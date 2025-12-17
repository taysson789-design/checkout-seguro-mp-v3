
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Lock, Save, LayoutTemplate, AlertCircle, CheckCircle, Users, CreditCard, TrendingUp, Crown, Zap, Package, Key, ShoppingBag, RefreshCw, LogOut, ShieldAlert } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Default config if nothing is saved
const DEFAULT_CONFIG = {
  promoBadge: "Tecnologia Pollinations AI",
  heroTitle: "Crie Vídeos, Sites e Conteúdo com IA.",
  heroSubtitle: "A única plataforma que transforma suas ideias em Landing Pages completas, Vídeos Cinematográficos e Documentos Jurídicos em segundos.",
  paymentPublicKey: "",
  paymentPrivateKey: ""
};

const Admin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // CMS State
  const [siteConfig, setSiteConfig] = useState(DEFAULT_CONFIG);
  const [showSuccess, setShowSuccess] = useState(false);

  // Stats State
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPaid: 0,
    subscribersPro: 0,
    subscribersMaster: 0,
    oneTimePurchases: 0,
    loading: true
  });

  const { login, logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Load existing config
    const fetchConfig = async () => {
        const { data } = await supabase.from('site_config').select('*').limit(1).single();
        if (data) {
            let loadedBadge = data.promo_badge;
            let loadedTitle = data.hero_title;
            let loadedSubtitle = data.hero_subtitle;

            // SANITIZAÇÃO NO ADMIN: Se carregar algo antigo, corrige na interface para que o próximo save limpe o DB.
            if (loadedBadge?.toLowerCase().includes('gemini')) loadedBadge = "Tecnologia Pollinations AI";
            if (loadedTitle?.toLowerCase().includes('gemini')) loadedTitle = "Sua Criatividade <br/><span class='text-gradient-animated'>Sem Limites.</span>";
            if (loadedSubtitle?.toLowerCase().includes('gemini')) loadedSubtitle = "De freelancers a grandes agências: crie sites, imagens e copys profissionais em segundos com IA Open Source.";

            setSiteConfig({
                promoBadge: loadedBadge,
                heroTitle: loadedTitle,
                heroSubtitle: loadedSubtitle,
                paymentPublicKey: data.payment_public_key || "",
                paymentPrivateKey: data.payment_private_key || ""
            });
        }
    };

    if (user?.isAdmin) {
        fetchConfig();
    }
  }, [user]);

  // Fetch Stats only if User is Admin
  useEffect(() => {
    if (user?.isAdmin) {
        fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
      try {
          // Fetch essential fields to calculate stats
          const { data, error } = await supabase
            .from('profiles')
            .select('id, is_pro, plan_type');
          
          if (error) throw error;
          
          if (data) {
              const totalUsers = data.length;
              
              // Count Master (Yearly or Monthly Master)
              // CORREÇÃO: Usando 'master_monthly' (short name)
              const subscribersMaster = data.filter(p => 
                  p.plan_type === 'master_monthly' || 
                  p.plan_type === 'yearly'
              ).length;

              // Count Pro (Standard Monthly)
              // CORREÇÃO: Usando 'monthly' (short name)
              const subscribersPro = data.filter(p => 
                  p.plan_type === 'monthly'
              ).length;

              // Count One Time Packs
              const oneTimePurchases = data.filter(p => 
                  p.plan_type === 'credits_pack'
              ).length;

              // Total Paid (Anyone with a paid plan type OR is_pro flag true)
              const totalPaid = data.filter(p => p.is_pro || p.plan_type === 'credits_pack').length;

              setStats({
                  totalUsers,
                  totalPaid,
                  subscribersPro,
                  subscribersMaster,
                  oneTimePurchases,
                  loading: false
              });
          }
      } catch (err) {
          console.error("Error fetching stats:", err);
          setStats(prev => ({ ...prev, loading: false }));
      }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login(username, password);
    if (result.success) {
      setError('');
    } else {
      if (result.error?.includes("Invalid login credentials")) {
        setError('E-mail ou senha incorretos.');
      } else {
        setError(result.error || 'Credenciais inválidas.');
      }
    }
  };

  const handleSaveConfig = async () => {
    // We assume there's always one row, ID 1. Using upsert based on ID.
    // Note: Assuming columns payment_public_key and payment_private_key exist in DB
    const { error } = await supabase.from('site_config').upsert({
        id: 1,
        promo_badge: siteConfig.promoBadge,
        hero_title: siteConfig.heroTitle,
        hero_subtitle: siteConfig.heroSubtitle,
        payment_public_key: siteConfig.paymentPublicKey,
        payment_private_key: siteConfig.paymentPrivateKey,
        updated_at: new Date()
    });

    if (!error) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    } else {
        alert("Erro ao salvar (Verifique se as colunas de pagamento existem no banco): " + error.message);
    }
  };

  // 1. User Logged In AND Admin -> Show Dashboard
  if (user?.isAdmin) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4 animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <LayoutTemplate className="text-indigo-600" />
              Painel Administrativo
            </h1>
            <p className="text-slate-500">Visão geral do negócio e gerenciamento de conteúdo.</p>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" size="sm" onClick={fetchStats} className="border-slate-200">
                Atualizar Dados
             </Button>
             <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold border border-green-200 flex items-center h-fit self-center">
                Acesso Super Admin
             </div>
          </div>
        </div>

        {/* --- STATS SECTION --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Stats Cards */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200 transform hover:scale-[1.02] transition-transform">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-white/20 rounded-lg">
                        <CreditCard className="text-white" size={24} />
                    </div>
                    <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-md text-indigo-100">+ Vendas</span>
                </div>
                <h3 className="text-4xl font-bold mb-1">{stats.loading ? '...' : stats.totalPaid}</h3>
                <p className="text-indigo-100 text-sm font-medium opacity-90">Total de Pagantes</p>
            </div>
            
             <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-amber-100 rounded-lg">
                        <RefreshCw className="text-amber-600" size={24} />
                    </div>
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-1">
                    {stats.loading ? '...' : (stats.subscribersPro + stats.subscribersMaster)}
                </h3>
                <p className="text-slate-500 text-sm font-medium">Assinaturas Recorrentes</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Package className="text-blue-600" size={24} />
                    </div>
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-1">{stats.loading ? '...' : stats.oneTimePurchases}</h3>
                <p className="text-slate-500 text-sm font-medium">Packs de Crédito Vendidos</p>
            </div>

             <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-slate-100 rounded-lg">
                        <Users className="text-slate-600" size={24} />
                    </div>
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-1">{stats.loading ? '...' : stats.totalUsers}</h3>
                <p className="text-slate-500 text-sm font-medium">Usuários Totais</p>
            </div>
        </div>

        {/* --- CMS & PAYMENT CONFIG SECTION --- */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-4 flex items-center gap-2">
              <Key size={20} className="text-indigo-600" />
              Configurações de Pagamento & CMS
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Payment Settings */}
              <div className="space-y-6">
                 <div className="flex items-center gap-2">
                    <ShoppingBag className="text-blue-500" />
                    <h3 className="font-bold text-slate-700">Mercado Pago (Assinaturas)</h3>
                 </div>
                 <p className="text-xs text-slate-500">Configure as chaves para criar planos e assinaturas recorrentes.</p>
                 
                 <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Access Token (Produção/Teste)</label>
                    <div className="relative">
                        <input 
                            type="password" 
                            value={siteConfig.paymentPrivateKey}
                            onChange={(e) => setSiteConfig({...siteConfig, paymentPrivateKey: e.target.value})}
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                            placeholder="APP_USR-xxxx-xxxx-xxxx-xxxx"
                        />
                         <div className="absolute right-3 top-3 text-slate-400">
                            <Lock size={16} />
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2">
                        Usado para criar assinaturas via API.
                    </p>
                 </div>

                 <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 opacity-70">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Public Key (Opcional)</label>
                    <input 
                        type="text" 
                        value={siteConfig.paymentPublicKey}
                        onChange={(e) => setSiteConfig({...siteConfig, paymentPublicKey: e.target.value})}
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                        placeholder="TEST-xxxx-xxxx-xxxx-xxxx"
                    />
                    <p className="text-[10px] text-slate-500 mt-2">
                        Menos usada para assinaturas puras de API, mas útil para checkout transparente.
                    </p>
                 </div>
              </div>

              {/* CMS Settings */}
              <div className="space-y-6">
                <h3 className="font-bold text-slate-700">Aparência do Site</h3>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Badge Promocional</label>
                    <input 
                        type="text" 
                        value={siteConfig.promoBadge}
                        onChange={(e) => setSiteConfig({...siteConfig, promoBadge: e.target.value})}
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Título Principal (HTML)</label>
                    <textarea 
                        rows={2}
                        value={siteConfig.heroTitle}
                        onChange={(e) => setSiteConfig({...siteConfig, heroTitle: e.target.value})}
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Subtítulo</label>
                    <textarea 
                        rows={3}
                        value={siteConfig.heroSubtitle}
                        onChange={(e) => setSiteConfig({...siteConfig, heroSubtitle: e.target.value})}
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
              </div>
          </div>

          <div className="pt-8 flex items-center gap-4 border-t mt-6">
            <Button onClick={handleSaveConfig} className="shadow-lg shadow-indigo-200">
                <Save className="w-4 h-4 mr-2" />
                Salvar Configurações
            </Button>

            {showSuccess && (
                <span className="text-green-600 flex items-center gap-1 text-sm animate-fade-in">
                <CheckCircle size={16} /> Atualizado com sucesso!
                </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. User Logged In BUT NOT Admin -> Show Access Denied
  if (user && !user.isAdmin) {
    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-100 w-full max-w-md text-center animate-slide-up">
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldAlert size={32} />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Acesso Restrito</h1>
                <p className="text-slate-500 mb-6">
                    A conta <strong>{user.email}</strong> não possui privilégios de administrador.
                </p>
                <div className="bg-slate-50 p-3 rounded-lg text-xs text-left font-mono text-slate-600 mb-6 overflow-x-auto">
                    <p className="mb-2 text-slate-400">// Para liberar acesso, rode no SQL do Supabase:</p>
                    update profiles set is_admin = true where email = '{user.email}';
                </div>
                <Button onClick={logout} variant="outline" className="w-full justify-center text-red-500 border-red-200 hover:bg-red-50">
                    <LogOut size={16} className="mr-2" /> Sair e tentar outra conta
                </Button>
            </div>
        </div>
    );
  }

  // 3. Not Logged In -> Show Login Form
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Acesso Restrito</h1>
          <p className="text-slate-500 text-sm">Área exclusiva para administração.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">E-mail de Admin</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
              placeholder="admin@exemplo.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" variant="secondary" className="w-full justify-center mt-2">
            Entrar no Painel
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Admin;
