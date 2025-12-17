
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { supabase } from '../lib/supabase';

export type User = UserProfile & { id?: string };

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  signUp: (email: string, password: string, name: string) => Promise<{success: boolean, error?: string, session?: any}>;
  activatePlan: (planId: string) => Promise<void>;
  consumeCredit: (resourceType: 'TEXT' | 'IMAGE' | 'SITE') => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Função auxiliar para mapear dados do DB para o objeto User
  const mapProfileToUser = (data: any, email: string): User => {
      return {
          id: data.id,
          email: data.email || email,
          name: data.full_name || email?.split('@')[0] || 'Usuário',
          isPro: data.is_pro || false,
          credits: data.credits ?? 5, // PADRÃO: 5 CRÉDITOS
          isAdmin: data.is_admin || false,
          planType: data.plan_type || 'free',
          subscriptionDate: data.subscription_date,
          lastFreeReset: data.last_free_reset
      };
  };

  const fetchProfile = async (userId: string, email: string, userMetadata?: any) => {
    const fallbackUser: User = {
        id: userId,
        email: email,
        name: userMetadata?.full_name || email.split('@')[0],
        isPro: false,
        credits: 5, // PADRÃO: 5 CRÉDITOS
        isAdmin: false,
        planType: 'free'
    };

    try {
      // TIMEOUT RACE: Se o DB demorar mais de 3s, usamos o fallback para não travar a UI
      const dbPromise = supabase.from('profiles').select('*').eq('id', userId).single();
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000));

      const { data, error } = await Promise.race([dbPromise, timeoutPromise]) as any;

      if (data) {
        let userProfile = mapProfileToUser(data, email);

        // --- LÓGICA DE RESET DE CRÉDITOS (PLANO GRÁTIS) ---
        // Regra: Reseta para 5 créditos a cada 3 dias
        if (!userProfile.isPro && userProfile.planType === 'free') {
            const now = new Date();
            const lastReset = data.last_free_reset ? new Date(data.last_free_reset) : new Date(0);
            const diffDays = Math.abs(now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24);

            if (diffDays >= 3) {
                const updates = {
                    credits: 5, // Reseta para 5
                    last_free_reset: now.toISOString(),
                    plan_type: 'free'
                };
                // Atualiza em background
                supabase.from('profiles').update(updates).eq('id', userId).then();
                userProfile.credits = 5;
                userProfile.lastFreeReset = updates.last_free_reset;
            }
        }
        setUser(userProfile);
        return userProfile;
      } else {
        console.warn("Perfil demorou ou não encontrado, usando fallback rápido.");
        setUser(fallbackUser);
        return fallbackUser;
      }
    } catch (err) {
      console.error("Fetch profile timeout/error, usando fallback:", err);
      setUser(fallbackUser);
      return fallbackUser;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          await fetchProfile(session.user.id, session.user.email!, session.user.user_metadata);
        }
      } catch (error) {
        console.error("Erro na sessão:", error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email!, session.user.user_metadata);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
      if (!user?.id) return;
      await fetchProfile(user.id, user.email, {});
  };

  const login = async (email: string, password: string) => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
        });

        if (error) {
            return { success: false, error: error.message };
        }
        
        if (data.session?.user) {
            fetchProfile(data.session.user.id, data.session.user.email!, data.session.user.user_metadata);
        }
        
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || "Erro de conexão." };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
                data: {
                  full_name: name,
                },
            },
        });

        if (error) return { success: false, error: error.message };
        
        if (data.session?.user) {
            // Inicializa com 5 créditos
            const newUser: User = {
                id: data.session.user.id,
                email: email,
                name: name,
                isPro: false,
                credits: 5, 
                isAdmin: false,
                planType: 'free'
            };
            
            // Força a atualização inicial no banco para garantir os 5 créditos
            await supabase.from('profiles').update({ credits: 5 }).eq('id', data.session.user.id);
            
            setUser(newUser);
        }

        return { success: true, session: data.session };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const activatePlan = async (planId: string) => {
    if (!user || !user.id) return;
  };

  const consumeCredit = async (resourceType: 'TEXT' | 'IMAGE' | 'SITE'): Promise<boolean> => {
    if (!user || !user.id) return false;
    
    const isUnlimited = user.planType === 'monthly' || 
                        user.planType === 'master_monthly' || 
                        user.planType === 'yearly' || 
                        user.isAdmin;

    if (isUnlimited) return true;

    // DEFINIÇÃO DE CUSTO
    // Imagem (Flux) = 5 créditos
    // Outros = 1 crédito
    const cost = resourceType === 'IMAGE' ? 5 : 1;

    if (user.credits < cost) return false;

    const newCredits = Math.max(0, user.credits - cost);
    
    // Optimistic Update
    setUser(prev => prev ? ({ ...prev, credits: newCredits }) : null);

    const { error } = await supabase.from('profiles').update({ credits: newCredits }).eq('id', user.id);
    
    if (error) {
        // Revert se der erro (opcional, mas boa prática)
        refreshProfile();
        return false;
    }
    
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signUp, activatePlan, consumeCredit, refreshProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
