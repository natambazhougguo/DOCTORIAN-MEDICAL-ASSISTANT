import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  Brain, 
  Timer, 
  Activity, 
  Smile, 
  Zap, 
  Moon, 
  Eye, 
  Settings,
  ChevronRight,
  TrendingUp,
  Wind,
  Focus,
  Play,
  CheckCircle2,
  Lock,
  ArrowRight,
  Info,
  X,
  PlusCircle,
  Heart,
  BarChart2,
  Calendar,
  Bot,
  LayoutGrid
} from 'lucide-react';

export const CognisHub: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [focusScore, setFocusScore] = useState(78);
  const [isMeditating, setIsMeditating] = useState(false);
  const [timer, setTimer] = useState(300); // 5 minutes standard
  const [customDuration, setCustomDuration] = useState(5);
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'analysis'>('overview');
  const [showTrainingLab, setShowTrainingLab] = useState(false);
  const [trainingStep, setTrainingStep] = useState(0);
  const [testScore, setTestScore] = useState<number | null>(null);

  // Simulated metrics state
  const [metrics, setMetrics] = useState([
    { label: 'Attention Span', value: '45m', unit: 'avg', icon: <Eye className="text-blue-500" />, trend: '+12%', valNum: 45 },
    { label: 'Reactivity', value: '180ms', unit: 'low', icon: <Zap className="text-amber-500" />, trend: '-5ms', valNum: 180 },
    { label: 'Mood Index', value: 'Balanced', unit: '', icon: <Smile className="text-emerald-500" />, trend: 'Stable', valNum: 0 },
    { label: 'Sleep Depth', value: '82%', unit: 'high', icon: <Moon className="text-indigo-500" />, trend: '+4%', valNum: 82 },
  ]);

  const playSound = useCallback((type: 'start' | 'end') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      if (type === 'start') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
        oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.5);
      } else {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.5);
      }

      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (err) {
      console.warn("Audio Context not supported or interaction required", err);
    }
  }, []);

  useEffect(() => {
    const loadingTimer = setTimeout(() => setIsLoading(false), 2000);
    let interval: any;
    if (isMeditating && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
        // Simulate fluctuating focus during meditation
        if (timer % 10 === 0) {
          setFocusScore(prev => Math.min(100, Math.max(0, prev + (Math.random() > 0.5 ? 1 : -1))));
        }
      }, 1000);
    } else if (timer === 0 && isMeditating) {
      setIsMeditating(false);
      setFocusScore(prev => Math.min(100, prev + 5)); // Reward focus after session
      playSound('end');
    }
    return () => {
      clearInterval(interval);
      clearTimeout(loadingTimer);
    };
  }, [isMeditating, timer, playSound]);

  const handleStartMeditation = () => {
    if (isMeditating) {
      setIsMeditating(false);
    } else {
      setTimer(customDuration * 60);
      setIsMeditating(true);
      playSound('start');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startTraining = () => {
    setShowTrainingLab(true);
    setTrainingStep(1);
  };

  const conductCognisTest = () => {
    setTrainingStep(2);
    setTimeout(() => {
      const score = Math.floor(Math.random() * 40) + 60; // 60-100
      setTestScore(score);
      setFocusScore(score);
      setTrainingStep(3);
    }, 2000);
  };

  const analysisData = useMemo(() => [
    { day: 'Mon', focus: 78, reactivity: 195, duration: 42 },
    { day: 'Tue', focus: 85, reactivity: 185, duration: 55 },
    { day: 'Wed', focus: 72, reactivity: 190, duration: 38 },
    { day: 'Thu', focus: 92, reactivity: 175, duration: 65 },
    { day: 'Fri', focus: 88, reactivity: 180, duration: 60 },
    { day: 'Sat', focus: 95, reactivity: 170, duration: 75 },
    { day: 'Sun', focus: 82, reactivity: 182, duration: 50 },
  ], []);

  const stats = useMemo(() => ({
    avgFocusDuration: "52m",
    highestFocus: "95%",
    reactivityTrend: "-12.5%",
    totalSessions: 24,
    recoveryRate: "88%"
  }), []);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 min-h-screen flex flex-col items-center justify-center space-y-12 animate-pulse">
        <div className="relative">
          <div className="w-32 h-32 bg-purple-100 dark:bg-purple-900/20 rounded-[2.5rem] flex items-center justify-center">
            <Brain className="text-purple-600 animate-bounce" size={56} />
          </div>
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-4 border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-[3rem]"
          />
        </div>
        <div className="space-y-4 text-center">
          <div className="h-12 w-80 bg-slate-100 dark:bg-slate-900 rounded-full mx-auto" />
          <div className="h-4 w-64 bg-slate-50 dark:bg-slate-950 rounded-full mx-auto opacity-50" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mt-12">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-48 bg-white dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-600 p-2 rounded-xl text-white shadow-lg shadow-purple-200 dark:shadow-purple-900/20">
              <Brain size={24} />
            </div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Cognitive Intelligence</p>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
            COGNIS<span className="text-purple-600">HUB</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold mt-2">Optimizing mental clarity and neurological performance through AI data.</p>
        </motion.div>
        
        <div className="flex gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          {(['overview', 'sessions', 'analysis'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative z-10 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab 
                ? 'text-white' 
                : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute inset-0 bg-purple-600 rounded-xl -z-10 shadow-lg shadow-purple-200 dark:shadow-purple-900/20"
                />
              )}
            </button>
          ))}
        </div>
      </header>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Main Console */}
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 dark:bg-purple-900/20 rounded-full blur-3xl -mr-32 -mt-32 opacity-50 transition-opacity group-hover:opacity-80" />
                
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                  <div className="relative cursor-help shrink-0" onClick={() => setFocusScore(prev => prev > 95 ? 60 : prev + 5)}>
                    <svg className="w-40 h-40 md:w-48 md:h-48 transform -rotate-90" viewBox="0 0 192 192">
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        className="text-slate-100 dark:text-slate-800"
                      />
                      <motion.circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={552}
                        animate={{ strokeDashoffset: 552 - (552 * focusScore) / 100 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="text-purple-600"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white">{focusScore}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Focus Level</span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-6">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Today's Cognitive Load</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">
                        {focusScore > 80 
                          ? "Your cognitive activity is peaking. You are in a high-efficiency state." 
                          : "Moderate cognitive fatigue detected. Consider a Cognis Sync session."}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">State</p>
                        <p className={`text-lg font-black uppercase ${focusScore > 85 ? 'text-purple-600' : 'text-blue-500'}`}>
                          {focusScore > 85 ? 'Hyper-Focus' : focusScore > 70 ? 'Optimal' : 'Flowing'}
                        </p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Deep Work</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white">4h 12m</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mental Clarity Visualizer - NEW */}
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm overflow-hidden relative">
                <div className="flex items-center justify-between mb-8">
                   <div>
                      <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">Mental Clarity Analysis</h4>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Real-time synaptic coherence visualization</p>
                   </div>
                   <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-[10px] font-black text-slate-400 uppercase">Live Stream Active</span>
                   </div>
                </div>
                <div className="h-48 w-full flex items-end gap-1">
                   {[...Array(24)].map((_, i) => (
                      <motion.div 
                        key={i}
                        animate={{ height: [ 20 + Math.random() * 40 + '%', 40 + Math.random() * 60 + '%', 20 + Math.random() * 40 + '%' ] }}
                        transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }}
                        className={`flex-1 rounded-full ${i % 4 === 0 ? 'bg-purple-600' : 'bg-blue-500/20'} min-h-[4px]`}
                      />
                   ))}
                </div>
                <div className="mt-8 grid grid-cols-3 gap-6">
                   {[
                      { label: 'Alpha Coherence', value: '0.84', color: 'text-purple-600' },
                      { label: 'Beta Stability', value: '0.92', color: 'text-blue-600' },
                      { label: 'Gamma Response', value: 'Low', color: 'text-slate-400' }
                   ].map((item, i) => (
                      <div key={i} className="text-center">
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                         <p className={`text-xl font-black ${item.color}`}>{item.value}</p>
                      </div>
                   ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Meditation Instrument */}
                <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 p-6 opacity-20">
                    <Wind size={80} className={isMeditating ? "animate-spin-[10s] duration-[10s]" : "animate-pulse"} />
                  </div>
                  
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="mb-8">
                      <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em] mb-2">Meditation Protocol</h4>
                      <p className="text-2xl font-black uppercase tracking-tight">Cognis Sync Mode</p>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center my-4">
                      {!isMeditating && (
                        <div className="flex flex-wrap justify-center gap-2 mb-6">
                          {[1, 5, 10, 20].map((mins) => (
                            <button
                              key={mins}
                              onClick={() => {
                                setCustomDuration(mins);
                                setTimer(mins * 60);
                              }}
                              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                customDuration === mins 
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40' 
                                : 'bg-white/10 text-slate-400 hover:text-white'
                              }`}
                            >
                              {mins}m
                            </button>
                          ))}
                          <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-xl border border-white/10">
                            <input 
                              type="number" 
                              min="1" 
                              max="120"
                              value={customDuration}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 1;
                                setCustomDuration(val);
                                setTimer(val * 60);
                              }}
                              className="w-10 bg-transparent text-center text-xs font-black focus:outline-none"
                            />
                            <span className="text-[8px] font-black uppercase text-slate-500">custom</span>
                          </div>
                        </div>
                      )}
                      
                      <motion.div 
                        animate={isMeditating ? { scale: [1, 1.2, 1], filter: ["blur(0px)", "blur(2px)", "blur(0px)"] } : {}}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="text-6xl font-mono font-medium tracking-tighter"
                      >
                        {formatTime(timer)}
                      </motion.div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-4">
                        {isMeditating ? 'INHALE ... EXHALE' : 'Breath Synchronization'}
                      </p>
                    </div>

                    <button 
                      onClick={handleStartMeditation}
                      className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all ${
                        isMeditating 
                        ? 'bg-rose-600 text-white hover:bg-rose-700' 
                        : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-900/50'
                      }`}
                    >
                      {isMeditating ? 'Terminate Protocol' : 'Initiate Session'}
                    </button>
                  </div>
                </div>
  
                {/* Cognis-Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {metrics.map((metric, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ scale: 1.02, y: -5 }}
                      className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between cursor-pointer"
                    >
                      <div className="bg-slate-50 dark:bg-slate-800 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                        {metric.icon}
                      </div>
                      <div>
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{metric.label}</h5>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-black text-slate-900 dark:text-white">{metric.value}</span>
                          <span className="text-[10px] font-bold text-slate-400">{metric.unit}</span>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center gap-1">
                        <TrendingUp size={12} className="text-emerald-500" />
                        <span className="text-[10px] font-black text-emerald-500 uppercase">{metric.trend}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Intelligence */}
            <div className="lg:col-span-4 space-y-8">
              <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                <h4 className="text-lg font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight flex items-center gap-2">
                  <Focus className="text-purple-600" size={20} />
                  AI Insights
                </h4>
                <div className="space-y-4">
                  {[
                    "Cognis efficiency is up 15% during morning hours. Front-load your complex tasks before 11:00 AM.",
                    "High cortisol patterns detected around 4:00 PM. Schedule a guided breathing session.",
                    "Your 'Flow State' is most consistent on Tuesdays. Analyze environmental factors."
                  ].map((insight, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-l-4 border-purple-600 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-help"
                    >
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed italic">"{insight}"</p>
                    </motion.div>
                  ))}
                </div>
              </section>

              <section className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none" />
                <h4 className="text-lg font-black mb-4 uppercase tracking-tight">Focus Training</h4>
                <p className="text-sm text-purple-100 font-bold mb-6">Level up your cognitive endurance with AI-powered focus rituals.</p>
                <button 
                   onClick={startTraining}
                   className="w-full bg-white text-purple-600 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 group shadow-lg active:scale-95 transition-all text-[10px]"
                >
                  Open Training Lab
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </section>

              {/* Pulse & Rhythm Section */}
              <section className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 relative overflow-hidden group">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-rose-600 rounded-xl shadow-lg shadow-rose-200 dark:shadow-rose-900/20">
                    <Heart className="text-white animate-pulse" size={16} />
                  </div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Pulse & Rhythm</h4>
                </div>
                <div className="space-y-4">
                   <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Heart Variability</p>
                        <p className="text-3xl font-black text-slate-900 dark:text-white">72 <span className="text-[10px] text-slate-400">ms</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Resonant</p>
                      </div>
                   </div>
                   <div className="h-16 flex items-center justify-center gap-1">
                      {[...Array(12)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{ height: [8, 24, 8] }}
                          transition={{ repeat: Infinity, duration: 1.5 + Math.random(), delay: i * 0.1 }}
                          className={`w-1 rounded-full ${i % 3 === 0 ? 'bg-purple-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                        />
                      ))}
                   </div>
                </div>
              </section>

              <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex items-center justify-between group cursor-pointer hover:border-purple-600 transition-all">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                    <Settings size={20} className="text-slate-400 group-hover:rotate-90 transition-transform duration-500" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 dark:text-white">Cognis Settings</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Configure bio-sensors</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-slate-300" />
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'sessions' && (
          <motion.div 
            key="sessions"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              { title: 'Alpha Flow', duration: '15m', difficulty: 'Beginner', tags: ['Clarity', 'Focus'], color: 'bg-blue-500' },
              { title: 'Theta Core', duration: '20m', difficulty: 'Intermediate', tags: ['Creativity', 'Sleep'], color: 'bg-purple-500' },
              { title: 'Gamma Peak', duration: '30m', difficulty: 'Advanced', tags: ['Problem Solving'], color: 'bg-rose-500' },
              { title: 'Cognitive Reset', duration: '5m', difficulty: 'Easy', tags: ['Stress'], color: 'bg-emerald-500' },
            ].map((session, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between group cursor-pointer hover:shadow-xl transition-all">
                <div>
                  <div className={`w-12 h-12 rounded-2xl ${session.color} mb-6 flex items-center justify-center text-white shadow-lg`}>
                    <Play size={24} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">{session.title}</h3>
                  <div className="flex gap-2 mb-4">
                    {session.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-[10px] font-black uppercase text-slate-400">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-8">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">{session.duration}</span>
                  </div>
                  <button className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 group-hover:bg-purple-600 group-hover:text-white transition-all">
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            ))}
            <div className="bg-slate-100 dark:bg-slate-800 rounded-[2rem] border-2 border-dashed border-slate-300 dark:border-slate-700 p-6 flex flex-col items-center justify-center text-center group cursor-pointer">
              <PlusCircle className="text-slate-300 group-hover:text-purple-600 mb-4 transition-colors" size={40} />
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Create Custom Protocol</p>
            </div>
          </motion.div>
        )}

        {activeTab === 'analysis' && (
          <motion.div 
            key="analysis"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-8"
          >
            {/* Top Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Avg Focus Duration', value: stats.avgFocusDuration, icon: <Timer size={16} />, color: 'text-blue-500' },
                { label: 'Peak Focus Score', value: stats.highestFocus, icon: <Zap size={16} />, color: 'text-purple-500' },
                { label: 'Reactivity Shift', value: stats.reactivityTrend, icon: <TrendingUp size={16} />, color: 'text-emerald-500' },
                { label: 'Cognis Recovery', value: stats.recoveryRate, icon: <Activity size={16} />, color: 'text-rose-500' },
              ].map((s, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`${s.color} opacity-80`}>{s.icon}</div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</span>
                  </div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
              {/* Focus Performance History */}
              <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Cognis-Performance Stream</h3>
                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">7-Day focus and duration dynamics</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-purple-600" />
                       <span className="text-[10px] font-black text-slate-400 uppercase">Focus</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-blue-500" />
                       <span className="text-[10px] font-black text-slate-400 uppercase">Duration</span>
                    </div>
                  </div>
                </div>

                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analysisData}>
                      <defs>
                        <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorDuration" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="day" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                      />
                      <Tooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-slate-900 border border-slate-700 p-3 rounded-2xl shadow-2xl backdrop-blur-md">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{label}</p>
                                <div className="space-y-1.5">
                                  {payload.map((entry: any, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                      <span className="text-[11px] font-bold text-slate-300 uppercase tracking-tight">{entry.name}:</span>
                                      <span className="text-sm font-black text-white">{entry.value}{entry.name === 'focus' ? '%' : 'm'}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="focus" 
                        stroke="#9333ea" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorFocus)" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="duration" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        fillOpacity={1} 
                        fill="url(#colorDuration)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Reactivity Analysis */}
              <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                  <Activity size={120} className="text-white" />
                </div>
                
                <h3 className="text-lg font-black text-white uppercase tracking-tight mb-8">Cognis Speed</h3>
                
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analysisData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                      <XAxis 
                        dataKey="day" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 8, fontWeight: 900 }}
                      />
                      <Tooltip 
                        cursor={{ fill: 'rgba(51, 65, 85, 0.3)' }}
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl shadow-2xl">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
                                <div className="flex items-center gap-2">
                                  <div className="w-1 h-1 rounded-full bg-amber-500" />
                                  <span className="text-xs font-black text-white uppercase">{payload[0].value}ms Latency</span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar 
                        dataKey="reactivity" 
                        fill="#f59e0b" 
                        radius={[4, 4, 4, 4]} 
                        barSize={12}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={14} className="text-amber-500" />
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Reactivity Status</span>
                  </div>
                  <p className="text-xs font-bold text-slate-300">Your cognitive response time has decreased by an average of 15ms this week, indicating improved synaptic efficiency.</p>
                </div>
              </div>
            </div>

            {/* Bottom Insights */}
            <div className="grid md:grid-cols-2 gap-8">
               <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] flex items-center gap-6 shadow-sm group hover:border-purple-600 transition-all cursor-pointer">
                  <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-3xl flex items-center justify-center text-purple-600 shadow-inner group-hover:scale-110 transition-transform">
                     <Brain size={40} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Cognis-Plasticity Grade</h4>
                    <p className="text-sm font-bold text-slate-500">Tier 1: High Adaptive Capacity</p>
                    <div className="mt-4 flex items-center gap-2">
                       <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">+4.2% Growth Index</span>
                       <div className="h-1 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full w-4/5 bg-emerald-500" />
                       </div>
                    </div>
                  </div>
               </div>
               
               <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Synthetic Recommendation</h4>
                    <Bot size={16} className="text-purple-500" />
                  </div>
                  <p className="text-base font-serif italic text-slate-300">"Sustained alpha-rhythm patterns suggest an elite cognitive window opening. Propose a high-complexity research session within the next 45 minutes."</p>
                  <div className="mt-6 flex gap-4">
                    <button className="flex-1 bg-white text-slate-900 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">Accept Strategy</button>
                    <button className="px-6 border border-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">Ignore</button>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Training Lab Modal */}
      <AnimatePresence>
        {showTrainingLab && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl relative"
            >
              <button 
                onClick={() => setShowTrainingLab(false)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white z-10"
              >
                <X size={24} />
              </button>

              <div className="p-10">
                {trainingStep === 1 && (
                  <div className="text-center">
                    <div className="w-20 h-20 bg-purple-600 rounded-3xl mx-auto mb-8 flex items-center justify-center text-white shadow-xl rotate-12">
                      <Zap size={32} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">Cognis Reactivity Test</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-bold mb-10 leading-relaxed">
                      We will measure your cognitive speed and accuracy. 
                      Click the button as soon as it changes color to initiate cognitive assessment.
                    </p>
                    <button 
                      onClick={conductCognisTest}
                      className="w-full bg-slate-900 dark:bg-purple-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                    >
                      Begin Assessment
                    </button>
                  </div>
                )}

                {trainingStep === 2 && (
                  <div className="text-center py-20 flex flex-col items-center">
                    <div className="w-32 h-32 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center relative overflow-hidden">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: '100%' }}
                        transition={{ duration: 2 }}
                        className="absolute bottom-0 inset-x-0 bg-purple-600/20"
                      />
                      <Activity size={48} className="text-purple-600 animate-pulse" />
                    </div>
                    <p className="mt-8 text-sm font-black text-slate-500 uppercase tracking-widest animate-pulse">Scanning Synaptic Firing Patterns...</p>
                  </div>
                )}

                {trainingStep === 3 && (
                  <div className="text-center">
                    <div className="w-24 h-24 bg-emerald-500 rounded-full mx-auto mb-8 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                      <CheckCircle2 size={48} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">Intelligence Locked</h2>
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-10">Assessment Successful</p>
                    
                    <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-[2rem] mb-10">
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cognis Score</p>
                          <p className="text-4xl font-black text-slate-900 dark:text-white">{testScore}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Percentile</p>
                          <p className="text-4xl font-black text-purple-600">92nd</p>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => setShowTrainingLab(false)}
                      className="w-full bg-purple-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-purple-700 transition-all shadow-xl"
                    >
                      Retain & Save Metrics
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
