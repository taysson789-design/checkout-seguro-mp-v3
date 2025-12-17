
import { Download, Copy, Lock, Plus, Zap, Crown, ShoppingCart, Star, FileText, ArrowLeft, RefreshCw, Send, Mic, MicOff, Image as ImageIcon, X, CreditCard, CheckCircle, MessageCircle } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DOCUMENT_TEMPLATES, ICONS, SUPPORT_WHATSAPP } from '../constants';
import { Wizard } from '../components/Wizard';
import { generateDocumentContent, refineDocumentContent } from '../services/geminiService';
import { UserAnswers, GeneratedDocument } from '../types';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const Generator: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const template = DOCUMENT_TEMPLATES.find(t => t.id === templateId);
  const { user, consumeCredit } = useAuth();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState<GeneratedDocument | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallType, setPaywallType] = useState<'master' | 'pro' | 'credits' | 'one_time'>('credits');
  
  // Refinement states
  const [refineInput, setRefineInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const [loadingStep, setLoadingStep] = useState(0);
  const loadingMessages = [
     "Conectando à Rede Neural Global...",
     "Analisando padrões de alta performance...",
     "Gerando conteúdo exclusivo...",
     "Finalizando detalhes visuais..."
  ];

  useEffect(() => {
    let interval: any;
    if (isGenerating) {
        interval = setInterval(() => setLoadingStep(prev => (prev + 1) % loadingMessages.length), 2000);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'pt-BR';
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setRefineInput(prev => prev + ' ' + transcript);
      };
    }
  }, []);

  if (!template) return <div className="text-center py-40 font-black text-3xl text-slate-300">Ferramenta não encontrada.</div>;

  const isMaster = user?.planType === 'master_monthly' || user?.planType === 'yearly' || user?.isAdmin;
  const isPro = user?.isPro || isMaster;

  const handleWizardComplete = async (answers: UserAnswers) => {
    if (!user) {
        navigate('/login', { state: { from: { pathname: `/generate/${template.id}` } } });
        return;
    }

    // LÓGICA DE PERMISSÃO RIGOROSA
    // 1. Master/Pro acessa tudo ilimitado (Currículos inclusos)
    if (isMaster || isPro) {
        // Prosseguir para geração
    } else {
        // Se NÃO é assinante:
        
        // REGRA DE CURRÍCULO: NÃO PODE USAR CRÉDITOS. TEM QUE COMPRAR.
        if (template.category === 'Curriculo') {
            setPaywallType('one_time');
            setShowPaywall(true);
            return;
        }

        // Se for Master Exclusivo (ex: Quebra de Objeções)
        if (template.minPlan === 'master') {
             setPaywallType('master');
             setShowPaywall(true);
             return;
        }

        // Se for Pro Exclusivo (ex: Criador de Sites)
        if (template.minPlan === 'pro') {
             setPaywallType('pro');
             setShowPaywall(true);
             return;
        }
        
        // Se for Serviço Gratuito (Creative Studio, Translator): Checa Créditos
        if (user.credits <= 0) {
            setPaywallType('credits');
            setShowPaywall(true);
            return;
        }
    }

    // INÍCIO DA GERAÇÃO
    setIsGenerating(true);

    try {
      // Consumo de crédito (Apenas se não for Pro/Master E não for Currículo pago)
      // Se pagou avulso no currículo (simulação), não gasta crédito. 
      // Mas aqui assumimos fluxo direto. Se for serviço gratuito, gasta.
      if (!isPro && !isMaster && template.category !== 'Curriculo') {
          const success = await consumeCredit(template.outputType === 'IMAGE' ? 'IMAGE' : 'TEXT');
          if (!success) throw new Error("Credits error.");
      }

      const content = await generateDocumentContent(template, answers, isPro);
      
      const newDoc: GeneratedDocument = {
        id: '', 
        templateId: template.id,
        title: `${template.title} - ${new Date().toLocaleDateString()}`,
        content: content,
        createdAt: new Date(),
        previewSnippet: template.outputType === 'TEXT' ? content.substring(0, 150) + '...' : template.outputType,
        type: template.outputType
      };

      if (user?.id) {
        const { data } = await supabase.from('documents').insert({
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
      setIsGenerating(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err: any) {
      console.error(err);
      setIsGenerating(false);
      alert("Ocorreu um erro na geração. Tente novamente.");
    }
  };

  const handleRefine = async () => {
    if (!refineInput.trim()) return;
    setIsGenerating(true);
    try {
      const instruction = refineInput;
      const newContent = await refineDocumentContent(generatedDoc!.content, instruction, template);
      
      setGeneratedDoc(prev => prev ? ({ ...prev, content: newContent }) : null);
      setRefineInput('');
      
      if (generatedDoc?.id) {
        await supabase.from('documents').update({ content: newContent }).eq('id', generatedDoc.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSpeech = () => {
    if (!recognitionRef.current) {
      alert("Seu navegador não suporta escrita por voz.");
      return;
    }
    if (isListening) recognitionRef.current.stop();
    else recognitionRef.current.start();
  };

  const handleDownload = () => {
    if (!generatedDoc) return;
    
    if (generatedDoc.type === 'IMAGE') {
        const link = document.createElement('a');
        link.href = generatedDoc.content;
        link.download = `imagem-${generatedDoc.id}.png`;
        link.target = '_blank';
        link.click();
        return;
    }

    const blob = new Blob([generatedDoc.content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${generatedDoc.title}.html`;
    link.click();
  };

  const handleOneTimePurchase = () => {
      const message = `Olá! Gostaria de comprar o acesso avulso para a ferramenta *${template.title}* por *R$ ${template.oneTimePrice?.toFixed(2)}*. Como procedo para o pagamento?`;
      const url = `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
  };

  if (generatedDoc) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 animate-slide-up">
          <div className="flex justify-between items-center mb-16">
              <Button variant="ghost" onClick={() => setGeneratedDoc(null)} className="text-lg"><Plus className="mr-2" /> Novo Projeto</Button>
              <Button onClick={handleDownload} size="lg" className="shadow-2xl shadow-indigo-200 text-lg px-12"><Download className="mr-3" /> Baixar</Button>
          </div>
          
          <div className="glass-panel rounded-[3rem] p-8 md:p-16 shadow-2xl mb-10 relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-full h-2 ${template.color}`}></div>
              
              <div className="prose prose-lg prose-indigo max-w-none text-slate-800">
                  {template.outputType === 'SITE' ? (
                      <div className="h-[800px] rounded-[2rem] overflow-hidden border border-slate-200 shadow-inner bg-white">
                          <iframe srcDoc={generatedDoc.content} className="w-full h-full" title="Result" />
                      </div>
                  ) : template.outputType === 'IMAGE' ? (
                      <div className="flex justify-center">
                          <img src={generatedDoc.content} alt="Resultado IA" className="rounded-2xl shadow-lg max-h-[800px]" />
                      </div>
                  ) : (
                    <pre className="whitespace-pre-wrap font-sans leading-relaxed text-xl bg-transparent p-0 border-none">{generatedDoc.content}</pre>
                  )}
              </div>
          </div>

          {/* Refinamento só aparece para Texto/Site por enquanto */}
          {template.outputType !== 'IMAGE' && (
              <div className="max-w-3xl mx-auto">
                 <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-6 shadow-xl omni-input-glow transition-all">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-lg">
                            <Zap size={16} fill="white" />
                        </div>
                        <span className="text-sm font-black text-slate-900 uppercase tracking-widest">Refinar Resultado</span>
                    </div>

                    <div className="relative">
                        <textarea 
                            value={refineInput}
                            onChange={(e) => setRefineInput(e.target.value)}
                            placeholder="O que você deseja alterar no texto/código acima?"
                            className="w-full bg-slate-50 border-none rounded-[1.8rem] p-6 pr-32 text-slate-800 focus:ring-0 resize-none h-32 text-lg font-medium placeholder-slate-400"
                        />
                        
                        <div className="absolute right-4 bottom-4 flex items-center gap-2">
                             <button 
                                onClick={toggleSpeech}
                                className={`p-3 border rounded-full transition-all shadow-sm ${isListening ? 'bg-red-500 text-white border-red-500 animate-pulse' : 'bg-white border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'}`}
                             >
                                {isListening ? <MicOff size={22} /> : <Mic size={22} />}
                             </button>
                             <button 
                                onClick={handleRefine}
                                disabled={isGenerating || (!refineInput.trim())}
                                className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-200"
                             >
                                <Send size={22} className="ml-0.5" />
                             </button>
                        </div>
                    </div>
                 </div>
              </div>
          )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-32 px-4 animate-fade-in bg-mesh-light min-h-screen">
      {isGenerating && (
          <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-3xl flex flex-col items-center justify-center p-12 text-center">
              <div className="w-32 h-32 mb-12 relative">
                  <div className="absolute inset-0 border-[6px] border-indigo-500/20 rounded-full"></div>
                  <div className="absolute inset-0 border-[6px] border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <div className="absolute inset-0 m-auto w-20 h-20 bg-indigo-500/20 rounded-full blur-xl animate-pulse"></div>
                  <Zap className="absolute inset-0 m-auto text-white animate-pulse" size={40} fill="currentColor" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tighter max-w-2xl leading-tight">{loadingMessages[loadingStep]}</h2>
              <p className="text-slate-400 text-xl font-light">Criando algo único para você...</p>
          </div>
      )}

      <div className="text-center mb-24">
        <div className={`w-24 h-24 mx-auto rounded-[2rem] ${template.color} text-white flex items-center justify-center mb-10 shadow-2xl transform rotate-3`}>
          {ICONS[template.icon] && React.createElement(ICONS[template.icon], { size: 48, strokeWidth: 2 })}
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-8">{template.title}</h1>
        <p className="text-slate-500 text-2xl font-medium max-w-2xl mx-auto leading-relaxed">{template.description}</p>
        
        {/* Badges de Preço/Plano */}
        {template.category === 'Curriculo' ? (
             <div className="mt-10 inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-3 rounded-full text-xs font-black border border-slate-200 shadow-sm animate-pulse-glow">
                 <CreditCard size={14} /> 
                 {isPro ? 'INCLUSO NO SEU PLANO' : `R$ ${template.oneTimePrice?.toFixed(2)} (COMPRA ÚNICA)`}
             </div>
        ) : template.minPlan === 'master' ? (
            <div className="mt-10 inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-3 rounded-full text-xs font-black border border-slate-800 shadow-xl">
                <Crown size={14} fill="#fbbf24" className="text-amber-400" /> EXCLUSIVO MASTER
            </div>
        ) : template.minPlan === 'pro' ? (
            <div className="mt-10 inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white px-8 py-3 rounded-full text-xs font-black shadow-xl">
                <Star size={14} fill="white"/> SERVIÇO PRO
            </div>
        ) : (
            <div className="mt-10 inline-flex items-center gap-3 bg-white text-indigo-700 px-8 py-3 rounded-full text-xs font-black border border-indigo-100 shadow-sm">
                <Zap size={14} fill="currentColor"/> GRÁTIS / CRÉDITOS
            </div>
        )}
      </div>

      <Wizard steps={template.steps} onComplete={handleWizardComplete} isGenerating={isGenerating} />

      {/* PAYWALL & UPSELL MODAL */}
      {showPaywall && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-6">
            <div className="bg-white rounded-[4rem] p-16 max-w-xl w-full shadow-[0_60px_120px_rgba(0,0,0,0.5)] border border-white/50 animate-slide-up text-center relative overflow-hidden">
                <div className={`absolute top-0 inset-x-0 h-2 ${template.color}`}></div>
                
                <div className="w-28 h-28 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-10 text-indigo-600 shadow-inner">
                    {paywallType === 'master' ? <Crown size={56} fill="currentColor" className="text-amber-500" /> : 
                     paywallType === 'one_time' ? <CreditCard size={56} /> :
                     paywallType === 'pro' ? <FileText size={56} /> : 
                     <Zap size={56} fill="currentColor" />}
                </div>
                
                <h3 className="text-4xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
                    {paywallType === 'one_time' ? 'Desbloquear Documento' : 
                     paywallType === 'master' ? 'Exclusivo Master' : 
                     paywallType === 'pro' ? 'Seja Premium' : 'Sem Créditos'}
                </h3>
                
                <p className="text-slate-500 text-lg font-medium mb-12 leading-relaxed">
                    {paywallType === 'one_time' 
                        ? `Currículos são documentos de alto valor. Adquira este modelo por R$ ${template.oneTimePrice?.toFixed(2)} ou assine para acesso ilimitado.`
                        : paywallType === 'master' 
                        ? 'Este serviço utiliza recursos avançados exclusivos do plano Master.' 
                        : paywallType === 'credits' 
                        ? 'Seus 5 créditos gratuitos acabaram. Espere a recarga ou assine.'
                        : 'Liberte todo o potencial da IA com nossos planos.'}
                </p>

                <div className="space-y-4">
                    {paywallType === 'one_time' && (
                        <Button className="w-full justify-center h-16 rounded-[2rem] text-xl bg-slate-900 hover:bg-slate-800" onClick={handleOneTimePurchase}>
                            <MessageCircle size={24} className="mr-2" />
                            COMPRAR VIA WHATSAPP
                        </Button>
                    )}
                    
                    <Button className="w-full justify-center h-16 rounded-[2rem] text-xl shadow-xl hover:scale-[1.02] transition-transform" onClick={() => navigate('/pricing')}>
                        {paywallType === 'one_time' ? 'OU ASSINAR PRO (ILIMITADO)' : 'VER PLANOS'}
                    </Button>
                    
                    <button onClick={() => setShowPaywall(false)} className="text-slate-400 text-xs font-bold hover:text-slate-600 mt-6 block w-full tracking-[0.2em] uppercase">Cancelar</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Generator;
