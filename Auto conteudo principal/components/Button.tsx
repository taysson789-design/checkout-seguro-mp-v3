
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gold';
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
  const baseStyles = "inline-flex items-center justify-center font-bold tracking-tight transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl active:scale-95 relative overflow-hidden";
  
  const variants = {
    // Primary: Neon Indigo/Purple glow
    primary: "bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-[length:200%_auto] hover:bg-right text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] hover:shadow-[0_0_30px_rgba(99,102,241,0.7)] border border-white/10 btn-shine animate-gradient-x",
    
    // Gold: For Master Actions
    gold: "bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 shadow-[0_0_20px_rgba(251,191,36,0.5)] hover:shadow-[0_0_30px_rgba(251,191,36,0.7)] btn-shine hover:-translate-y-0.5",

    // Secondary: Dark Glass
    secondary: "bg-white/10 text-white hover:bg-white/20 hover:shadow-lg border border-white/10 backdrop-blur-md",
    
    // Outline: For minimal actions
    outline: "border border-white/20 bg-transparent text-slate-300 hover:bg-white/5 hover:text-white hover:border-white/40",
    
    ghost: "text-slate-400 hover:bg-white/5 hover:text-white bg-transparent"
  };

  const sizes = {
    sm: "h-9 px-4 text-xs",
    md: "h-12 px-6 text-sm", 
    lg: "h-16 px-10 text-lg" 
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
