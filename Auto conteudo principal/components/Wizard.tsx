
import React, { useState, useEffect, useRef } from 'react';
import { WizardStep, UserAnswers, QuestionType } from '../types';
import { Button } from './Button';
import { ArrowLeft, ArrowRight, Check, Upload, X, Mic, MicOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WizardProps {
  steps: WizardStep[];
  onComplete: (answers: UserAnswers) => void;
  isGenerating: boolean;
}

export const Wizard: React.FC<WizardProps> = ({ steps, onComplete, isGenerating }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswers>({});
  const [inputValue, setInputValue] = useState<string | string[]>('');
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const navigate = useNavigate();

  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  useEffect(() => {
    const existingAnswer = answers[currentStep.id];
    setInputValue(existingAnswer || (currentStep.type === QuestionType.MULTI_SELECT || currentStep.type === QuestionType.MULTI_IMAGE_UPLOAD ? [] : ''));
    setError(null);
  }, [currentStepIndex, currentStep.id]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(prev => typeof prev === 'string' ? (prev ? prev + ' ' + transcript : transcript) : transcript);
      };
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleSpeech = () => {
    if (!recognitionRef.current) {
      alert("Seu navegador não suporta escrita por voz ou não deu permissão ao microfone.");
      return;
    }
    if (isListening) recognitionRef.current.stop();
    else recognitionRef.current.start();
  };

  const handleNext = () => {
    if (currentStep.required && (!inputValue || (Array.isArray(inputValue) && inputValue.length === 0))) {
      setError('Este campo é obrigatório.');
      return;
    }
    const newAnswers = { ...answers, [currentStep.id]: inputValue };
    setAnswers(newAnswers);
    if (currentStepIndex < steps.length - 1) setCurrentStepIndex(prev => prev + 1);
    else onComplete(newAnswers);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;
    const maxFiles = currentStep.maxFiles || 1;
    const currentFiles = Array.isArray(inputValue) ? inputValue : [];
    if (currentFiles.length + files.length > maxFiles) {
        setError(`Máximo de ${maxFiles} fotos permitido.`);
        return;
    }
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (currentStep.type === QuestionType.MULTI_IMAGE_UPLOAD) {
          setInputValue(prev => [...(Array.isArray(prev) ? prev : []), base64]);
        } else {
          setInputValue(base64);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index?: number) => {
    if (index !== undefined && Array.isArray(inputValue)) {
      setInputValue(inputValue.filter((_, i) => i !== index));
    } else {
      setInputValue('');
    }
  };

  const renderInput = () => {
    const isText = currentStep.type === QuestionType.TEXT || currentStep.type === QuestionType.TEXTAREA;

    return (
      <div className="relative w-full">
        {isText && (
          <button 
            type="button"
            onClick={toggleSpeech}
            className={`absolute right-3 top-3 z-10 p-2 md:p-3 rounded-full transition-all shadow-md ${isListening ? 'bg-red-500 text-white animate-pulse scale-110' : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-white'}`}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        )}

        {currentStep.type === QuestionType.TEXT && (
          <input
            autoFocus
            type="text"
            value={inputValue as string}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full p-4 md:p-5 pr-14 text-base md:text-xl bg-slate-900 border border-slate-700 text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium placeholder-slate-600"
            placeholder={currentStep.placeholder || "Digite aqui..."}
          />
        )}

        {currentStep.type === QuestionType.TEXTAREA && (
          <textarea
            autoFocus
            rows={5}
            value={inputValue as string}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full p-4 md:p-5 pr-14 text-base md:text-xl bg-slate-900 border border-slate-700 text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium resize-none placeholder-slate-600"
            placeholder={currentStep.placeholder || "Descreva detalhadamente..."}
          />
        )}

        {(currentStep.type === QuestionType.IMAGE_UPLOAD || currentStep.type === QuestionType.MULTI_IMAGE_UPLOAD) && (
          <div className="space-y-4">
             <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-indigo-500 hover:bg-slate-800 rounded-[2rem] p-8 md:p-12 flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-900/50"
             >
                <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-800 rounded-2xl shadow-xl flex items-center justify-center text-indigo-400 mb-4 transform group-hover:scale-110 transition-transform">
                   <Upload className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <p className="font-black text-white text-base md:text-lg text-center">Enviar Fotos</p>
                <p className="text-xs md:text-sm text-slate-500 mt-2 font-medium text-center">Arraste ou clique para selecionar (Máx: {currentStep.maxFiles || 1})</p>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple={currentStep.type === QuestionType.MULTI_IMAGE_UPLOAD} onChange={handleFileChange} />
             </div>
             
             <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                {Array.isArray(inputValue) ? inputValue.map((src, i) => (
                    <div key={i} className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden group shadow-lg border border-slate-700">
                        <img src={src} className="w-full h-full object-cover" />
                        <button onClick={() => removeFile(i)} className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={24} /></button>
                    </div>
                )) : inputValue && (
                    <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden group shadow-lg border border-slate-700 mx-auto md:mx-0">
                        <img src={inputValue as string} className="w-full h-full object-cover" />
                        <button onClick={() => removeFile()} className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={24} /></button>
                    </div>
                )}
             </div>
          </div>
        )}

        {currentStep.type === QuestionType.SELECT && (
          <div className="grid gap-3 md:gap-4">
            {currentStep.options?.map(opt => (
              <button 
                key={opt.value} 
                onClick={() => setInputValue(opt.value)}
                className={`p-4 md:p-6 text-left border rounded-2xl md:rounded-3xl transition-all font-bold text-base md:text-lg flex items-center justify-between group active:scale-[0.98] ${inputValue === opt.value ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300 shadow-xl scale-[1.02]' : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-600 hover:text-white'}`}
              >
                {opt.label}
                <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center transition-all ${inputValue === opt.value ? 'border-indigo-500 bg-indigo-500' : 'border-slate-600'}`}>
                    {inputValue === opt.value && <Check size={12} className="text-white" />}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-2 md:px-0">
      <div className="mb-6 md:mb-10">
        <div className="w-full bg-slate-800 h-1.5 md:h-2 rounded-full overflow-hidden shadow-inner">
          <div className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 h-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(99,102,241,0.8)]" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="glass-panel-dark p-6 md:p-14 rounded-[2rem] md:rounded-[3rem] shadow-2xl border border-white/10 animate-slide-up relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-32 md:w-40 h-32 md:h-40 bg-indigo-600/20 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none"></div>

        <h2 className="text-xl md:text-3xl font-black text-white mb-6 md:mb-10 leading-tight tracking-tight">{currentStep.question}</h2>
        
        {renderInput()}
        
        {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm mt-4 font-bold animate-pulse">
                <X size={16} /> {error}
            </div>
        )}
        
        <div className="flex flex-col-reverse md:flex-row justify-between mt-10 md:mt-16 gap-4">
          <Button variant="ghost" onClick={() => currentStepIndex > 0 ? setCurrentStepIndex(prev => prev - 1) : navigate('/')} className="text-slate-500 hover:text-white w-full md:w-auto">
            <ArrowLeft className="w-5 h-5 mr-2" /> Voltar
          </Button>
          <Button onClick={handleNext} isLoading={isGenerating} size="lg" className="px-12 shadow-[0_0_30px_rgba(99,102,241,0.4)] w-full md:w-auto justify-center">
            {currentStepIndex === steps.length - 1 ? 'Gerar Agora' : 'Próximo'}
            {currentStepIndex !== steps.length - 1 && <ArrowRight className="w-5 h-5 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
};
