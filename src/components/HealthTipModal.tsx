import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, ShieldCheck, Zap, Brain, Smile, Droplets, Apple, Moon } from 'lucide-react';

export interface HealthTip {
  title: string;
  description: string;
  details: string;
  benefits?: string[];
  icon: React.ReactNode;
  color: string;
}

interface HealthTipModalProps {
  isOpen: boolean;
  onClose: () => void;
  tip: HealthTip;
}

export const HealthTipModal: React.FC<HealthTipModalProps> = ({ isOpen, onClose, tip }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl max-w-lg w-full relative border border-slate-100 dark:border-slate-800"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400"
            >
              <X size={24} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className={`${tip.color} dark:bg-opacity-10 w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-lg`}>
                {tip.icon}
              </div>
              
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                {tip.title}
              </h2>
              <p className="text-blue-600 dark:text-blue-400 font-black text-xs uppercase tracking-widest mb-6">
                Daily Health Insight
              </p>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 text-left border border-slate-100 dark:border-slate-700 mb-8">
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium italic mb-4">
                  "{tip.description}"
                </p>
                <div className="h-px bg-slate-200 dark:bg-slate-700 w-full mb-4" />
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
                  {tip.details}
                </p>

                {tip.benefits && tip.benefits.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Key Benefits</p>
                    <div className="grid grid-cols-1 gap-2">
                      {tip.benefits.map((benefit, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                          {benefit}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={onClose}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 dark:shadow-blue-900/20 active:scale-95"
              >
                Got it, thanks!
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
