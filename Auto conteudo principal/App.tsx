
import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Generator from './pages/Generator';
import History from './pages/History';
import Login from './pages/Login';
import Pricing from './pages/Pricing';
import Admin from './pages/Admin';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Cpu, Lock } from 'lucide-react';
import { ChatWidget } from './components/ChatWidget';

// Component to protect routes
const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-white">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        {/* GLOBAL BACKGROUND ELEMENTS - Persistent across routes */}
        <div className="bg-noise"></div>
        <div className="bg-grid-perspective"></div>
        <div className="aurora-blob blob-1"></div>
        <div className="aurora-blob blob-2"></div>
        <div className="aurora-blob blob-3"></div>

        <div className="min-h-screen flex flex-col relative z-10">
          <Navbar />
          
          {/* Main Content Area - Full Width, No Default Padding */}
          <main className="flex-grow w-full">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<Admin />} />
              
              <Route path="/generate/:templateId" element={
                <ProtectedRoute>
                  <Generator />
                </ProtectedRoute>
              } />
              <Route path="/history" element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          
          <ChatWidget />

          <footer className="border-t border-white/5 bg-black/40 backdrop-blur-md mt-auto">
            <div className="max-w-7xl mx-auto px-6 py-10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                
                <div className="text-center md:text-left">
                  <p className="text-slate-300 font-bold text-sm tracking-wide">
                    &copy; {new Date().getFullYear()} AutoConteúdo Pro.
                  </p>
                  <p className="text-slate-500 text-xs mt-1">
                    Inteligência Artificial de Elite.
                  </p>
                  <Link to="/admin" className="inline-flex items-center gap-1 text-slate-600 hover:text-indigo-400 transition-colors text-[10px] mt-2 font-medium">
                    <Lock size={10} />
                    Área Administrativa
                  </Link>
                </div>

                <div className="flex flex-col items-center md:items-end group cursor-default">
                  <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">
                    Arquitetura por
                  </span>
                  
                  <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10 hover:border-indigo-500/50 hover:bg-white/10 transition-all duration-300">
                     <div className="bg-[#0055D4] p-1.5 rounded-lg shadow-[0_0_15px_#0055d4] text-white flex items-center justify-center">
                        <Cpu size={18} strokeWidth={2.5} />
                     </div>
                     <div className="flex flex-col justify-center leading-none">
                        <span className="text-xl font-black text-white tracking-tighter leading-none">
                          AYG
                        </span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.25em] leading-none ml-[1px] mt-[2px]">
                          Serviços
                        </span>
                     </div>
                  </div>
                </div>

              </div>
            </div>
          </footer>
        </div>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
