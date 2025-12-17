
import React, { useState } from 'react';
import { PLANS } from '../constants';
import { Button } from '../components/Button';
import { Check, Crown, Zap, TrendingUp, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PaymentModal } from '../components/PaymentModal';

const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const handleSelectPlan = (plan: any) => {
    if (!user) { navigate('/login'); return; }
    
    if (plan.price === '0.00') {
        navigate('/');
        return;
    }
    
    setSelectedPlan(plan);
  };

  return (
    <div className="max-w-7xl mx-auto py-20 md:py-32 px-4 animate-fade-in relative bg-mesh-dark min-h-screen">
      <div className="text-center mb-16 md:mb-32">
        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-[10px] font-black uppercase tracking-[0.3em] mb-8 md:mb-10 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <TrendingUp size={14} /> Retorno Sobre Investimento
        </div>
        <h1 className="text-5xl sm:text-7xl md:text-[8rem] font-black text-white mb-6 md:mb-8 leading-[0.9] md:leading-[0.85] tracking-tighter drop-shadow-2xl">
            Poder. <br/>
            <span className="text-gradient-animated">Ilimitado.</span>
        </h1>
        <p className="text-base md:text-xl text-slate-400 font-light max-w-xs md:max-w-2xl mx-auto leading-relaxed">
            Ferramentas de nível corporativo acessíveis para você. Cancele quando quiser, sem perguntas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-32 md:mb-48 perspective-1000 items-end">
        {PLANS.map((plan) => {
          const isMaster = plan.id.includes('master');
          const isPro = plan.highlight;
          
          return (
          <div 
            key={plan.id}
            className={`
                group relative rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 flex flex-col overflow-hidden backface-hidden transition-all duration-500
                ${isMaster 
                    ? 'bg-slate-900 border border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.15)] md:scale-110 z-10 hover:-translate-y-2' 
                    : isPro 
                        ? 'bg-slate-900/60 border border-indigo-500/30 backdrop-blur-md hover:-translate-y-2 hover:border-indigo-500/50' 
                        : 'bg-slate-950/40 border border-white/10 backdrop-blur-md hover:-translate-y-2 hover:border-white/20'}
            `}
          >
            {/* Master Shine Effect */}
            {isMaster && (
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_20px_#fbbf24]"></div>
            )}

            <div className="mb-6 md:mb-8 text-center">
                <div className={`w-16 h-16 md:w-20 md:h-20 mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-xl transition-all group-hover:scale-110 ${isMaster ? 'bg-gradient-to-br from-amber-400 to-orange-600 text-slate-900' : isPro ? 'bg-gradient-to-br from-indigo-500 to-fuchsia-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                    {isMaster ? <Crown className="w-8 h-8 md:w-10 md:h-10" fill="currentColor"/> : <Zap className="w-8 h-8 md:w-10 md:h-10" fill="currentColor"/>}
                </div>
                <h3 className={`text-2xl md:text-3xl font-black mb-2 tracking-tight ${isMaster ? 'text-white' : 'text-slate-200'}`}>{plan.name}</h3>
                <p className="text-xs md:text-sm font-medium text-slate-500 leading-relaxed px-4">
                    {plan.description}
                </p>
            </div>
            
            <div className="mb-8 md:mb-10 text-center">
              <div className="flex items-baseline justify-center gap-1 text-white">
                <span className="text-base md:text-lg font-bold opacity-60">R$</span>
                <span className="text-5xl md:text-6xl font-black tracking-tighter">{plan.price}</span>
              </div>
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mt-2 block text-slate-500"> 
                {plan.period}
              </span>
            </div>

            <div className="space-y-3 md:space-y-4 mb-8 md:mb-10 flex-grow px-2">
               {plan.features.map((f, i) => (
                 <div key={i} className={`flex items-start gap-3 text-xs md:text-sm font-bold ${isMaster ? 'text-slate-300' : 'text-slate-400'}`}>
                    <div className={`shrink-0 w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center ${isMaster ? 'bg-amber-500 text-slate-950' : isPro ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                        <Check size={10} strokeWidth={4} />
                    </div>
                    {f}
                 </div>
               ))}
            </div>

            <button 
                onClick={() => handleSelectPlan(plan)}
                className={`w-full h-14 md:h-16 rounded-2xl text-xs md:text-sm font-black group flex items-center justify-center gap-2 transition-all shadow-xl hover:scale-[1.02] active:scale-95 ${isMaster ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 btn-shine' : isPro ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-white text-slate-900 hover:bg-slate-200'}`}
            >
                {plan.price === '0.00' ? 'CRIAR CONTA GRÁTIS' : 'GARANTIR ACESSO'}
                <ArrowRight className="transition-transform group-hover:translate-x-1" size={16} />
            </button>
            
            {isMaster && (
                <div className="mt-4 flex justify-center items-center gap-2 text-[9px] md:text-[10px] text-amber-500/80 font-bold uppercase tracking-wider">
                    <ShieldCheck size={12} /> Garantia de 7 dias
                </div>
            )}
          </div>
        )})}
      </div>

      {selectedPlan && user && (
          <PaymentModal 
              plan={selectedPlan} 
              user={user} 
              onClose={() => setSelectedPlan(null)} 
          />
      )}
    </div>
  );
};

export default Pricing;
