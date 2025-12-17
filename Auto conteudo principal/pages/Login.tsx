
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/Button';
import { Zap, CheckCircle, Lock, ArrowLeft, Mail, User, Send, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Watchdog para evitar carregamento infinito
  useEffect(() => {
    let timer: any;
    if (loading) {
        timer = setTimeout(() => {
            if (loading) {
                setLoading(false);
                setErrorMsg("A conexão está demorando muito. Tente novamente.");
            }
        }, 15000); 
    }
    return () => clearTimeout(timer);
  }, [loading]);

  const checkDeviceIntegrity = async (): Promise<boolean> => {
      // 1. Verifica LocalStorage (Fingerprint Simples)
      const hasAccount = localStorage.getItem('acp_user_registered');
      if (hasAccount) {
          setErrorMsg("Este dispositivo já possui uma conta gratuita registrada. Faça login.");
          setIsSignUp(false);
          return false;
      }
      return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isSignUp) {
        // --- BLOQUEIO DE MULTI-CONTAS ---
        const allowed = await checkDeviceIntegrity();
        if (!allowed) {
            setLoading(false);
            return;
        }

        // --- LÓGICA DE CADASTRO ---
        const res = await signUp(email, password, name);
        
        if (res.success) {
           // Marca o dispositivo como usado
           localStorage.setItem('acp_user_registered', 'true');

           // 1. Sessão criada? Vai pro dashboard
           if (res.session) {
               navigate('/', { replace: true });
               return;
           }

           // 2. Sem sessão? Tenta logar manualmente
           const loginRes = await login(email, password);
           
           if (loginRes.success) {
             navigate('/', { replace: true });
           } else {
             if (loginRes.error?.toLowerCase().includes("email not confirmed")) {
                 setShowConfirmation(true);
             } else {
                 setShowConfirmation(true); 
             }
           }
        } else {
           const errLower = res.error?.toLowerCase() || "";
           if (errLower.includes("already registered") || errLower.includes("unique constraint")) {
               setErrorMsg("E-mail já cadastrado. Tente fazer login.");
               setIsSignUp(false);
           } else {
               setErrorMsg(res.error || "Erro ao criar conta.");
           }
        }
      } else {
        // --- LÓGICA DE LOGIN ---
        const res = await login(email, password);
        if (res.success) {
          const from = (location.state as any)?.from?.pathname || '/';
          navigate(from, { replace: true });
        } else {
          const errLower = res.error?.toLowerCase() || "";
          if (errLower.includes("invalid login credentials")) {
             setErrorMsg("E-mail ou senha incorretos.");
          } else if (errLower.includes("email not confirmed")) {
             setErrorMsg("Confirme seu e-mail para acessar.");
             setShowConfirmation(true);
          } else {
             setErrorMsg(res.error || "Erro ao entrar. Tente novamente.");
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Ocorreu um erro inesperado. Verifique sua internet.");
    } finally {
      if (location.pathname === '/login') {
          setLoading(false);
      }
    }
  };

  if (showConfirmation) {
      return (
        <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-8">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-12 max-w-lg w-full text-center animate-fade-in">
                <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <Send size={40} />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4 font-heading">Verifique seu E-mail</h2>
                <p className="text-slate-600 text-lg mb-8">
                    Enviamos um link de confirmação para <strong>{email}</strong>. 
                    <br/>Clique no link para ativar sua conta.
                </p>
                <div className="flex flex-col gap-3">
                    <Button onClick={() => setShowConfirmation(false)} variant="outline">
                        Voltar para Login
                    </Button>
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-8">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col md:flex-row max-w-5xl w-full mx-auto animate-fade-in">
        
        {/* Form Section */}
        <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center">
          
          <Link to="/" className="inline-flex items-center text-sm text-slate-500 hover:text-indigo-600 mb-6 transition-colors group">
            <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            Voltar para o site
          </Link>

          <div className="text-center md:text-left mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2 font-heading">
              {isSignUp ? 'Criar Conta Grátis' : 'Bem-vindo(a) de volta'}
            </h2>
            <p className="text-slate-600 text-lg">
              {isSignUp ? 'Junte-se a elite de criadores com IA.' : 'Acesse sua conta para continuar criando.'}
            </p>
          </div>

          <div className="space-y-6">
            
            <form className="space-y-5" onSubmit={handleSubmit}>
              
              {errorMsg && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-center gap-3 animate-fade-in">
                   <div className="bg-red-100 p-1 rounded-full shrink-0"><ShieldAlert size={16} /></div>
                   <span className="font-medium">{errorMsg}</span>
                </div>
              )}

              {isSignUp && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Nome Completo</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Como gostaria de ser chamado?"
                        className="w-full p-3.5 pl-10 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">E-mail</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full p-3.5 pl-10 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Senha</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full p-3.5 pl-10 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full justify-center h-12 text-base shadow-lg shadow-indigo-200 mt-2" size="lg" isLoading={loading}>
                {isSignUp ? 'Começar Agora' : 'Acessar Painel'}
              </Button>
            </form>
          </div>

          <div className="mt-8 text-center">
             <button 
               onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); setShowConfirmation(false); }}
               className="text-indigo-600 hover:text-indigo-800 font-bold text-sm hover:underline transition-all"
             >
               {isSignUp ? 'Já possui conta? Fazer Login' : 'Não tem conta? Criar Grátis'}
             </button>
          </div>
        </div>

        {/* Side Panel */}
        <div className="bg-slate-900 p-8 md:p-12 md:w-1/2 flex flex-col justify-center text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/30 rounded-full blur-[100px] -mr-20 -mt-20 animate-pulse-soft"></div>
             <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/20 rounded-full blur-[80px] -mb-20 -ml-20"></div>
             <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

             <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-8 shadow-xl shadow-indigo-500/20 border border-white/10">
                   <Zap className="text-white w-8 h-8 fill-white" />
                </div>
                <h3 className="text-3xl md:text-4xl font-heading font-black mb-6 leading-tight tracking-tight">
                  Liberte seu potencial criativo com IA.
                </h3>
                <p className="text-slate-300 text-lg leading-relaxed mb-10 font-light">
                  Acesse ferramentas de elite para criar documentos, sites e imagens em segundos.
                </p>
             </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
