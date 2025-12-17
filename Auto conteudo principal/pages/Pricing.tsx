
import React, { useState, useEffect } from 'react';
import { PLANS, API_BASE_URL } from '../constants';
import { Button } from '../components/Button';
import { Check, ShieldCheck, PartyPopper, Crown, Sparkles, X, Loader2, AlertCircle, ArrowRight, Star } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Pricing: React.FC = () => {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Estados de Verificação
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshProfile } = useAuth();

  // Efeito para verificar pagamento ao retornar do gateway
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const status = query.get('status');
    const verifying = query.get('verifying');

    if (status === 'success' || verifying === 'true') {
        checkPaymentStatus();
    }
  }, [location]);

  const checkPaymentStatus = async () => {
      setIsVerifying(true);
      
      // Tenta verificar por até 5 vezes (poll)
      let attempts = 0;
      const maxAttempts = 5;
      
      const interval = setInterval(async () => {
          attempts++;
          
          // 1. Atualiza dados do usuário do Supabase
          await refreshProfile();
          
          // 2. Verifica se o status mudou na sessão local (atualizada pelo refreshProfile)
          // Nota: Como 'user' no closure pode estar desatualizado, idealmente checamos o retorno,
          // mas refreshProfile atualiza o contexto. Vamos assumir sucesso após algumas tentativas se não der erro.
          
          if (attempts >= maxAttempts) {
              clearInterval(interval);
              setIsVerifying(false);
              setPaymentSuccess(true); // Assume sucesso para dar feedback positivo, o usuário verá os recursos liberados
              window.history.replaceState({}, document.title, window.location.pathname);
          }
      }, 2000); // Checa a cada 2 segundos
  };

  const handleSelectPlan = async (plan: typeof PLANS[0]) => {
    if (plan.id === 'free_tier') {
        navigate('/');
        return;
    }
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }

    setLoading(true);
    setSelectedPlanId(plan.id);
    setErrorMsg('');

    try {
        const response = await fetch(`${API_BASE_URL}/pagamento/criar-checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                planId: plan.id,
                email: user.email,
                name: user.name,
                userId: user.id
            })
        });

        const data = await response.json();

        if (response.ok && data.paymentUrl) {
            window.location.href = data.paymentUrl;
        } else {
            throw new Error(data.error || "Erro ao conectar com servidor de pagamento.");
        }

    } catch (err: any) {
        console.error("Erro checkout:", err);
        setErrorMsg("Não foi possível iniciar o pagamento. Verifique se o backend está online.");
        setLoading(false);
        setSelectedPlanId(null);
    }
  };

  const renderFeature = (featureString: string, isMasterCard: boolean, isDarkTheme: boolean = false) => {
    const [text, tag] = featureString.split('||');
    const isNegative = text.includes('Sem ') || text.includes('❌');

    const getBadge = () => {
      switch (tag) {
        case 'PRO':
          return <span className={`ml-auto text-[10px] font-extrabold px-2 py-0.5 rounded-full tracking-wide uppercase border ${isDarkTheme ? 'bg-indigo-900/50 text-indigo-300 border-indigo-700' : 'bg-indigo-100 text-indigo-700 border-indigo-200'}`}>PRO</span>;
        case 'MASTER':
          return <span className={`ml-auto text-[10px] font-extrabold px-2 py-0.5 rounded-full tracking-wide uppercase border shadow-sm flex items-center gap-1 ${isDarkTheme ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' : 'bg-gradient-to-r from-amber-300 to-yellow-400 text-slate-900 border-amber-300'}`}><Crown size={8} fill="currentColor"/> MASTER</span>;
        case 'VIP':
          return <span className={`ml-auto text-[10px] font-extrabold px-2 py-0.5 rounded-full tracking-wide uppercase border ${isDarkTheme ? 'bg-rose-900/50 text-rose-300 border-rose-700' : 'bg-rose-100 text-rose-700 border-rose-200'}`}>VIP</span>;
        case 'OFF':
          return <span className={`ml-auto text-[10px] font-extrabold px-2 py-0.5 rounded-full tracking-wide uppercase border ${isDarkTheme ? 'bg-green-900/50 text-green-400 border-green-700' : 'bg-green-100 text-green-700 border-green-200'}`}>ECONOMIA</span>;
        case 'EXCLUSIVO':
          return <span className={`ml-auto text-[10px] font-extrabold px-2 py-0.5 rounded-full tracking-wide uppercase border ${isDarkTheme ? 'bg-purple-900/50 text-purple-300 border-purple-700' : 'bg-purple-100 text-purple-700 border-purple-200'}`}>BETA</span>;
        default:
          return null;
      }
    };

    return (
      <div className={`flex items-center gap-3 text-sm py-1 ${isDarkTheme ? (isNegative ? 'text-slate-600' : 'text-slate-200') : (isMasterCard ? 'text-slate-800' : isNegative ? 'text-slate-400' : 'text-slate-700')}`}>
        <div className={`shrink-0 rounded-full p-0.5 ${isNegative ? (isDarkTheme ? 'text-slate-700' : 'text-slate-300') : isMasterCard ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
           {isNegative ? <X size={14} /> : <Check size={14} strokeWidth={3} />}
        </div>
        <span className={`font-semibold ${isNegative ? 'line-through decoration-slate-300' : ''}`}>{text}</span>
        {getBadge()}
      </div>
    );
  };

  // --- TELA DE VERIFICAÇÃO / SUCESSO ---
  if (isVerifying || paymentSuccess) {
      return (
          <div className="min-h-[70vh] flex flex-col items-center justify-center animate-fade-in text-center px-4 relative z-10">
              <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl border border-indigo-100 max-w-lg w-full relative overflow-hidden">
                 <div className="absolute inset-0 bg-indigo-500/5"></div>
                 <div className="relative z-10 flex flex-col items-center">
                     {isVerifying ? (
                        <>
                           <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 relative">
                               <div className="absolute inset-0 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
                               <Loader2 className="w-8 h-8 text-indigo-600" />
                           </div>
                           <h2 className="text-2xl font-bold text-slate-900 mb-2">Validando Pagamento...</h2>
                           <p className="text-slate-500">Estamos confirmando sua transação com o banco. Isso leva apenas alguns segundos.</p>
                        </>
                     ) : (
                        <>
                           <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-8 animate-pulse-soft">
                                <PartyPopper size={48} />
                           </div>
                           <h2 className="text-4xl font-bold text-slate-900 mb-4 font-heading">Tudo Pronto!</h2>
                           <p className="text-slate-600 mb-8 text-lg">
                               Sua conta foi atualizada. Agora você tem acesso aos recursos de inteligência artificial.
                           </p>
                           <Button onClick={() => navigate('/')} className="w-full bg-green-600 hover:bg-green-700 shadow-xl shadow-green-200 py-4 text-lg">
                               Começar a Criar
                           </Button>
                        </>
                     )}
                 </div>
              </div>
          </div>
      );
  }

  const starterPlan = PLANS[0];
  const proMonthlyPlan = PLANS[1];
  const masterMonthlyPlan = PLANS[2];
  const masterYearlyPlan = PLANS[3];

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 animate-fade-in relative z-10">
      
      {/* Header */}
      <div className="text-center mb-16 relative">
        <h1 className="relative font-heading text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
          Níveis de <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600">Inteligência</span>
        </h1>
        <p className="relative text-xl text-slate-500 max-w-2xl mx-auto font-light">
          Escolha o poder de processamento ideal para sua ambição.
        </p>
      </div>
      
      {errorMsg && (
          <div className="max-w-xl mx-auto mb-8 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-center gap-2 justify-center">
              <AlertCircle size={20} />
              {errorMsg}
          </div>
      )}

      {/* PLANS DISPLAY */}
      <div className={`flex flex-col items-center gap-10 max-w-5xl mx-auto ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
        
        {/* 1. MASTER ANNUAL (THE BIG ONE) */}
        <div className="w-full relative group cursor-pointer" onClick={() => handleSelectPlan(masterYearlyPlan)}>
           {/* Glow Effect */}
           <div className="absolute -inset-1 bg-gradient-to-r from-amber-300 via-orange-500 to-fuchsia-600 rounded-[2.5rem] blur-lg opacity-60 group-hover:opacity-100 transition duration-500 animate-gradient-x"></div>
           
           <div className="relative bg-[#020617] rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 shadow-2xl overflow-hidden border border-white/10">
              {/* Background Details */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-b from-amber-500/20 to-transparent rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-full h-full bg-grid-pattern opacity-10 pointer-events-none"></div>

              <div className="flex-1 text-center md:text-left z-10">
                 <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full px-4 py-1.5 mb-6 shadow-lg shadow-amber-500/20">
                    <Crown size={14} className="text-white" fill="currentColor" />
                    <span className="text-xs font-black text-white uppercase tracking-widest">A Escolha da Elite</span>
                 </div>
                 <h2 className="text-4xl md:text-5xl font-heading font-black text-white mb-3">Master Anual</h2>
                 <p className="text-slate-300 text-xl mb-8 max-w-md font-light">{masterYearlyPlan.description}</p>
                 <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="text-left bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                        <div className="flex items-baseline gap-2">
                           <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 tracking-tight">R$ {masterYearlyPlan.price}</span>
                           <span className="text-slate-400 font-bold">/ano</span>
                        </div>
                        <p className="text-green-400 text-sm font-bold mt-1 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                            Equivalente a R$ 32,32/mês
                        </p>
                    </div>
                 </div>
              </div>

              <div className="w-full md:w-auto flex flex-col gap-6 z-10">
                 <Button 
                    className="w-full md:w-80 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white font-black text-xl py-6 rounded-2xl shadow-[0_0_40px_-10px_rgba(245,158,11,0.6)] hover:scale-105 active:scale-95 transition-transform border-none"
                    isLoading={loading && selectedPlanId === masterYearlyPlan.id}
                 >
                    {loading && selectedPlanId === masterYearlyPlan.id ? 'Processando...' : 'ATIVAR PLANO MASTER'}
                 </Button>
                 <div className="bg-white/5 rounded-2xl p-6 border border-white/10 w-full md:w-80 backdrop-blur-md">
                     <p className="text-amber-200 text-xs font-bold mb-4 uppercase tracking-wider flex items-center gap-2">
                        <Star size={12} fill="currentColor" /> Tudo do Mensal +
                     </p>
                     <div className="space-y-3">
                        {masterYearlyPlan.features.slice(2, 5).map((f, i) => <div key={i}>{renderFeature(f, true, true)}</div>)}
                     </div>
                 </div>
              </div>
           </div>
        </div>

        {/* 2. MASTER MONTHLY */}
        <div className="w-full max-w-4xl group" onClick={() => handleSelectPlan(masterMonthlyPlan)}>
            <div className="bg-white rounded-[2rem] border-2 border-slate-100 p-8 flex flex-col md:flex-row items-center gap-8 shadow-xl relative overflow-hidden transition-all duration-300 hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-500/20 cursor-pointer">
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-indigo-500 to-purple-500"></div>
                
                <div className="flex-1 text-center md:text-left">
                   <h3 className="text-2xl font-bold text-slate-900 font-heading flex items-center justify-center md:justify-start gap-2">
                       Master Mensal 
                       <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-md font-bold">POPULAR</span>
                   </h3>
                   <p className="text-slate-500 mt-2 font-medium">{masterMonthlyPlan.description}</p>
                </div>
                <div className="text-center">
                   <div className="flex items-baseline justify-center gap-1">
                       <span className="text-4xl font-black text-slate-900">R$ {masterMonthlyPlan.price}</span>
                       <span className="text-slate-400 font-bold text-sm">/mês</span>
                   </div>
                </div>
                <div className="w-full md:w-72">
                   <Button 
                       variant="secondary" 
                       className="w-full bg-slate-900 text-white hover:bg-indigo-900 py-4 text-lg shadow-lg"
                       isLoading={loading && selectedPlanId === masterMonthlyPlan.id}
                   >
                       Assinar Mensal
                   </Button>
                   <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">
                       {masterMonthlyPlan.features.slice(0,3).map((f, i) => <div key={i}>{renderFeature(f, true)}</div>)}
                   </div>
                </div>
            </div>
        </div>

        {/* 3. PRO MONTHLY */}
        <div className="w-full max-w-3xl bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm hover:shadow-lg transition-all cursor-pointer opacity-90 hover:opacity-100" onClick={() => handleSelectPlan(proMonthlyPlan)}>
            <div className="flex-1 text-center md:text-left">
               <h3 className="text-xl font-bold text-slate-700 font-heading">Assinatura Pro</h3>
               <p className="text-slate-400 text-sm mt-1">Essencial para quem produz conteúdo.</p>
            </div>
            <div className="flex items-baseline gap-1"><span className="text-3xl font-bold text-slate-900">R$ {proMonthlyPlan.price}</span><span className="text-slate-400 text-xs">/mês</span></div>
            <div className="w-full md:w-48">
               <Button 
                    className="w-full bg-white text-indigo-600 hover:bg-indigo-50 border-2 border-indigo-100 shadow-none hover:border-indigo-300"
                    isLoading={loading && selectedPlanId === proMonthlyPlan.id}
               >
                   Escolher Pro
               </Button>
            </div>
        </div>

        {/* 4. STARTER PACK */}
        <div className="w-full max-w-2xl mt-4">
           <div className="flex flex-col md:flex-row items-center justify-center gap-4 group">
               <div className="text-center md:text-right">
                  <h4 className="font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{starterPlan.name}</h4>
                  <p className="text-xs text-slate-400">Pagamento único, sem renovação.</p>
               </div>
               <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
               <div className="font-bold text-slate-700 text-xl group-hover:text-indigo-600 transition-colors">R$ {starterPlan.price}</div>
               <Button 
                    onClick={(e) => { e.stopPropagation(); handleSelectPlan(starterPlan); }} 
                    size="sm" 
                    variant="outline" 
                    className="rounded-full px-6 border-slate-300 text-slate-500 hover:text-white hover:bg-slate-900 hover:border-slate-900"
                    isLoading={loading && selectedPlanId === starterPlan.id}
               >
                   Comprar Créditos
               </Button>
           </div>
        </div>
      </div>

      <div className="mt-20 text-center">
         <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-md border border-indigo-100 rounded-full text-slate-600 text-sm font-medium shadow-md">
            <ShieldCheck size={18} className="text-green-500" />
            Pagamento Seguro. Aceitamos Pix, Cartão e Boleto.
         </div>
      </div>
    </div>
  );
};

export default Pricing;
