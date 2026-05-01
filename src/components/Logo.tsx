import React from 'react';
import { Stethoscope, BrainCircuit } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', className = '', showText = true }) => {
  const iconSize = size === 'sm' ? 20 : size === 'md' ? 24 : size === 'lg' ? 32 : size === 'xl' ? 48 : 24;
  const containerSize = size === 'sm' ? 'w-10 h-10' : size === 'md' ? 'w-12 h-12' : size === 'lg' ? 'w-16 h-16' : size === 'xl' ? 'w-24 h-24' : 'w-12 h-12';
  const fontSize = size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : 'text-2xl';

  return (
    <div className={`flex items-center gap-3 group/logo ${className}`}>
      <div className={`relative ${containerSize} flex items-center justify-center`}>
        {/* Simplified Background Layer */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl group-hover/logo:scale-105 transition-transform duration-300" />
        
        {/* Icon Composite */}
        <div className="relative z-10 flex items-center justify-center text-white">
          <BrainCircuit size={iconSize * 0.8} className="absolute inset-0 opacity-20" />
          <Stethoscope size={iconSize} className="relative z-20 stroke-[2.5]" />
        </div>

        {/* Status Indicator Dot */}
        <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-400 rounded-full border border-white dark:border-slate-900 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-baseline">
            <span className={`${fontSize} font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none`}>
              Doctorian
            </span>
            <div className="ml-1 px-1.5 py-0.5 bg-blue-600 rounded-md">
               <span className="text-[10px] font-black text-white uppercase italic">AI</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="h-px w-4 bg-slate-300 dark:bg-slate-700" />
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 whitespace-nowrap">Cognis Health Systems</span>
          </div>
        </div>
      )}
    </div>
  );
};
