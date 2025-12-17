
import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DOCUMENT_TEMPLATES, ICONS } from '../constants';
import { ArrowRight, ArrowDown, Crown, Sparkles, Plus, Lock, Loader2, Aperture, Command, Layers, Flame, CheckCircle2, Star, Zap, CreditCard, Award, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { omniCoreGenerate } from '../services/geminiService';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Omni Core States
  const [omniInput, setOmniInput] = useState('');
  const [omniImages, setOmniImages] = useState<string[]>([]);
  const [omniMode, setOmniMode] = useState<'creative' | 'analytical' | 'executive'>('executive');
  const [omniResponse, setOmniResponse] = useState('');
  const [isOmniLoading, setIsOmniLoading] = useState(false);
  const omniFileRef = useRef<HTMLInputElement>(null);
  const omniResultRef = useRef<HTMLDivElement>(null);

  const categories = ['All', 'Curriculo', 'Marketing', 'Business', 'Jurídico', 'Criativo'];

  const filteredTemplates = activeCategory === 'All' 
    ? DOCUMENT_TEMPLATES 
    : DOCUMENT_TEMPLATES.filter(t => t.category === activeCategory);

  const isMaster = user?.planType === 'master_monthly' || user?.planType === 'yearly' || user?.isAdmin;
  const isPro = user?.isPro || isMaster;

  // --- RENDERIZAÇÃO DO CARD ---
  const renderCard = (template: typeof DOCUMENT_TEMPLATES[0]) => {
    const Icon = ICONS[template.icon];
    const isElite = template.minPlan === 'master';
    const isPremium = template.minPlan === 'pro';
    const isCV = template.category === 'Curriculo';
    const isNew = ['viral-ugc-engine', 'neural-data-analyst', 'cv-executive', 'cv-creative'].includes(template.id);
    const hasAccess = (isElite && isMaster) || (isPremium && isPro) || (!template.minPlan && template.category !== 'Curriculo');
    const hasPrice = !!template.oneTimePrice;

    // Definição de Cores por Nível
    const glowType = isElite ? 'glow-master' : isPremium ? 'glow-pro' : 'glow-free';
    const accentColor = isElite ? 'text-amber-400' : isPremium ? 'text-indigo-400' : 'text-cyan-400';
    const badgeBg = isElite ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : isPremium ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400';

    // Highlight visual for CVs
    const containerClasses = isCV 
        ? `bg-gradient-to-br from-slate-900 via-[#0f111a] to-slate-900 border-indigo-500/30 shadow-[0_0_30px_rgba(79,70,229,0.15)] ring-1 ring-indigo-500/50 hover:scale-[1.02]`
        : `cyber-card ${glowType}`;

    return (
        <Link 
          key={template.id} 
          to={`/generate/${template.id}`}
          className="group block h-full w-full active:scale-[0.98] transition-all duration-300"
        >
          <div className={`${containerClasses} h-full rounded-[20px] md:rounded-[24px] p-5 md:p-6 flex flex-col justify-between relative overflow-hidden`}>
               
               {/* Background Gradient Spot */}
               <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[60px] opacity-0 group-hover:opacity-40 transition-opacity duration-500 ${isElite ? 'bg-amber-500' : isPremium ? 'bg-indigo-600' : 'bg-cyan-500'}`}></div>

               {/* HEADER: Icon + Badges */}
               <div className="flex justify-between items-start mb-5 relative z-10">
                   <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 bg-[#0f111a] border border-white/5`}>
                       {Icon && <Icon size={24} strokeWidth={1.5} className={accentColor} />}
                   </div>
                   
                   <div className="flex flex-col items-end gap-2">
                        {isNew && (
                            <span className="flex items-center gap-1 bg-red-600 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider animate-pulse shadow-[0_0_10px_#dc2626]">
                                <Flame size={10} fill="currentColor" /> Novo
                            </span>
                        )}
                        <div className={`px-2 py-1 rounded border text-[9px] font-black uppercase tracking-wider flex items-center gap-1 ${badgeBg}`}>
                            {isElite ? <Crown size={10} /> : isPremium ? <Star size={10} /> : <Zap size={10} />}
                            {isElite ? 'Master' : isPremium ? 'Pro' : 'Free'}
                        </div>
                   </div>
               </div>

               {/* BODY: Content */}
               <div className="flex-grow flex flex-col relative z-10">
                   <div className="flex flex-col gap-1 mb-3">
                       <h3 className="font-hero font-bold text-lg md:text-xl leading-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-all">
                           {template.title}
                       </h3>

                       {/* PREÇO DESTACADO (Se existir e usuário não for Pro) */}
                       {hasPrice && !isPro && (
                           <div className="self-start mt-1 bg-emerald-600 text-white border border-emerald-400 px-3 py-1 rounded-lg text-xs font-black whitespace-nowrap shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center gap-1.5 transform group-hover:scale-105 transition-transform origin-left">
                               <CreditCard size={12} strokeWidth={3} />
                               R$ {template.oneTimePrice?.toFixed(2).replace('.', ',')}
                           </div>
                       )}
                   </div>
                   
                   <p className="text-sm text-slate-400 font-medium leading-relaxed mb-4 md:mb-6 line-clamp-3">
                       {template.description}
                   </p>
               </div>

               {/* FOOTER: Action */}
               <div className="mt-auto border-t border-white/5 pt-4 flex items-center justify-between relative z-10">
                   <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest group-hover:text-slate-500 transition-colors">
                      {template.category}
                   </span>
                   
                   <div className={`flex items-center gap-2 text-[10px] font-black transition-all duration-300 transform translate-y-0 group-hover:translate-x-1 ${hasAccess ? 'text-emerald-400' : 'text-slate-500'}`}>
                       {hasAccess ? (
                           <>ACESSAR <ArrowRight size={12} /></>
                       ) : (
                           <><Lock size={12} /> {hasPrice ? 'COMPRAR' : 'BLOQUEADO'}</>
                       )}
                   </div>
               </div>
          </div>
        </Link>
    );
  };

  const handleOmniSubmit = async () => {
      if (!isPro) { navigate('/pricing'); return; }
      if (!omniInput.trim() && omniImages.length === 0) return;
      setIsOmniLoading(true);
      setOmniResponse('');
      try {
          const result = await omniCoreGenerate(omniInput, omniImages, omniMode);
          setOmniResponse(result);
          setTimeout(() => { omniResultRef.current?.scrollIntoView({ behavior: 'smooth' }); }, 100);
      } catch (error) { setOmniResponse("Erro no Omni."); } finally { setIsOmniLoading(false); }
  };

  const handleOmniFile = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []) as File[];
      files.forEach(file => {
          const reader = new FileReader();
          reader.onloadend = () => setOmniImages(prev => [...prev, reader.result as string]);
          reader.readAsDataURL(file);
      });
  };

  return (
    <div className="w-full">
      
      {/* --- HERO SECTION MASSIVA --- */}
      <div className="relative min-h-[90vh] flex flex-col justify-center items-center text-center px-4 pt-28 pb-16 md:pt-32 md:pb-20">
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[900px] md:h-[900px] bg-indigo-500/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none -z-10"></div>

          <div className="relative z-10 animate-fade-in-up max-w-6xl mx-auto flex flex-col items-center">
              
              <div className="inline-flex items-center gap-2 md:gap-3 px-4 py-2 md:px-6 md:py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-indigo-300 text-[9px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.3em] mb-6 md:mb-10 hover:bg-white/10 transition-colors shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                  <Sparkles size={12} className="text-amber-400 animate-pulse" /> Inteligência Artificial de Elite
              </div>
              
              <h1 className="font-hero text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-black text-white mb-6 md:mb-8 tracking-tighter leading-[1] md:leading-[0.95] drop-shadow-2xl">
                  A TECNOLOGIA DOS <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-amber-400 animate-gradient-x text-glow-gold">BILIONÁRIOS.</span>
              </h1>
              
              <p className="text-base sm:text-lg md:text-2xl text-slate-300 max-w-xs sm:max-w-2xl md:max-w-3xl mx-auto mb-10 md:mb-12 leading-relaxed font-light mix-blend-plus-lighter">
                  <span className="text-white font-bold block mb-1 md:mb-2">Agora na palma da sua mão.</span>
                  Da estratégia de vendas ao jurídico blindado. Acessibilidade para todos, poder para quem quer vencer.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6 items-center w-full mt-2">
                   <button onClick={() => document.getElementById('services')?.scrollIntoView({behavior: 'smooth'})} className="group btn-neon relative w-full sm:w-auto px-8 py-4 md:px-12 md:py-6 rounded-full font-black text-white text-sm md:text-lg tracking-wide hover:scale-105 transition-transform shadow-2xl shadow-indigo-900/50">
                       <span className="relative z-10 flex items-center justify-center gap-3">EXPLORAR ARSENAL <ArrowDown size={18} className="group-hover:translate-y-1 transition-transform"/></span>
                   </button>
                   {!isPro && (
                       <button onClick={() => navigate('/pricing')} className="w-full sm:w-auto px-8 py-4 md:px-12 md:py-6 rounded-full font-bold text-sm md:text-lg text-white border border-white/20 hover:bg-white/5 hover:border-amber-400/50 hover:text-amber-300 transition-all flex items-center justify-center gap-2 backdrop-blur-sm">
                           <Crown size={18} className="text-amber-400 animate-pulse" fill="currentColor"/> ACESSO VIP
                       </button>
                   )}
              </div>

              <div className="mt-16 md:mt-20 flex flex-wrap justify-center gap-4 md:gap-16 opacity-40 grayscale mix-blend-screen px-4">
                  {['Gemini 2.0 Flash', 'Processamento Neural', 'Dados Criptografados', '24/7'].map((tech, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold text-white whitespace-nowrap">
                          <CheckCircle2 size={12} /> {tech}
                      </div>
                  ))}
              </div>
          </div>
      </div>

      {/* --- SERVICES GRID FULL WIDTH (ALINHADO) --- */}
      <div id="services" className="w-full px-4 md:px-12 lg:px-24 py-16 md:py-24 bg-black/20 backdrop-blur-sm border-t border-white/5">
          <div className="max-w-[1600px] mx-auto">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-16 gap-6 md:gap-8 border-b border-white/5 pb-8">
                   <div className="text-center md:text-left">
                       <h2 className="text-3xl md:text-5xl font-hero font-black text-white flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-4 tracking-tight mb-2 md:mb-4 justify-center md:justify-start">
                           <Layers className="text-indigo-500 w-8 h-8 md:w-12 md:h-12" /> ARSENAL COMPLETO
                       </h2>
                       <p className="text-slate-400 text-sm md:text-xl max-w-2xl mx-auto md:mx-0">
                           Ferramentas de alta performance organizadas por objetivo. Selecione seu módulo.
                       </p>
                   </div>
                   
                   <div className="flex flex-wrap justify-center md:justify-end gap-2">
                       {categories.map(cat => (
                           <button 
                               key={cat}
                               onClick={() => setActiveCategory(cat)}
                               className={`px-3 py-2 md:px-5 md:py-2.5 rounded-xl text-[9px] md:text-xs font-black uppercase tracking-wider transition-all border ${activeCategory === cat ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.5)]' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white'}`}
                           >
                               {cat}
                           </button>
                       ))}
                   </div>
              </div>

              {/* SECTION: CURRÍCULOS DESTAQUE (Se estiver em All ou Curriculo) */}
              {(activeCategory === 'All' || activeCategory === 'Curriculo') && (
                  <div className="mb-12">
                      <div className="flex items-center gap-3 mb-6">
                           <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
                              <Briefcase size={20} fill="currentColor" />
                           </div>
                           <h3 className="text-2xl font-bold text-white tracking-tight">Carreira & Currículos de Elite</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                           {DOCUMENT_TEMPLATES.filter(t => t.category === 'Curriculo').map(renderCard)}
                      </div>
                      
                      {/* Divider se não for apenas categoria curriculo */}
                      {activeCategory === 'All' && <div className="h-px bg-white/5 my-12"></div>}
                  </div>
              )}

              {/* GRID GERAL (Restante) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-8 auto-rows-fr">
                  {filteredTemplates.filter(t => t.category !== 'Curriculo').map(renderCard)}
              </div>
          </div>
      </div>

      {/* --- NÚCLEO OMNI --- */}
      <div className="relative py-20 md:py-40 border-t border-white/5 bg-[#010208]">
          <div className="max-w-7xl mx-auto px-4 relative z-10">
              <div className="text-center mb-12 md:mb-20">
                  <div className="inline-flex items-center justify-center w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-[2rem] bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-500/50 mb-6 md:mb-8 shadow-[0_0_80px_rgba(99,102,241,0.3)] animate-float">
                      <Aperture size={32} className="md:w-12 md:h-12 text-indigo-400" />
                  </div>
                  <h2 className="text-4xl md:text-7xl lg:text-8xl font-black mb-4 md:mb-6 tracking-tighter text-white">
                      NÚCLEO <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 animate-gradient-x text-glow">OMNI</span>
                  </h2>
                  <p className="text-indigo-200/50 text-base md:text-2xl max-w-3xl mx-auto font-light">
                      Acesso direto à rede neural bruta. Sem templates. Poder ilimitado.
                  </p>
              </div>

              <div className="glass-panel rounded-2xl md:rounded-3xl p-1 relative border border-indigo-500/20 shadow-2xl overflow-hidden ring-1 ring-white/5 max-w-5xl mx-auto">
                   
                   {!isPro && (
                       <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-center p-6">
                           <Lock size={32} className="text-slate-500 mb-4 md:mb-6" />
                           <h3 className="text-xl md:text-3xl font-bold mb-4 text-white">Acesso Restrito Classe Elite</h3>
                           <button onClick={() => navigate('/pricing')} className="btn-neon text-white px-8 py-3 md:px-10 md:py-4 rounded-full font-black tracking-wide text-xs md:text-sm">
                               DESBLOQUEAR ACESSO
                           </button>
                       </div>
                   )}

                   <div className="bg-[#0c0e16] rounded-xl md:rounded-[1.4rem] p-4 md:p-10 min-h-[400px] md:min-h-[500px] flex flex-col">
                       {/* Terminal Header */}
                       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-8 border-b border-white/5 pb-4 gap-4 w-full">
                           <div className="flex gap-2">
                               <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-500 shadow-[0_0_10px_red]"></div>
                               <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-500 shadow-[0_0_10px_orange]"></div>
                               <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-500 shadow-[0_0_10px_green]"></div>
                           </div>
                           <div className="flex gap-2 bg-black/40 p-1 rounded-lg w-full md:w-auto overflow-x-auto no-scrollbar">
                               {[
                                   { id: 'creative', label: 'Visionário' },
                                   { id: 'analytical', label: 'Analítico' },
                                   { id: 'executive', label: 'Executivo' }
                               ].map(mode => (
                                   <button 
                                       key={mode.id}
                                       onClick={() => setOmniMode(mode.id as any)}
                                       className={`flex-1 md:flex-none px-3 py-2 rounded-md text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${omniMode === mode.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                                   >
                                       {mode.label}
                                   </button>
                               ))}
                           </div>
                       </div>

                       {/* Input Area */}
                       <div className="flex-grow flex flex-col relative group">
                           <textarea 
                               value={omniInput}
                               onChange={(e) => setOmniInput(e.target.value)}
                               placeholder="> Insira seu comando mestre aqui..."
                               className="w-full bg-transparent border-none text-indigo-50 placeholder-slate-700 text-lg md:text-2xl p-0 focus:ring-0 resize-none font-mono leading-relaxed flex-grow outline-none h-40 md:h-auto"
                           />

                           {omniImages.length > 0 && (
                               <div className="flex gap-4 mt-6 overflow-x-auto pb-2">
                                   {omniImages.map((src, i) => (
                                       <div key={i} className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.2)] flex-shrink-0">
                                           <img src={src} className="w-full h-full object-cover" />
                                       </div>
                                   ))}
                               </div>
                           )}
                       </div>

                       {/* Action Bar */}
                       <div className="flex flex-col md:flex-row justify-between items-center mt-6 md:mt-8 pt-6 border-t border-white/5 gap-4">
                           <div className="flex items-center gap-4 w-full md:w-auto">
                               <button 
                                 onClick={() => omniFileRef.current?.click()}
                                 className="text-slate-500 hover:text-indigo-400 transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-wider group w-full md:w-auto justify-center md:justify-start border border-slate-800 rounded-lg p-3 md:border-none md:p-0"
                               >
                                   <div className="w-6 h-6 md:w-8 md:h-8 rounded-full md:border border-slate-700 flex items-center justify-center group-hover:border-indigo-500 group-hover:bg-indigo-500/10">
                                      <Plus size={14} className="md:w-4 md:h-4" />
                                   </div>
                                   Adicionar Visual
                               </button>
                               <input type="file" ref={omniFileRef} className="hidden" accept="image/*" multiple onChange={handleOmniFile} />
                           </div>
                           
                           <button 
                             onClick={handleOmniSubmit}
                             disabled={isOmniLoading}
                             className={`w-full md:w-auto px-8 py-3 md:px-10 md:py-4 rounded-xl font-black text-xs md:text-sm flex items-center justify-center gap-3 transition-all ${isOmniLoading ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_30px_rgba(79,70,229,0.4)] hover:scale-105 active:scale-95'}`}
                           >
                               {isOmniLoading ? <Loader2 size={16} className="animate-spin" /> : <Command size={16} />}
                               {isOmniLoading ? 'PROCESSANDO...' : 'EXECUTAR'}
                           </button>
                       </div>

                       {omniResponse && (
                           <div ref={omniResultRef} className="mt-8 pt-8 border-t border-indigo-500/30 animate-fade-in pb-10">
                               <div className="flex items-center gap-2 mb-4 text-indigo-400 text-xs font-bold uppercase tracking-widest">
                                   <Aperture size={14} className="animate-spin-slow" /> Resposta do Núcleo
                               </div>
                               <pre className="whitespace-pre-wrap font-mono text-xs md:text-base text-indigo-100/90 leading-relaxed overflow-x-auto">{omniResponse}</pre>
                           </div>
                       )}
                   </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
