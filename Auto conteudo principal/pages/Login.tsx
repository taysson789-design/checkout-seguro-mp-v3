
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isSignUp) {
        const res = await signUp(email, password, name);
        if (res.success) {
           if (res.session) {
               navigate('/', { replace: true });
               return;
           }
           const loginRes = await login(email, password);
           if (loginRes.success) {
             navigate('/', { replace: true });
           } else {
             setShowConfirmation(true);
           }
        } else {
           setErrorMsg(res.error || "Erro ao criar conta.");
        }
      } else {
        const res = await login(email, password);
        if (res.success) {
          // Redireciona diretamente para a página anterior ou para a raiz (Dashboard)
          const from = (location.state as any)?.from?.pathname || '/';
          navigate(from, { replace: true });
        } else {
          setErrorMsg(res.error || "Erro ao entrar.");
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Ocorreu um erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  if (showConfirmation) {
      return (
        <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-8 px-4">
            <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl border border-slate-200 p-8 md:p-16 max-w-lg w-full text-center animate-fade-in">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-8 md:mb-10 animate-pulse">
                    <Send size={40} />
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-950 mb-4 md:mb-6 font-heading tracking-tighter">Verifique seu E-mail</h2>
                <p className="text-slate-600 text-lg md:text-xl mb-8 md:mb-12 leading-relaxed">
                    Enviamos um link de confirmação para <br/><strong>{email}</strong>. 
                </p>
                <Button onClick={() => setShowConfirmation(false)} variant="outline" className="w-full h-14 md:h-16 rounded-2xl">
                    Voltar para Login
                </Button>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-4 md:py-8 px-4">
      <div className="bg-white rounded-[2rem] md:rounded-[4rem] shadow-3xl border border-slate-100 overflow-hidden flex flex-col md:flex-row max-w-6xl w-full mx-auto animate-fade-in">
        
        {/* Form Section */}
        <div className="p-8 md:p-20 md:w-1/2 flex flex-col justify-center bg-white order-2 md:order-1">
          <Link to="/" className="inline-flex items-center text-xs md:text-sm font-black text-slate-400 hover:text-indigo-600 mb-8 md:mb-12 transition-colors group uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Voltar ao site
          </Link>

          <div className="text-left mb-8 md:mb-12">
            <h2 className="text-3xl md:text-5xl font-black text-slate-950 mb-3 md:mb-4 font-heading tracking-tighter leading-tight">
              {isSignUp ? 'Criar Conta Elite' : 'Acesse seu Estúdio'}
            </h2>
            <p className="text-slate-500 text-base md:text-xl font-medium">
              A inteligência artificial de última geração ao seu comando.
            </p>
          </div>

          <form className="space-y-5 md:space-y-6" onSubmit={handleSubmit}>
            {errorMsg && (
              <div className="bg-red-50 text-red-600 p-4 md:p-5 rounded-2xl text-xs md:text-sm border border-red-100 flex items-center gap-3 animate-fade-in">
                 <ShieldAlert size={20} />
                 <span className="font-bold">{errorMsg}</span>
              </div>
            )}

            {isSignUp && (
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Como você quer ser chamado?"
                      className="w-full p-4 md:p-5 pl-12 md:pl-14 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-sm md:text-base text-slate-900 placeholder:text-slate-400"
                      required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">E-mail Corporativo</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full p-4 md:p-5 pl-12 md:pl-14 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-sm md:text-base text-slate-900 placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Senha Segura</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-4 md:p-5 pl-12 md:pl-14 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-sm md:text-base text-slate-900 placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-14 md:h-16 text-lg md:text-xl rounded-2xl shadow-2xl btn-premium mt-4 md:mt-6" size="lg" isLoading={loading}>
              {isSignUp ? 'CONSTRUIR MINHA CONTA' : 'ACESSAR AGORA'}
            </Button>
          </form>

          <div className="mt-8 md:mt-12 text-center">
             <button 
               onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); }}
               className="text-slate-400 hover:text-indigo-600 font-black text-xs uppercase tracking-widest transition-all p-2"
             >
               {isSignUp ? 'Já faz parte da elite? Fazer Login' : 'Ainda não tem acesso? Criar Grátis'}
             </button>
          </div>
        </div>

        {/* Side Panel (Hidden on very small mobile, shown on larger) */}
        <div className="bg-slate-950 p-8 md:p-20 md:w-1/2 flex flex-col justify-center text-white relative overflow-hidden order-1 md:order-2 min-h-[300px] md:min-h-0">
             <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-indigo-600/20 rounded-full blur-[80px] md:blur-[120px] -mr-10 -mt-10"></div>
             <div className="absolute bottom-0 left-0 w-48 md:w-80 h-48 md:h-80 bg-fuchsia-600/10 rounded-full blur-[60px] md:blur-[100px] -mb-10 -ml-10"></div>

             <div className="relative z-10 text-center md:text-left">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-fuchsia-600 flex items-center justify-center mb-6 md:mb-10 shadow-3xl transform rotate-6 mx-auto md:mx-0">
                   <Zap className="text-white w-8 h-8 md:w-10 md:h-10 fill-white" />
                </div>
                <h3 className="text-3xl md:text-6xl font-heading font-black mb-6 md:mb-10 leading-tight tracking-tighter">
                  A próxima geração de criadores está aqui.
                </h3>
                <div className="space-y-4 md:space-y-6 hidden sm:block">
                   <div className="flex items-center gap-4 text-slate-400 font-medium text-sm md:text-lg justify-center md:justify-start">
                      <div className="w-2 h-2 rounded-full bg-indigo-500"></div> IA Gemini 3 Pro Elite
                   </div>
                   <div className="flex items-center gap-4 text-slate-400 font-medium text-sm md:text-lg justify-center md:justify-start">
                      <div className="w-2 h-2 rounded-full bg-fuchsia-500"></div> Geração de Código & Sites
                   </div>
                   <div className="flex items-center gap-4 text-slate-400 font-medium text-sm md:text-lg justify-center md:justify-start">
                      <div className="w-2 h-2 rounded-full bg-amber-500"></div> Suporte Consultivo 24/7
                   </div>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
