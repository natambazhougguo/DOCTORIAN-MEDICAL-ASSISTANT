import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Brain, Loader2, ClipboardCheck, Activity, ShieldCheck, Zap, X, ChevronRight, Share2 } from 'lucide-react';
import { api } from '../api';
import { Vitals } from '../hooks/useArduino';

interface NeuralHealthSummaryProps {
  vitals: Vitals | null;
  history: Vitals[];
  records?: any[];
  onClose?: () => void;
}

export const NeuralHealthSummary: React.FC<NeuralHealthSummaryProps> = ({ vitals, history, records = [], onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateSummary = async () => {
    if (!vitals && history.length === 0 && records.length === 0) {
      setError("No health data available for analysis.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    const systemInstruction = `You are Doctorian AI, a state-of-the-art clinical neural intelligence. 
    Your task is to provide a "Neural Health Summary" based on real-time vitals, historical health data, and medical records.
    Be precise, professional, and insightful. Use medical terminology correctly but explain critical points.
    Strictly follow this format:
    1. CURRENT STATE: A brief assessment of current vitals (if provided).
    2. CLINICAL HISTORY: A synthesis of medical records and prescriptions (if provided).
    3. TREND ANALYSIS: How vitals or health status have changed over time.
    4. NEURAL INSIGHTS: Deep physiological connections (e.g., how medications relate to current vitals).
    5. ACTIONABLE PROTOCOLS: Specific, science-based recommendations.
    6. BIOMETRIC CONFIDENCE: A percentage score of how stable the overall profile is.
    
    Keep the tone "Cyber-Clinical" - high-tech and ultra-precise.`;

    const dataPrompt = `Analyis Request for Patient Health Matrix:
    - Current Vitals: ${JSON.stringify(vitals)}
    - Historical Trend (Last 10 samples): ${JSON.stringify(history.slice(-10))}
    - Medical Records/Prescriptions: ${JSON.stringify(records.slice(-5))}
    
    Please synthesize a comprehensive report.`;

    try {
      const response = await api.ai.geminiChat(
        [{ role: 'user', text: dataPrompt }],
        systemInstruction,
        'gemini-1.5-flash',
        0.5
      );
      setSummary(response.text);
    } catch (err: any) {
      console.error("Neural synthesis failed:", err);
      setError("Neural link interrupted. Failed to synthesize health summary.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col h-full">
      <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-950 text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Brain size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tighter">Neural Health Summary</h3>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Cognis Analysis Active</span>
            </div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X size={20} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {!summary && !isGenerating ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8 py-12">
            <div className="w-32 h-32 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center relative">
              <Sparkles size={64} className="text-blue-500 absolute animate-pulse" />
              <ClipboardCheck size={48} className="text-slate-300 relative z-10" />
            </div>
            <div className="max-w-md space-y-4">
              <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Synthesize Biological Intelligence</h4>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Initiate a deep clinical analysis of your physiological data stream. Doctorian AI will correlate your vitals, historical trends, and biometric markers.
              </p>
            </div>
            <button 
              onClick={generateSummary}
              className="px-12 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm uppercase tracking-[0.3em] transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center gap-4"
            >
              <Zap size={20} />
              Generate Neural Assessment
            </button>
          </div>
        ) : isGenerating ? (
          <div className="h-full flex flex-col items-center justify-center space-y-10 py-20">
            <div className="relative">
              <div className="w-24 h-24 border-8 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
              <Brain size={32} className="absolute inset-0 m-auto text-blue-600 animate-pulse" />
            </div>
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-3">
                <Loader2 size={16} className="animate-spin text-blue-600" />
                <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest">Synthesizing Neural Summary</h4>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Correlating Biometric Data Streams • Optimal Inference Active</p>
            </div>
            <div className="w-full max-w-sm space-y-4">
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 10, ease: "linear" }}
                  className="h-full bg-blue-600"
                />
              </div>
              <p className="text-[9px] font-black text-slate-400 uppercase text-center">Inference Model: Doctorian Alpha v4</p>
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                <div className="relative z-10 flex items-center gap-4 mb-4">
                  <div className="p-3 bg-white dark:bg-slate-700 rounded-2xl text-blue-600 shadow-sm">
                    <Activity size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analysis Identity</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white uppercase">Neural Bio-Link S-4</p>
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-[10px] font-black text-emerald-500 uppercase">Verified Report</span>
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-700" />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-slate-900 text-white rounded-3xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                    <ShieldCheck size={100} />
                 </div>
                 <div className="relative z-10 mb-4 text-emerald-400">
                    <ClipboardCheck size={24} />
                 </div>
                 <div className="relative z-10">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Updated</p>
                    <p className="text-sm font-black uppercase">{new Date().toLocaleString()}</p>
                 </div>
              </div>
            </div>

            <div className="prose prose-slate dark:prose-invert max-w-none">
              <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-lg whitespace-pre-wrap font-medium text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
                {summary}
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={generateSummary}
                className="flex-1 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <RefreshCw size={14} className={isGenerating ? "animate-spin" : ""} />
                Re-Synthesize Insights
              </button>
              <button className="px-8 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95">
                <Share2 size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {error && (
          <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl text-red-600 dark:text-red-400 text-xs font-black uppercase text-center tracking-widest">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

const RefreshCw: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);
