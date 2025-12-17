
import React, { useState, useEffect, useRef } from 'react';
import { WizardStep, UserAnswers, QuestionType } from '../types';
import { Button } from './Button';
import { ArrowLeft, ArrowRight, Check, Upload, X, Image as ImageIcon } from 'lucide-react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  // Reset input value when step changes
  useEffect(() => {
    const existingAnswer = answers[currentStep.id];
    setInputValue(existingAnswer || (currentStep.type === QuestionType.MULTI_SELECT ? [] : ''));
    setError(null);
  }, [currentStepIndex, steps, answers, currentStep.id, currentStep.type]);

  const handleNext = () => {
    // Validation
    if (currentStep.required) {
      if (Array.isArray(inputValue)) {
        if (inputValue.length === 0) {
          setError('Por favor, selecione pelo menos uma opção.');
          return;
        }
      } else if (!inputValue || inputValue.trim() === '') {
        setError('Este campo é obrigatório.');
        return;
      }
    }

    const newAnswers = { ...answers, [currentStep.id]: inputValue };
    setAnswers(newAnswers);

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      onComplete(newAnswers);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    } else {
      // Functional: Go back to Dashboard if on the first step
      navigate('/');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentStep.type !== QuestionType.TEXTAREA && currentStep.type !== QuestionType.IMAGE_UPLOAD) {
      handleNext();
    }
  };

  // Handle File Upload & Convert to Base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        setError("A imagem deve ter no máximo 4MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setInputValue(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setInputValue('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const renderInput = () => {
    switch (currentStep.type) {
      case QuestionType.TEXT:
        return (
          <input
            autoFocus
            type="text"
            value={inputValue as string}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={currentStep.placeholder}
            // text-base impede zoom no iOS
            className="w-full p-4 text-base md:text-lg border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all"
          />
        );
      case QuestionType.TEXTAREA:
        return (
          <textarea
            autoFocus
            rows={4}
            value={inputValue as string}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={currentStep.placeholder}
            // text-base impede zoom no iOS
            className="w-full p-4 text-base md:text-lg border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all"
          />
        );
      case QuestionType.SELECT:
        return (
          <div className="grid grid-cols-1 gap-3">
            {currentStep.options?.map((option) => (
              <button
                key={option.value}
                onClick={() => setInputValue(option.value)}
                className={`p-4 text-left border rounded-xl transition-all duration-200 transform hover:scale-[1.01] active:scale-95 ${
                  inputValue === option.value
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600 shadow-md'
                    : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm md:text-base">{option.label}</span>
                  {inputValue === option.value && <Check className="w-5 h-5 text-indigo-600 animate-fade-in" />}
                </div>
              </button>
            ))}
          </div>
        );
      case QuestionType.IMAGE_UPLOAD:
        return (
          <div className="w-full">
            {!inputValue ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50 rounded-2xl p-6 md:p-10 flex flex-col items-center justify-center cursor-pointer transition-all group"
              >
                <div className="bg-indigo-100 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6 md:w-8 md:h-8 text-indigo-600" />
                </div>
                <p className="font-bold text-slate-700 text-base md:text-lg text-center">Clique para fazer upload</p>
                <p className="text-slate-500 text-xs md:text-sm mt-2">JPG ou PNG (Máx 4MB)</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/png, image/jpeg, image/jpg" 
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-lg group">
                <img 
                  src={inputValue as string} 
                  alt="Preview" 
                  className="w-full h-48 md:h-64 object-cover object-center"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <Button variant="secondary" onClick={removeImage} className="bg-white text-red-600 hover:bg-red-50">
                      <X className="w-4 h-4 mr-2" /> Remover Imagem
                   </Button>
                </div>
                <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                   <ImageIcon size={12} /> Imagem Carregada
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-1 md:px-0">
      {/* Progress Bar */}
      <div className="mb-6 md:mb-8 animate-fade-in">
        <div className="flex justify-between text-xs font-medium text-slate-500 mb-2">
          <span>Passo {currentStepIndex + 1} de {steps.length}</span>
          <span>{Math.round(progress)}% Concluído</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-indigo-600 h-2 rounded-full transition-all duration-500 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-0 h-full w-2 bg-white/30 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="glass-panel bg-white/90 p-6 md:p-8 rounded-2xl shadow-xl min-h-[350px] md:min-h-[400px] flex flex-col justify-between animate-slide-up">
        {/* Key forces re-render for animation on step change */}
        <div key={currentStepIndex} className="animate-slide-in-right">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 leading-tight">
            {currentStep.question}
          </h2>
          {currentStep.subtext && (
            <p className="text-sm md:text-base text-slate-500 mb-6">{currentStep.subtext}</p>
          )}

          <div className="mt-4 md:mt-6">
            {renderInput()}
            {error && (
              <p className="mt-3 text-sm text-red-600 flex items-center gap-1 animate-fade-in">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500"></span> {error}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mt-8 md:mt-10 pt-6 border-t border-slate-100/50">
          <Button 
            variant="ghost" 
            onClick={handleBack} 
            disabled={isGenerating}
            className="text-slate-500 hover:text-slate-700 px-2 md:px-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1 md:mr-2" />
            {currentStepIndex === 0 ? 'Cancelar' : 'Voltar'}
          </Button>

          <Button 
            variant="primary" 
            size="lg"
            onClick={handleNext}
            isLoading={isGenerating && currentStepIndex === steps.length - 1}
            className="shadow-lg shadow-indigo-200 hover:shadow-indigo-300 h-10 md:h-12 text-sm md:text-base px-6 md:px-8"
          >
            {currentStepIndex === steps.length - 1 ? 'Gerar Documento' : 'Próximo'}
            {currentStepIndex !== steps.length - 1 && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </div>
      
      <div className="mt-6 text-center text-xs md:text-sm text-slate-400 animate-fade-in delay-300">
        <p>A IA atua como seu consultor pessoal. Responda com sinceridade.</p>
      </div>
    </div>
  );
};
