import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dna, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Map as MapIcon, 
  Activity,
  ArrowRight,
  Info,
  Thermometer,
  Wind,
  Plus,
  Trash2,
  Brain,
  Heart,
  Stethoscope as StethoscopeIcon,
  ShieldCheck,
  Zap,
  ChevronRight,
  Clock,
  History,
  RefreshCw
} from 'lucide-react';

interface Symptom {
  id: string;
  region: string;
  name: string;
  severity: 'mild' | 'moderate' | 'acute';
  description: string;
  timestamp: string;
}

interface Region {
  id: string;
  name: string;
  pos: string;
  commonSymptoms: string[];
}

const regions: Region[] = [
  { 
    id: 'cranial', 
    name: 'Cranial / Cognis', 
    pos: 'top-[8%] left-1/2 -translate-x-1/2',
    commonSymptoms: ['Migraine', 'Dizziness', 'Cognitive Fog', 'Visual Distortion', 'Insomnia']
  },
  { 
    id: 'thoracic', 
    name: 'Thoracic / Cardiac', 
    pos: 'top-[22%] left-1/2 -translate-x-1/2',
    commonSymptoms: ['Chest Pressure', 'Palpitations', 'Shortness of Breath', 'Cough']
  },
  { 
    id: 'abdominal', 
    name: 'Abdominal / Digestive', 
    pos: 'top-[38%] left-1/2 -translate-x-1/2',
    commonSymptoms: ['Nausea', 'Acute Pain', 'Bloating', 'Indigestion']
  },
  { 
    id: 'back', 
    name: 'Dorsal / Spine', 
    pos: 'top-[28%] left-[42%]',
    commonSymptoms: ['Lumbar Pain', 'Stiffness', 'Sciatic Tension']
  },
  { 
    id: 'extremities-u', 
    name: 'Upper Extremities', 
    pos: 'top-[26%] left-[28%]',
    commonSymptoms: ['Joint Pain', 'Numbness', 'Tremors', 'Weakness']
  },
  { 
    id: 'extremities-l', 
    name: 'Lower Extremities', 
    pos: 'top-[65%] left-1/2 -translate-x-1/2',
    commonSymptoms: ['Knee Instability', 'Swelling', 'Cramps', 'Gait Impairment']
  },
];

export const SymptomChecker: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [activeSymptoms, setActiveSymptoms] = useState<Symptom[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    assessment: string;
    riskLevel: 'low' | 'elevated' | 'critical';
    confidence: number;
    recommendations: string[];
  } | null>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  const handleAddSymptom = (regionId: string, name: string = 'New Symptom') => {
    const newSymptom: Symptom = {
      id: Math.random().toString(36).substr(2, 9),
      region: regionId,
      name: name,
      severity: 'mild',
      description: '',
      timestamp: new Date().toISOString()
    };
    setActiveSymptoms(prev => [...prev, newSymptom]);
    setAnalysisResult(null);
  };

  const removeSymptom = (id: string) => {
    setActiveSymptoms(prev => prev.filter(s => s.id !== id));
    setAnalysisResult(null);
  };

  const updateSymptom = (id: string, updates: Partial<Symptom>) => {
    setActiveSymptoms(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const runAnalysis = () => {
    setIsAnalyzing(true);
    // Simulate complex cognitive processing
    setTimeout(() => {
      setAnalysisResult({
        assessment: "Cognis synthesis indicates a probable cluster of stress-induced metabolic disturbances. Synergistic patterns suggest localized inflammation in the selected regions linked to sympathetic nervous system overactivity.",
        riskLevel: activeSymptoms.some(s => s.severity === 'acute') ? 'elevated' : 'low',
        confidence: 89.4,
        recommendations: [
          "Initiate 15-minute focused respiratory recalibration (Box Breathing).",
          "Increase hydration to 3.2L for detoxification support.",
          "Limit digital blue-light exposure for next 4 hours.",
          "Scheduled clinical review if symptoms maintain status beyond 24h."
        ]
      });
      setIsAnalyzing(false);
    }, 3000);
  };

  const currentRegion = regions.find(r => r.id === selectedRegion);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 sm:py-20 flex flex-col items-center justify-center space-y-8 sm:space-y-12 animate-pulse text-center">
        <div className="relative">
          <div className="w-28 h-28 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            <Activity className="text-blue-600 animate-pulse" size={48} />
          </div>
          <div className="absolute inset-0 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-full animate-spin-slow" />
        </div>
        <div className="space-y-4 text-center">
          <div className="h-12 w-80 bg-slate-100 dark:bg-slate-900 rounded-full mx-auto" />
          <div className="h-4 w-64 bg-slate-50 dark:bg-slate-950 rounded-full mx-auto opacity-50" />
        </div>
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className="h-[500px] bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border border-slate-100 dark:border-slate-800" />
          <div className="h-[500px] bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto py-10 sm:py-20 lg:py-24">
      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8 mb-10 sm:mb-16 border-b border-slate-100 dark:border-slate-800 pb-8 sm:pb-12">
        <div className="max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-800 mb-6"
          >
            <Activity size={12} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Bio-Feedback Loop Active</span>
          </motion.div>
          
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-[1000] text-slate-900 dark:text-white tracking-[-0.05em] uppercase leading-none">
            Symptom <span className="text-blue-600">Mapper</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold mt-4 text-lg md:text-xl leading-relaxed">
            Cognis pre-assessment through precise biological localization. 
            Map your anomalies for AI-driven clinical synthesis.
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-2xl shadow-slate-200/50 dark:shadow-slate-950/50 flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
              <History size={18} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Session</p>
              <p className="text-sm font-black text-slate-900 dark:text-white uppercase">Live Debug</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        
        {/* Visual Biological Schematic (Left Column) */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-8">
          <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-[3rem] p-8 sm:p-12 border border-slate-100 dark:border-slate-800 relative min-h-[600px] overflow-hidden flex flex-col items-center">
            
            {/* HUD Elements */}
            <div className="absolute top-8 left-8">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Spatial Mapper L4</span>
            </div>
            
            {/* Body Silhouette Container */}
            <div className="relative w-full h-full max-w-[320px] aspect-[1/2] flex items-center justify-center mt-8">
              <div className="absolute inset-0 bg-slate-200/50 dark:bg-slate-800/30 rounded-[30%_30%_15%_15%] border-2 border-slate-200 dark:border-slate-700 opacity-40 blur-sm pointer-events-none" />
              <div className="relative w-full h-full bg-slate-100 dark:bg-slate-800/40 rounded-[25%_25%_10%_10%] border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                
                {/* Glow effects on hover */}
                <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                {/* Interactive Nodes */}
                {regions.map((reg) => {
                  const isActive = selectedRegion === reg.id;
                  const hasSymptoms = activeSymptoms.some(s => s.region === reg.id);
                  
                  return (
                    <motion.button
                      key={reg.id}
                      onClick={() => setSelectedRegion(reg.id)}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.95 }}
                      className={`absolute ${reg.pos} z-20 group/node`}
                    >
                      <div className={`relative w-8 h-8 flex items-center justify-center transition-all duration-500`}>
                        {/* Orbit Circles */}
                        <div className={`absolute inset-0 border rounded-full transition-all duration-700 ${
                          isActive ? 'scale-150 border-blue-500/50 opacity-100 rotate-45' : 'scale-0 opacity-0'
                        }`} />
                        <div className={`absolute inset-0 border rounded-full transition-all duration-700 delay-75 ${
                          isActive ? 'scale-125 border-emerald-500/50 opacity-100 -rotate-12' : 'scale-0 opacity-0'
                        }`} />
                        
                        {/* Center Point */}
                        <div className={`relative w-3 h-3 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all duration-300 ${
                          isActive ? 'bg-blue-600 scale-125' : 
                          hasSymptoms ? 'bg-rose-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600 hover:bg-blue-400'
                        }`} />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Region Detail Overlay */}
            <AnimatePresence mode="wait">
              {selectedRegion && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  className="absolute bottom-8 inset-x-8 bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-2xl z-40"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Focus Point</span>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
                        {currentRegion?.name}
                      </h3>
                    </div>
                    <button onClick={() => setSelectedRegion(null)} className="text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                      <Plus className="rotate-45" size={20} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[9px] font-black uppercase text-slate-400 mb-2">Common Anomalies</p>
                    <div className="flex flex-wrap gap-2">
                      {currentRegion?.commonSymptoms.map(s => (
                        <button 
                          key={s}
                          onClick={() => handleAddSymptom(selectedRegion!, s)}
                          className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900/50 hover:bg-blue-600 hover:text-white transition-all rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={() => handleAddSymptom(selectedRegion!)}
                      className="w-full mt-2 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-blue-500/20"
                    >
                      Custom Symptom
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Symptoms & Analysis (Right Column) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-8">
          
          {/* Active Symptoms List */}
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600">
                  <Activity size={24} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Current Reports</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase">{activeSymptoms.length} Anomalies</span>
              </div>
            </div>

            {activeSymptoms.length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem]">
                <div className="bg-slate-50 dark:bg-slate-800/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck size={32} className="text-emerald-500" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">No Active Reports</h3>
                <p className="text-slate-400 font-bold max-w-xs mx-auto text-sm">Select a biological region on the map to begin synchronization.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeSymptoms.map((sym) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      key={sym.id}
                      className="group bg-slate-50 dark:bg-slate-800/40 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700/50 hover:border-blue-500/30 transition-all flex flex-col"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                             <span className="text-[9px] font-black uppercase text-blue-500 tracking-widest">
                                {regions.find(r => r.id === sym.region)?.name}
                             </span>
                          </div>
                          <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">{sym.name}</h4>
                        </div>
                        <button 
                          onClick={() => removeSymptom(sym.id)}
                          className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-slate-300 hover:text-rose-500 transition-colors shadow-sm"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div className="flex gap-2">
                          {(['mild', 'moderate', 'acute'] as const).map(sev => (
                            <button
                              key={sev}
                              onClick={() => updateSymptom(sym.id, { severity: sev })}
                              className={`flex-1 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${
                                sym.severity === sev 
                                  ? sev === 'acute' ? 'bg-rose-600 text-white shadow-lg' : 
                                    sev === 'moderate' ? 'bg-amber-500 text-white shadow-lg' :
                                    'bg-blue-600 text-white shadow-lg'
                                  : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800'
                              }`}
                            >
                              {sev}
                            </button>
                          ))}
                        </div>
                        <textarea 
                          placeholder="Describe metabolic sensation..."
                          value={sym.description}
                          onChange={(e) => updateSymptom(sym.id, { description: e.target.value })}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-300 focus:outline-none focus:border-blue-500 transition-all resize-none h-24"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="pt-8 border-t border-slate-100 dark:border-slate-800 mt-8 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <Clock size={16} className="text-slate-400" />
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analysis Ready • Matrix Synced</span>
                  </div>
                  <button 
                    onClick={runAnalysis}
                    disabled={isAnalyzing || activeSymptoms.length === 0}
                    className="group relative px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-[1.05] active:scale-95 transition-all overflow-hidden disabled:opacity-50"
                  >
                    <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-10 transition-opacity" />
                    <div className="flex items-center gap-3 relative z-10">
                      {isAnalyzing ? (
                        <>
                          <RefreshCw className="animate-spin" size={16} />
                          Synthesizing...
                        </>
                      ) : (
                        <>
                          <Brain size={16} />
                          Request AI Synthesis
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Analysis Results Display */}
          <AnimatePresence>
            {analysisResult && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                className="space-y-8"
              >
                {/* Result Header Card */}
                <div className={`rounded-[3rem] p-10 border shadow-2xl relative overflow-hidden ${
                  analysisResult.riskLevel === 'critical' ? 'bg-rose-600 border-rose-500' :
                  analysisResult.riskLevel === 'elevated' ? 'bg-amber-500 border-amber-400 text-slate-900' :
                  'bg-blue-600 border-blue-500 text-white'
                }`}>
                  <div className="absolute -top-8 -right-8 p-12 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                    <Dna size={200} />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                       <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-xl">
                        <Zap size={24} />
                       </div>
                       <div>
                         <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70 mb-1 block">Clinical Engine Result</span>
                         <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">Intelligence Synthesis</h3>
                       </div>
                    </div>
                    
                    <p className={`text-xl md:text-2xl font-bold leading-relaxed font-serif max-w-4xl mb-10 ${
                      analysisResult.riskLevel === 'elevated' ? 'text-slate-900' : 'text-white'
                    }`}>
                      "{analysisResult.assessment}"
                    </p>

                    <div className="flex flex-wrap items-center gap-8 pt-8 border-t border-white/20">
                      <div>
                        <p className="text-[10px] font-black uppercase opacity-60 mb-2 tracking-widest">Confidence Index</p>
                        <div className="flex items-baseline gap-2">
                           <span className="text-3xl font-black tracking-tighter">{analysisResult.confidence}</span>
                           <span className="text-sm font-black">%</span>
                        </div>
                      </div>
                      <div className="h-10 w-px bg-white/10 hidden md:block" />
                      <div>
                        <p className="text-[10px] font-black uppercase opacity-60 mb-2 tracking-widest">Audit UUID</p>
                        <p className="font-mono text-[10px] font-bold tracking-tight opacity-80 uppercase">
                          SYN-{Math.random().toString(36).substr(2, 9).toUpperCase()}
                        </p>
                      </div>
                      <div className={`ml-auto px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/20 ${
                        analysisResult.riskLevel === 'elevated' ? 'bg-slate-900/10' : 'bg-white/10'
                      }`}>
                         Risk Status: {analysisResult.riskLevel}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {analysisResult.recommendations.map((rec, i) => (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      key={i}
                      className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-start gap-6 group hover:shadow-xl hover:-translate-y-1 transition-all"
                    >
                      <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        {i === 0 ? <Wind size={20} /> : i === 1 ? <Activity size={20} /> : i === 2 ? <Zap size={20} /> : <StethoscopeIcon size={20} />}
                      </div>
                      <div className="flex-1">
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Protocol 0{i+1}</span>
                         <p className="text-slate-900 dark:text-white font-bold leading-relaxed">{rec}</p>
                      </div>
                      <ChevronRight size={16} className="text-slate-300 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                  ))}
                </div>

                {/* Disclaimer / System Note */}
                <div className="p-8 bg-slate-50 dark:bg-slate-800/30 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex items-start gap-4">
                  <Info size={16} className="text-slate-400 mt-1" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed tracking-wide">
                    The Doctorian AI synthesis is a pre-clinical synchronization tool and should not be substituted for expert human clinical diagnostics. 
                    If metabolic drift exceeds safe baseline, contact specialized cognitive assistance immediately.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SymptomChecker;
