import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, ShieldAlert, CheckCircle2, ChevronRight, Loader2, Sparkles, Zap, Brain, MessageSquare, PhoneCall } from 'lucide-react';
import { api } from '../api';
import { Vitals, HealthStatus } from '../hooks/useArduino';

interface AnomalyDetectorProps {
  vitals: Vitals | null;
  healthStatus: HealthStatus | null;
}

export const AnomalyDetector: React.FC<AnomalyDetectorProps> = ({ vitals, healthStatus }) => {
  const [analysis, setAnalysis] = useState<{
    anomalies: string[];
    risks: string[];
    recommendations: string[];
    criticality: 'low' | 'medium' | 'high';
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performAnalysis = async () => {
    if (!vitals) return;
    setLoading(true);
    setError(null);

    try {
      const prompt = `Act as a senior clinical physician specializing in critical care and anomaly detection. 
      Analyze the following live patient biometric data:
      - HEART RATE: ${vitals.heartRate} bpm
      - SPO2: ${vitals.spo2}%
      - TEMP: ${vitals.temperature}°C
      - BLOOD PRESSURE: ${vitals.systolicBP}/${vitals.diastolicBP} mmHg
      - RESPIRATORY RATE: ${vitals.respiratoryRate} rpm
      - SCORE: ${healthStatus?.score}/100
      - CURRENT ALERTS: ${healthStatus?.alerts.join(', ')}

      Identify any physiological anomalies or critical deviations. 
      Summarize potential risks and provide IMMEDIATE NEXT STEPS.
      
      Respond STRICTLY in this JSON format:
      {
        "anomalies": ["anomaly 1", "anomaly 2"],
        "risks": ["risk 1", "risk 2"],
        "recommendations": ["step 1", "step 2"],
        "criticality": "low" | "medium" | "high"
      }`;

      const response = await api.ai.geminiChat(
        [{ role: 'user', text: prompt }],
        "You are an expert medical diagnostic AI focus on precision and safety.",
        "gemini-1.5-flash",
        0.2
      );

      // Extract JSON from response
      const jsonStr = response.text.match(/\{[\s\S]*\}/)?.[0];
      if (jsonStr) {
        setAnalysis(JSON.parse(jsonStr));
      } else {
        throw new Error("Invalid neural response format");
      }
    } catch (err) {
      console.error("Anomaly analysis failed:", err);
      setError("Neural link synchronization failed. System falling back to heuristic diagnostics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (healthStatus?.overall === 'critical' || healthStatus?.overall === 'warning') {
      performAnalysis();
    }
  }, [healthStatus?.overall]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm overflow-hidden relative">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Safety Diagnostic Matrix</h4>
          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Anomaly Detection</h3>
        </div>
        <button 
          onClick={performAnalysis}
          disabled={loading || !vitals}
          className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
              <Brain size={20} className="absolute inset-0 m-auto text-blue-600 animate-pulse" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scanning physiological waves...</p>
          </motion.div>
        ) : analysis ? (
          <motion.div 
            key="analysis"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Criticality Indicator */}
            <div className={`p-4 rounded-2xl border flex items-center gap-4 ${
              analysis.criticality === 'high' ? 'bg-rose-50 border-rose-100 text-rose-700' :
              analysis.criticality === 'medium' ? 'bg-amber-50 border-amber-100 text-amber-700' :
              'bg-emerald-50 border-emerald-100 text-emerald-700'
            }`}>
              {analysis.criticality === 'high' ? <ShieldAlert size={24} /> : 
               analysis.criticality === 'medium' ? <AlertCircle size={24} /> : 
               <CheckCircle2 size={24} />}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70 leading-none mb-1">Threat Level</p>
                <p className="text-sm font-black uppercase tracking-tight">{analysis.criticality} Criticality</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" /> Detected Anomalies
                </h5>
                <ul className="space-y-2">
                  {analysis.anomalies.map((a, i) => (
                    <li key={i} className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-start gap-2">
                      <ChevronRight size={14} className="text-blue-500 mt-0.5 shrink-0" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600" /> Potential Risks
                </h5>
                <ul className="space-y-2">
                  {analysis.risks.map((r, i) => (
                    <li key={i} className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-start gap-2">
                      <AlertCircle size={14} className="text-rose-500 mt-0.5 shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50 dark:border-slate-800">
              <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                <Sparkles size={14} className="text-blue-500" /> Immediate Clinical Protocols
              </h5>
              <div className="grid grid-cols-1 gap-2">
                {analysis.recommendations.map((rec, i) => (
                  <div key={i} className="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center gap-3 group hover:border-blue-200 transition-all">
                    <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 text-[10px] font-black">
                      {i + 1}
                    </div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            {analysis.criticality === 'high' && (
              <div className="flex gap-3 pt-4">
                <button className="flex-1 py-4 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-rose-200 dark:shadow-none hover:bg-rose-700 transition-all">
                  <PhoneCall size={14} />
                  Emergency Link
                </button>
                <button className="flex-1 py-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3">
                  <MessageSquare size={14} />
                  Alert Specialist
                </button>
              </div>
            )}
          </motion.div>
        ) : !vitals ? (
          <div className="flex flex-col items-center justify-center py-12 text-center opacity-50">
            <Loader2 className="animate-spin text-slate-300 mb-4" size={32} />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Waiting for physiological link...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center">
              <CheckCircle2 size={40} className="text-slate-300" />
            </div>
            <div className="max-w-xs">
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-4">No critical anomalies detected in the current data packet. System coherent.</p>
              <button 
                onClick={performAnalysis}
                className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] hover:underline"
              >
                Perform Deep Diagnostic
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
