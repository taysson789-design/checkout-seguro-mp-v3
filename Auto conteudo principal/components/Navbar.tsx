
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Zap, LayoutGrid, History, LogOut, Crown, User as UserIcon, Menu, X, ChevronRight, CreditCard, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  
  const isActive = (path: string) => location.pathname === path;
  const isMaster = user?.planType === 'yearly' || user?.planType === 'master_monthly' || user?.isAdmin;
  const isPro = user?.isPro || isMaster;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    // Click outside to close profile dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 md:pt-6 px-4">
      <div className={`
          flex justify-between items-center px-4 md:px-6 py-3 rounded-full transition-all duration-500 ease-out
          ${scrolled || mobileMenuOpen ? 'bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] w-full max-w-7xl' : 'bg-transparent w-full max-w-7xl'}
      `}>
          
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 md:gap-3 group" onClick={() => setMobileMenuOpen(false)}>
          <div className="relative w-8 h-8 md:w-10 md:h-10 shrink-0">
              <div className="absolute inset-0 bg-indigo-500 rounded-full blur-md opacity-50 group-hover:opacity-100 transition-opacity animate-pulse"></div>
              <div className="relative w-full h-full bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-full flex items-center justify-center text-white shadow-lg border border-white/20">
                  <Zap size={16} className="md:w-5 md:h-5" fill="currentColor" />
              </div>
          </div>
          <span className="font-hero font-bold text-lg md:text-xl tracking-tight text-white group-hover:text-glow transition-all">
            Auto<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">Conteúdo</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1 bg-white/5 p-1.5 rounded-full border border-white/5 backdrop-blur-md">
          <Link 
            to="/" 
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${isActive('/') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            Studio
          </Link>
          <Link 
            to="/history" 
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${isActive('/history') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            Arquivos
          </Link>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 md:gap-4">
          {user ? (
            <div className="relative" ref={profileRef}>
               {/* Trigger Button */}
               <div 
                 onClick={() => setProfileOpen(!profileOpen)}
                 className="flex items-center gap-3 cursor-pointer group"
               >
                 <div className="hidden lg:flex flex-col items-end">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-white group-hover:text-indigo-300 transition-colors">
                        {isMaster && <Crown size={12} className="text-amber-400 animate-pulse" fill="currentColor"/>}
                        {user.name.split(' ')[0]}
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded transition-all ${isMaster ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' : isPro ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20' : 'bg-white/10 text-slate-400 border border-white/10'}`}>
                        {isMaster ? 'Membro Elite' : isPro ? 'Membro Pro' : 'Plano Grátis'}
                    </span>
                 </div>

                 <div className={`relative w-8 h-8 md:w-10 md:h-10 rounded-full p-[2px] cursor-pointer transition-transform shrink-0 ${profileOpen ? 'scale-105' : 'group-hover:scale-105'} ${isMaster ? 'bg-gradient-to-br from-amber-400 to-orange-500' : isPro ? 'bg-gradient-to-br from-indigo-500 to-fuchsia-500' : 'bg-slate-700'}`}>
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden relative">
                        {user.isAdmin ? (
                          <div className="bg-indigo-600 w-full h-full flex items-center justify-center text-white font-bold text-xs">ADM</div>
                        ) : (
                          <UserIcon size={16} className="md:w-[18px] text-slate-200" />
                        )}
                    </div>
                    {/* Status Dot */}
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-[#0a0a0a] rounded-full ${isMaster || isPro ? 'bg-green-500' : 'bg-slate-500'}`}></div>
                 </div>
               </div>

               {/* --- DROPDOWN PROFILE MENU --- */}
               {profileOpen && (
                 <div className="absolute right-0 top-14 w-80 bg-[#0f111a] border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden animate-slide-up z-50">
                    
                    {/* Header */}
                    <div className={`p-5 relative overflow-hidden ${isMaster ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/10' : isPro ? 'bg-gradient-to-r from-indigo-500/10 to-fuchsia-500/10' : 'bg-slate-800/30'}`}>
                       <div className="flex items-center gap-4 relative z-10">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-lg ${isMaster ? 'bg-gradient-to-br from-amber-400 to-orange-600' : isPro ? 'bg-gradient-to-br from-indigo-500 to-fuchsia-600' : 'bg-slate-700'}`}>
                             {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                             <h4 className="text-white font-bold truncate">{user.name}</h4>
                             <p className="text-xs text-slate-400 truncate">{user.email}</p>
                          </div>
                       </div>
                    </div>

                    {/* Plan Details */}
                    <div className="p-5 space-y-5">
                       
                       {/* Badge do Plano */}
                       <div className="flex justify-between items-center pb-4 border-b border-white/5">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Seu Plano</span>
                          <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${isMaster ? 'bg-amber-500 text-slate-900' : isPro ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'}`}>
                             {isMaster ? <Crown size={12} fill="currentColor"/> : isPro ? <Sparkles size={12} fill="currentColor"/> : <LayoutGrid size={12} />}
                             {isMaster ? 'MASTER ELITE' : isPro ? 'PROFISSIONAL' : 'BÁSICO (FREE)'}
                          </div>
                       </div>

                       {/* Status de Créditos (Só para Free ou Pack) */}
                       {!isMaster && !isPro ? (
                          <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
                              <div className="flex justify-between items-end mb-2">
                                  <span className="text-xs text-slate-400 font-medium">Créditos Disponíveis</span>
                                  <span className="text-sm font-black text-white">{user.credits} <span className="text-slate-500 text-xs font-normal">/ 5</span></span>
                              </div>
                              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-500 ${user.credits > 2 ? 'bg-cyan-400' : 'bg-red-500'}`} 
                                    style={{ width: `${Math.min((user.credits / 5) * 100, 100)}%` }}
                                  ></div>
                              </div>
                              <Link to="/pricing" onClick={() => setProfileOpen(false)}>
                                <button className="w-full py-2 rounded-lg bg-indigo-600/20 text-indigo-400 text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all border border-indigo-500/30 flex items-center justify-center gap-2">
                                   <Zap size={12} /> AUMENTAR LIMITES
                                </button>
                              </Link>
                          </div>
                       ) : (
                          <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20 flex items-center gap-3">
                              <div className="bg-emerald-500/20 p-2 rounded-full text-emerald-400">
                                 <ShieldCheck size={18} />
                              </div>
                              <div>
                                 <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Acesso Ilimitado</p>
                                 <p className="text-[10px] text-emerald-200/70">Você tem o poder total.</p>
                              </div>
                          </div>
                       )}

                       {/* Menu Actions */}
                       <div className="space-y-1">
                          {user.isAdmin && (
                            <Link to="/admin" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 p-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-xs font-medium">
                                <Crown size={14} /> Painel Admin
                            </Link>
                          )}
                          <Link to="/history" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 p-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-xs font-medium">
                              <History size={14} /> Histórico de Arquivos
                          </Link>
                          <Link to="/pricing" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 p-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-xs font-medium">
                              <CreditCard size={14} /> Gerenciar Assinatura
                          </Link>
                       </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-slate-900 border-t border-white/5">
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 py-2 rounded-lg transition-colors text-xs font-bold uppercase tracking-widest"
                        >
                            <LogOut size={14} /> Sair da Conta
                        </button>
                    </div>

                 </div>
               )}
            </div>
          ) : (
            <Link to="/login" className="hidden md:block">
              <button className="bg-white text-black px-6 py-2.5 rounded-full font-black text-xs hover:bg-indigo-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:-translate-y-1 tracking-wide">
                ENTRAR
              </button>
            </Link>
          )}

          {/* Mobile Toggle */}
          <button className="md:hidden p-2 text-white bg-white/5 rounded-lg border border-white/10" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
          <div className="md:hidden fixed inset-x-4 top-24 z-40 animate-slide-up origin-top">
              <div className="bg-[#0a0a0a] backdrop-blur-3xl rounded-3xl border border-white/20 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)] space-y-3">
                  <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block p-4 rounded-2xl bg-white/5 font-bold text-white text-center hover:bg-indigo-600 transition-colors border border-white/5">Studio</Link>
                  <Link to="/history" onClick={() => setMobileMenuOpen(false)} className="block p-4 rounded-2xl bg-white/5 font-bold text-white text-center hover:bg-indigo-600 transition-colors border border-white/5">Arquivos</Link>
                  <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="block p-4 rounded-2xl bg-white/5 font-bold text-white text-center hover:bg-indigo-600 transition-colors border border-white/5">Planos</Link>
                  
                  {!user && (
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block p-4 rounded-2xl bg-white text-black font-black text-center shadow-lg hover:scale-[1.02] transition-transform">
                        ENTRAR AGORA
                    </Link>
                  )}

                  {user && (
                      <button onClick={handleLogout} className="w-full p-4 rounded-2xl bg-red-500/10 font-bold text-red-400 text-center hover:bg-red-500/20 border border-red-500/20">Sair da Conta</button>
                  )}
              </div>
          </div>
      )}
    </nav>
  );
};
