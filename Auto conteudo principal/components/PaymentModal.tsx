
import React, { useState } from 'react';
import { X, CreditCard, QrCode, Smartphone, Loader2, Lock, CheckCircle, Copy, AlertCircle, MessageCircle } from 'lucide-react';
import { Button } from './Button';
import { User } from '../context/AuthContext';
import { SUPPORT_WHATSAPP } from '../constants';

interface PaymentModalProps {
  plan: any;
  user: User;
  onClose: () => void;
}

// URL do Backend no Render
const API_URL = "https://checkout-seguro-mp-v3.onrender.com";

export const PaymentModal: React.FC<PaymentModalProps> = ({ plan, user, onClose }) => {
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form Data
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  
  // Payment Data
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');
  const [qrCodeBase64, setQrCodeBase64] = useState('');
  const [copyPasteCode, setCopyPasteCode] = useState('');
  const [paymentLink, setPaymentLink] = useState(''); // Para cartão/link geral

  // Máscaras simples
  const handleCpf = (v: string) => {
    v = v.replace(/\D/g, "");
    if (v.length > 11) v = v.substring(0, 11);
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    setCpf(v);
  };

  const handlePhone = (v: string) => {
    v = v.replace(/\D/g, "");
    v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
    v = v.replace(/(\d)(\d{4})$/, "$1-$2");
    setPhone(v);
  };

  const initiateCheckout = async () => {
    if (cpf.length < 14 || phone.length < 14) {
        setError("Por favor, preencha CPF e Telefone corretamente.");
        return;
    }
    
    setLoading(true);
    setError('');

    try {
        const payload = {
            planId: plan.id, // ID do plano conforme backend espera
            name: user.name,
            email: user.email,
            userId: user.id,
            cpfCnpj: cpf.replace(/\D/g, "")
        };

        // Chama a rota CORRETA do Backend Asaas
        const response = await fetch(`${API_URL}/api/pagamento/criar-checkout`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error || "Erro na conexão com pagamento");

        // Salva os dados retornados
        if (data.paymentUrl) setPaymentLink(data.paymentUrl);
        if (data.qr_code_base64) setQrCodeBase64(data.qr_code_base64);
        if (data.qr_code) setCopyPasteCode(data.qr_code);

        // Avança para a tela de pagamento
        setStep('payment');

    } catch (err) {
        console.error(err);
        setError("backend_fail");
    } finally {
        setLoading(false);
    }
  };

  const openWhatsAppFallback = () => {
      const msg = `Olá! Tentei assinar o plano *${plan.name}* (R$ ${plan.price}) mas tive problemas no site. Pode me enviar o link de pagamento? Meus dados: ${user.email}`;
      window.open(`https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const copyPix = () => {
      navigator.clipboard.writeText(copyPasteCode);
      alert("Código PIX copiado!");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-fade-in">
        <div className="bg-[#0f111a] w-full max-w-md rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-slate-900/50 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Lock size={18} className="text-emerald-400" /> Checkout Seguro
                </h3>
                <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                    <X size={24} />
                </button>
            </div>

            {/* Error / Fallback State */}
            {error === 'backend_fail' ? (
                <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                    <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-6">
                        <AlertCircle size={40} className="text-amber-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Ops! Instabilidade temporária.</h2>
                    <p className="text-slate-400 mb-8">
                        Não conseguimos gerar o pagamento automático agora. Mas não se preocupe, finalize diretamente pelo WhatsApp.
                    </p>
                    <Button onClick={openWhatsAppFallback} className="w-full h-14 text-lg bg-[#25D366] hover:bg-[#128C7E] text-white shadow-lg shadow-green-900/20">
                        <MessageCircle size={24} className="mr-2" />
                        FINALIZAR NO WHATSAPP
                    </Button>
                    <button onClick={() => setError('')} className="mt-4 text-slate-500 text-sm hover:text-white underline">
                        Tentar novamente
                    </button>
                </div>
            ) : step === 'details' ? (
                <div className="p-6 space-y-6 overflow-y-auto">
                    {/* Summary */}
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5 flex justify-between items-center">
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Você está assinando</p>
                            <h4 className="text-lg font-black text-white">{plan.name}</h4>
                        </div>
                        <div className="text-right">
                            <p className="text-xl font-black text-emerald-400">R$ {plan.price}</p>
                            <p className="text-[10px] text-slate-500">{plan.period}</p>
                        </div>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">CPF (Titular)</label>
                            <input 
                                type="text" 
                                value={cpf}
                                onChange={e => handleCpf(e.target.value)}
                                placeholder="000.000.000-00"
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder-slate-600"
                                maxLength={14}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Celular / WhatsApp</label>
                            <input 
                                type="text" 
                                value={phone}
                                onChange={e => handlePhone(e.target.value)}
                                placeholder="(00) 00000-0000"
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder-slate-600"
                                maxLength={15}
                            />
                        </div>
                    </div>

                    {/* Payment Method Tabs */}
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase ml-1 mb-2 block">Forma de Pagamento</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => setPaymentMethod('pix')}
                                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'pix' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'}`}
                            >
                                <QrCode size={24} />
                                <span className="font-bold text-sm">PIX (Instantâneo)</span>
                            </button>
                            <button 
                                onClick={() => setPaymentMethod('card')}
                                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'card' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'}`}
                            >
                                <CreditCard size={24} />
                                <span className="font-bold text-sm">Cartão de Crédito</span>
                            </button>
                        </div>
                    </div>
                    
                    {error && (
                        <div className="text-red-400 text-sm font-bold bg-red-400/10 p-3 rounded-lg flex items-center gap-2">
                             <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <Button 
                        onClick={initiateCheckout} 
                        isLoading={loading}
                        className="w-full h-14 text-lg shadow-xl shadow-indigo-900/20"
                    >
                        {paymentMethod === 'pix' ? 'GERAR PAGAMENTO PIX' : 'IR PARA PAGAMENTO'}
                    </Button>
                    
                    <p className="text-center text-[10px] text-slate-500">
                        Ambiente criptografado. Seus dados estão seguros.
                    </p>
                </div>
            ) : (
                <div className="p-6 space-y-6 flex flex-col items-center text-center">
                    {/* PAYMENT STEP */}
                    {paymentMethod === 'pix' ? (
                        <>
                            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mb-2">
                                <CheckCircle size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-white">Pagamento Gerado!</h3>
                            
                            {qrCodeBase64 ? (
                                <>
                                    <p className="text-slate-400 text-sm">Escaneie o QR Code abaixo:</p>
                                    <div className="bg-white p-4 rounded-xl shadow-lg my-4">
                                        <img src={`data:image/png;base64,${qrCodeBase64}`} alt="QR Code Pix" className="w-48 h-48" />
                                    </div>
                                </>
                            ) : (
                                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl my-4 text-amber-300 text-sm">
                                    <p className="font-bold">QR Code de Imagem não disponível.</p>
                                    <p className="text-xs mt-1">Utilize o botão "Copia e Cola" abaixo ou clique em "Abrir Fatura".</p>
                                </div>
                            )}

                            {copyPasteCode && (
                                <div className="w-full">
                                    <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Pix Copia e Cola</label>
                                    <div className="flex gap-2">
                                        <input value={copyPasteCode} readOnly className="bg-slate-900 border border-slate-700 text-slate-300 text-xs p-3 rounded-lg w-full truncate" />
                                        <button onClick={copyPix} className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-lg">
                                            <Copy size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            <a href={paymentLink} target="_blank" rel="noopener noreferrer" className="w-full mt-2">
                                <Button variant="outline" className="w-full h-12 text-sm border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10">
                                    ABRIR FATURA COMPLETA
                                </Button>
                            </a>
                        </>
                    ) : (
                        <>
                            <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 mb-2 animate-pulse">
                                <CreditCard size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-white">Quase lá!</h3>
                            <p className="text-slate-400 text-sm mb-6">Para sua segurança, finalize o pagamento no checkout blindado.</p>
                            
                            <a href={paymentLink} target="_blank" rel="noopener noreferrer" className="w-full">
                                <Button className="w-full h-14 text-lg">ABRIR CHECKOUT SEGURO</Button>
                            </a>
                        </>
                    )}

                    <div className="w-full pt-6 border-t border-white/5 mt-4">
                         <button onClick={openWhatsAppFallback} className="text-sm font-bold text-slate-500 hover:text-green-400 flex items-center justify-center gap-2 w-full transition-colors">
                            <MessageCircle size={16} /> Tive um problema, me ajude no WhatsApp
                         </button>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};
