import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dna, 
  Activity, 
  Zap, 
  Heart, 
  Scale, 
  Clock, 
  ShieldCheck, 
  ChevronRight,
  TrendingUp,
  Target,
  FlaskConical,
  Award,
  Settings,
  X,
  Plus,
  Play,
  Info
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export const VitalityMatrix: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [longevityScore, setLongevityScore] = useState(89);
  const [metabolicAge, setMetabolicAge] = useState(24);
  const [actualAge, setActualAge] = useState(32);
  const [showProtocols, setShowProtocols] = useState(false);
  const [viewMode, setViewMode] = useState<'real-time' | 'predictive'>('real-time');
  const [predictionParams, setPredictionParams] = useState({
    timeframe: 90,
    intensity: 'optimal' as 'conservative' | 'optimal' | 'aggressive',
    dataWeight: 'blended' as 'historical' | 'blended' | 'recent'
  });

  const predictiveData = [
    { day: 'Day 0', metabolic: 82, regeneration: 78 },
    { day: 'Day 15', metabolic: 84, regeneration: 81 },
    { day: 'Day 30', metabolic: 87, regeneration: 85 },
    { day: 'Day 45', metabolic: 89, regeneration: 88 },
    { day: 'Day 60', metabolic: 92, regeneration: 91 },
    { day: 'Day 75', metabolic: 93, regeneration: 94 },
    { day: 'Day 90', metabolic: 95, regeneration: 97 },
  ];
  
  // Rituals state
  const [rituals, setRituals] = useState([
    { label: 'Cold Exposure', time: 720, total: 900, active: true }, // in seconds
    { label: 'Red Light Therapy', time: 0, total: 600, active: false },
    { label: 'Fasting Window', time: 15120, total: 57600, active: true }, // 16h = 57600s
  ]);

  const hrvHistory = [
    { day: 'Mon', value: 65, type: 'actual' },
    { day: 'Tue', value: 68, type: 'actual' },
    { day: 'Wed', value: 72, type: 'actual' },
    { day: 'Thu', value: 70, type: 'actual' },
    { day: 'Fri', value: 75, type: 'actual' },
    { day: 'Sat', value: 71, type: 'actual' },
    { day: 'Sun', value: 72, type: 'actual' },
    ...(viewMode === 'predictive' ? [
      { day: 'Mon*', value: 74, type: 'predicted' },
      { day: 'Tue*', value: 76, type: 'predicted' },
      { day: 'Wed*', value: 78, type: 'predicted' },
    ] : [])
  ];

  const metrics = [
    { label: 'VO2 MAX', value: viewMode === 'predictive' ? '56.8' : '54.2', unit: 'ml/kg/min', icon: <Activity />, color: 'text-blue-500', trend: viewMode === 'predictive' ? '+2.6' : '+4.2%' },
    { label: 'RHR', value: viewMode === 'predictive' ? '54' : '58', unit: 'bpm', icon: <Heart />, color: 'text-rose-500', trend: viewMode === 'predictive' ? '-4' : '-2 bpm' },
    { label: 'G-FLUX', value: viewMode === 'predictive' ? '1.6' : '1.4', unit: 'ratio', icon: <Scale />, color: 'text-purple-500', trend: viewMode === 'predictive' ? '+0.2' : 'Stable' },
    { label: 'HRV', value: viewMode === 'predictive' ? '78' : '72', unit: 'ms', icon: <Zap />, color: 'text-amber-500', trend: viewMode === 'predictive' ? '+6ms' : '+8ms' },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    const interval = setInterval(() => {
      setRituals(prev => prev.map(r => {
        if (r.active && r.time > 0) {
          return { ...r, time: r.time - 1 };
        }
        return r;
      }));
    }, 1000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const formatTime = (seconds: number) => {
    if (seconds === 0) return 'Completed';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleRitual = (index: number) => {
    setRituals(prev => prev.map((r, i) => i === index ? { ...r, active: !r.active } : r));
  };

  const hrvData = [65, 68, 72, 70, 75, 71, 72]; // Last 7 days

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 min-h-screen flex flex-col items-center justify-center space-y-8 animate-pulse">
        <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/20 rounded-[2rem] flex items-center justify-center">
          <Dna className="text-emerald-500 animate-spin-slow" size={48} />
        </div>
        <div className="space-y-4 text-center">
          <div className="h-10 w-64 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto" />
          <div className="h-4 w-48 bg-slate-50 dark:bg-slate-900 rounded-full mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-4xl mt-12">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-white dark:bg-slate-950 min-h-screen font-sans">
      <header className="mb-20 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-3 bg-slate-50 dark:bg-slate-900 px-6 py-2 rounded-full border border-slate-100 dark:border-slate-800 mb-8"
        >
          <Dna size={18} className="text-emerald-500" />
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Personalized longevity analytics</span>
        </motion.div>
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-6 drop-shadow-sm">
          VITALITY<span className="text-emerald-500">MATRIX</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 font-medium max-w-2xl mx-auto font-serif">
          "The science of longevity integrated with real-time performance tracking for a superior health outcome."
        </p>

        <div className="mt-12 flex items-center justify-center">
          <div className="bg-slate-100 dark:bg-slate-900 p-1.5 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex gap-2">
            <button
              onClick={() => setViewMode('real-time')}
              className={`px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                viewMode === 'real-time' 
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xl shadow-slate-200/50 dark:shadow-black/20' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              Real-time
            </button>
            <button
              onClick={() => setViewMode('predictive')}
              className={`px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${
                viewMode === 'predictive' 
                  ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/30' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <Zap size={14} className={viewMode === 'predictive' ? 'animate-pulse' : ''} />
              AI Predictive
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
        <div className="lg:col-span-2 space-y-12">
          {/* Top Row Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Main Longevity Card */}
            <div className="col-span-1 md:col-span-2 bg-slate-50 dark:bg-slate-900 rounded-[3rem] p-12 border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
              <div className="absolute bottom-0 right-0 p-12 opacity-5 scale-150 group-hover:scale-[1.6] transition-transform duration-700 pointer-events-none">
                <FlaskConical size={200} />
              </div>
              
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row justify-between gap-12">
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">
                        {viewMode === 'predictive' ? 'Projected Integrity' : 'Biological Integrity'}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 font-bold max-w-xs leading-relaxed">
                        {viewMode === 'predictive' 
                          ? 'Based on your current trajectory, you are projected to reach the 98th percentile within 12 weeks.'
                          : 'Your cellular health is performing in the 94th percentile for your demographic.'}
                      </p>
                    </div>
                    
                    <div className="flex gap-12">
                      <div className="cursor-pointer group" onClick={() => setMetabolicAge(prev => prev > 20 ? prev - 1 : 25)}>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-hover:text-emerald-500 transition-colors">
                          {viewMode === 'predictive' ? 'Projected Metabolic Age' : 'Metabolic Age'}
                        </p>
                        <p className="text-4xl font-black text-emerald-500">
                          {viewMode === 'predictive' ? metabolicAge - 2 : metabolicAge}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Actual Age</p>
                        <p className="text-4xl font-black text-slate-900 dark:text-white">{actualAge}</p>
                      </div>
                    </div>
                  </div>

                  <div 
                    className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl shadow-emerald-100 dark:shadow-emerald-950/20 border border-emerald-50 dark:border-emerald-900/10 cursor-help"
                    onClick={() => setLongevityScore(prev => prev > 98 ? 80 : prev + 1)}
                  >
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100 dark:text-slate-700" />
                        <motion.circle 
                          cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" 
                          strokeDasharray={351} 
                          initial={{ strokeDashoffset: 351 }}
                          animate={{ strokeDashoffset: 351 - (351 * longevityScore) / 100 }} 
                          className="text-emerald-500" 
                          strokeLinecap="round" 
                        />
                      </svg>
                      <span className="absolute text-2xl font-black text-slate-900 dark:text-white">{longevityScore}%</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-6">Longevity Index</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Metabolic Efficiency - NEW */}
            <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
               <div className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-10">
                     <FlaskConical size={60} />
                  </div>
                  <h4 className="text-lg font-black uppercase tracking-tight mb-6">
                    {viewMode === 'predictive' ? 'Projected Autophagy' : 'Autophagy Progress'}
                  </h4>
                  <div className="flex items-end gap-6 mb-8 text-center">
                     <div className="flex-1">
                        <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Cellular Cleanup</p>
                        <p className="text-3xl font-black text-emerald-500">
                          {viewMode === 'predictive' ? 'Optimized' : 'Active'}
                        </p>
                     </div>
                     <div className="flex-1 border-x border-white/10">
                        <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Target Fast</p>
                        <p className="text-3xl font-black">{viewMode === 'predictive' ? '18h' : '15h'}</p>
                     </div>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                     <div 
                       className="bg-emerald-500 h-full rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-1000" 
                       style={{ width: viewMode === 'predictive' ? '95%' : '82%' }}
                     />
                  </div>
               </div>

               <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        {viewMode === 'predictive' ? 'Future Glucose Path' : 'Glucose Stability'}
                      </h4>
                      <div className={`w-2 h-2 rounded-full animate-pulse ${viewMode === 'predictive' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 leading-relaxed italic">
                      {viewMode === 'predictive' 
                        ? 'Projected stability index based on ritual adherence.'
                        : 'Optimal glycemic control detected. 24h peak: 112 mg/dL.'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                     <div className="flex gap-1 items-end h-8">
                        {[16, 24, 12, 18, 30, 22, 14, 10, 8, 12].map((h, i) => (
                           <div key={i} className={`w-2 rounded-full transition-all duration-500 ${i > 6 ? 'bg-emerald-100 dark:bg-emerald-900/40 opacity-50' : 'bg-blue-100 dark:bg-blue-900/40'}`} style={{ height: h, display: i > 6 && viewMode !== 'predictive' ? 'none' : 'block' }} />
                        ))}
                     </div>
                     <span className={`text-2xl font-black tracking-tighter ${viewMode === 'predictive' ? 'text-emerald-600' : 'text-blue-600'}`}>
                        {viewMode === 'predictive' ? '99.9%' : '99.8%'}
                     </span>
                  </div>
               </div>
            </div>

            {metrics.map((metric, i) => (
              <motion.div 
                key={i} 
                whileHover={{ scale: 1.05 }}
                className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div className={`p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 ${metric.color}`}>
                      {metric.icon}
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp size={14} className="text-emerald-500" />
                      <span className="text-xs font-black text-emerald-500">{metric.trend}</span>
                    </div>
                  </div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{metric.label}</h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">{metric.value}</span>
                    <span className="text-xs font-bold text-slate-400">{metric.unit}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Dedicated HRV Analysis Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <Zap className="text-amber-500" size={24} />
                  {viewMode === 'predictive' ? 'Bio-AI Predictive Trajectory' : 'HRV Bio-Analytic History'}
                </h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  {viewMode === 'predictive' ? 'Projected Parasympathetic Dominance' : 'Autonomic Nervous System Balace (7-Day Trace)'}
                </p>
              </div>
              <div className="flex gap-4">
                {viewMode === 'predictive' && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Predictive mode active</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${viewMode === 'predictive' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span className="text-[10px] font-black text-slate-400 uppercase">Recovery</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg cursor-pointer">
                  <Info size={16} className="text-slate-400" />
                </div>
              </div>
            </div>

            <div className="h-80 w-full pr-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hrvHistory}>
                  <defs>
                    <linearGradient id="hrvGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} 
                    dy={10}
                  />
                  <YAxis 
                    hide 
                    domain={['dataMin - 5', 'dataMax + 5']}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      backgroundColor: '#0f172a',
                      color: '#fff'
                    }}
                    itemStyle={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '10px' }}
                    labelStyle={{ fontWeight: 900, marginBottom: '4px', textTransform: 'uppercase', fontSize: '10px', opacity: 0.5 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke={viewMode === 'predictive' ? '#10b981' : '#f59e0b'} 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill={`url(#${viewMode === 'predictive' ? 'hrvPredictiveGradient' : 'hrvGradient'})`} 
                    animationDuration={2000}
                  />
                  {viewMode === 'predictive' && (
                    <defs>
                      <linearGradient id="hrvPredictiveGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-8 grid grid-cols-3 gap-6">
              {[
                { label: viewMode === 'predictive' ? 'Projected Avg' : 'Weekly Avg', value: viewMode === 'predictive' ? '76.2ms' : '70.4ms' },
                { label: viewMode === 'predictive' ? 'Future Peak' : 'Highest Peak', value: viewMode === 'predictive' ? '82ms' : '75ms' },
                { label: 'ANS State', value: 'Parasympathetic' }
              ].map((stat, i) => (
                <div key={i} className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white uppercase">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <section className="bg-slate-900 text-white rounded-[3rem] p-10 relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-emerald-400 mb-8">
                <ShieldCheck size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">Premium Bio-Hack</span>
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Longevity Rituals</h3>
              <p className="text-slate-400 text-sm font-bold mb-10 leading-relaxed">Optimizing your biological clock through specialized cold exposure and intermittent fasting protocols.</p>
              
              <div className="space-y-4 mb-10">
                {rituals.map((task, i) => (
                  <motion.div 
                    key={i} 
                    layout
                    onClick={() => toggleRitual(i)}
                    className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${task.active ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-white/5 bg-white/5 opacity-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${task.active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                      <span className="text-sm font-black">{task.label}</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{formatTime(task.time)}</span>
                  </motion.div>
                ))}
              </div>

              <button 
                onClick={() => setShowProtocols(true)}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
              >
                Configure Protocols
              </button>
            </div>
          </section>

          <section className="bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800">
            <h4 className="text-lg font-black text-slate-900 dark:text-white mb-8 flex items-center justify-between uppercase tracking-tight">
              {viewMode === 'predictive' ? 'AI Projected Targets' : 'Performance Targets'}
              <Target size={20} className={viewMode === 'predictive' ? 'text-emerald-500' : 'text-slate-400'} />
            </h4>
            <div className="space-y-6">
              {[
                { label: 'Cellular Recovery', progress: viewMode === 'predictive' ? 94 : 85 },
                { label: 'Hormonal Balance', progress: viewMode === 'predictive' ? 78 : 62 },
                { label: 'Liver Detoxification', progress: viewMode === 'predictive' ? 55 : 41 },
              ].map((target, i) => (
                <div key={i} className="cursor-help group">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-emerald-500 transition-colors">
                      {target.label}
                    </span>
                    <span className="text-xs font-black text-slate-400 tracking-tight">
                      {target.progress}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      key={`${viewMode}-${i}`}
                      initial={{ width: 0 }} 
                      animate={{ width: `${target.progress}%` }} 
                      transition={{ duration: 1.5, ease: "easeOut" }} 
                      className={`h-full rounded-full ${viewMode === 'predictive' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-blue-500'}`} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-8 rounded-[2.5rem] flex items-center justify-between group cursor-pointer hover:shadow-lg transition-all">
            <div className="flex items-center gap-4">
              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm">
                <Award size={24} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-white">Elite Benchmarking</p>
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Compare with Top 1%</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-emerald-500 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* --- Predictive Bio-Markers Section --- */}
      <section className="mt-16 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500"></div>
        <div className="p-8 sm:p-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-600/10 p-2 rounded-xl text-blue-600">
                  <TrendingUp size={20} />
                </div>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">AI Intelligence Unit</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-4">
                Predictive <span className="text-blue-600 font-serif italic normal-case lowercase animate-pulse">Bio-Markers</span>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                Using deep learning on your historical vitals and current performance trends to forecast cellular aging and metabolic optimization milestones.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 bg-slate-50 dark:bg-slate-950 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Timeframe (Days)</label>
                <div className="flex gap-2">
                  {[30, 90, 180].map(d => (
                    <button 
                      key={d}
                      onClick={() => setPredictionParams(p => ({ ...p, timeframe: d }))}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${predictionParams.timeframe === d ? 'bg-blue-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-100 dark:border-slate-700 hover:text-slate-600'}`}
                    >
                      {d}d
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Intensity</label>
                <div className="flex gap-2">
                  {['conservative', 'optimal', 'aggressive'].map(i => (
                    <button 
                      key={i}
                      onClick={() => setPredictionParams(p => ({ ...p, intensity: i as any }))}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black capitalize transition-all ${predictionParams.intensity === i ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-100 dark:border-slate-700 hover:text-slate-600'}`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
            <div className="xl:col-span-8 bg-slate-50 dark:bg-slate-950/50 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800/50">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                  <Activity size={16} className="text-blue-600" />
                  Forecast Model Alpha
                </h3>
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-600" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Metabolic</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Regenerative</span>
                   </div>
                </div>
              </div>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={predictiveData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="metabolicGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="regenGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0f172a', 
                        border: 'none', 
                        borderRadius: '1rem', 
                        padding: '1rem',
                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                      }}
                      itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="metabolic" 
                      stroke="#2563eb" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#metabolicGradient)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="regeneration" 
                      stroke="#10b981" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#regenGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="xl:col-span-4 space-y-6">
              <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 border border-white/5 flex flex-col justify-between min-h-[190px]">
                <div>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Metabolic Peak Reach</p>
                   <h4 className="text-3xl font-black tracking-tight">{predictionParams.timeframe} Days</h4>
                </div>
                <div className="flex items-center gap-3 text-emerald-400">
                   <Zap size={18} />
                   <p className="text-xs font-bold leading-tight">Optimizing calorie partitioning for muscle protein synthesis.</p>
                </div>
              </div>

              <div className="bg-emerald-500 text-white rounded-[2.5rem] p-8 flex flex-col justify-between min-h-[190px]">
                <div>
                   <p className="text-[10px] font-black text-emerald-100 uppercase tracking-widest mb-2">Cellular Age Delta</p>
                   <h4 className="text-3xl font-black tracking-tight">-2.4 Years</h4>
                </div>
                <div className="flex items-center gap-3 text-white">
                   <Clock size={18} />
                   <p className="text-xs font-bold leading-tight">Telomere length stabilization forecasted at Day 45.</p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">AI Confidence</h4>
                <div className="flex items-end gap-3 mb-4">
                  <span className="text-4xl font-black text-slate-900 dark:text-white leading-none">94%</span>
                  <span className="text-emerald-500 text-xs font-black mb-1 flex items-center gap-1">
                    <TrendingUp size={14} /> +2%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '94%' }}
                    className="h-full bg-blue-600 rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {showProtocols && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl relative"
            >
              <button 
                onClick={() => setShowProtocols(false)}
                className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white z-10"
              >
                <X size={28} />
              </button>

              <div className="p-12">
                <div className="flex items-center gap-4 mb-2">
                  <Settings size={32} className="text-emerald-500" />
                  <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Protocol Configuration</h2>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-bold mb-12 uppercase tracking-widest text-[10px]">Customize your biological enhancement schedule</p>

                <div className="space-y-6">
                  {[
                    { name: 'Cold Exposure', interval: 'Daily', intensity: 'Advanced (2°C)', icon: <Zap size={18} /> },
                    { name: 'Red Light Therapy', interval: '3x Weekly', intensity: 'Standard', icon: <Scale size={18} /> },
                    { name: 'Fast Autophagy', interval: '16/8 Window', intensity: 'Intermittent', icon: <Heart size={18} /> },
                    { name: 'Hyperbaric Oxygen', interval: 'Monthly', intensity: 'Clinical', icon: <Activity size={18} /> },
                  ].map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700/50 group hover:border-emerald-500/50 transition-all cursor-pointer">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm">
                          {p.icon}
                        </div>
                        <div>
                          <p className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{p.name}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{p.interval} • {p.intensity}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-slate-300 hover:text-emerald-500 transition-colors">
                          <Play size={20} fill="currentColor" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-12 flex gap-4">
                  <button className="flex-1 bg-slate-900 dark:bg-white dark:text-slate-900 py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all text-white">
                    Save Changes
                  </button>
                  <button className="px-8 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <Plus size={24} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
