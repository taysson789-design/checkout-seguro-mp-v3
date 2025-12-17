
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DOCUMENT_TEMPLATES, ICONS } from '../constants';
import { Wizard } from '../components/Wizard';
import { generateDocumentContent, refineDocumentContent } from '../services/geminiService';
import { UserAnswers, GeneratedDocument } from '../types';
import { Button } from '../components/Button';
import { Download, Copy, Lock, AlertTriangle, Check, Plus, Heart, MessageCircle, Send, Bookmark, Crown, Image as ImageIcon, Wand2, Sparkles, RefreshCw, Zap, Bot, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface RefineMessage {
    id: string;
    role: 'user' | 'ai';
    text: string;
}

const Generator: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const template = DOCUMENT_TEMPLATES.find(t => t.id === templateId);
  const { user, consumeCredit } = useAuth();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState<GeneratedDocument | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Chat State
  const [refineInstruction, setRefineInstruction] = useState('');
  const [refineHistory, setRefineHistory] = useState<RefineMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Ref para o topo da página de resultados
  const resultsTopRef = useRef<HTMLDivElement>(null);

  // Estados para animação de loading
  const [loadingStep, setLoadingStep] = useState(0);
  const loadingMessages = [
     "Analisando seus requisitos...",
     "Conectando à Rede Neural...",
     "Estruturando o Design...",
     "Refinando a Criatividade...",
     "Finalizando Detalhes..."
  ];

  useEffect(() => {
    let interval: any;
    if (isGenerating) {
        setLoadingStep(0);
        interval = setInterval(() => {
            setLoadingStep(prev => (prev + 1) % loadingMessages.length);
        }, 1500);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Scroll to bottom of chat
  useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [refineHistory]);

  if (!template) {
    return (
      <div className="text-center mt-20 animate-fade-in">
        <h2 className="text-2xl font-bold text-slate-900">Template não encontrado</h2>
        <Button className="mt-4" onClick={() => navigate('/')}>Voltar ao Dashboard</Button>
      </div>
    );
  }

  const isMasterTemplate = template.id === 'launch-agent-360';
  const isSubscriber = user?.isPro || user?.planType === 'master_monthly' || user?.planType === 'yearly' || user?.isAdmin;
  
  // Cálculo de Custo
  const creditCost = template.outputType === 'IMAGE' ? 5 : 1;
  const userCredits = user?.credits || 0;
  const hasSufficientCredits = userCredits >= creditCost;

  if (isMasterTemplate && user?.planType !== 'master_monthly' && user?.planType !== 'yearly' && !user?.isAdmin) {
      return (
          <div className="max-w-2xl mx-auto mt-20 p-8 bg-white rounded-3xl shadow-2xl text-center border border-amber-200 relative overflow-hidden animate-slide-up scene-3d">
               <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-amber-300 to-orange-500"></div>
               <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 transform hover:rotate-12 transition-transform duration-500">
                   <Crown size={40} className="text-amber-500" fill="currentColor" />
               </div>
               <h2 className="text-3xl font-bold text-slate-900 mb-4 font-heading">Acesso Exclusivo Master</h2>
               <p className="text-slate-600 text-lg mb-8">
                   O <strong>Agente de Lançamento 360º</strong> é uma ferramenta de alta potência reservada para membros da Elite.
               </p>
               <Button size="lg" onClick={() => navigate('/pricing')} className="bg-gradient-to-r from-amber-500 to-orange-600 border-none shadow-xl hover:shadow-amber-500/30 text-white font-bold w-full md:w-auto px-8">
                   Fazer Upgrade para Master
               </Button>
               <div className="mt-6">
                   <Link to="/" className="text-slate-400 hover:text-slate-600 text-sm">Voltar ao Início</Link>
               </div>
          </div>
      );
  }

  const handleWizardComplete = async (answers: UserAnswers) => {
    // Verifica se pode gerar (Assinante OU Créditos Suficientes)
    if (!isSubscriber && !hasSufficientCredits) {
        setShowPaywall(true);
        return;
    }

    setIsGenerating(true);
    setError(null);
    setRefineHistory([]); // Reset chat

    try {
      const canProceed = await consumeCredit(template.outputType);
      
      if (!isSubscriber && !canProceed) {
          throw new Error(`Saldo insuficiente. Esta ferramenta custa ${creditCost} créditos.`);
      }

      const content = await generateDocumentContent(template, answers, isSubscriber);
      
      const newDoc: GeneratedDocument = {
        id: '', 
        templateId: template.id,
        title: `${template.title} - ${new Date().toLocaleDateString()}`,
        content: content,
        createdAt: new Date(),
        previewSnippet: template.outputType === 'TEXT' ? content.substring(0, 150) + '...' : template.outputType,
        type: template.outputType
      };

      if (user && user.id) {
        const { data, error: dbError } = await supabase.from('documents').insert({
            user_id: user.id,
            template_id: template.id,
            title: newDoc.title,
            content: content,
            type: template.outputType,
            preview_snippet: newDoc.previewSnippet
          }).select().single();
        if (data) newDoc.id = data.id;
      }

      setGeneratedDoc(newDoc);
      
      setRefineHistory([{
          id: 'init',
          role: 'ai',
          text: 'Documento gerado com sucesso! Se quiser fazer alterações, basta pedir aqui no chat abaixo.'
      }]);

      // Rola a página para o topo para focar no resultado
      setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          resultsTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro desconhecido. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefine = async () => {
      if (!isSubscriber || !generatedDoc) return;
      if (!refineInstruction.trim()) return;

      const instruction = refineInstruction;
      setRefineInstruction('');
      
      // Add User Message
      setRefineHistory(prev => [...prev, { id: Date.now().toString(), role: 'user', text: instruction }]);

      setIsRefining(true);
      try {
          const newContent = await refineDocumentContent(generatedDoc.content, instruction, template);
          
          setGeneratedDoc(prev => prev ? ({ ...prev, content: newContent }) : null);

          // Add AI Message
          setRefineHistory(prev => [...prev, { id: Date.now() + 'ai', role: 'ai', text: 'Alterações aplicadas! Verifique o resultado acima.' }]);

          if (generatedDoc.id) {
              await supabase.from('documents').update({ content: newContent }).eq('id', generatedDoc.id);
          }
          
          // Rola suavemente para o topo novamente para ver a alteração
          window.scrollTo({ top: 0, behavior: 'smooth' });

      } catch (err) {
          console.error("Erro refinamento", err);
          setRefineHistory(prev => [...prev, { id: Date.now() + 'err', role: 'ai', text: 'Tive um problema ao processar sua alteração. Tente novamente.' }]);
      } finally {
          setIsRefining(false);
      }
  };

  const handleCopy = () => {
    if (generatedDoc && (generatedDoc.type === 'TEXT' || generatedDoc.type === 'SITE')) {
      const cleanContent = generatedDoc.content.replace(/\[\[GENERATED_IMAGE_URL:.*?\]\]/, '');
      navigator.clipboard.writeText(cleanContent);
      alert("Conteúdo copiado!");
    }
  };

  const handleDownload = () => {
    if (!generatedDoc) return;

    if (generatedDoc.type === 'IMAGE') {
       const link = document.createElement('a');
       link.href = generatedDoc.content;
       link.download = `imagem-ia-${Date.now()}.png`;
       document.body.appendChild(link);
       link.click();
       document.body.removeChild(link);
    } else if (generatedDoc.type === 'SITE') {
       const blob = new Blob([generatedDoc.content], { type: 'text/html;charset=utf-8' });
       const url = URL.createObjectURL(blob);
       const link = document.createElement('a');
       link.href = url;
       link.download = `site-${Date.now()}.html`;
       document.body.appendChild(link);
       link.click();
       document.body.removeChild(link);
       URL.revokeObjectURL(url);
    } else {
        if (!isSubscriber && (user?.credits || 0) <= 0) {
            setShowPaywall(true);
        } else {
             alert("Download do PDF iniciado!");
        }
    }
  };

  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) {
          return <h3 key={i} className="text-xl font-bold text-indigo-700 mt-6 mb-3 border-b border-indigo-100 pb-2">{line.replace('## ', '')}</h3>;
      }
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <div key={i} className={`mb-2 ${line.startsWith('#') || line.startsWith('Título:') ? 'font-bold text-lg text-slate-900 mt-4' : 'text-slate-700'}`}>
           {parts.map((part, j) => {
             if (part.startsWith('**') && part.endsWith('**')) {
               return <strong key={j} className="text-slate-900">{part.slice(2, -2)}</strong>;
             }
             return <span key={j}>{part}</span>;
           })}
        </div>
      );
    });
  };

  const renderInstagramPreview = (content: string) => {
    const imageMatch = content.match(/\[\[GENERATED_IMAGE_URL:(.*?)\]\]/);
    const generatedImageUrl = imageMatch ? imageMatch[1] : null;
    const cleanContent = content.replace(/\[\[GENERATED_IMAGE_URL:.*?\]\]/, '');

    return (
      <div className="flex justify-center bg-slate-100 p-8 rounded-xl">
        <div className="bg-white w-[350px] rounded-[2rem] border-8 border-slate-900 shadow-2xl overflow-hidden flex flex-col transform hover:scale-[1.02] transition-transform duration-300">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px]">
                 <div className="w-full h-full rounded-full bg-white border-2 border-white overflow-hidden">
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`} alt="avatar" />
                 </div>
              </div>
              <span className="text-xs font-semibold text-slate-900">{user?.name?.toLowerCase().replace(/\s/g, '') || 'usuario'}</span>
          </div>
          
          <div className="aspect-square bg-slate-100 flex items-center justify-center relative overflow-hidden">
              {generatedImageUrl ? (
                <img src={generatedImageUrl} alt="IG Post" className="w-full h-full object-cover" />
              ) : (
                <div className="text-indigo-900/40 text-sm font-medium">(Imagem não gerada)</div>
              )}
          </div>

          <div className="px-4 py-3 flex justify-between items-center">
              <div className="flex gap-4">
                <Heart className="w-6 h-6 text-slate-800" />
                <MessageCircle className="w-6 h-6 text-slate-800" />
                <Send className="w-6 h-6 text-slate-800" />
              </div>
              <Bookmark className="w-6 h-6 text-slate-800" />
          </div>
          <div className="px-4 pb-6 text-sm overflow-y-auto max-h-[300px]">
              <p className="font-semibold text-slate-900 mb-1">2.435 curtidas</p>
              <div className="text-slate-800 space-y-1">
                <span className="font-semibold mr-2">{user?.name?.split(' ')[0]}:</span>
                {renderFormattedText(cleanContent)}
              </div>
          </div>
        </div>
      </div>
    );
  };

  // --- POPUP DE CARREGAMENTO ---
  const renderLoadingPopup = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]/90 backdrop-blur-md animate-fade-in perspective-1000">
       <div className="relative flex flex-col items-center justify-center w-full max-w-lg p-10">
          <div className="cube-container mb-12">
              <div className="cube-face cube-face-front"></div>
              <div className="cube-face cube-face-back"></div>
              <div className="cube-face cube-face-right"></div>
              <div className="cube-face cube-face-left"></div>
              <div className="cube-face cube-face-top"></div>
              <div className="cube-face cube-face-bottom"></div>
              <div className="cube-inner">
                  <div className="inner-face inner-front"></div>
                  <div className="inner-face inner-back"></div>
                  <div className="inner-face inner-right"></div>
                  <div className="inner-face inner-left"></div>
                  <div className="inner-face inner-top"></div>
                  <div className="inner-face inner-bottom"></div>
              </div>
          </div>
          <div className="text-center relative z-10">
              <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-indigo-400 animate-gradient-x mb-4 tracking-tight">
                  IA Criando sua Arte
              </h3>
              <div className="h-8 overflow-hidden">
                  <p key={loadingStep} className="text-indigo-200 text-lg font-medium animate-slide-up">
                      {loadingMessages[loadingStep]}
                  </p>
              </div>
              <div className="w-64 h-1.5 bg-slate-800 rounded-full mt-8 overflow-hidden mx-auto relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-fuchsia-500 w-full animate-[shimmer_1.5s_infinite]"></div>
              </div>
          </div>
       </div>
    </div>
  );

  if (generatedDoc) {
    const isImage = generatedDoc.type === 'IMAGE';
    const isSite = generatedDoc.type === 'SITE';
    const isText = generatedDoc.type === 'TEXT';
    const isResume = templateId === 'resume-cv';

    return (
      <div ref={resultsTopRef} className={`mx-auto animate-slide-up ${isSite ? 'w-full max-w-full px-2' : 'max-w-5xl'}`}>
        {/* Header Actions */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
             <Link to="/" className="text-sm text-slate-500 hover:text-indigo-600 mb-1 inline-block transition-colors">← Voltar ao início</Link>
             <h1 className="text-2xl font-bold text-slate-900">
                {isImage ? 'Sua Imagem de Estúdio' : isResume ? 'Seu Currículo Profissional' : isSite ? 'Seu Site Profissional' : 'Seu Documento Premium'}
             </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {(isText || isSite) && <Button variant="outline" onClick={handleCopy}><Copy className="w-4 h-4 mr-2" /> Copiar</Button>}
            <Button onClick={handleDownload} className="shadow-lg shadow-indigo-200 bg-indigo-600 hover:bg-indigo-700">
                <Download className="w-4 h-4 mr-2" /> 
                {isImage ? 'Baixar PNG (4k)' : isResume ? 'Baixar Currículo (HTML)' : isSite ? 'Baixar Arquivo HTML' : 'Baixar PDF'}
            </Button>
          </div>
        </div>

        {/* Content Display */}
        <div className={`relative mb-8 perspective-1000`}>
           {isImage && (
             <div className="bg-slate-900 p-8 rounded-2xl shadow-2xl flex flex-col items-center transform transition-transform hover:rotate-1">
                 <img src={generatedDoc.content} alt="Arte gerada por IA" className="max-w-full rounded-lg shadow-black/50 shadow-2xl max-h-[70vh] object-contain border border-slate-700" />
             </div>
           )}
           {isSite && (
             <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xl h-[85vh] bg-white relative group">
                <iframe srcDoc={generatedDoc.content} title="Preview" className="w-full h-full border-0 bg-slate-50" sandbox="allow-scripts allow-popups"/>
             </div>
           )}
           {isText && (
             templateId === 'instagram-post' ? renderInstagramPreview(generatedDoc.content) :
             (<div className="bg-white p-8 md:p-12 rounded-xl shadow-xl border border-slate-200 card-3d-hover">{renderFormattedText(generatedDoc.content)}</div>)
           )}
        </div>
        
        {/* --- FIXED CHAT (REFINE) --- */}
        <div className="mb-12 relative z-10 max-w-4xl mx-auto">
            <div className={`
                rounded-2xl p-1 relative overflow-hidden transition-all duration-500
                ${isSubscriber 
                    ? 'bg-gradient-to-r from-indigo-100 to-purple-100 shadow-xl' 
                    : 'bg-slate-900 shadow-2xl shadow-purple-500/20'}
            `}>
                {/* Background Effects for Locked State */}
                {!isSubscriber && (
                    <>
                       <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                       <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-600 rounded-full blur-[80px] opacity-40 animate-pulse"></div>
                       <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-600 rounded-full blur-[80px] opacity-40 animate-pulse delay-700"></div>
                    </>
                )}

                <div className={`
                    relative rounded-xl flex flex-col h-[400px]
                    ${isSubscriber ? 'bg-white' : 'bg-slate-900/90 backdrop-blur-md border border-white/10'}
                `}>
                     {/* Chat Header */}
                     <div className={`px-6 py-4 border-b flex items-center gap-3 ${isSubscriber ? 'border-slate-100 bg-slate-50/50' : 'border-white/10'}`}>
                         <div className={`p-2 rounded-lg ${isSubscriber ? 'bg-indigo-100 text-indigo-600' : 'bg-purple-600 text-white'}`}>
                             <Wand2 size={18} />
                         </div>
                         <div>
                             <h4 className={`text-sm font-bold uppercase tracking-wider ${isSubscriber ? 'text-slate-800' : 'text-white'}`}>
                                 Editor Inteligente
                             </h4>
                             <p className={`text-xs ${isSubscriber ? 'text-slate-500' : 'text-slate-400'}`}>
                                 {isImage ? 'Peça mudanças na imagem (Ex: "Mude o fundo para azul")' : 'Converse com a IA para refinar o resultado.'}
                             </p>
                         </div>
                     </div>

                     {/* Chat Messages Area */}
                     <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-slate-50/30">
                         {isSubscriber ? (
                             refineHistory.map((msg) => (
                                 <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                     <div className={`
                                         max-w-[80%] p-3 rounded-2xl text-sm shadow-sm flex items-start gap-3
                                         ${msg.role === 'user' 
                                             ? 'bg-indigo-600 text-white rounded-tr-sm' 
                                             : 'bg-white text-slate-700 border border-slate-200 rounded-tl-sm'}
                                     `}>
                                         <div className={`mt-0.5 shrink-0 ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                                             {msg.role === 'user' ? <User size={14} /> : <Bot size={14} className="text-indigo-600"/>}
                                         </div>
                                         <div className={msg.role === 'user' ? 'order-1' : 'order-2'}>{msg.text}</div>
                                     </div>
                                 </div>
                             ))
                         ) : (
                             <div className="flex flex-col gap-4 mt-8 opacity-30">
                                 <div className="flex justify-start"><div className="bg-white/10 p-4 rounded-2xl w-2/3 h-16 animate-pulse"></div></div>
                                 <div className="flex justify-end"><div className="bg-white/10 p-4 rounded-2xl w-1/2 h-12 animate-pulse"></div></div>
                                 <div className="flex justify-start"><div className="bg-white/10 p-4 rounded-2xl w-3/4 h-20 animate-pulse"></div></div>
                             </div>
                         )}
                         <div ref={chatEndRef} />
                     </div>

                     {/* Chat Input Area */}
                     <div className={`p-4 border-t ${isSubscriber ? 'border-slate-100' : 'border-white/10'}`}>
                         <div className="flex gap-2">
                             <input 
                                 type="text" 
                                 value={refineInstruction}
                                 onChange={(e) => setRefineInstruction(e.target.value)}
                                 onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                                 disabled={isRefining || !isSubscriber}
                                 placeholder={isSubscriber ? (isSite ? "Ex: Mude o fundo para preto..." : isImage ? "Ex: Adicione luzes de neon..." : "Ex: Reescreva o segundo parágrafo...") : "Desbloqueie para digitar..."}
                                 className={`w-full rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${isSubscriber ? 'bg-slate-100 border-transparent text-slate-900' : 'bg-white/5 border border-white/10 text-slate-400 cursor-not-allowed'}`}
                             />
                             <Button 
                                 size="md" 
                                 onClick={handleRefine} 
                                 isLoading={isRefining} 
                                 disabled={!isSubscriber}
                                 className={`shrink-0 rounded-xl ${!isSubscriber && 'opacity-50 cursor-not-allowed'}`}
                             >
                                 <Send size={18} />
                             </Button>
                         </div>
                     </div>

                     {/* Locked Overlay */}
                     {!isSubscriber && (
                         <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/60 backdrop-blur-[2px] rounded-xl group cursor-pointer transition-all hover:bg-slate-900/50" onClick={() => navigate('/pricing')}>
                             <div className="bg-white/10 border border-white/20 p-6 rounded-2xl backdrop-blur-md shadow-2xl transform group-hover:scale-105 transition-transform text-center max-w-sm mx-4">
                                 <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-500/30">
                                     <Lock size={20} className="text-white" />
                                 </div>
                                 <h3 className="text-white font-bold text-lg mb-1">Acesso Elite Necessário</h3>
                                 <p className="text-indigo-200 text-xs mb-4">
                                     Apenas membros Pro podem conversar com a IA para refinar e editar o conteúdo em tempo real.
                                 </p>
                                 <button className="bg-white text-slate-900 font-bold text-xs py-2 px-6 rounded-full hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 mx-auto w-full">
                                     <Zap size={12} className="text-indigo-600 fill-current" />
                                     DESBLOQUEAR EDITOR IA
                                 </button>
                             </div>
                         </div>
                     )}
                </div>
            </div>
        </div>

        <div className="text-center mb-12">
            <Button variant="secondary" onClick={() => navigate('/')}><Plus className="w-4 h-4 mr-2" /> Criar Novo</Button>
        </div>

        {/* Paywall Modal */}
        {showPaywall && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
             <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden animate-slide-up transform hover:scale-105 transition-transform duration-300">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner animate-pulse"><Lock size={32} /></div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Saldo Insuficiente</h3>
                  <p className="text-slate-600">
                      Este recurso custa <strong>{creditCost} créditos</strong> e você possui {user?.credits}.
                  </p>
                  {!isSubscriber && creditCost === 5 && (
                      <p className="text-xs text-indigo-600 mt-2 font-semibold">Dica: Membros Pro criam ilimitado.</p>
                  )}
                </div>
                <Button className="w-full justify-center" size="lg" onClick={() => navigate('/pricing')}>Ver Planos</Button>
                <button onClick={() => setShowPaywall(false)} className="w-full text-center text-sm text-slate-400 mt-3">Fechar</button>
             </div>
           </div>
        )}
      </div>
    );
  }

  // --- TELA INICIAL DO WIZARD ---
  return (
    <div className="animate-fade-in">
      {isGenerating && renderLoadingPopup()}

      <div className="mb-8 text-center">
        <div className={`inline-flex p-3 rounded-full ${template.color} text-white mb-4 shadow-lg shadow-indigo-100 transform hover:scale-110 hover:rotate-12 transition-all duration-300`}>
          {ICONS[template.icon] && React.createElement(ICONS[template.icon], { size: 32 })}
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{template.title}</h1>
        <p className="text-slate-500 mt-2 max-w-lg mx-auto">Responda às perguntas abaixo para que nossa IA Inteligente personalize cada detalhe.</p>
        
        {/* INFO DE CRÉDITOS E CUSTO */}
        {!isSubscriber && (
          <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold shadow-sm ${hasSufficientCredits ? 'bg-indigo-50 text-indigo-800' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            <span className={hasSufficientCredits ? "text-indigo-600" : "text-red-600"}>
                <Zap size={12} className="inline mr-1 mb-0.5" fill="currentColor"/>
                Saldo: {userCredits}
            </span>
            <span className="w-px h-3 bg-current opacity-30"></span>
            <span>
                Custo: {creditCost} crédito{creditCost > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700 animate-slide-up">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="transform transition-all">
           <Wizard steps={template.steps} onComplete={handleWizardComplete} isGenerating={isGenerating} />
      </div>
    </div>
  );
};

export default Generator;
