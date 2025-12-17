
// Carrega as variáveis do .env na pasta raiz
require('dotenv').config({ path: '../.env' }); 

const express = require('express');
const cors = require('cors');
const axios = require('axios'); // Usaremos Axios para chamadas HTTP ao Asaas
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 4000;

// --- 1. CONFIGURAÇÃO E SEGURANÇA ---
// A chave fornecida foi inserida aqui. 
// EM PRODUÇÃO REAL: Mova isso para o arquivo .env por segurança.
const ASAAS_API_KEY = "$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjliNjUxMWI2LWZlYmYtNDIxOS05MzNhLWM5Y2ExODNhNmJiMzo6JGFhY2hfNzVlMGEyMGMtMWVkYS00YWY5LThjZTMtYzU1M2VkMzlmNzg5";

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY; // Deve ser a SERVICE_ROLE_KEY

// Inicializa Supabase
// Se as chaves não estiverem no .env, o servidor vai avisar, mas tentará rodar se possível.
const supabase = createClient(SUPABASE_URL || '', SUPABASE_KEY || '');

// Middleware
app.use(cors({
    origin: '*', 
    methods: ['POST', 'GET'],
    credentials: true
}));
app.use(express.json());

// URL Base do Asaas (Produção)
const ASAAS_URL = 'https://www.asaas.com/api/v3';

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
            const { data: customers } = await asaasClient.get(`/customers?email=${email}`);
            if (customers.data && customers.data.length > 0) {
                customerId = customers.data[0].id;
            } else {
                // Cria novo cliente
                const newCustomer = await asaasClient.post('/customers', {
                    name: name || 'Cliente AutoConteúdo',
                    email: email,
                    cpfCnpj: cpfCnpj || undefined 
                });
                customerId = newCustomer.data.id;
            }
        } catch (err) {
            console.error("Erro Asaas Customer:", err.response?.data || err.message);
            // Fallback: Se der erro de auth na chave, avisa o front
            if (err.response?.status === 401) {
                return res.status(500).json({ error: 'Erro de Autenticação na API de Pagamento.' });
            }
            return res.status(500).json({ error: 'Erro ao criar cliente no gateway.' });
        }

        // 2. Criar a Cobrança (Payment)
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 2); // Vencimento em 2 dias

        const paymentPayload = {
            customer: customerId,
            billingType: 'UNDEFINED', // Permite escolher Pix/Cartão/Boleto no link, mas focamos em PIX aqui
            value: product.price,
            dueDate: dueDate.toISOString().split('T')[0],
            description: `Pagamento: ${product.title}`,
            externalReference: userId, // ID do Supabase
            postalService: false,
            // Redirecionamento após pagamento (Volta para o site verificando sucesso)
            callback: {
                successUrl: `${FRONTEND_URL}/#/pricing?status=success&verifying=true`
            }
        };

        const { data: paymentData } = await asaasClient.post('/payments', paymentPayload);
        const paymentId = paymentData.id;

        console.log("Cobrança criada com sucesso ID:", paymentId);

        // 3. BUSCAR QR CODE PIX ESPECÍFICO (Passo Adicional Crucial)
        let qrCodeData = { encodedImage: null, payload: null };
        try {
            const { data: qrData } = await asaasClient.get(`/payments/${paymentId}/pixQrCode`);
            qrCodeData = qrData;
            console.log("QR Code PIX recuperado.");
        } catch (qrError) {
            console.warn("Aviso: Não foi possível recuperar QR Code Pix imediato (pode ser boleto ou crédito).", qrError.message);
        }
        
        // Retorna tudo para o frontend
        return res.json({ 
            paymentUrl: paymentData.invoiceUrl, // Link geral (fallback)
            qr_code_base64: qrCodeData.encodedImage, // Imagem Base64
            qr_code: qrCodeData.payload // Copia e Cola
        });

    } catch (error) {
        console.error('Erro ao criar cobrança Asaas:', error.response?.data || error.message);
        return res.status(500).json({ error: 'Erro ao conectar com servidor de pagamento.' });
    }
});

// --- ROTA 2: WEBHOOK AUTOMATIZADO (ASAAS) ---
app.post('/api/asaas/webhook', async (req, res) => {
    const { event, payment } = req.body;

    console.log(`Asaas Webhook: [${event}] ID: [${payment?.id}] Valor: [${payment?.value}]`);

    // Eventos de sucesso no Asaas
    if (event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_RECEIVED') {
        try {
            const userId = payment.externalReference;
            const paidValue = payment.value;
            
            // Tenta identificar o plano pelo valor pago
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
                
                // Se não era assinante, marca como 'credits_pack'
                if (!profile?.is_pro) {
                    updateData.plan_type = 'credits_pack';
                }
            } else {
                // Se for assinatura
                updateData.plan_type = product.plan;
                updateData.subscription_date = new Date().toISOString();
                updateData.credits = 9999; // Ilimitado
            }

            const { error } = await supabase
                .from('profiles')
                .update(updateData)
                .eq('id', userId);

            if (error) {
                console.error('Erro Supabase:', error);
                return res.status(500).send('Erro DB');
            }

            console.log(`SUCESSO: Usuário ${userId} atualizado para ${product.title}`);
            return res.status(200).json({ received: true });

        } catch (error) {
            console.error('Erro processando webhook:', error);
            return res.status(500).send('Erro interno');
        }
    }

    return res.status(200).json({ received: true });
});

app.listen(PORT, () => {
    console.log(`Servidor Backend Asaas rodando na porta ${PORT}`);
});
