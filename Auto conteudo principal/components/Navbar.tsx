
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, LayoutGrid, History, LogOut, Crown } from 'lucide-react';
import { APP_NAME } from '../constants';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  // Render a simpler navbar for Login page
  if (location.pathname === '/login') {
    return (
      <nav className="sticky top-0 z-50 glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="bg-gradient-to-br from-fuchsia-500 via-purple-600 to-indigo-600 p-2 rounded-xl shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all duration-300 hover:rotate-6">
                  <Zap className="h-5 w-5 text-white fill-white" />
                </div>
                <span className="font-heading font-black text-xl tracking-tight text-slate-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 transition-all">{APP_NAME}</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Verifica se é Master (usando valores curtos)
  const isMaster = user?.planType === 'yearly' || user?.planType === 'master_monthly' || user?.isAdmin;

  return (
    <nav className="sticky top-0 z-50 glass-nav transition-all duration-300 border-b border-white/40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
                {/* Ícone com gradiente mais forte */}
                <div className="bg-gradient-to-br from-fuchsia-600 to-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-all duration-300">
                  <Zap className="h-5 w-5 text-white fill-white" />
                </div>
                {/* Texto do Logo: Esconde em telas muito pequenas se necessário, ou reduz tamanho */}
                <span className="font-heading font-extrabold text-lg md:text-xl tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors hidden xs:block">
                  {APP_NAME}
                </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-2 bg-white/60 p-1.5 rounded-full border border-white/60 backdrop-blur-sm self-center shadow-sm">
            <Link 
              to="/" 
              className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 ${isActive('/') ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-white'}`}
            >
              <LayoutGrid size={16} />
              Apps
            </Link>
            <Link 
              to="/history" 
              className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 ${isActive('/history') ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-white'}`}
            >
              <History size={16} />
              Arquivos
            </Link>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
             {user ? (
               <div className="flex items-center gap-2 md:gap-3">
                 <div className="flex flex-col items-end mr-1">
                    {/* Nome do usuário: Visível apenas em Tablet/Desktop para economizar espaço no mobile */}
                    <span className="hidden md:block text-xs font-bold text-slate-900">{user.name}</span>
                    
                    {/* Badge: Ajustado para mobile */}
                    <span className={`text-[9px] md:text-[10px] font-black tracking-wide uppercase px-2 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap ${isMaster ? 'bg-gradient-to-r from-amber-200 to-yellow-400 text-amber-900 shadow-md border border-amber-300' : user.isPro ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                      {isMaster && <Crown size={10} fill="currentColor" />}
                      {isMaster ? 'MASTER' : user.isPro ? 'PRO' : `${user.credits} CRÉDITOS`}
                    </span>
                 </div>
                 
                 {/* Botão Upgrade: Ícone apenas no mobile, Texto no Desktop */}
                 {!isMaster && (
                   <Link to="/pricing">
                     <button className="text-xs font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-red-400 bg-[length:200%_auto] animate-gradient-x px-3 md:px-4 py-2 rounded-full transition-all shadow-lg shadow-orange-500/30 flex items-center gap-1 transform hover:scale-105">
                        <Crown size={14} fill="currentColor" />
                        <span className="hidden md:inline">SER MASTER</span>
                     </button>
                   </Link>
                 )}

                 <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all" title="Sair">
                   <LogOut size={18} />
                 </button>
               </div>
             ) : (
               <div className="flex items-center gap-2">
                 <Link to="/login">
                   <button className="text-xs md:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 px-4 md:px-6 py-2 md:py-2.5 rounded-full shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-0.5 hover:shadow-slate-900/40">
                      Entrar
                   </button>
                 </Link>
               </div>
             )}
          </div>
        </div>
        
        {/* Mobile Navigation Bottom Bar (Opcional, mas aqui vamos usar links simples no menu se necessário) */}
        {/* Por enquanto mantemos a navegação limpa, o usuário pode clicar no logo para Home */}
        <div className="md:hidden flex justify-center pb-2 gap-6 text-xs font-medium text-slate-500">
            <Link to="/" className={isActive('/') ? 'text-indigo-600' : ''}>Apps</Link>
            <Link to="/history" className={isActive('/history') ? 'text-indigo-600' : ''}>Arquivos</Link>
        </div>
      </div>
    </nav>
  );
};
