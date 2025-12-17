
import { DocumentTemplate, QuestionType } from './types';
import { FileText, Dumbbell, ShoppingBag, Mail, FileSignature, Instagram, Scale, Image, Palette, Briefcase, Globe, Code, Rocket, BrainCircuit, LayoutTemplate, Star, Award, Zap, Crown, Gavel, Utensils, Plane, GraduationCap, BookOpen, UserCheck, HeartPulse, PenTool, Terminal, Gem, Monitor, Youtube, Languages, UserPlus, Briefcase as BriefcaseIcon, TrendingUp, Wand2, Paintbrush, ShieldCheck, MessageCircle, Hash, Smile, Flame, Video, ScrollText, Target, Map, BarChart3, AlertTriangle, Lightbulb, AlertOctagon, HeartCrack, Moon, Search, ChefHat, Clapperboard, FileSearch, Network, LineChart, Bot } from 'lucide-react';

export const APP_NAME = "AutoConteúdo Pro";
export const SUPPORT_WHATSAPP = "5571996556182"; 

export const PLANS = [
  { 
    id: 'free_starter', 
    name: 'Grátis', 
    price: '0.00', 
    period: 'sempre', 
    description: 'Para quem está começando.', 
    features: ['5 Créditos Iniciais', 'Acesso a Ferramentas Básicas', 'Suporte via Comunidade'] 
  },
  { 
    id: 'subscription_pro', 
    name: 'Pro', 
    price: '47.90', 
    period: '/mês', 
    highlight: true, 
    description: 'Para criadores e profissionais.', 
    features: ['Máquina de Vídeos Virais', 'Redator SEO Invisível', 'Criação de Sites', 'Prioridade na Fila'] 
  },
  { 
    id: 'subscription_master_monthly', 
    name: 'Master', 
    price: '89.90', 
    period: '/mês', 
    description: 'Para empresas e agências.', 
    features: ['Analista de Lucro IA', 'Fábrica de Funcionários IA', 'Jurídico Blindado', 'Imagens Ultra-Realistas'] 
  }
];

// CORES E GRADIENTES VIBRANTES (SISTEMA DE CORES OTIMIZADO)
const COLORS = {
  FREE: 'bg-gradient-to-br from-cyan-400 to-blue-500',
  PRO: 'bg-gradient-to-br from-violet-500 via-fuchsia-500 to-purple-600',
  MASTER: 'bg-gradient-to-br from-amber-300 via-orange-400 to-yellow-500', 
  CREATIVE: 'bg-gradient-to-br from-pink-500 via-rose-500 to-red-500',
  SOCIAL: 'bg-gradient-to-br from-rose-400 via-fuchsia-500 to-indigo-500', 
  LEGAL: 'bg-gradient-to-br from-slate-700 to-slate-900',
  LIFESTYLE: 'bg-gradient-to-br from-emerald-400 to-teal-600',
  DATA: 'bg-gradient-to-br from-emerald-500 to-cyan-600',
  TECH: 'bg-gradient-to-br from-blue-600 to-indigo-900',
  DANGER: 'bg-gradient-to-br from-red-500 to-red-800'
};

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  
  // ==========================================================================================
  // CURRÍCULOS DE ELITE (100% POWER) - AGORA COM FOTOS
  // ==========================================================================================
  {
    id: 'cv-executive',
    title: 'Currículo Executivo (CEO Style)',
    description: 'Layout imponente para cargos de liderança. Design sóbrio, foto profissional e foco em resultados.',
    icon: 'Crown',
    color: COLORS.MASTER,
    category: 'Curriculo',
    outputType: 'SITE',
    minPlan: 'pro', 
    oneTimePrice: 29.90, 
    systemPrompt: 'Você é um Designer de Currículos Premiado de Nova York. Crie um CV HTML/Tailwind sofisticado. 1. Use layout de duas colunas: Uma barra lateral escura elegante para a foto (use src="{{USER_PHOTO}}"), contatos e skills. 2. Coluna principal branca para Experiência e Resumo. 3. Use fontes serifadas modernas (Playfair Display) para títulos. 4. Destaque métricas de sucesso em caixas de estatísticas. O visual deve gritar "Sucesso" e "Autoridade".',
    steps: [
      { id: 'user_photo', type: QuestionType.IMAGE_UPLOAD, question: 'Sua Foto Profissional', subtext: 'Uma foto de alta qualidade aumenta em 40% as chances.', required: true, maxFiles: 1 },
      { id: 'full_name', type: QuestionType.TEXT, question: 'Seu Nome Completo', required: true },
      { id: 'role', type: QuestionType.TEXT, question: 'Cargo Atual / Almejado', required: true },
      { id: 'summary', type: QuestionType.TEXTAREA, question: 'Resumo Profissional (Pitch)', subtext: 'Venda seu peixe em 3 linhas.', required: true },
      { id: 'experience', type: QuestionType.TEXTAREA, question: 'Experiências Profissionais', subtext: 'Empresa, Cargo, Data e PRINCIPAIS RESULTADOS.', required: true },
      { id: 'skills', type: QuestionType.TEXTAREA, question: 'Habilidades & Competências', required: true },
      { id: 'contact', type: QuestionType.TEXT, question: 'Contatos (Email, Tel, LinkedIn)', required: true }
    ]
  },
  {
    id: 'cv-creative',
    title: 'Currículo Criativo (Visual)',
    description: 'Para designers, marketing e artistas. Use cores, formas e sua foto em destaque.',
    icon: 'Palette',
    color: COLORS.CREATIVE,
    category: 'Curriculo',
    outputType: 'SITE',
    minPlan: 'pro', 
    oneTimePrice: 19.90, 
    systemPrompt: 'Você é um Diretor de Arte Sênior. Crie um CV HTML/Tailwind vibrante e moderno. 1. Use um Header grande e colorido com a foto (src="{{USER_PHOTO}}") em formato circular com borda grossa. 2. Use grids criativos para mostrar as Skills (barras de progresso ou tags coloridas). 3. Tipografia Sans-Serif moderna (Inter ou Poppins). 4. Use ícones para contatos. O layout deve ser uma obra de arte.',
    steps: [
      { id: 'user_photo', type: QuestionType.IMAGE_UPLOAD, question: 'Sua Melhor Foto', required: true, maxFiles: 1 },
      { id: 'full_name', type: QuestionType.TEXT, question: 'Seu Nome', required: true },
      { id: 'role', type: QuestionType.TEXT, question: 'Sua Arte/Profissão', required: true },
      { id: 'portfolio', type: QuestionType.TEXT, question: 'Link do Portfólio', required: false },
      { id: 'experience', type: QuestionType.TEXTAREA, question: 'Onde você já brilhou? (Experiência)', required: true },
      { id: 'skills', type: QuestionType.TEXTAREA, question: 'Domínio de Ferramentas (Softwares/Skills)', required: true }
    ]
  },
  {
    id: 'cv-modern',
    title: 'Currículo Moderno (Tech)',
    description: 'O padrão ouro para Tech, Startups e Administrativo. Limpo, direto e com foto.',
    icon: 'Briefcase',
    color: COLORS.PRO,
    category: 'Curriculo',
    outputType: 'SITE',
    minPlan: 'pro', 
    oneTimePrice: 14.90, 
    systemPrompt: 'Crie um CV HTML/Tailwind estilo "Startup Unicórnio". Minimalista, mas poderoso. 1. Fundo cinza bem claro (slate-50). 2. Card branco flutuante (shadow-xl) contendo o conteúdo. 3. Foto (src="{{USER_PHOTO}}") no topo esquerdo, quadrada com cantos arredondados (rounded-xl). 4. Use acentos em Azul Indigo ou Violeta. 5. Foco total em legibilidade e hierarquia visual perfeita.',
    steps: [
      { id: 'user_photo', type: QuestionType.IMAGE_UPLOAD, question: 'Foto de Perfil', required: true, maxFiles: 1 },
      { id: 'full_name', type: QuestionType.TEXT, question: 'Nome Completo', required: true },
      { id: 'role', type: QuestionType.TEXT, question: 'Cargo', required: true },
      { id: 'summary', type: QuestionType.TEXTAREA, question: 'Sobre Você', required: true },
      { id: 'experience', type: QuestionType.TEXTAREA, question: 'Histórico Profissional', required: true },
      { id: 'education', type: QuestionType.TEXTAREA, question: 'Formação', required: true }
    ]
  },

  // ==========================================================================================
  // NÍVEL 1: MASTER (ELITE) - MÓDULOS DE ALTA COMPLEXIDADE
  // ==========================================================================================

  {
    id: 'neural-data-analyst',
    title: 'Analista de Lucro IA',
    description: 'Envie planilhas ou relatórios e descubra onde você está perdendo dinheiro.',
    icon: 'LineChart',
    color: COLORS.DATA,
    category: 'Business',
    outputType: 'TEXT',
    minPlan: 'master',
    systemPrompt: 'Você é um Cientista de Dados Sênior focado em Business Intelligence. Analise os dados fornecidos (texto ou upload de CSV simulado). Gere um relatório estruturado: 1. Resumo Executivo (Focado em Dinheiro). 2. Três principais tendências identificadas. 3. Alertas de Risco. 4. Recomendação de Ação Imediata para aumentar lucro.',
    steps: [
      { id: 'data_input', type: QuestionType.TEXTAREA, question: 'Cole seus dados ou resumo financeiro aqui', required: true },
      { id: 'data_file', type: QuestionType.IMAGE_UPLOAD, question: 'Ou envie foto de planilha/relatório', maxFiles: 3, required: false },
      { id: 'focus', type: QuestionType.SELECT, question: 'O que você quer descobrir?', options: [{label: 'Aumentar Lucro', value: 'profit'}, {label: 'Cortar Custos', value: 'costs'}, {label: 'Prever Futuro', value: 'patterns'}], required: true }
    ]
  },
  {
    id: 'multi-agent-architect',
    title: 'Fábrica de Funcionários',
    description: 'Crie uma equipe de robôs autônomos. Um vende, outro atende, outro gerencia.',
    icon: 'Bot',
    color: COLORS.TECH,
    category: 'Business',
    outputType: 'TEXT',
    minPlan: 'master',
    systemPrompt: 'Você é um Arquiteto de Sistemas de IA. Crie a definição técnica (Prompt de Sistema) para 3 agentes especializados baseados no objetivo do usuário. Para cada agente defina: Nome, Personalidade, Missão Principal e Regras de Conduta.',
    steps: [
      { id: 'goal', type: QuestionType.TEXTAREA, question: 'Qual o objetivo da sua empresa?', subtext: 'Ex: Vender carros usados via WhatsApp.', required: true },
      { id: 'agents_count', type: QuestionType.SELECT, question: 'Tamanho da Equipe', options: [{label: '2 Robôs (Dupla)', value: '2'}, {label: '3 Robôs (Squad)', value: '3'}, {label: '5 Robôs (Corporação)', value: '5'}], required: true },
      { id: 'tone', type: QuestionType.TEXT, question: 'Estilo de atendimento (Ex: Formal, Jovem)', required: true }
    ]
  },
  {
    id: 'legal-contract',
    title: 'Contrato Blindado',
    description: 'Proteja seu serviço contra calotes. Contrato jurídico completo em segundos.',
    icon: 'Gavel',
    color: COLORS.LEGAL,
    category: 'Jurídico',
    outputType: 'TEXT',
    minPlan: 'master',
    oneTimePrice: 29.90, 
    systemPrompt: 'Aja como um advogado sênior especialista em direito civil brasileiro. Crie um contrato de prestação de serviços robusto. Inclua cláusulas de objeto, obrigações, pagamentos, multas, rescisão, foro, confidencialidade e proteção de dados (LGPD).',
    steps: [
      { id: 'contractor', type: QuestionType.TEXT, question: 'Seus Dados (Prestador)', required: true },
      { id: 'client', type: QuestionType.TEXT, question: 'Dados do Cliente', required: true },
      { id: 'service_desc', type: QuestionType.TEXTAREA, question: 'O que será feito?', required: true },
      { id: 'value_payment', type: QuestionType.TEXT, question: 'Valor e Forma de Pagamento', required: true },
      { id: 'forum', type: QuestionType.TEXT, question: 'Sua Cidade (Para o Foro)', required: true }
    ]
  },
  {
    id: 'image-gen',
    title: 'Estúdio Ultra-Realista',
    description: 'Crie fotos que parecem reais, logos 3D e artes digitais de cinema.',
    icon: 'Image',
    color: COLORS.MASTER,
    category: 'Criativo',
    outputType: 'IMAGE',
    minPlan: 'master',
    oneTimePrice: 4.90,
    systemPrompt: 'Create a high quality image based on this description. Style: Photorealistic, 8k, Detailed texture.',
    steps: [
      { id: 'prompt', type: QuestionType.TEXTAREA, question: 'O que você quer criar?', subtext: 'Seja detalhista. Ex: Um gato astronauta em marte, 4k.', required: true },
      { id: 'style', type: QuestionType.SELECT, question: 'Estilo Visual', options: [{label: 'Foto Realista (8k)', value: 'photorealistic'}, {label: 'Cyberpunk Neon', value: 'cyberpunk'}, {label: 'Desenho 3D (Pixar)', value: '3d render'}, {label: 'Logo Minimalista', value: 'logo'}], required: true },
      { id: 'aspect_ratio', type: QuestionType.SELECT, question: 'Formato da Imagem', options: [{label: 'Quadrado (Instagram)', value: '1:1'}, {label: 'Em pé (Stories)', value: '9:16'}, {label: 'Deitado (Youtube)', value: '16:9'}], required: true }
    ]
  },
  {
    id: 'investor-pitch',
    title: 'Apresentação Investidor',
    description: 'O roteiro exato para convencer investidores a colocarem dinheiro na sua ideia.',
    icon: 'Lightbulb',
    color: COLORS.MASTER,
    category: 'Business',
    outputType: 'TEXT',
    minPlan: 'master',
    systemPrompt: 'Crie o roteiro textual para um Pitch Deck de 12 slides (Padrão Vale do Silício). Para cada slide, defina: Título, Texto Principal (Bullet points) e O que o apresentador deve falar (Speech).',
    steps: [
      { id: 'startup_name', type: QuestionType.TEXT, question: 'Nome do Projeto/Empresa', required: true },
      { id: 'problem', type: QuestionType.TEXTAREA, question: 'Qual problema você resolve?', required: true },
      { id: 'solution', type: QuestionType.TEXTAREA, question: 'Qual a sua solução mágica?', required: true },
      { id: 'ask', type: QuestionType.TEXT, question: 'Quanto dinheiro você precisa?', required: true }
    ]
  },

  // ==========================================================================================
  // NÍVEL 2: PRO (PROFISSIONAL) - FERRAMENTAS DE CRESCIMENTO
  // ==========================================================================================

  {
    id: 'viral-ugc-engine',
    title: 'Máquina de Vídeos Virais',
    description: 'Transforme vídeos chatos em máquinas de visualização. Cortes e Legendas.',
    icon: 'Clapperboard',
    color: COLORS.PRO,
    category: 'Marketing',
    outputType: 'TEXT',
    minPlan: 'pro',
    systemPrompt: 'Você é um editor de vídeo profissional do TikTok/Reels. Analise o contexto do vídeo descrito pelo usuário. Saída esperada: 1. Sugestão de "Hook Visual" (primeiros 3s). 2. Roteiro de cortes (Timestamps sugeridos). 3. Legenda magnética com Hashtags. 4. Sugestão de áudio em alta.',
    steps: [
      { id: 'video_context', type: QuestionType.TEXTAREA, question: 'Sobre o que é o vídeo bruto?', subtext: 'Descreva o que acontece na gravação.', required: true },
      { id: 'niche', type: QuestionType.TEXT, question: 'Qual o seu nicho?', subtext: 'Ex: Fitness, Humor, Vendas.', required: true },
      { id: 'goal', type: QuestionType.SELECT, question: 'Qual o objetivo?', options: [{label: 'Explodir de Views', value: 'views'}, {label: 'Vender Produto', value: 'sales'}, {label: 'Ganhar Seguidores', value: 'authority'}], required: true }
    ]
  },
  {
    id: 'site-builder',
    title: 'Criador de Sites',
    description: 'Sua empresa na internet em segundos. Site completo com design moderno.',
    icon: 'Globe',
    color: COLORS.PRO,
    category: 'Criativo',
    outputType: 'SITE',
    minPlan: 'pro',
    systemPrompt: 'Crie uma Landing Page completa em HTML único com Tailwind CSS. Estrutura: Header (Logo+Nav), Hero Section (Headline+Sub+CTA), Features (Grid 3 colunas), Social Proof (Testimonials), Pricing Table, FAQ e Footer. Design moderno, cores harmoniosas, responsivo mobile.',
    steps: [
      { id: 'niche', type: QuestionType.TEXT, question: 'Qual o ramo do site?', required: true },
      { id: 'name', type: QuestionType.TEXT, question: 'Nome do Negócio', required: true },
      { id: 'headline', type: QuestionType.TEXT, question: 'Frase Principal (Promessa)', required: true },
      { id: 'colors', type: QuestionType.TEXT, question: 'Cores da marca', required: true },
      { id: 'features', type: QuestionType.TEXTAREA, question: '3 Benefícios do seu produto', required: true }
    ]
  },
  {
    id: 'seo-shadow-writer',
    title: 'Redator SEO Invisível',
    description: 'Você escreve normal, a IA reescreve para dominar a primeira página do Google.',
    icon: 'FileSearch',
    color: COLORS.PRO,
    category: 'Marketing',
    outputType: 'TEXT',
    minPlan: 'pro',
    systemPrompt: 'Você é um especialista em SEO Técnico e Copywriting. Reescreva o texto do usuário mantendo o sentido original, mas aplicando técnicas de SEO On-Page: Inserção natural de keywords, melhoria de legibilidade (Flesch Reading Ease), uso de termos LSI e estrutura de headers (H1, H2). Saída em Markdown.',
    steps: [
      { id: 'original_text', type: QuestionType.TEXTAREA, question: 'Cole seu texto original', required: true },
      { id: 'keyword', type: QuestionType.TEXT, question: 'Palavra-chave Foco (O que buscam no Google?)', required: true },
      { id: 'competitors', type: QuestionType.TEXT, question: 'Sites concorrentes (Opcional)', required: false }
    ]
  },
  {
    id: 'youtube-script',
    title: 'Roteiros Milionários',
    description: 'A estrutura secreta dos Youtubers gigantes para prender a atenção.',
    icon: 'Youtube',
    color: COLORS.PRO,
    category: 'Marketing',
    outputType: 'TEXT',
    minPlan: 'pro',
    systemPrompt: 'Crie um roteiro de vídeo para YouTube focado em alta retenção. Estrutura: 1. Hook (0-30s) impactante, 2. Intro rápida, 3. Conteúdo (em 3 atos), 4. Transições sugeridas, 5. CTA final. Inclua sugestões visuais (B-Roll).',
    steps: [
      { id: 'title', type: QuestionType.TEXT, question: 'Ideia de Título', required: true },
      { id: 'niche', type: QuestionType.TEXT, question: 'Tema do Canal', required: true },
      { id: 'hook_idea', type: QuestionType.TEXTAREA, question: 'Qual a curiosidade inicial?', required: true },
      { id: 'cta', type: QuestionType.TEXT, question: 'O que pedir no final? (Like, Compra...)', required: true }
    ]
  },

  // ==========================================================================================
  // NÍVEL 3: FREE (GRÁTIS) - FERRAMENTAS DO DIA A DIA
  // ==========================================================================================

  {
    id: 'chef-ia',
    title: 'Chef de Cozinha IA',
    description: 'Não sabe o que jantar? Diga o que tem na geladeira e receba uma receita.',
    icon: 'ChefHat',
    color: COLORS.LIFESTYLE,
    category: 'Criativo',
    outputType: 'TEXT',
    minPlan: 'free',
    systemPrompt: 'Aja como um Chef com estrela Michelin. Baseado nos ingredientes fornecidos, crie uma receita criativa e deliciosa.',
    steps: [
      { id: 'ingredients', type: QuestionType.TEXTAREA, question: 'O que tem na geladeira?', required: true },
      { id: 'time', type: QuestionType.SELECT, question: 'Quanto tempo você tem?', options: [{label: '15 min (Rápido)', value: '15'}, {label: '30 min (Médio)', value: '30'}, {label: '1h+ (Sem pressa)', value: '60'}], required: true }
    ]
  },
  {
    id: 'love-advisor',
    title: 'Guru do Amor',
    description: 'A mensagem perfeita para conquistar, terminar ou fazer as pazes.',
    icon: 'HeartCrack',
    color: COLORS.SOCIAL,
    category: 'Criativo',
    outputType: 'TEXT',
    minPlan: 'free',
    systemPrompt: 'Aja como um especialista em relacionamentos. Escreva 3 opções de mensagens (Curta, Emocional, Direta) para WhatsApp.',
    steps: [
      { id: 'situation', type: QuestionType.SELECT, question: 'Qual a situação?', options: [{label: 'Chamar pra sair', value: 'date'}, {label: 'Voltar com Ex', value: 'back'}, {label: 'Terminar', value: 'breakup'}], required: true },
      { id: 'person_name', type: QuestionType.TEXT, question: 'Nome dele(a)', required: true },
      { id: 'details', type: QuestionType.TEXTAREA, question: 'O que aconteceu?', required: true }
    ]
  },
  {
    id: 'dream-interpreter',
    title: 'Vidente dos Sonhos',
    description: 'Sonhou algo estranho? A IA revela o significado oculto.',
    icon: 'Moon',
    color: COLORS.LIFESTYLE,
    category: 'Criativo',
    outputType: 'TEXT',
    minPlan: 'free',
    systemPrompt: 'Aja como um especialista em interpretação de sonhos junguiana e mística. Analise os elementos do sonho e dê um significado.',
    steps: [
      { id: 'dream_desc', type: QuestionType.TEXTAREA, question: 'Como foi o sonho?', required: true },
      { id: 'feeling', type: QuestionType.TEXT, question: 'Qual sentimento ficou?', required: true }
    ]
  }
];

export const ICONS: Record<string, any> = {
  FileText, Dumbbell, ShoppingBag, Mail, FileSignature, Instagram, Scale, Image, Palette, Briefcase, Globe, Code, Rocket, BrainCircuit, LayoutTemplate, Star, Award, Zap, Crown, Gavel, Utensils, Plane, GraduationCap, BookOpen, UserCheck, HeartPulse, PenTool, Terminal, Gem, Monitor, Youtube, Languages, UserPlus, BriefcaseIcon, TrendingUp, Wand2, Paintbrush, ShieldCheck, MessageCircle, Hash, Smile, Flame, Video, ScrollText, Target, Map, BarChart3, AlertTriangle, Lightbulb, AlertOctagon, HeartCrack, Moon, Search, ChefHat, Clapperboard, FileSearch, Network, LineChart, Bot
};
