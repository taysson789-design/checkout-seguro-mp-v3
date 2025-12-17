
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
// As credenciais foram atualizadas para conectar ao projeto real

// Tenta obter as variáveis de ambiente do Vite, ou usa as credenciais fornecidas como fallback
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://gvxxhbgamzplcsovhbuo.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2eHhoYmdhbXpwbGNzb3ZoYnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NTI0NTMsImV4cCI6MjA4MTMyODQ1M30.ZGuzFi1XxfuKZJs7I8hZK8rO1nnv_8rcyKKouB_1kno';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce' // Mais seguro e robusto para web
  },
  db: {
    schema: 'public'
  },
  // Aumenta retries globais para instabilidade de rede
  global: {
    headers: { 'x-application-name': 'autoconteudo-pro' }
  }
});
