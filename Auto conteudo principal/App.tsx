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
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!user) {
    // Redirect to login but save the location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <div className="min-h-screen flex flex-col bg-slate-50">
          <Navbar />
          <main className="flex-grow p-4 md:p-8">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<Admin />} />
              
              {/* Protected Routes */}
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

          <footer className="bg-white border-t border-slate-200 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                
                {/* Product Copyright */}
                <div className="text-center md:text-left">
                  <p className="text-slate-900 font-semibold text-sm">
                    &copy; {new Date().getFullYear()} AutoConteúdo Pro.
                  </p>
                  <p className="text-slate-400 text-xs mt-1">
                    Seu Consultor Especialista com IA. Todos os direitos reservados.
                  </p>
                  
                  {/* VISIBLE Admin Link */}
                  <Link to="/admin" className="inline-flex items-center gap-1 text-slate-300 hover:text-indigo-600 transition-colors text-[10px] mt-2 font-medium">
                    <Lock size={10} />
                    Área Administrativa
                  </Link>
                </div>

                {/* Developer Branding - AYG Serviços */}
                <div className="flex flex-col items-center md:items-end group cursor-default">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
                    Desenvolvido e Construído por
                  </span>
                  
                  <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all duration-300">
                     {/* Logo Icon representation */}
                     <div className="bg-[#0055D4] p-1.5 rounded-lg shadow-sm text-white flex items-center justify-center">
                        <Cpu size={18} strokeWidth={2.5} />
                     </div>
                     
                     {/* Typography representation */}
                     <div className="flex flex-col justify-center leading-none">
                        <span className="text-xl font-black text-slate-800 tracking-tighter leading-none group-hover:text-[#0055D4] transition-colors">
                          AYG
                        </span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.25em] leading-none ml-[1px] mt-[2px]">
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