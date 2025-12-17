
import { DocumentTemplate, QuestionType } from './types';
import { FileText, Dumbbell, ShoppingBag, Mail, FileSignature, Instagram, Scale, Image, Palette, Briefcase, Globe, Code, Rocket, BrainCircuit, LayoutTemplate } from 'lucide-react';

export const APP_NAME = "AutoConteúdo Pro";
export const MRR_GOAL_PRICE = "R$ 47,90";

// URL do seu Backend Node.js
export const API_BASE_URL = "http://localhost:4000/api";

export const SUPPORT_WHATSAPP = "5571996568342"; 

export const PLANS = [
  {
    id: 'credits_pack',
    name: 'Pack Starter',
    price: '25.90', 
    period: 'único',
    highlight: false,
    description: 'Para quem quer testar.',
    features: [
      '50 Créditos de geração',
      'Textos e Imagens Básicas',
      'Sem acesso aos Agentes 360º',
      'Acesso Imediato'
    ]
  },
  {
    id: 'subscription_monthly',
    name: 'Assinatura PRO',
    price: '47.90',
    period: '/mês',
    highlight: false,
    description: 'Para criadores constantes.',
    features: [
      '✅ CRIAÇÃO ILIMITADA||PRO',
      'Sites, Textos e Imagens',
      'IA Avançada||PRO',
      'Histórico na Nuvem||PRO',
      'Sem Agente 360º'
    ]
  },
  {
    id: 'subscription_master_monthly',
    name: 'MASTER Mensal',
    price: '89.90',
    period: '/mês',
    highlight: false,
    description: 'Acesso à Inteligência Real.',
    features: [
      '🚀 AGENTE 360º||MASTER',
      '💎 Raciocínio (Thinking)||MASTER',
      '💎 Imagens Ultra Realistas||MASTER',
      'Prioridade na Fila||VIP',
      'Cancele quando quiser',
    ]
  },
  {
    id: 'subscription_yearly',
    name: 'MASTER Anual 👑',
    price: '497.90',
    period: '/ano',
    highlight: true,
    description: 'A escolha da Elite (R$ 41,49/mês).',
    features: [
      '👑 TUDO do Master Ilimitado||MASTER',
      'Agentes Autônomos||MASTER',
      'Economize R$ 580,90||OFF',
      'Suporte Pessoal||VIP',
      'Acesso a Betas||EXCLUSIVO',
    ]
  },
  {
    id: 'free_tier',
    name: 'Plano Inicial Grátis',
    price: '0.00',
    period: '/sempre',
    highlight: false,
    description: 'Para experimentar a tecnologia.',
    features: [
      '2 Créditos a cada 3 dias',
      'Geração de Texto e Imagem',
      'Qualidade Padrão',
      'Sem acesso a Sites/HTML',
      'Suporte Comunitário'
    ]
  }
];

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'launch-agent-360',
    title: 'Agente de Lançamento 360º (MASTER)',
    description: '⚡ EXCLUSIVO MASTER: Cria E-mail, Post, Script de Vídeo e Landing Page de uma só vez a partir de uma ideia.',
    icon: 'Rocket',
    color: 'bg-gradient-to-r from-amber-500 to-orange-600',
    outputType: 'TEXT',
    systemPrompt: `ATENÇÃO: Você é um ESTRATEGISTA CHEFE DE MARKETING digital de classe mundial.
    Sua missão é criar uma campanha de lançamento COMPLETA, ÉTICA e COESA.
    
    SEGURANÇA E ÉTICA: Não faça promessas de ganhos financeiros irreais ou curas milagrosas. Mantenha a copy persuasiva mas honesta.
    
    Gere 4 seções detalhadas, separadas por "## ":
    
    1. ## 📧 Sequência de E-mail (AIDA)
       - Assunto matador (Curto e Curioso).
       - Corpo do e-mail focado em conversão.
    
    2. ## 📸 Estratégia de Instagram
       - Legenda viral com ganchos fortes.
       - Sugestão visual do criativo.
       - 15 Hashtags de alto alcance.
    
    3. ## 🎬 Roteiro de Vídeo (TikTok/Reels)
       - Gancho visual (0-3s).
       - Desenvolvimento da dor/solução.
       - CTA claro e direto.
    
    4. ## 🌐 Estrutura da Página de Vendas (Copy)
       - Headline (H1).
       - Subheadline (H2).
       - Bullets de Benefícios.
       - Tratamento de Objeções.
       - Oferta Irresistível.
    
    Use linguagem persuasiva, gatilhos mentais (Urgência, Prova Social, Autoridade) e formatação Markdown impecável.`,
    steps: [
      {
        id: 'product_concept',
        type: QuestionType.TEXTAREA,
        question: 'O que você vai lançar hoje?',
        subtext: 'Descreva seu produto ou oferta. O Agente fará todo o resto.',
        placeholder: 'Ex: Um ebook sobre jejum intermitente por R$ 27,90...',
        required: true
      },
      {
        id: 'target_pain',
        type: QuestionType.TEXT,
        question: 'Qual a maior dor do seu cliente?',
        required: true
      },
      {
        id: 'transformation',
        type: QuestionType.TEXTAREA,
        question: 'Qual a transformação (Promessa)?',
        subtext: 'Onde a pessoa estará depois de usar seu produto?',
        placeholder: 'Ex: Vai perder 3kg em 7 dias sem passar fome.',
        required: true
      },
      {
        id: 'authority_bio',
        type: QuestionType.TEXTAREA,
        question: 'Quem é o especialista/autor? (Breve bio)',
        placeholder: 'Ex: Nutricionista com 10 anos de experiência...',
        required: false
      },
      {
        id: 'price',
        type: QuestionType.TEXT,
        question: 'Qual o preço e a oferta?',
        placeholder: 'Ex: R$ 97,00 à vista ou 12x de R$ 9,70',
        required: true
      },
      {
        id: 'guarantee',
        type: QuestionType.TEXT,
        question: 'Qual a garantia oferecida?',
        placeholder: 'Ex: 7 dias incondicional ou seu dinheiro de volta',
        required: true
      },
      {
        id: 'bonus_offer',
        type: QuestionType.TEXT,
        question: 'Existe algum bônus especial? (Opcional)',
        placeholder: 'Ex: Mentoria grátis, Ebook extra, Comunidade VIP...',
        required: false
      }
    ]
  },
  {
    id: 'banner-pro',
    title: 'Criador de Banners Pro',
    description: 'Crie banners, capas para YouTube, headers de LinkedIn e artes para anúncios em formatos perfeitos.',
    icon: 'LayoutTemplate',
    color: 'bg-gradient-to-br from-fuchsia-500 to-purple-600',
    outputType: 'IMAGE',
    systemPrompt: 'Generate a high quality banner image. Focus on composition, negative space for text, and professional lighting.',
    steps: [
      {
        id: 'banner_topic',
        type: QuestionType.TEXTAREA,
        question: 'Qual o tema ou texto principal do Banner?',
        subtext: 'Ex: "Promoção de Black Friday", "Tutorial de React", "Capa para Perfil Executivo". A IA criará a arte visual baseada nisso.',
        placeholder: 'Descreva o que deve aparecer na imagem...',
        required: true
      },
      {
        id: 'platform_format',
        type: QuestionType.SELECT,
        question: 'Onde você vai usar este banner?',
        options: [
          { label: 'Instagram/Facebook Feed (1:1)', value: '1:1' },
          { label: 'YouTube Capa/Thumbnail (16:9)', value: '16:9' },
          { label: 'Stories / Reels / TikTok (9:16)', value: '9:16' },
          { label: 'LinkedIn Header / Site Hero (4:1)', value: '4:1' },
          { label: 'Twitter/X Header (3:1)', value: '3:1' },
        ],
        required: true
      },
      {
        id: 'visual_style',
        type: QuestionType.SELECT,
        question: 'Qual o estilo visual?',
        options: [
          { label: 'Corporativo & Clean (Azul/Branco)', value: 'corporate, clean, professional, blue and white, minimalist' },
          { label: 'Gamer / Neon / Cyberpunk', value: 'cyberpunk, neon lights, gaming atmosphere, dark background' },
          { label: 'Luxo / Premium (Dourado/Preto)', value: 'luxury, gold and black, elegant, premium texture' },
          { label: 'Varejo / Promoção (Vibrante)', value: 'sales background, vibrant red and yellow, exciting, marketing' },
          { label: 'Minimalista / Tech', value: 'minimalist tech, white space, modern abstract shapes' },
          { label: 'Natureza / Orgânico', value: 'nature, organic, leaves, soft lighting, green tones' },
        ],
        required: true
      },
      {
        id: 'elements',
        type: QuestionType.TEXT,
        question: 'Algum elemento específico?',
        subtext: 'Ex: "Quero um notebook na mesa", "Um fundo abstrato", "Uma pessoa apontando".',
        placeholder: 'Opcional',
        required: false
      }
    ]
  },
  {
    id: 'website-generator',
    title: 'Web Designer IA',
    description: 'Crie Landing Pages completas e profissionais em segundos. HTML/CSS responsivo pronto para publicar.',
    icon: 'Globe',
    color: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    outputType: 'SITE',
    systemPrompt: `Você é um Desenvolvedor Frontend Sênior e UI/UX Designer premiado (Awwwards).
    Seu objetivo é criar uma LANDING PAGE DE ALTA CONVERSÃO em um ÚNICO ARQUIVO HTML.
    
    REGRAS TÉCNICAS (CRÍTICO):
    1. Importe Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
    2. Use fontes do Google Fonts (Inter, Outfit ou Poppins).
    3. Use ícones via FontAwesome CDN ou Heroicons SVG inline.
    4. O código deve ser RESPONSIVO (Mobile-First).
    5. NÃO use CSS externo. Use classes Tailwind para tudo.
    
    ESTRUTURA VISUAL:
    1. **Navbar**: Logo (Texto estilizado), Links de âncora, Botão CTA de destaque.
    2. **Hero Section**: Headline gigante, Subheadline persuasiva, Botão CTA pulsante, e a Imagem do Produto (Use o placeholder [[USER_IMAGE_SRC]]).
    3. **Seção de Benefícios**: Grid de cards com ícones e sombras suaves (hover effects).
    4. **Prova Social**: Depoimentos ou números de impacto.
    5. **Sobre**: Breve descrição com foto ou cor de fundo.
    6. **Footer**: Links, Copyright e Redes Sociais.
    
    DESIGN SYSTEM:
    - Use sombras (shadow-xl, shadow-2xl) para profundidade.
    - Use gradientes sutis nos fundos ou textos (bg-gradient-to-r).
    - Use bordas arredondadas (rounded-xl, rounded-2xl).
    - Garanta alto contraste e acessibilidade.
    
    Gere APENAS o código HTML. Nada de explicações.`,
    steps: [
      {
        id: 'business_name',
        type: QuestionType.TEXT,
        question: 'Qual o nome do seu negócio/projeto?',
        placeholder: 'Ex: Pizzaria Bella Napoli, Advogado Silva...',
        required: true
      },
      {
        id: 'business_type',
        type: QuestionType.TEXTAREA,
        question: 'O que você vende ou oferece?',
        subtext: 'Descreva seu produto/serviço para a IA criar os textos de venda.',
        placeholder: 'Ex: Vendo consultoria financeira para pequenas empresas...',
        required: true
      },
      {
        id: 'target_audience',
        type: QuestionType.TEXT,
        question: 'Quem é seu cliente ideal?',
        placeholder: 'Ex: Jovens, Empresas, Donas de casa...',
        required: true
      },
      {
        id: 'contact_info',
        type: QuestionType.TEXT,
        question: 'Dados de Contato (para o site)',
        placeholder: 'Ex: (11) 99999-9999, contato@empresa.com, Endereço...',
        required: true
      },
      {
        id: 'business_image',
        type: QuestionType.IMAGE_UPLOAD,
        question: '✨ Upload VIP: Foto de Destaque / Hero',
        subtext: 'Envie uma foto de alta qualidade do seu negócio, produto ou portfolio. Essa imagem será o destaque principal (Hero Section) do seu site premium.',
        required: false
      },
      {
        id: 'color_scheme',
        type: QuestionType.SELECT,
        question: 'Qual a paleta de cores desejada?',
        options: [
          { label: 'Azul Tech (Confiança/Moderno)', value: 'blue' },
          { label: 'Verde Natureza (Saúde/Bem-estar)', value: 'green' },
          { label: 'Preto e Dourado (Luxo/Premium)', value: 'gold' },
          { label: 'Laranja Vibrante (Energia/Fitness)', value: 'orange' },
          { label: 'Roxo Criativo (Inovação/Arte)', value: 'purple' },
          { label: 'Rosa/Pastel (Estética/Beleza)', value: 'pink' },
          { label: 'Minimalista (Preto e Branco)', value: 'grayscale' },
        ],
        required: true
      },
      {
        id: 'cta_text',
        type: QuestionType.TEXT,
        question: 'Qual a ação principal do botão (CTA)?',
        placeholder: 'Ex: Falar no WhatsApp, Comprar Agora, Agendar Visita...',
        required: true
      },
      {
        id: 'social_proof',
        type: QuestionType.TEXTAREA,
        question: 'Depoimentos ou Números (Opcional)',
        subtext: 'O que seus clientes falam de você? Ou quantos anos de experiência?',
        placeholder: 'Ex: +1000 alunos formados, Nota 5.0 no Google...',
        required: false
      }
    ]
  },
  {
    id: 'ai-image-generator',
    title: 'Estúdio Flux.1 (Alta Definição)',
    description: 'A nova geração de imagens com IA. Crie fotos realistas, logos e artes complexas com o modelo Flux.',
    icon: 'Image',
    color: 'bg-gradient-to-br from-purple-500 to-pink-500',
    outputType: 'IMAGE',
    systemPrompt: 'Generate a high quality image. SAFETY FILTER: Do not generate NSFW, violence, or illegal content.',
    steps: [
      {
        id: 'image_prompt',
        type: QuestionType.TEXTAREA,
        question: 'O que você quer criar?',
        subtext: 'Pode escrever em português e de forma simples. Nossa IA vai refinar seu pedido para qualidade máxima.',
        placeholder: 'Ex: Um astronauta andando a cavalo em Marte, estilo cinema...',
        required: true
      },
      {
        id: 'image_style',
        type: QuestionType.SELECT,
        question: 'Estilo artístico',
        options: [
          { label: 'Fotografia Realista (Flux)', value: 'photorealistic, 8k, highly detailed' },
          { label: 'Cinematográfico (Filme)', value: 'cinematic lighting, movie scene, dramatic' },
          { label: '3D Render (Pixar)', value: '3d render, cute, soft lighting, octane render' },
          { label: 'Cyberpunk / Neon', value: 'cyberpunk, neon lights, futuristic' },
          { label: 'Logo Minimalista', value: 'minimalist vector logo, clean, white background' },
          { label: 'Anime / Mangá', value: 'anime style, vibrant colors' },
          { label: 'Arquitetura / Interiores', value: 'modern architecture, interior design' },
        ],
        required: true
      },
      {
        id: 'aspect_ratio',
        type: QuestionType.SELECT,
        question: 'Formato da Imagem',
        options: [
          { label: 'Quadrado (1:1) - Instagram/Feed', value: '1:1' },
          { label: 'Vertical (9:16) - Stories/Reels', value: '9:16' },
          { label: 'Paisagem (16:9) - Youtube/Site', value: '16:9' },
          { label: 'Retrato (3:4) - Padrão Foto', value: '3:4' },
        ],
        required: true
      }
    ]
  },
  {
    id: 'instagram-post',
    title: 'Post Viral Instagram',
    description: 'Legendas virais, imagens criadas com IA e hashtags estratégicas.',
    icon: 'Instagram',
    color: 'bg-gradient-to-br from-pink-500 to-rose-500',
    outputType: 'TEXT',
    systemPrompt: `Você é um Especialista em Marketing Viral e Social Media Manager.
    Seu objetivo é criar conteúdo de alto engajamento para Instagram.
    
    1. Crie uma "Headline" (Gancho) impossível de ignorar (no topo).
    2. Desenvolva uma legenda envolvente usando técnicas de Storytelling.
    3. Inclua emojis estrategicamente para dar ritmo à leitura.
    4. Use quebra de linha para facilitar leitura.
    5. Gere 15 hashtags nichadas e relevantes no final.
    
    Importante: Mantenha o tom adequado ao público selecionado.`,
    steps: [
      {
        id: 'post_topic',
        type: QuestionType.TEXT,
        question: 'Sobre o que é o post?',
        placeholder: 'Ex: Dicas para emagrecer rápido, Bastidores da empresa...',
        required: true
      },
      {
        id: 'target_audience_specifics',
        type: QuestionType.TEXT,
        question: 'Para quem é esse post?',
        placeholder: 'Ex: Mães de primeira viagem, Empreendedores iniciantes...',
        required: true
      },
      {
        id: 'format',
        type: QuestionType.SELECT,
        question: 'Qual o formato do conteúdo?',
        options: [
            { label: 'Carrossel (Várias imagens)', value: 'carousel' },
            { label: 'Foto Única (Estática)', value: 'static_photo' },
            { label: 'Stories (Sequência)', value: 'stories_sequence' },
        ],
        required: true
      },
      {
        id: 'tone',
        type: QuestionType.SELECT,
        question: 'Qual o objetivo principal?',
        options: [
          { label: 'Vender um produto', value: 'vendas' },
          { label: 'Educar/Ensinar', value: 'educativo' },
          { label: 'Entreter/Divertido', value: 'entretenimento' },
          { label: 'Inspirar/Motivar', value: 'inspiracional' },
          { label: 'Gerar Polêmica/Debate', value: 'polemico' },
        ],
        required: true
      },
      {
        id: 'hook_style',
        type: QuestionType.SELECT,
        question: 'Estilo do Gancho (Headline)',
        options: [
          { label: 'Curiosidade ("Você não sabia...")', value: 'curiosity' },
          { label: 'Promessa Forte ("Como conseguir X...")', value: 'promise' },
          { label: 'Medo/Erro ("Pare de fazer isso...")', value: 'fear' },
          { label: 'História Pessoal ("Como eu comecei...")', value: 'story' },
        ],
        required: true
      },
      {
        id: 'cta',
        type: QuestionType.TEXT,
        question: 'Chamada para Ação (CTA)',
        placeholder: 'Ex: Comente "EU QUERO", Clique no Link da Bio...',
        required: true
      }
    ]
  },
  {
    id: 'resume-cv',
    title: 'Currículo Visual Premium',
    description: 'Crie um currículo com design profissional, layout visual (Modelo A4) pronto para imprimir em PDF.',
    icon: 'Briefcase',
    color: 'bg-gradient-to-br from-emerald-500 to-teal-500',
    outputType: 'SITE',
    systemPrompt: `Você é um Designer Gráfico e Headhunter Especialista em Currículos de Alto Impacto.
    Seu objetivo é criar um CURRÍCULO VISUALMENTE IMPRESSIONANTE em um ÚNICO ARQUIVO HTML.
    
    REGRAS DE DESIGN (CRÍTICO):
    1. Importe Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
    2. Importe a fonte 'Inter' do Google Fonts e aplique no body.
    3. **Estrutura de Papel A4**: O container principal deve ter classe 'max-w-[210mm] mx-auto bg-white shadow-2xl min-h-[297mm] p-8 md:p-12 my-8'.
    4. **Layout**: Use um layout limpo, moderno e executivo. Pode usar duas colunas ou cabeçalho centralizado elegante.
    5. **Estilo**: Use badges para habilidades, timeline visual para experiência (com borda lateral), e tipografia hierárquica clara.
    6. **Cores**: Use acentos em Azul Marinho (blue-900), Cinza Chumbo (slate-800) ou Verde Petróleo (teal-800). Fundo branco.
    
    CONTEÚDO DO CURRÍCULO:
    - **Header**: Nome (Grande), Cargo Desejado (Subtítulo), Contatos (Ícones + Texto).
    - **Resumo Profissional**: Texto persuasivo no topo.
    - **Experiência**: Lista cronológica. Use negrito para cargos e empresas. Destaque resultados.
    - **Educação**: Formação acadêmica clara.
    - **Habilidades**: Lista de tags/badges (ex: bg-slate-100 px-3 py-1 rounded).
    
    Gere APENAS o código HTML completo. O resultado final deve parecer um documento PDF profissional visualizado no navegador.`,
    steps: [
      {
        id: 'personal_info',
        type: QuestionType.TEXTAREA,
        question: 'Dados Pessoais e Contato',
        placeholder: 'Nome Completo, Cidade, Telefone, Email, LinkedIn...',
        required: true
      },
      {
        id: 'target_role',
        type: QuestionType.TEXT,
        question: 'Qual o cargo ou área de interesse?',
        required: true
      },
      {
        id: 'experience',
        type: QuestionType.TEXTAREA,
        question: 'Experiência Profissional (Últimas 3)',
        subtext: 'Inclua nome da empresa, cargo, datas e, principalmente, RESULTADOS alcançados.',
        placeholder: 'Ex: Gerente de Vendas na Empresa X (2020-2023). Aumentei as vendas em 30%...',
        required: true
      },
      {
        id: 'education',
        type: QuestionType.TEXTAREA,
        question: 'Formação Acadêmica',
        placeholder: 'Curso, Instituição, Ano de conclusão...',
        required: true
      },
      {
        id: 'skills',
        type: QuestionType.TEXTAREA,
        question: 'Principais Habilidades (Hard & Soft Skills)',
        placeholder: 'Inglês fluente, Excel Avançado, Liderança...',
        required: true
      },
      {
        id: 'languages',
        type: QuestionType.TEXT,
        question: 'Idiomas',
        placeholder: 'Ex: Inglês Fluente, Espanhol Intermediário...',
        required: false
      },
      {
        id: 'certifications',
        type: QuestionType.TEXTAREA,
        question: 'Cursos e Certificações Extras',
        placeholder: 'Ex: PMP, Google Analytics, Workshop de Liderança...',
        required: false
      }
    ]
  },
  {
    id: 'contract-service',
    title: 'Contrato Jurídico',
    description: 'Contrato de prestação de serviços blindado e profissional. Ideal para freelancers e MEI.',
    icon: 'FileSignature',
    color: 'bg-gradient-to-br from-indigo-500 to-blue-600',
    outputType: 'TEXT',
    systemPrompt: `Você é um Advogado Sênior Especialista em Contratos Civis e Comerciais.
    Sua tarefa é redigir um CONTRATO DE PRESTAÇÃO DE SERVIÇOS seguro, formal e bem estruturado.
    
    SEGURANÇA JURÍDICA:
    - Use terminologia jurídica correta.
    - Use **Negrito** para Cláusulas e Títulos (Ex: **CLÁUSULA PRIMEIRA - DO OBJETO**).
    
    ESTRUTURA OBRIGATÓRIA:
    1. Qualificação das Partes (Contratante e Contratado).
    2. Objeto do Contrato (Descrição detalhada).
    3. Obrigações do Contratante e Contratado.
    4. Preço e Forma de Pagamento.
    5. Prazo de Vigência.
    6. Política de Rescisão e Multa.
    7. Foro de Eleição.
    8. Espaço para Assinaturas.
    
    DISCLAIMER DE SEGURANÇA: No final do documento, adicione uma nota em itálico: *"Nota: Este documento é uma minuta gerada por Inteligência Artificial. Recomenda-se a revisão por um advogado para garantir a validade jurídica específica para o seu caso."*`,
    steps: [
      {
        id: 'party_identification',
        type: QuestionType.SELECT,
        question: 'Partes envolvidas',
        options: [
          { label: 'Pessoa Física x Pessoa Física', value: 'pf_pf' },
          { label: 'Empresa (PJ) x Pessoa Física', value: 'pj_pf' },
          { label: 'Empresa (PJ) x Empresa (PJ)', value: 'pj_pj' },
        ],
        required: true
      },
      {
        id: 'contratante',
        type: QuestionType.TEXT,
        question: 'Dados do Contratante (Cliente)',
        placeholder: 'Nome/Razão Social, CPF/CNPJ, Endereço...',
        required: true
      },
      {
        id: 'contratado',
        type: QuestionType.TEXT,
        question: 'Dados do Contratado (Prestador)',
        placeholder: 'Nome/Razão Social, CPF/CNPJ, Endereço...',
        required: true
      },
      {
        id: 'service_description',
        type: QuestionType.TEXTAREA,
        question: 'Descrição detalhada do Serviço',
        required: true
      },
      {
        id: 'payment_value',
        type: QuestionType.TEXT,
        question: 'Valor e Forma de Pagamento',
        placeholder: 'Ex: R$ 5.000,00 sendo 50% na entrada e 50% na entrega...',
        required: true
      },
      {
        id: 'late_fee',
        type: QuestionType.TEXT,
        question: 'Multa por atraso de pagamento?',
        placeholder: 'Ex: Multa de 2% e juros de 1% ao mês.',
        required: true
      },
      {
        id: 'prazo',
        type: QuestionType.TEXT,
        question: 'Prazo de entrega ou vigência',
        required: true
      },
      {
        id: 'cancellation',
        type: QuestionType.TEXT,
        question: 'Política de Cancelamento/Rescisão',
        placeholder: 'Ex: Aviso prévio de 30 dias, multa de 10%...',
        required: true
      },
      {
        id: 'jurisdiction',
        type: QuestionType.TEXT,
        question: 'Foro (Cidade/Estado para resolver disputas)',
        placeholder: 'Ex: Comarca de São Paulo/SP',
        required: true
      }
    ]
  },
  {
    id: 'product-description',
    title: 'Copy E-commerce (SEO)',
    description: 'Descrições persuasivas para Mercado Livre, Shopee e Amazon.',
    icon: 'ShoppingBag',
    color: 'bg-gradient-to-br from-yellow-400 to-orange-500',
    outputType: 'TEXT',
    systemPrompt: `Você é um Especialista em Copywriting e SEO para E-commerce com foco em conversão.
    
    Sua missão é criar uma descrição de produto que venda.
    
    ESTRUTURA:
    1. **Título Otimizado (SEO)**: Crie um título forte com palavras-chave.
    2. **Descrição Emocional (Storytelling)**: Conecte o produto a uma necessidade ou desejo.
    3. **Lista de Benefícios (Bullets)**: Use emojis e destaque o valor (não só características).
    4. **Especificações Técnicas**: Crie uma tabela ou lista organizada.
    5. **FAQ (Perguntas Frequentes)**: Antecipe 3 dúvidas comuns e responda para quebrar objeções.
    
    SEGURANÇA: Não prometa características que o produto não tem. Seja fiel às informações fornecidas.`,
    steps: [
      {
        id: 'product_name',
        type: QuestionType.TEXT,
        question: 'Nome do Produto',
        required: true
      },
      {
        id: 'target_audience',
        type: QuestionType.TEXT,
        question: 'Público Alvo',
        required: true
      },
      {
        id: 'main_benefits',
        type: QuestionType.TEXTAREA,
        question: 'Características principais e Benefícios',
        required: true
      },
      {
        id: 'tech_specs',
        type: QuestionType.TEXTAREA,
        question: 'Especificações Técnicas (Ficha Técnica)',
        placeholder: 'Ex: Voltagem 220v, Peso 2kg, Material Aço Inox...',
        required: true
      },
      {
        id: 'objections',
        type: QuestionType.TEXT,
        question: 'Qual a principal dúvida/medo do comprador?',
        placeholder: 'Ex: Se vai servir, se é original, garantia...',
        required: false
      },
      {
        id: 'seo_keywords',
        type: QuestionType.TEXT,
        question: 'Palavras-chave para SEO (Como as pessoas buscam?)',
        placeholder: 'Ex: tênis corrida, tênis confortável, nike air...',
        required: true
      }
    ]
  }
];

export const ICONS: Record<string, any> = {
  FileText,
  Dumbbell,
  ShoppingBag,
  Mail,
  FileSignature,
  Instagram,
  Scale,
  Image,
  Palette,
  Briefcase,
  Globe,
  Code,
  Rocket,
  BrainCircuit,
  LayoutTemplate
};
