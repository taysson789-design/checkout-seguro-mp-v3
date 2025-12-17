// Carrega as variáveis do .env (necessário em desenvolvimento)
require('dotenv').config({ path: '../.env' }); 

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 4000;

// --- 1. CONFIGURAÇÃO E SEGURANÇA ---
// TODAS as variáveis sensíveis são carregadas do process.env (do .env local ou do Render)
const ASAAS_API_KEY = process.env.ASAAS_ACCESS_TOKEN; 
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY; // Deve ser a SERVICE_ROLE_KEY

// Verifica se as chaves críticas estão presentes
if (!ASAAS_API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
    console.error("ERRO CRÍTICO: Variáveis ASAAS_ACCESS_TOKEN, SUPABASE_URL ou SUPABASE_KEY não encontradas.");
    // Em produção, você pode querer sair do processo: process.exit(1);
}

// Inicializa Supabase
const supabase = createClient(SUPABASE_URL || '', SUPABASE_KEY || '');

// Middleware
// Configura o CORS de forma mais estrita para o FRONTEND_URL, 
// mas permite POST de outros (como o webhook do Asaas).
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || origin === FRONTEND_URL || origin.includes('netlify.app') || origin.includes('render.com')) {
            callback(null, true);
        } else {
            // Permite requisições sem origin (como o Webhook do Asaas)
            callback(null, true);
        }
    },
    methods: ['POST', 'GET'],
    credentials: true
}));
app.use(express.json());

// URL Base do Asaas (Produção)
const ASAAS_URL = 'https://api.asaas.com/v3'; // URL correta para chamadas de API

// TABELA DE PRODUTOS
const PRODUCTS = {
    'credits_pack': { title: 'Pack Starter - 50 Créditos', price: 25.90, type: 'credits', amount: 50 },
    'subscription_monthly': { title: 'Assinatura PRO Mensal', price: 47.90, type: 'subscription', plan: 'monthly' },
    'subscription_master_monthly': { title: 'Assinatura MASTER Mensal', price: 89.90, type: 'subscription', plan: 'master_monthly' },
    'subscription_yearly': { title: 'Assinatura MASTER Anual', price: 497.90, type: 'subscription', plan: 'yearly' }
};

// --- HELPER: Configuração do Axios para Asaas ---
const asaasClient = axios.create({
    baseURL: ASAAS_URL,
    headers: {
        // Usa a variável carregada do process.env
        'access_token': ASAAS_API_KEY, 
        'Content-Type': 'application/json'
    }
});

// --- ROTA 1: CRIAR CHECKOUT (ASAAS) ---
app.post('/api/pagamento/criar-checkout', async (req, res) => {
    try {
        const { planId, email, userId, name, cpfCnpj } = req.body; 

        console.log(`Iniciando checkout para: ${email}, Plano: ${planId}`);

        if (!userId || !email || !planId) {
            return res.status(400).json({ error: 'Dados incompletos (planId, email, userId).' });
        }

        const product = PRODUCTS[planId];
        if (!product) {
            return res.status(404).json({ error: 'Plano não encontrado.' });
        }

        // 1. Criar ou Recuperar Cliente no Asaas
        let customerId;
        try {
            // O Asaas usa query params para busca
            const { data: customers } = await asaasClient.get(`/customers?email=${email}`);
            
            if (customers.data && customers.data.length > 0) {
                customerId = customers.data[0].id;
                console.log(`Cliente Asaas existente encontrado: ${customerId}`);
            } else {
                // Cria novo cliente
                const newCustomer = await asaasClient.post('/customers', {
                    name: name || 'Cliente AutoConteúdo',
                    email: email,
                    cpfCnpj: cpfCnpj || undefined 
                });
                customerId = newCustomer.data.id;
                console.log(`Novo cliente Asaas criado: ${customerId}`);
            }
        } catch (err) {
            console.error("Erro Asaas Customer:", err.response?.data || err.message);
            if (err.response?.status === 401) {
                return res.status(500).json({ error: 'Erro de Autenticação na API de Pagamento. Verifique o token.' });
            }
            return res.status(500).json({ error: 'Erro ao criar/recuperar cliente no gateway.' });
        }

        // 2. Criar a Cobrança (Payment)
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7); // Vencimento padrão em 7 dias

        const paymentPayload = {
            customer: customerId,
            billingType: 'UNDEFINED', // Permite escolher Pix/Cartão/Boleto no checkout
            value: product.price,
            dueDate: dueDate.toISOString().split('T')[0],
            description: `Pagamento: ${product.title}`,
            externalReference: userId, // ID do Supabase
            // Redirecionamento após pagamento (Volta para o site verificando sucesso)
            callback: {
                 // Certifique-se de que a URL de retorno no Asaas está correta
                successUrl: `${FRONTEND_URL}/#/pricing?status=success&verifying=true` 
            },
            // Configura o webhook para receber a notificação do pagamento
            notificationUrl: `${SERVER_URL}/api/asaas/webhook`
        };

        const { data: paymentData } = await asaasClient.post('/payments', paymentPayload);

        console.log("Cobrança criada com sucesso. Fatura:", paymentData.invoiceUrl);
        
        // Retorna a URL da fatura que o Front-end deve abrir
        return res.json({ paymentUrl: paymentData.invoiceUrl });

    } catch (error) {
        console.error('Erro ao criar cobrança Asaas:', error.response?.data || error.message);
        return res.status(500).json({ error: 'Erro ao conectar com servidor de pagamento.' });
    }
});

// --- ROTA 2: WEBHOOK AUTOMATIZADO (ASAAS) ---
app.post('/api/asaas/webhook', async (req, res) => {
    // Webhook deve ser a URL pública do seu Render, ex: https://NOME-DO-RENDER.onrender.com/api/asaas/webhook
    const { event, payment } = req.body;

    console.log(`Asaas Webhook: [${event}] ID: [${payment?.id}] Valor: [${payment?.value}]`);

    // Eventos de sucesso no Asaas
    if (event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_RECEIVED') {
        try {
            const userId = payment.externalReference;
            const paidValue = payment.value;
            
            // Tenta identificar o plano pelo valor pago (tolerância de R$ 0.50 para taxas/arredondamentos)
            let planIdFound = null;
            for (const [key, prod] of Object.entries(PRODUCTS)) {
                if (Math.abs(prod.price - paidValue) < 0.5) { 
                    planIdFound = key;
                    break;
                }
            }

            if (!userId || !planIdFound) {
                console.error(`Webhook: UserId (${userId}) ou Plano não identificado para valor ${paidValue}`);
                return res.status(200).json({ received: true }); 
            }

            const product = PRODUCTS[planIdFound];

            // Prepara atualização no Supabase
            let updateData = {
                last_payment: new Date().toISOString(),
                is_pro: true // Ativa status PRO
            };

            if (product.type === 'credits') {
                // Se for pacote de créditos, SOMA aos atuais
                const { data: profile } = await supabase.from('profiles').select('credits, is_pro').eq('id', userId).single();
                const currentCredits = profile?.credits || 0;
                updateData.credits = currentCredits + product.amount;
                
                if (!profile?.is_pro) {
                    updateData.plan_type = 'credits_pack';
                }
            } else {
                // Se for assinatura
                updateData.plan_type = product.plan;
                updateData.subscription_date = new Date().toISOString();
                updateData.credits = 9999; // Ilimitado (para assinantes)
            }

            const { error } = await supabase
                .from('profiles')
                .update(updateData)
                .eq('id', userId);

            if (error) {
                console.error('Erro Supabase ao atualizar perfil:', error);
                return res.status(500).send('Erro DB');
            }

            console.log(`SUCESSO: Usuário ${userId} atualizado para ${product.title}`);
            return res.status(200).json({ received: true });

        } catch (error) {
            console.error('Erro processando webhook:', error);
            return res.status(500).send('Erro interno');
        }
    }

    // Retorna 200 para eventos não processados (Asaas espera um 200)
    return res.status(200).json({ received: true });
});

// Rota de saúde simples (opcional, para testes)
app.get('/', (req, res) => {
    res.send('Asaas Backend Rodando!');
});

app.listen(PORT, () => {
    console.log(`Servidor Backend Asaas rodando na porta ${PORT} (URL: ${SERVER_URL})`);
});
