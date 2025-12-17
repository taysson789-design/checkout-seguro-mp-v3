
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Sparkles, ChevronRight, Zap, Phone, RefreshCw } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { DOCUMENT_TEMPLATES, PLANS, APP_NAME, SUPPORT_WHATSAPP } from '../constants';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: 'Olá! Sou seu copiloto de IA. Posso ajudar a criar conteúdos ou tirar dúvidas sobre nossos planos e ferramentas.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contextPrompt, setContextPrompt] = useState('');
  const [currentToolName, setCurrentToolName] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Rola para baixo automaticamente
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
        scrollToBottom();
    }
  }, [messages, isOpen]);

  // Detecta onde o usuário está para dar contexto à IA
  useEffect(() => {
    if (location.pathname.startsWith('/generate/')) {
        const templateId = location.pathname.split('/generate/')[1];
        const template = DOCUMENT_TEMPLATES.find(t => t.id === templateId);
        
        if (template) {
            setCurrentToolName(template.title);
            setContextPrompt(`
                O usuário está AGORA na ferramenta: "${template.title}".
                Descrição da ferramenta: ${template.description}.
                Ajude-o especificamente com dúvidas sobre como preencher esse formulário ou dê ideias criativas para esse contexto.
            `);
        }
    } else if (location.pathname === '/pricing') {
        setCurrentToolName('Planos e Preços');
        setContextPrompt(`O usuário está na página de PREÇOS. Ajude-o a escolher o melhor plano entre Starter, Pro e Master. Destaque o Master Anual como melhor custo-benefício.`);
    } else {
        setContextPrompt('');
        setCurrentToolName('');
    }
  }, [location.pathname]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // --- CONTEXTO GLOBAL DO SITE ---
      const toolsList = DOCUMENT_TEMPLATES.map(t => `- ${t.title}: ${t.description}`).join('\n');
      const plansList = PLANS.map(p => `- ${p.name}: R$ ${p.price} (${p.description}) - Detalhes: ${p.features.map(f => f.split('||')[0]).join(', ')}`).join('\n');

      // Prompt do Sistema Otimizado com Contexto Total
      let systemInstruction = `
          Você é o Assistente Virtual Oficial da plataforma ${APP_NAME}.
          
          SUA BASE DE CONHECIMENTO (Memorize isso):
          
          1. FERRAMENTAS DISPONÍVEIS:
          ${toolsList}

          2. PLANOS E PREÇOS:
          ${plansList}

          3. SUPORTE:
          WhatsApp Oficial: ${SUPPORT_WHATSAPP}

          DIRETRIZES:
          - Seja um consultor especialista, vendedor e suporte técnico.
          - Se perguntarem preços, use a lista acima.
          - Se perguntarem "o que o site faz", resuma as ferramentas.
          - Respostas curtas (máx 3 frases), use emojis e seja prestativo.
          - O Plano Master permite Agentes 360º e imagens melhores.
      `;
      
      if (contextPrompt) {
          systemInstruction += `\nCONTEXTO IMEDIATO DO USUÁRIO: ${contextPrompt}`;
      }

      // Monta histórico de mensagens
      const apiMessages = [
        { role: 'system', content: systemInstruction },
        ...messages.slice(-6).map(m => ({ role: m.role === 'model' ? 'assistant' : 'user', content: m.text })),
        { role: 'user', content: input }
      ];

      // Chamada para API Gratuita (Pollinations)
      const response = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          model: 'openai', 
          seed: Math.floor(Math.random() * 1000)
        })
      });

      if (!response.ok) throw new Error("Erro na API");

      const text = await response.text();
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: text }]);

    } catch (error: any) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Estou reconectando meus neurônios... Tente novamente em alguns segundos!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Bloquear rolagem do body quando chat mobile estiver aberto
  useEffect(() => {
    if (window.innerWidth < 768 && isOpen) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; }
  }, [isOpen]);

  return (
    <div className="font-sans">
      
      {/* JANELA DO CHAT (Mobile: Fullscreen, Desktop: Widget) */}
      <div 
        className={`
            fixed z-[9999] transition-all duration-300 ease-in-out
            bg-white overflow-hidden flex flex-col shadow-2xl border border-slate-200
            
            md:right-4 md:bottom-20 md:w-[360px] md:rounded-2xl md:max-h-[75vh] md:h-[480px]
            md:origin-bottom-right
            
            ${/* Mobile Styles: Fullscreen Fixed */ ''}
            left-0 right-0 bottom-0 top-0 rounded-none w-full h-[100dvh] md:top-auto md:left-auto

            ${isOpen 
                ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' 
                : 'opacity-0 scale-95 translate-y-4 pointer-events-none md:translate-y-10'}
        `}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-900 p-4 md:p-3 flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-3 md:gap-2.5">
                <div className="relative">
                    <div className="bg-white/10 p-1.5 rounded-lg backdrop-blur-sm border border-white/10">
                        <Bot className="text-indigo-300 w-5 h-5 md:w-5 md:h-5" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-slate-900 rounded-full"></span>
                </div>
                <div>
                    <h3 className="text-white text-base md:text-sm font-bold leading-tight">Copiloto IA</h3>
                    <p className="text-indigo-200 text-xs md:text-[10px] flex items-center gap-1">
                        {currentToolName ? <span className="text-amber-300 flex items-center gap-0.5"><Zap size={10} fill="currentColor"/> {currentToolName}</span> : "Online"}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2 md:gap-1">
                 {/* Botão de WhatsApp/Suporte */}
                 <a 
                    href={`https://wa.me/${SUPPORT_WHATSAPP}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 md:p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    title="Suporte Humano"
                >
                    <Phone size={18} className="md:w-3.5 md:h-3.5" />
                </a>
                <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 md:p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                    <X size={20} className="md:w-4 md:h-4" />
                </button>
            </div>
        </div>

        {/* Aviso de Contexto (Se houver) */}
        {currentToolName && (
            <div className="bg-indigo-50 px-4 py-2 md:px-3 md:py-1.5 border-b border-indigo-100 flex items-center justify-between shrink-0">
                <span className="text-xs md:text-[10px] text-indigo-700 font-medium flex items-center gap-1">
                    <Sparkles size={12} /> Ajuda para: <strong>{currentToolName}</strong>
                </span>
            </div>
        )}

        {/* Área de Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 md:p-3 space-y-4 md:space-y-3 bg-slate-50 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                    {msg.role === 'model' && (
                         <div className="w-8 h-8 md:w-6 md:h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0 mr-2 mt-1 shadow-sm">
                            IA
                         </div>
                    )}
                    <div className={`
                        max-w-[85%] p-3 md:p-2.5 rounded-2xl text-sm md:text-xs leading-relaxed shadow-sm
                        ${msg.role === 'user' 
                            ? 'bg-slate-800 text-white rounded-tr-sm' 
                            : 'bg-white text-slate-700 border border-slate-200 rounded-tl-sm'}
                    `}>
                        {msg.text}
                    </div>
                </div>
            ))}
            {isLoading && (
                <div className="flex justify-start">
                    <div className="w-8 h-8 md:w-6 md:h-6 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mr-2 mt-1">
                        <RefreshCw size={12} className="animate-spin text-slate-500"/>
                    </div>
                    <div className="bg-white p-3 md:p-2.5 rounded-2xl rounded-tl-sm border border-slate-200 shadow-sm">
                        <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Área de Input - Otimizada para Touch */}
        <div className="p-3 md:p-2 bg-white border-t border-slate-100 shrink-0 pb-safe">
            <div className="relative flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-1 py-1 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400 transition-all">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Digite sua mensagem..."
                    // text-base evita zoom no iPhone
                    className="flex-1 bg-transparent border-none focus:ring-0 text-base md:text-xs text-slate-800 placeholder:text-slate-400 pl-4 md:pl-3 py-3 md:py-2 h-12 md:h-9"
                    disabled={isLoading}
                />
                <button 
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="w-10 h-10 md:w-8 md:h-8 flex items-center justify-center bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-transform hover:scale-105 active:scale-95 shadow-md shadow-indigo-200"
                >
                    <Send size={18} className={`md:w-3.5 md:h-3.5 ${isLoading ? "opacity-0" : "ml-0.5"}`} />
                </button>
            </div>
            <div className="text-center mt-2 md:mt-1">
                <span className="text-[10px] md:text-[9px] text-slate-400">Powered by {APP_NAME} AI</span>
            </div>
        </div>
      </div>

      {/* BOTÃO FLUTUANTE (FAB) - Fixed Bottom Right */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`
            fixed bottom-4 right-4 md:bottom-6 md:right-6
            group flex items-center justify-center w-14 h-14 md:w-14 md:h-14 rounded-full 
            shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20
            transition-all duration-300 hover:scale-110 active:scale-95 z-[9990]
            ${isOpen ? 'bg-slate-800 rotate-90' : 'bg-gradient-to-tr from-indigo-600 to-violet-600 animate-pulse-slow'}
        `}
      >
        {isOpen ? (
            <X className="text-white w-6 h-6 transition-transform" />
        ) : (
            <>
                <MessageCircle className="text-white w-7 h-7 fill-white/20" />
                {/* Notification Dot */}
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white rounded-full flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                </span>
            </>
        )}
      </button>
      
      {/* Overlay para fechar no desktop ao clicar fora (opcional, mas bom pra UX) */}
      {isOpen && window.innerWidth >= 768 && (
        <div className="fixed inset-0 z-[9998]" onClick={() => setIsOpen(false)}></div>
      )}
    </div>
  );
};
