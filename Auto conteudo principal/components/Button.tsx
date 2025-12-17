
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-bold tracking-tight transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl active:scale-95 relative overflow-hidden";
  
  // Variantes atualizadas com Gradientes Fortes
  const variants = {
    // Primary agora é um gradiente vivo e animado
    primary: "bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-[length:200%_auto] hover:bg-right text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 border border-transparent btn-shine hover:-translate-y-0.5 animate-gradient-x",
    
    // Secondary mantém o contraste escuro
    secondary: "bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-500/20 focus:ring-slate-500 border border-transparent hover:-translate-y-0.5",
    
    outline: "border-2 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-600 focus:ring-indigo-500 shadow-sm hover:shadow-md",
    
    ghost: "text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 focus:ring-slate-500 bg-transparent"
  };

  const sizes = {
    sm: "h-9 px-4 text-xs",
    md: "h-12 px-6 text-sm", // Aumentado um pouco para facilitar o clique
    lg: "h-16 px-10 text-lg" // Botões grandes para CTA
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="mr-2">
          <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
      ) : null}
      <span className="relative z-10 flex items-center">{children}</span>
    </button>
  );
};
