
import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DOCUMENT_TEMPLATES, ICONS } from '../constants';
import { ArrowRight, Crown, Sparkles, Lock, Zap, Layout, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

// Componente para revelar seções ao rolar (Scroll Reveal)
const RevealSection: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setIsVisible(true);
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const { current } = domRef;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// 3D Decorative Object Component
const FloatingCube: React.FC<{ size: number; top: string; left: string; delay?: string }> = ({ size, top, left, delay = '0s' }) => (
    <div className="absolute float-shape scene-3d opacity-40 hover:opacity-80 transition-opacity duration-500 pointer-events-none" style={{ top, left, animationDelay: delay }}>
        <div className="cube-container" style={{ width: size, height: size }}>
            <div className="cube-face cube-face-front" style={{ width: size, height: size, transform: `rotateY(0deg) translateZ(${size/2}px)` }}></div>
            <div className="cube-face cube-face-back" style={{ width: size, height: size, transform: `rotateY(180deg) translateZ(${size/2}px)` }}></div>
            <div className="cube-face cube-face-right" style={{ width: size, height: size, transform: `rotateY(90deg) translateZ(${size/2}px)` }}></div>
            <div className="cube-face cube-face-left" style={{ width: size, height: size, transform: `rotateY(-90deg) translateZ(${size/2}px)` }}></div>
            <div className="cube-face cube-face-top" style={{ width: size, height: size, transform: `rotateX(90deg) translateZ(${size/2}px)` }}></div>
            <div className="cube-face cube-face-bottom" style={{ width: size, height: size, transform: `rotateX(-90deg) translateZ(${size/2}px)` }}></div>
        </div>
    </div>
);

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [siteConfig, setSiteConfig] = useState({
    promoBadge: "Tecnologia Pollinations AI",
    heroTitle: "Sua Criatividade <br/><span class='text-gradient-animated'>Sem Limites.</span>",
    heroSubtitle: "De freelancers a grandes agências: crie sites, imagens e copys profissionais em segundos com IA Open Source."
  });

  useEffect(() => {
    const fetchConfig = async () => {
      const { data, error } = await supabase.from('site_config').select('*').limit(1).single();
      if (data && !error) {
        let badge = data.promo_badge || "Tecnologia Pollinations AI";
        let title = data.hero_title || "Sua Criatividade <br/><span class='text-gradient-animated'>Sem Limites.</span>";
        let subtitle = data.hero_subtitle || "De freelancers a grandes agências: crie sites, imagens e copys profissionais em segundos com IA Open Source.";

        if (badge.toLowerCase().includes("gemini") || badge.includes("3.0")) {
            badge = "Tecnologia Pollinations AI";
        }
        if (title.toLowerCase().includes("gemini")) {
            title = "Sua Criatividade <br/><span class='text-gradient-animated'>Sem Limites.</span>";
        }
        if (subtitle.toLowerCase().includes("gemini")) {
            subtitle = "De freelancers a grandes agências: crie sites, imagens e copys profissionais em segundos com IA Open Source.";
        }

        setSiteConfig({
          promoBadge: badge,
          heroTitle: title,
          heroSubtitle: subtitle
        });
      }
    };
    fetchConfig();
  }, []);

  const premiumTemplates = DOCUMENT_TEMPLATES.filter(t => 
    ['launch-agent-360', 'website-generator', 'ai-image-generator', 'banner-pro'].includes(t.id)
  );
  
  const standardTemplates = DOCUMENT_TEMPLATES.filter(t => 
    !['launch-agent-360', 'website-generator', 'ai-image-generator', 'banner-pro'].includes(t.id)
  );

  const isMasterUser = user?.planType === 'master_monthly' || user?.planType === 'yearly' || user?.isAdmin;
  const isSubscriber = user?.isPro || isMasterUser;
  const isFreePlan = !user?.isPro && (!user?.planType || user?.planType === 'free');

  const handleServiceClick = (e: React.MouseEvent, templateId: string) => {
    const isMasterOnly = templateId === 'launch-agent-360';
    const isLockedForFree = templateId === 'website-generator'; 
    
    if (isMasterOnly && !isMasterUser) {
        e.preventDefault();
        navigate('/pricing');
        return;
    }
    if (isLockedForFree && isFreePlan) {
        e.preventDefault();
        alert("A criação de Sites completos é exclusiva para membros Pro. Faça upgrade para desbloquear.");
        navigate('/pricing');
        return;
    }
    if (!isSubscriber && (!user?.credits || user.credits <= 0)) {
        e.preventDefault();
        navigate('/pricing');
        return;
    }
  };

  const renderCard = (template: typeof DOCUMENT_TEMPLATES[0], isPremiumSection: boolean) => {
    const Icon = ICONS[template.icon];
    const isMasterOnly = template.id === 'launch-agent-360';
    const isLockedForFree = template.id === 'website-generator';
    
    let isLocked = false;
    let lockLabel = "";
    
    if (isMasterOnly && !isMasterUser) {
        isLocked = true;
        lockLabel = "Exclusivo Master";
    } else if (isLockedForFree && isFreePlan) {
        isLocked = true;
        lockLabel = "Apenas Pro/Master";
    } else if (!isSubscriber && (!user?.credits || user.credits <= 0)) {
        isLocked = true;
        lockLabel = "Sem Créditos";
    }

    return (
        <Link 
          key={template.id} 
          to={`/generate/${template.id}`}
          onClick={(e) => handleServiceClick(e, template.id)}
          className={`group relative flex flex-col h-full rounded-3xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:-translate-y-2 card-3d-hover ${
            isPremiumSection 
                ? 'bg-[#0f172a] border border-indigo-500/30 shadow-2xl shadow-indigo-900/20' 
                : 'bg-white border border-slate-100 hover:border-indigo-200 shadow-xl shadow-slate-200/50'
          }`}
        >
           {/* Efeito de Borda Brilhante no Hover (Pseudo-element Gradient) */}
           <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 ${isPremiumSection ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500' : 'bg-gradient-to-br from-blue-400 to-indigo-400'}`} style={{ padding: '2px' }}>
               <div className={`h-full w-full rounded-[22px] ${isPremiumSection ? 'bg-[#0f172a]' : 'bg-white'}`}></div>
           </div>

           {/* Internal ambient glow for Premium */}
           {isPremiumSection && (
              <>
                 <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-purple-600/10 opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                 {/* Moving sheen */}
                 <div className="absolute top-0 -left-[100%] w-[200%] h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 group-hover:animate-[shimmer_1.5s_infinite]"></div>
              </>
           )}

           <div className="p-6 md:p-8 flex flex-col h-full relative z-10 transform preserve-3d">
               {/* Header: Icon + Badge */}
               <div className="flex justify-between items-start mb-6">
                   <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-white shadow-lg transform group-hover:translate-z-10 transition-all duration-300 ${template.color}`}>
                       {Icon && <Icon size={28} className="md:w-8 md:h-8" strokeWidth={1.5} />}
                   </div>
                   
                   {isLocked ? (
                       <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-amber-500/50 shadow-lg shadow-amber-500/10">
                           <Lock size={12} className="text-amber-400" />
                           <span className="text-[9px] md:text-[10px] font-bold text-amber-400 uppercase tracking-wide whitespace-nowrap">{lockLabel}</span>
                       </div>
                   ) : isMasterOnly ? (
                       <div className="relative">
                          <span className="absolute inset-0 animate-ping opacity-75 inline-flex h-full w-full rounded-full bg-amber-400"></span>
                          <div className="relative bg-gradient-to-r from-amber-300 to-yellow-500 text-slate-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-amber-500/40">
                              <Crown size={12} fill="currentColor" /> ELITE
                          </div>
                       </div>
                   ) : isPremiumSection ? (
                       <div className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-indigo-500/30">
                           PRO
                       </div>
                   ) : null}
               </div>

               {/* Content */}
               <h3 className={`font-heading font-bold text-xl md:text-2xl mb-3 leading-tight ${isPremiumSection ? 'text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 group-hover:from-white group-hover:to-white' : 'text-slate-900 group-hover:text-indigo-600 transition-colors'}`}>
                   {template.title}
               </h3>
               <p className={`text-sm leading-relaxed mb-6 flex-grow font-medium ${isPremiumSection ? 'text-slate-400 group-hover:text-slate-300' : 'text-slate-500'}`}>
                   {template.description}
               </p>

               {/* Action Footer */}
               <div className={`mt-auto pt-5 border-t ${isPremiumSection ? 'border-white/10' : 'border-slate-100'}`}>
                   {isLocked ? (
                       <div className="flex items-center text-amber-500 text-sm font-bold group-hover:translate-x-1 transition-transform">
                           <Sparkles size={16} className="mr-2 animate-pulse" />
                           Desbloquear
                           <ArrowRight size={16} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                       </div>
                   ) : (
                       <button className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all btn-shine ${
                           isPremiumSection 
                             ? 'bg-white text-slate-900 hover:bg-indigo-50' 
                             : 'bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-600 group-hover:from-indigo-600 group-hover:to-violet-600 group-hover:text-white'
                       }`}>
                           Criar Agora
                           <Zap size={16} className={isPremiumSection ? "text-indigo-600" : "fill-current"} />
                       </button>
                   )}
               </div>
           </div>
        </Link>
    );
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      
      {/* FREE PLAN ALERT - Gradient Border */}
      {isFreePlan && user && (
         <div className="max-w-7xl mx-auto px-4 mt-4 animate-fade-in flex justify-center">
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-[1px] rounded-full shadow-lg">
                <div className="bg-white rounded-full px-5 py-2 flex flex-wrap justify-center items-center gap-2 text-xs sm:text-sm">
                    <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center gap-1">
                        <Zap size={14} className="text-purple-600 fill-purple-600" /> Grátis:
                    </span>
                    <span className="text-slate-700 font-bold">
                        {user.credits} gerações restantes.
                    </span>
                    <div className="hidden sm:block h-3 w-px bg-slate-300"></div>
                    <Link to="/pricing" className="text-indigo-600 font-bold hover:underline">
                        Faça Upgrade
                    </Link>
                </div>
            </div>
         </div>
      )}
      
      {/* 
        HERO SECTION: REFORMULADA (3D UNIVERSE)
        Fundo escuro profundo com "Aurora" neon vibrante e OBJETOS 3D FLUTUANTES.
      */}
      <div className="relative max-w-[1400px] mx-auto mt-4 md:mt-6 mb-12 md:mb-20 px-2 md:px-4">
        <div className="relative rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-[#020617] shadow-[0_0_80px_-20px_rgba(124,58,237,0.3)] border border-indigo-500/20 isolate group scene-3d">
            
            {/* Animated Background Layers (More vibrant) */}
            <div className="absolute inset-0 bg-grid-pattern opacity-10 animate-[pulse_8s_infinite]"></div>
            
            {/* Blobs de Cor Intensa (Reduzidos no mobile) */}
            <div className="absolute -top-20 -left-10 md:-top-40 md:-left-20 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-indigo-600 rounded-full mix-blend-screen filter blur-[80px] md:blur-[120px] opacity-30 animate-blob"></div>
            <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-fuchsia-600 rounded-full mix-blend-screen filter blur-[80px] md:blur-[120px] opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-20 left-[20%] w-[350px] md:w-[600px] h-[350px] md:h-[600px] bg-blue-600 rounded-full mix-blend-screen filter blur-[80px] md:blur-[120px] opacity-20 animate-blob animation-delay-4000"></div>

            {/* 3D OBJECTS INJECTION (Menores no mobile) */}
            <div className="hidden md:block">
                <FloatingCube size={40} top="20%" left="10%" delay="0s" />
                <FloatingCube size={60} top="60%" left="85%" delay="2s" />
                <FloatingCube size={30} top="80%" left="20%" delay="4s" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 py-12 px-4 sm:px-12 md:py-32 md:px-20 text-center flex flex-col items-center">
                
                {/* Floating Badge (Glassmorphism + Border Gradient) */}
                <div className="mb-6 md:mb-8 orb-float">
                    <div className="inline-flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:scale-105 transition-transform cursor-default ring-1 ring-white/20">
                        <span className="relative flex h-2.5 w-2.5 md:h-3 md:w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 md:h-3 md:w-3 bg-fuchsia-500"></span>
                        </span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-fuchsia-200 to-pink-200 text-xs md:text-sm font-bold tracking-wide drop-shadow-sm truncate max-w-[250px] md:max-w-none">{siteConfig.promoBadge}</span>
                    </div>
                </div>

                {/* Main Headline - Bigger and Gradient */}
                <h1 
                    className="font-heading text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.1] md:leading-[1.05] tracking-tight mb-6 md:mb-8 drop-shadow-2xl px-2"
                    dangerouslySetInnerHTML={{ __html: siteConfig.heroTitle }}
                />

                <p className="text-base md:text-2xl text-slate-300 max-w-3xl mx-auto mb-8 md:mb-12 font-light leading-relaxed px-4">
                    {siteConfig.heroSubtitle}
                </p>

                {/* Call to Actions - "Click Machines" */}
                <div className="flex flex-col sm:flex-row gap-4 md:gap-5 w-full justify-center items-center perspective-1000 px-4">
                    <button 
                        onClick={() => document.getElementById('hub-section')?.scrollIntoView({ behavior: 'smooth' })}
                        className="relative group btn-shine bg-white text-slate-900 font-black text-lg md:text-xl py-4 md:py-5 px-8 md:px-12 rounded-2xl shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)] hover:scale-105 hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.7)] transition-all duration-300 flex items-center gap-3 w-full sm:w-auto justify-center overflow-hidden border-2 border-transparent hover:border-indigo-100 transform hover:rotate-x-12"
                    >
                        <Play size={20} className="fill-slate-900 group-hover:fill-indigo-600 transition-colors md:w-6 md:h-6" />
                        <span className="relative z-10 group-hover:text-indigo-600 transition-colors">COMEÇAR AGORA</span>
                    </button>

                    <Link to="/pricing" className="w-full sm:w-auto">
                        <button className="w-full group flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-white font-medium py-4 md:py-5 px-8 md:px-10 rounded-2xl border border-white/10 hover:border-amber-400/50 transition-all text-lg backdrop-blur-sm">
                            <Crown className="w-5 h-5 md:w-6 md:h-6 text-amber-400 group-hover:rotate-12 transition-transform drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                            Ver Planos
                        </button>
                    </Link>
                </div>
            </div>
        </div>
      </div>

      <div id="hub-section" className="h-10 md:h-20"></div>

      {/* 
         CONTENT SECTIONS
      */}
      <div className="max-w-7xl mx-auto pb-20 px-4">
          
          {/* PREMIUM / ELITE TOOLS */}
          <RevealSection>
             <div className="mb-16 md:mb-24 relative isolate">
                {/* Background glow for this section */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-fuchsia-500/5 blur-3xl -z-10 rounded-full transform scale-y-50"></div>
                
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 md:mb-12 gap-6">
                   <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row w-full md:w-auto">
                       <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-slate-800 relative overflow-hidden group mx-auto md:mx-0">
                           <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-fuchsia-500 opacity-20 group-hover:opacity-30 transition-opacity"></div>
                           <Crown size={28} className="text-amber-400 animate-pulse-soft relative z-10 md:w-8 md:h-8" fill="#fbbf24" />
                       </div>
                       <div>
                           <h2 className="text-3xl md:text-4xl font-black text-slate-900 font-heading tracking-tight">
                               <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600">Ferramentas Elite</span>
                           </h2>
                           <p className="text-slate-500 font-medium text-base md:text-lg">O poder máximo da IA generativa.</p>
                       </div>
                   </div>
                   
                   {!isSubscriber && (
                       <Link to="/pricing" className="flex items-center gap-2 text-indigo-600 font-bold hover:text-fuchsia-600 transition-colors bg-white px-4 py-2 rounded-full shadow-sm hover:shadow-md border border-indigo-100 text-sm">
                           Desbloquear tudo <ArrowRight size={16} />
                       </Link>
                   )}
                </div>
                
                {/* Grid Responsivo: 1 col no mobile, 2 no tablet, 3 no desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 scene-3d">
                   {premiumTemplates.map(template => renderCard(template, true))}
                </div>
             </div>
          </RevealSection>

          {/* STANDARD TOOLS */}
          <RevealSection delay={200}>
             <div className="mb-16 md:mb-24">
                <div className="flex items-center gap-4 mb-8 md:mb-10 border-b border-slate-200 pb-6">
                   <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl text-white shadow-lg shadow-blue-500/30">
                       <Layout size={20} className="md:w-6 md:h-6" />
                   </div>
                   <div>
                       <h2 className="text-xl md:text-2xl font-bold text-slate-900 font-heading">Caixa de Ferramentas</h2>
                       <p className="text-slate-500 font-medium text-sm md:text-base">Agilidade para o dia a dia.</p>
                   </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 scene-3d">
                   {standardTemplates.map(template => renderCard(template, false))}
                </div>
             </div>
          </RevealSection>

          {/* FOOTER CTA - HYPER MARKETING STYLE */}
          {!isSubscriber && (
            <RevealSection delay={300}>
                <div className="relative rounded-[2rem] md:rounded-[3rem] p-8 md:p-24 text-center text-white overflow-hidden shadow-2xl group border-4 border-white/20 bg-[#0F172A] isolate transform hover:scale-[1.01] transition-transform duration-500">
                    {/* Intense Background Gradients */}
                    <div className="absolute top-0 right-0 w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-indigo-600 rounded-full blur-[100px] md:blur-[150px] opacity-50 -mr-20 -mt-20 md:-mr-40 md:-mt-40 animate-pulse-soft"></div>
                    <div className="absolute bottom-0 left-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-fuchsia-600 rounded-full blur-[100px] md:blur-[150px] opacity-40 -ml-10 -mb-10 md:-ml-20 md:-mb-20"></div>
                    <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
                    
                    <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 md:px-6 md:py-2 rounded-full border border-white/20 mb-6 md:mb-10 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                            <Sparkles size={16} className="text-yellow-300 fill-yellow-300" />
                            <span className="text-xs md:text-base font-bold tracking-wider uppercase text-white">Oferta por Tempo Limitado</span>
                        </div>
                        
                        <h2 className="text-4xl md:text-7xl font-black mb-6 md:mb-8 font-heading leading-[0.9]">
                            Não fique para trás. <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-fuchsia-300 drop-shadow-lg">Lidere o mercado.</span>
                        </h2>
                        
                        <p className="text-indigo-100 mb-8 md:mb-12 text-lg md:text-2xl font-light opacity-90 max-w-2xl mx-auto leading-relaxed">
                           A inteligência artificial não vai substituir você. <br/>
                           <strong className="text-white font-bold">Quem usa IA vai substituir quem não usa.</strong>
                        </p>
                        
                        <Link to="/pricing" className="w-full sm:w-auto">
                            <button className="w-full bg-white text-indigo-950 font-black py-4 md:py-6 px-8 md:px-16 rounded-2xl hover:bg-indigo-50 transition-all shadow-[0_0_60px_-15px_rgba(255,255,255,0.7)] hover:scale-105 active:scale-95 text-lg md:text-2xl flex items-center justify-center gap-3 border-4 border-white/50 btn-shine ring-4 ring-indigo-500/30">
                                <Zap size={24} fill="currentColor" className="text-indigo-600 md:w-7 md:h-7" />
                                DESBLOQUEAR TUDO
                            </button>
                        </Link>
                    </div>
                </div>
            </RevealSection>
          )}

      </div>
    </div>
  );
};

export default Dashboard;
