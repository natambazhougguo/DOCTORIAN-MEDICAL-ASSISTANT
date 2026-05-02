import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, Zap, Brain, ShieldCheck, RefreshCw, 
  Bot, Monitor, FileText, Stethoscope, LayoutGrid, 
  Info, Bell, Search, Plus, ArrowRight, ArrowLeft, X, Pill, ChevronRight,
  TrendingUp, Heart, Battery, Droplets, Clock,
  CheckCircle2,
  ListTodo,
  Sparkles, Lightbulb, Quote, Cpu, Wind, Shield, Download, Fingerprint
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';
import BioSimulation from './BioSimulation';
import { BioSecurity } from './BioSecurity';
import { api } from '../api';

const performanceData = [
  { time: '00:00', value: 82 },
  { time: '04:00', value: 78 },
  { time: '08:00', value: 92 },
  { time: '12:00', value: 88 },
  { time: '16:00', value: 95 },
  { time: '20:00', value: 85 },
  { time: '23:59', value: 90 },
];

const vitalStats = [
  { label: 'Cognis Load', value: '42%', trend: '-4%', icon: <Brain size={16} />, color: 'blue' },
  { label: 'Cardiac Flux', value: '72 BPM', trend: '+2%', icon: <Heart size={16} />, color: 'rose' },
  { label: 'Energy Bio', value: '94%', trend: 'Stable', icon: <Battery size={16} />, color: 'emerald' },
  { label: 'Hydration', value: '2.4L', trend: '+0.4', icon: <Droplets size={16} />, color: 'cyan' },
];

interface DashboardProps {
  onNavigate: (view: any) => void;
  user: any;
  aiInsight?: string | null;
  onRefreshInsight: () => void;
  isInsightLoading: boolean;
  onInstall: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  onNavigate, 
  user, 
  aiInsight, 
  onRefreshInsight, 
  isInsightLoading,
  onInstall
}) => {
  const [tasks, setTasks] = useState<any[]>(() => {
    const saved = localStorage.getItem('doctorian_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [appointments, setAppointments] = useState<any[]>(() => {
    const saved = localStorage.getItem('doctorian_appointments');
    return saved ? JSON.parse(saved) : [
      { id: '1', specialist: { name: 'Dr. Sarah Johnson' }, date: new Date(Date.now() + 86400000).toISOString(), slot: '10:30 AM', type: 'virtual' }
    ];
  });

  useEffect(() => {
    const handleStorage = () => {
      const savedTasks = localStorage.getItem('doctorian_tasks');
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      const savedAppts = localStorage.getItem('doctorian_appointments');
      if (savedAppts) setAppointments(JSON.parse(savedAppts));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const pendingTasks = tasks.filter(t => !t.completed).sort((a, b) => {
    if (a.priority === 'high' && b.priority !== 'high') return -1;
    if (a.priority !== 'high' && b.priority === 'high') return 1;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  const [activeMetric, setActiveMetric] = useState('performance');
  const [isSosTriggering, setIsSosTriggering] = useState(false);
  const [showBioCore, setShowBioCore] = useState(false);
  const [showBioSecurity, setShowBioSecurity] = useState(false);
  const [selectedStat, setSelectedStat] = useState<any>(null);
  const [notifications, setNotifications] = useState<{id: string, text: string, type: 'info' | 'success' | 'warning'}[]>([]);
  const [timeframe, setTimeframe] = useState<'Day' | 'Week' | 'Month'>('Day');
  const [viewMode, setViewMode] = useState<'Real-time' | 'Predictive'>('Real-time');
  
  const [subView, setSubView] = useState<'main' | 'biosecurity' | 'alerts'>('main');
  
  const [systemLogs, setSystemLogs] = useState<{ id: string, event: string, time: string, level: 'low' | 'mid' | 'critical' }[]>([
    { id: '1', event: 'Neural Link Synchronized', time: '12:42', level: 'low' },
    { id: '2', event: 'Metabolic Shift Detected', time: '09:15', level: 'mid' },
    { id: '3', event: 'Node Activation Successful', time: '08:00', level: 'low' },
    { id: '4', event: 'Unauthorized Access Blocked', time: '04:22', level: 'critical' },
  ]);
  
  const addNotification = (text: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };
  const [diagnosticLogs, setDiagnosticLogs] = useState<string[]>([
    'COGNIS: Baseline synchronized',
    'BIO: Cardiac flux stabilized',
    'SYS: AES-256 Link Active'
  ]);

  useEffect(() => {
    const intervals = [
      'SYS: Analyzing biomarker drift...',
      'LOG: Cognis load at 42%',
      'BIO: Metabolic sync complete',
      'AUTH: RSA Verification passed',
      'DATA: Encrypted stream open'
    ];
    
    const interval = setInterval(() => {
      setDiagnosticLogs(prev => [intervals[Math.floor(Math.random() * intervals.length)], ...prev.slice(0, 2)]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const getDynamicData = () => {
    const base = [...performanceData];
    if (viewMode === 'Predictive') {
      return base.map(d => ({ ...d, value: Math.min(100, d.value + (Math.random() * 10 - 5)) }));
    }
    if (timeframe === 'Week') {
      return base.map(d => ({ ...d, value: d.value - 5 }));
    }
    if (timeframe === 'Month') {
      return base.map(d => ({ ...d, value: d.value + 2 }));
    }
    return base;
  };

  const handleSOS = async () => {
    if (!window.confirm("CRITICAL: This will trigger an emergency SMS and voice call to your doctor and mentor. Do you wish to proceed?")) {
      return;
    }

    setIsSosTriggering(true);
    try {
      await api.alerts.triggerSOS(user?.displayName || user?.email || 'Anonymous Patient');
      alert("SOS Sequence Activated. Authorities and emergency contacts have been notified.");
    } catch (err: any) {
      console.error(err);
      alert("SOS sequence failed to initialize. Please contact emergency services manually.");
    } finally {
      setIsSosTriggering(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {subView === 'main' ? (
        <motion.div 
          key="main"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-8 sm:space-y-12 pb-24"
        >
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-6 sm:p-10 lg:p-16 shadow-2xl relative overflow-hidden border border-slate-100 dark:border-slate-800 transition-all group">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
          <Activity size={320} className="w-[160px] h-[160px] sm:w-[320px] sm:h-[320px] text-blue-600" />
        </div>
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-2 h-10 sm:w-2.5 sm:h-12 bg-blue-600 rounded-full animate-pulse shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-[1000] tracking-tighter uppercase leading-none text-slate-900 dark:text-white text-high-visibility">
                    Cognis <span className="text-blue-600 italic font-serif lowercase tracking-normal">Nexus</span> Control
                  </h1>
                  <p className="text-blue-600 dark:text-blue-400 font-black text-[11px] sm:text-[12px] uppercase tracking-[0.3em] mt-3 text-high-visibility">Operational Integrity: 99.9% / Quantum Secure</p>
                </div>
              </div>
              <button 
                onClick={() => setSubView('alerts')}
                className="group flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                <div className="relative">
                  <Bell size={20} className="text-blue-600 dark:text-blue-400" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-600 rounded-full border-2 border-white dark:border-slate-800" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white leading-none">Operational Alerts</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">3 New Pulses</p>
                </div>
              </button>
            </div>
            
            <p className="text-slate-500 dark:text-slate-400 font-bold text-lg sm:text-xl lg:text-2xl leading-relaxed max-w-2xl">
              Unified diagnostic interface for {user?.name || user?.displayName || 'Authorized User'}. Real-time biometric synthesis and predictive modeling active.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={() => onNavigate('ai_nexus')}
                className="flex-1 sm:flex-none px-8 py-5 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all font-black text-xs sm:text-base uppercase tracking-widest flex items-center justify-center gap-3 border-2 border-transparent"
              >
                <Bot size={22} className="text-white animate-pulse" />
                Doctorian AI
              </button>

              <button 
                onClick={handleSOS}
                disabled={isSosTriggering}
                className="flex-1 sm:flex-none px-8 py-5 bg-rose-600 text-white rounded-2xl shadow-xl shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all font-black text-xs sm:text-base uppercase tracking-widest flex items-center justify-center gap-3 border-2 border-transparent disabled:opacity-50"
              >
                <Zap size={22} className={isSosTriggering ? "animate-spin" : "text-white animate-pulse"} />
                {isSosTriggering ? "Triggering..." : "SOS Emergency"}
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-1 gap-4">
            <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden relative group/logs">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Diagnostic Loop</span>
                <RefreshCw size={12} className="text-slate-400 animate-spin-slow" />
              </div>
              <div className="space-y-3 h-[120px] overflow-hidden">
                <AnimatePresence initial={false}>
                  {diagnosticLogs.map((log, i) => (
                    <motion.div 
                      key={log + i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                      <p className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 leading-none">
                        {log}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <div 
              onClick={() => setShowBioCore(true)}
              className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2rem] flex flex-col justify-between group cursor-pointer hover:shadow-2xl transition-all border border-slate-700 h-full"
            >
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400">
                  <Brain size={24} />
                </div>
                <span className="px-4 py-1.5 bg-blue-600/20 text-blue-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-500/30">Interface Ready</span>
              </div>
              <div className="mt-8">
                <h4 className="font-black uppercase tracking-tighter text-white text-2xl">Access <span className="text-blue-400">Bio-Core</span></h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 group-hover:text-white transition-colors">Strategic Simulation Protocol v9.4</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {vitalStats.map((stat, i) => (
          <button 
            key={i} 
            onClick={() => setSelectedStat(stat)}
            className="bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden text-left w-full"
          >
            <div className={`absolute -right-2 -top-2 w-12 h-12 sm:w-20 sm:h-20 bg-${stat.color}-500/5 rounded-full blur-xl sm:blur-2xl group-hover:bg-${stat.color}-500/10 transition-all`} />
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform relative z-10 shadow-sm`}>
              {React.cloneElement(stat.icon as any, { size: 20 })}
            </div>
            <p className="text-[10px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2 sm:mb-2 relative z-10 text-high-visibility">{stat.label}</p>
            <div className="flex items-baseline justify-between relative z-10">
              <h3 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none text-high-visibility">{stat.value}</h3>
              <span className={`text-[10px] sm:text-[10px] font-black ${stat.trend.startsWith('+') ? 'text-emerald-500' : stat.trend === 'Stable' ? 'text-blue-500' : 'text-rose-500'}`}>
                {stat.trend}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Advanced Cognitive & Cellular Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: 'Cognis Coherence', value: '0.98', label: 'Quantum Sync', sub: 'Phase Locked', color: 'blue', icon: <Cpu />, details: 'Coherence represents the synchrony between left and right hemispheres.' },
          { title: 'Oxygen Efficiency', value: '42%', label: 'Cellular Flux', sub: 'Optimized', color: 'cyan', icon: <Wind />, details: 'Mitochondrial oxygen utilization rate within targeted muscle tissue.' },
          { title: 'Stress Polarity', value: 'Low', label: 'Cortisol Phase', sub: 'Non-Reactive', color: 'rose', icon: <Zap />, details: 'Autonomic nervous system balance based on skin conductance.' }
        ].map((item, i) => (
          <div 
            key={i} 
            onClick={() => {
              addNotification(`Detailed analysis of ${item.title} available in CognisHub.`, 'info');
              setSelectedStat({...item, trend: 'Optimal', label: item.title});
            }}
            className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-xl border border-white/5 group hover:border-blue-500/50 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-10">
              <div className={`p-4 bg-${item.color}-500/20 text-${item.color}-400 rounded-2xl group-hover:scale-110 transition-all`}>
                {React.cloneElement(item.icon as any, { size: 24 })}
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black text-blue-500 uppercase tracking-[0.3em]">{item.label}</p>
                <p className="text-sm font-black uppercase text-white/40">{item.sub}</p>
              </div>
            </div>
            <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{item.title}</h4>
            <p className="text-4xl font-black tracking-tighter">{item.value}</p>
            <div className="mt-6 flex gap-1 h-1">
              {[...Array(12)].map((_, j) => (
                <div key={j} className={`flex-1 rounded-full ${j < 8 ? `bg-${item.color}-500/50` : 'bg-white/5'} transition-all`} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Powerful Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Analytics Hub */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp size={16} className="text-blue-600" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cognis Performance Index</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Biometric Synthesis</h2>
            </div>
            <div className="flex gap-2">
              {(['Day', 'Week', 'Month'] as const).map(t => (
                <button 
                  key={t} 
                  onClick={() => setTimeframe(t)}
                  className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                    timeframe === t 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 p-10 min-h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getDynamicData()}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#60a5fa' }}
                />
                <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="p-10 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Stability Score</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white uppercase">98.2<span className="text-blue-600 font-serif lowercase italic ml-1">optimal</span></p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Peak Activity</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white uppercase">16:42<span className="text-emerald-500 text-xs ml-2">+12%</span></p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Current Thread</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white uppercase">Alpha Mode</p>
            </div>
          </div>
        </div>

        {/* Powerful Context Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          {/* Quick Actions Portal */}
          <div className="bg-slate-900 text-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <Zap size={100} />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-8">Bio-Link<br />Actions</h3>
            <div className="space-y-4 relative z-10">
              {[
                { label: 'Start Cognis Consult', icon: <ArrowRight size={14} />, action: () => onNavigate('ai_lab') },
                { label: 'Verify Bio-Identity', icon: <Fingerprint size={14} />, action: () => setSubView('biosecurity') },
                { label: 'Log Protocol Task', icon: <Plus size={14} />, action: () => onNavigate('tasks') },
                { label: 'Record Medication', icon: <Pill size={14} />, action: () => onNavigate('meds') },
                { label: 'Scan Vital Matrix', icon: <Activity size={14} />, action: () => onNavigate('vitality') }
              ].map((item, idx) => (
                <button 
                  key={idx}
                  onClick={item.action} 
                  className="w-full flex items-center justify-between p-5 bg-white/5 hover:bg-white text-slate-300 hover:text-slate-900 rounded-2xl border border-white/5 hover:border-white transition-all font-black text-[10px] uppercase tracking-widest group/btn"
                >
                  {item.label} <span className="group-hover/btn:translate-x-1 transition-transform">{item.icon}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Activity Metrics & Predictive Row (missing or needs cleanup) */}
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-10">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
              Activity Metrics
              <Sparkles size={14} className="text-blue-600" />
            </h4>
            <div className="space-y-8">
              {[
                { label: 'Cognis Load', value: 34, color: 'blue', desc: 'Prefrontal cortex activity level.' },
                { label: 'Bio-Entropy', value: 12, color: 'emerald', desc: 'Total system metabolic disorder.' },
                { label: 'Recovery Phase', value: 88, color: 'indigo', desc: 'Anabolic tissue repair progress.' }
              ].map((activity, i) => (
                <div key={i} className="group cursor-help relative" onClick={() => addNotification(`${activity.label} detail logged at 99.9% accuracy.`)}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full bg-${activity.color}-500 animate-pulse`} />
                      <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">{activity.label}</span>
                    </div>
                    <span className="text-xs font-black text-slate-400">{activity.value}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${activity.value}%` }}
                      className={`h-full bg-${activity.color}-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.2)]`}
                    />
                  </div>
                  <p className="mt-2 text-[8px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-4">{activity.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Neural Session Queue */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-600 flex items-center justify-center">
                  <Clock size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Neural Sessions</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{appointments.length} Scheduled</p>
                </div>
              </div>
              <button onClick={() => onNavigate('specialist')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <Plus size={18} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              {appointments.slice(0, 2).map((appt) => (
                <div key={appt.id} className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-white/5 relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded italic">
                      {appt.type} link
                    </span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                       {new Date(appt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {appt.slots ? appt.slots.join(', ') : appt.slot}
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">{appt.specialist.name}</h4>
                  <div className="flex items-center justify-between mt-4">
                    <button className="text-[10px] font-black text-slate-400 hover:text-rose-600 uppercase tracking-widest transition-colors">Abort</button>
                    <button className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">Launch Link</button>
                  </div>
                </div>
              ))}
              {appointments.length === 0 && (
                <div className="py-8 text-center text-slate-400 space-y-3">
                   <p className="text-[10px] font-black uppercase tracking-widest">No Active Links</p>
                   <button onClick={() => onNavigate('specialist')} className="text-[9px] font-black text-blue-600 underline">Sync with Specialist</button>
                </div>
              )}
            </div>
          </div>

          {/* Priority Task Protocol Queue */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-[300px]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
                  <ListTodo size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Protocol Queue</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{pendingTasks.length} Pending</p>
                </div>
              </div>
              <button onClick={() => onNavigate('tasks')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <ChevronRight size={18} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-4 flex-1">
              {pendingTasks.slice(0, 3).map((task) => (
                <div key={task.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center justify-between group relative overflow-hidden">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    task.priority === 'high' ? 'bg-rose-500' : 
                    task.priority === 'medium' ? 'bg-amber-500' : 
                    'bg-blue-500'
                  }`} />
                  <div className="flex items-center gap-3 max-w-[70%] ml-1">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      task.priority === 'high' ? 'bg-rose-500 animate-pulse' : 
                      task.priority === 'medium' ? 'bg-amber-500' : 
                      'bg-blue-500'
                    }`} />
                    <h4 className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase truncate leading-tight">{task.title}</h4>
                  </div>
                  <button 
                    onClick={() => {
                      const updated = tasks.map(t => t.id === task.id ? { ...t, completed: true } : t);
                      localStorage.setItem('doctorian_tasks', JSON.stringify(updated));
                      setTasks(updated);
                      addNotification("Protocol verified and marked as complete.", "success");
                    }}
                    className="p-2 text-slate-300 hover:text-emerald-500 transition-colors"
                  >
                    <CheckCircle2 size={16} />
                  </button>
                </div>
              ))}
              {pendingTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 opacity-40">
                  <ShieldCheck size={32} />
                  <p className="text-[10px] font-black uppercase mt-3 tracking-widest">All Clear</p>
                </div>
              )}
            </div>

            <button 
              onClick={() => onNavigate('tasks')}
              className="mt-6 w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-[9px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all"
            >
              Manage Strategies
            </button>
          </div>

          {/* Daily Intelligence Briefing */}
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full min-h-[400px] relative overflow-hidden group">
            {/* Background Decoration */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-600/5 rounded-full blur-3xl group-hover:bg-blue-600/10 transition-colors" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <Sparkles size={20} />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cognis Briefing</span>
                </div>
                <div className="flex -space-x-1">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800" />
                  ))}
                </div>
              </div>

              <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase leading-tight mb-8 tracking-tighter">Daily Health <br /><span className="text-blue-600">Cognis</span></h4>
              
              <AnimatePresence mode="wait">
                {isInsightLoading ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse" />
                    <div className="h-3 w-[90%] bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse delay-75" />
                    <div className="h-3 w-[80%] bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse delay-150" />
                    <div className="h-3 w-[60%] bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse delay-300" />
                  </motion.div>
                ) : (
                  <motion.div key="insight" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                    <div className="relative">
                      <Quote size={20} className="absolute -left-6 -top-2 text-blue-600/20" />
                      <p className="text-slate-600 dark:text-slate-300 font-bold italic leading-relaxed text-lg font-serif">
                        "{aiInsight || 'Initializing metabolic synchronization protocols...'}"
                      </p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100/50 dark:border-blue-800/50">
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Priority Focus</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Maintain high hydration levels and optimize sleep architecture tonight.</p>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {['Synthesized', 'AI-Driven', 'Authorized'].map(tag => (
                        <span key={tag} className="px-3 py-1 bg-slate-50 dark:bg-slate-800 text-[8px] font-black text-slate-400 uppercase tracking-widest rounded-lg border border-slate-100 dark:border-slate-800">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="pt-10 flex items-center justify-between mt-auto">
              <button 
                onClick={onRefreshInsight} 
                disabled={isInsightLoading}
                className="flex items-center gap-2 text-[9px] font-black text-blue-600 uppercase tracking-widest group disabled:opacity-50"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <RefreshCw size={14} className={isInsightLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
                </div>
                Sync New Pattern
              </button>
              
              <div className="flex items-center gap-2 text-slate-400">
                <Lightbulb size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest">Tip of the Day</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Roadmap - NEW FEATURE */}
      <section className="bg-slate-900 text-white rounded-[4rem] p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-indigo-600/10" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/3">
            <h2 className="text-4xl font-black uppercase tracking-tighter leading-none mb-6">
              Clinical <br /><span className="text-blue-500">Roadmap</span>
            </h2>
            <p className="text-slate-400 font-bold mb-8">
              Your personalized journey toward optimal longevity and neurological health, recalibrated every cycle.
            </p>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Phase Progress</span>
                <span className="text-xl font-black">64%</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full w-[64%] rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
              </div>
            </div>
          </div>
          
          <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
            {[
              { title: 'Baseline Sync', status: 'Completed', date: 'Oct 12', icon: <RefreshCw />, color: 'blue', view: 'neuro' },
              { title: 'Metabolic Optimization', status: 'In Progress', date: 'Oct 28', icon: <Activity />, color: 'emerald', view: 'vitality' },
              { title: 'DNA Stabilization', status: 'Pending', date: 'Nov 15', icon: <ShieldCheck />, color: 'purple', view: 'monitor' },
              { title: 'Longevity Index Peak', status: 'Upcoming', date: 'Dec 02', icon: <TrendingUp />, color: 'orange', view: 'vitality' },
            ].map((milestone, i) => (
              <button 
                key={i} 
                onClick={() => onNavigate(milestone.view as any)}
                className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all group text-left cursor-pointer"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 bg-${milestone.color}-500/20 text-${milestone.color}-400 rounded-xl group-hover:scale-110 transition-transform`}>
                    {React.cloneElement(milestone.icon as any, { size: 18 })}
                  </div>
                  <div>
                    <h4 className="text-lg font-black uppercase tracking-tight leading-none group-hover:text-blue-400 transition-colors">{milestone.title}</h4>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mt-1">{milestone.date}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                    milestone.status === 'Completed' ? 'bg-blue-600 text-white' : 
                    milestone.status === 'In Progress' ? 'bg-emerald-600 text-white animate-pulse' : 
                    'bg-white/10 text-slate-400'
                  }`}>
                    {milestone.status}
                  </span>
                  <div className="flex -space-x-1">
                    <ArrowRight size={14} className="text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Navigation Suites */}
      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-8 bg-blue-600 rounded-full" />
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Clinical Intelligence Suite</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Bio-Security', subtitle: 'Neural Identity', icon: <Fingerprint />, view: 'biosecurity', color: 'blue', styles: 'bg-blue-600/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600', detail: 'Encrypted' },
            { title: 'Cognis Hub', subtitle: 'Synaptic Tracking', icon: <Brain />, view: 'neuro', color: 'purple', styles: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600', detail: 'Active' },
            { title: 'Vital Matrix', subtitle: 'Longevity Index', icon: <Zap />, view: 'vitality', color: 'emerald', styles: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600', detail: 'Optimized' },
            { title: 'AI Lab', subtitle: 'Neural Synthesis', icon: <Bot />, view: 'ai_lab', color: 'blue', styles: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600', detail: 'Ready' },
            { title: 'Bio-Monitor', subtitle: 'Bio-Telemetry', icon: <Monitor />, view: 'monitor', color: 'cyan', styles: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 group-hover:bg-cyan-600', detail: 'Live' },
            { title: 'Archive', subtitle: 'Clinical Records', icon: <FileText />, view: 'records', color: 'indigo', styles: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600', detail: 'Synced' },
            { title: 'Specialists', subtitle: 'Expert Network', icon: <Stethoscope />, view: 'specialist', color: 'rose', styles: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 group-hover:bg-rose-600', detail: 'Connected' },
            { title: 'System', subtitle: 'Analytics Ops', icon: <Info />, view: 'about', color: 'slate', styles: 'bg-slate-50 dark:bg-slate-900/20 text-slate-600 dark:text-slate-400 group-hover:bg-slate-600', detail: 'v5.0.2' },
          ].map((item, i) => (
            <motion.button
              key={i}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => {
                if (item.view === 'biosecurity') {
                  setSubView('biosecurity');
                } else {
                  onNavigate(item.view as any);
                }
              }}
              className="group bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all text-left flex flex-col justify-between min-h-[240px] relative overflow-hidden"
            >
              <div className="flex justify-between items-start relative z-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-sm ${item.styles} group-hover:text-white`}>
                  {React.cloneElement(item.icon as React.ReactElement<any>, { size: 24 })}
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-500 transition-colors bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-700">
                  {item.detail}
                </span>
              </div>
              <div className="relative z-10">
                <h3 className="font-black text-slate-900 dark:text-white text-xl tracking-tight mb-1 uppercase leading-none group-hover:text-blue-600 transition-colors">{item.title}</h3>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest opacity-80">{item.subtitle}</p>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1.5 bg-blue-600/10 group-hover:bg-blue-600 transition-all translate-y-2 group-hover:translate-y-0" />
            </motion.button>
          ))}
        </div>
      </section>

      {/* Advanced Simulations */}
      <div className="pt-10">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
          <Brain className="text-blue-600" size={24} />
          AI Predictive Modeling Matrix
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black uppercase tracking-widest text-slate-900 dark:text-white leading-none">Biological Forecast</h3>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest">Quantum Simulation</span>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getDynamicData().map(d => ({ ...d, pred: d.value + (Math.random() * 10 - 5) }))}>
                  <defs>
                    <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', color: '#fff', fontSize: '10px' }}
                  />
                  <XAxis dataKey="time" hide />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
                  <Area type="monotone" dataKey="pred" stroke="#10b981" fill="url(#colorPred)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-800">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">AI Prediction</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">High probability of peak cognitive performance in the next 12 hours. System stability is projected to increase by 4.2%.</p>
            </div>
          </div>

          <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-600/5 blur-3xl rounded-full" />
            <div className="relative z-10 space-y-8">
              <h3 className="text-xl font-black uppercase tracking-widest leading-none">Wellness Objectives</h3>
              <div className="space-y-6">
                {[
                  { label: "REM Cycle Optimization", progress: 85, color: "blue", tip: "Avoid blue light 2h before primary sleep phase." },
                  { label: "Mitochondrial Flux", progress: 62, color: "emerald", tip: "Maintain Zone 2 aerobic activity for 45 minutes." },
                  { label: "Glycemic Baseline", progress: 94, color: "amber", tip: "Post-prandial glucose levels currently stabilized." }
                ].map((goal, i) => (
                  <div key={i} className="space-y-3 group cursor-help" onClick={() => addNotification(`Wellness Protocol: ${goal.tip}`, 'info')}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-1 h-1 rounded-full bg-${goal.color}-500`} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">{goal.label}</span>
                      </div>
                      <span className="text-sm font-black">{goal.progress}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${goal.progress}%` }}
                        className={`h-full bg-${goal.color}-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)]`}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => addNotification("New wellness parameters synced with Bio-Core.", "success")}
                className="w-full py-4 mt-4 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-50 transition-all"
              >
                Sync Custom Goals
              </button>
            </div>
          </div>
        </div>

        {/* Bio-Core Intelligence Modal */}
        <div className="mt-10 bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8">
            <Cpu className="text-blue-600/20 animate-spin-slow" size={120} />
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white mb-6">Neural Optimization Bridge</h3>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {[
                { label: "Synaptic Sync", value: "Active", sub: "14ms Latency" },
                { label: "Dopamine Curve", value: "Elevated", sub: "Morning Peak" },
                { label: "Cortisol Drift", value: "Declining", sub: "Stable Baseline" },
                { label: "Bio-Rhythm", value: "Phase 4", sub: "Deep Focus" }
              ].map((m, i) => (
                <div key={i} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{m.label}</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white uppercase leading-none mb-1">{m.value}</p>
                  <p className="text-[10px] text-blue-600 font-bold">{m.sub}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => {
                  addNotification("Baseline recalibration initiated. Stay still for 30 seconds.", "success");
                }}
                className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all border border-white/10"
              >
                Recalibrate Baseline
              </button>
              <button 
                onClick={() => {
                  addNotification("Biometric data package compiled and ready for download.", "success");
                }}
                className="px-8 py-4 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all"
              >
                Export Bio-Data
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 bg-slate-950 rounded-[3rem] shadow-2xl border border-slate-800 overflow-hidden min-h-[600px]">
          <BioSimulation />
        </div>

        {/* Clinical Intelligence Overview */}
        <div className="mt-10 mb-6 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-3">
            <Shield className="text-emerald-500" size={20} />
            System Health Baseline
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Sync Status</span>
              <span className="text-xs font-bold text-emerald-500">LIVE</span>
            </div>
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { 
              title: "Neural Efficiency", 
              value: "98.4%", 
              trend: "+0.2%", 
              icon: <Zap className="text-amber-400" />,
              description: "Optimal synaptic response time."
            },
            { 
              title: "Metabolic Flux", 
              value: "Stable", 
              trend: "Syncing", 
              icon: <Activity className="text-emerald-400" />,
              description: "Glucose-insulin dynamics stable."
            },
            { 
              title: "Cellular Longevity", 
              value: "Tier 1", 
              trend: "Optimal", 
              icon: <Shield className="text-blue-400" />,
              description: "Telomere integrity protocols active."
            },
            {
              title: "Deep Sleep Depth",
              value: "2h 45m",
              trend: "+15m",
              icon: <Clock className="text-indigo-400" />,
              description: "Regenerative phase performance."
            }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-slate-900/50 backdrop-blur-xl p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  {stat.icon}
                </div>
                <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{stat.trend}</span>
              </div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.title}</p>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{stat.value}</h4>
              <p className="text-[10px] text-slate-500 leading-tight font-medium">{stat.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Predictive Bio-Forecast */}
        <div className="mt-10 bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-20 transition-transform duration-500 group-hover:scale-110">
            <Sparkles size={120} className="text-blue-400" />
          </div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-full border border-blue-500/30 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-6">
                <Brain size={12} />
                AI Prognosis Model
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tighter mb-4 leading-none">Biological Forecast: Next 48 Hours</h3>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">Our clinical intelligence engine has analyzed your current biomarkers. Your cognitive baseline is projected to peak tomorrow at 09:30 AM.</p>
              <div className="flex flex-wrap gap-4">
                <div className="px-5 py-3 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Stability Rate</p>
                  <p className="text-xl font-black">94.2%</p>
                </div>
                <div className="px-5 py-3 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Recovery Speed</p>
                  <p className="text-xl font-black">Fast</p>
                </div>
              </div>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getDynamicData()}>
                  <defs>
                    <linearGradient id="colorBio" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorBio)" strokeWidth={4} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Bio-Core Intelligence Modal */}
      <AnimatePresence>
        {showBioCore && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-3xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 50, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-5xl h-[85vh] rounded-[4rem] overflow-hidden shadow-2xl relative border border-white/10 flex flex-col sm:flex-row"
            >
              <button 
                onClick={() => setShowBioCore(false)}
                className="absolute top-10 right-10 p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-full z-10 transition-all border border-transparent hover:border-slate-200"
              >
                <LayoutGrid size={24} />
              </button>

              <div className="w-full sm:w-1/2 p-12 sm:p-20 flex flex-col justify-between bg-slate-50 dark:bg-slate-950/50">
                <div className="space-y-8">
                  <div className="w-20 h-2 bg-blue-600 rounded-full" />
                  <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-[0.9]">
                    Bio-Core <br /><span className="text-blue-600">Intelligence</span> <br />Matrix
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 font-bold text-lg leading-relaxed max-w-md">
                    Deep-layered biological synthesis engine monitoring your primary somatic feedback loops and synaptic efficiency in real-time.
                  </p>
                </div>

                <div className="space-y-6">
                  {[
                    { label: 'Cognis Fidelity', value: '99.4%', color: 'blue' },
                    { label: 'Cellular Entropy', value: '0.02', color: 'emerald' },
                    { label: 'Metabolic Sync', value: 'Active', color: 'amber' }
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center justify-between group">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-500 transition-colors">{stat.label}</span>
                      <span className={`text-xl font-black text-${stat.color}-500`}>{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full sm:w-1/2 bg-slate-900 relative p-12 sm:p-20 overflow-hidden flex flex-col justify-center text-center">
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600 rounded-full blur-[120px] animate-pulse" />
                </div>
                
                <div className="mb-12 relative z-10">
                  <div className="inline-block p-8 bg-blue-600 rounded-[3rem] shadow-[0_0_50px_rgba(37,99,235,0.4)] animate-float">
                    <Brain size={64} className="text-white" />
                  </div>
                </div>

                <h3 className="text-white font-black text-3xl uppercase tracking-tighter mb-4 relative z-10">Cognis Synthesis Active</h3>
                <p className="text-blue-200/60 font-black text-[10px] uppercase tracking-[0.4em] mb-12 relative z-10">Processing Biomarker Stream v5.0.2</p>

                <div className="grid grid-cols-2 gap-4 relative z-10">
                  <button 
                    onClick={() => {
                      addNotification("Biological scan initiated correctly. Sensor sync in progress.", "success");
                    }}
                    className="bg-white/10 hover:bg-white/20 border border-white/10 text-white p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                  >
                    Initiate Scan
                  </button>
                  <button 
                    onClick={() => {
                      addNotification("Cognis augmentation sequence started. Beta-wave focus increased.", "info");
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-600/30"
                  >
                    Cognis Boost
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metric Detail Modal */}
      <AnimatePresence>
        {selectedStat && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl"
            onClick={() => setSelectedStat(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className={`p-4 rounded-2xl bg-blue-600 text-white`}>
                    {selectedStat.icon || <Info />}
                  </div>
                  <button onClick={() => setSelectedStat(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                    <X size={20} />
                  </button>
                </div>
                
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-2">{selectedStat.label || 'Metric Analysis'}</p>
                <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">{selectedStat.value}</h3>
                <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed mb-10">
                  {selectedStat.details || "Continuous monitoring shows a stable pattern within standard medical ranges. Clinical correlation is recommended for any symptomatic changes."}
                </p>

                <div className="grid grid-cols-2 gap-6 mb-10">
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                    <p className="text-sm font-black text-emerald-500 uppercase tracking-tight">{selectedStat.trend || 'Normalized'}</p>
                  </div>
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Interval</p>
                    <p className="text-sm font-black text-slate-600 dark:text-slate-300 uppercase tracking-tight">Last 24 Hours</p>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    addNotification("Diagnostic report generated and saved to Health Records.", "success");
                    setSelectedStat(null);
                  }}
                  className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Download Full Diagnostic
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Notifications */}
      <div className="fixed top-10 right-10 z-[300] pointer-events-none space-y-4">
        <AnimatePresence>
          {notifications.map(note => (
            <motion.div
              key={note.id}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              className={`p-5 rounded-2xl shadow-2xl flex items-center gap-4 border pointer-events-auto ${
                note.type === 'success' 
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400' 
                  : note.type === 'warning'
                  ? 'bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-400'
                  : 'bg-blue-50 border-blue-100 text-blue-700 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-400'
              }`}
            >
              <div className="p-2 bg-white/50 dark:bg-black/20 rounded-lg">
                {note.type === 'success' ? <Zap size={16} /> : <Info size={16} />}
              </div>
              <p className="text-xs font-bold leading-tight max-w-[200px]">{note.text}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Clinical Diagnostic Timeline & Download APK */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="lg:col-span-2 bg-white dark:bg-slate-900 ring-1 ring-slate-100 dark:ring-slate-800 rounded-[2.5rem] p-8 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Diagnostic Logic Chain</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent AI Analytical Steps</p>
            </div>
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>

          <div className="space-y-6">
            {[
              { time: '09:42 AM', label: 'Neural Mapping', desc: 'Synaptic latency verified at 42ms. No cortical anomalies.', status: 'Complete', color: 'bg-emerald-500' },
              { time: '08:15 AM', label: 'Metabolic Baseline', desc: 'Glycemic index synchronized with AM protocol.', status: 'Verified', color: 'bg-emerald-500' },
              { time: 'Yesterday', label: 'Anatomical Synthesis', desc: 'Full-body voxel scan completed. Vitals stable.', status: 'Logged', color: 'bg-blue-500' }
            ].map((item, i) => (
              <div key={i} className="flex gap-6 items-start group">
                <div className="pt-1 w-16 shrink-0">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{item.time}</span>
                </div>
                <div className="relative pb-6 last:pb-0 flex-1">
                  {i !== 2 && <div className="absolute left-[-1.3rem] top-3 bottom-0 w-[1px] bg-slate-100 dark:bg-slate-800" />}
                  <div className={`absolute left-[-1.55rem] top-1.5 w-2 h-2 rounded-full ${item.color} ring-4 ring-white dark:ring-slate-900`} />
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight group-hover:text-blue-600 transition-colors">{item.label}</h4>
                    <span className="text-[8px] font-black px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-500">{item.status}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-600/30 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
              <Brain size={24} />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-2">Clinical Intelligence</h3>
            <p className="text-xs font-medium opacity-80 leading-relaxed mb-8">
              Your biological data is being processed through our Tier-3 neural network for deep diagnostic precision.
            </p>
            
            <div className="space-y-4">
              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-md border border-white/10">
                 <div className="flex justify-between items-center mb-1">
                   <span className="text-[8px] font-black uppercase tracking-widest">Synthesis Progress</span>
                   <span className="text-[10px] font-black tabular-nums">92%</span>
                 </div>
                 <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     whileInView={{ width: '92%' }}
                     className="bg-white h-full"
                   />
                 </div>
              </div>
            </div>
          </div>

          <button
            onClick={onInstall}
            className="w-full mt-8 py-4 bg-white text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
          >
            <Download size={14} /> INSTALL TO DEVICE
          </button>
        </motion.div>
      </div>
    </motion.div>
  ) : subView === 'biosecurity' ? (
        <motion.div
          key="biosecurity"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex-1 flex flex-col min-h-[600px] bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4 bg-slate-50 dark:bg-slate-900">
             <button 
               onClick={() => setSubView('main')}
               className="p-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-slate-400 hover:text-blue-600 transition-all shadow-sm"
             >
               <ArrowLeft size={18} />
             </button>
             <div>
               <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">Back to Dashboard</h3>
               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Protocol Visualization Ready</p>
             </div>
          </div>
          <div className="flex-1 overflow-hidden">
             <BioSecurity />
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="alerts"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex-1 flex flex-col min-h-[600px] bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4 bg-slate-50 dark:bg-slate-900">
             <button 
               onClick={() => setSubView('main')}
               className="p-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-slate-400 hover:text-blue-600 transition-all shadow-sm"
             >
               <ArrowLeft size={18} />
             </button>
             <div>
               <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">Neural Alert Center</h3>
               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">System Log & Operational Feed</p>
             </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
               {[
                 { label: 'Critical Alerts', count: systemLogs.filter(l => l.level === 'critical').length, color: 'text-rose-600' },
                 { label: 'Active Monitors', count: 12, color: 'text-blue-600' },
                 { label: 'System Health', count: '99.9%', color: 'text-emerald-600' },
               ].map((stat, i) => (
                 <div key={i} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className={`text-2xl font-black ${stat.color} tracking-tighter uppercase`}>{stat.count}</p>
                 </div>
               ))}
             </div>

             <div className="space-y-4">
               {systemLogs.map((log) => (
                 <div key={log.id} className="p-5 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-3xl flex items-center justify-between group hover:border-blue-200 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        log.level === 'critical' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600' :
                        log.level === 'mid' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' :
                        'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                      }`}>
                        <Bell size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{log.event}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Timestamp: {log.time}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                      log.level === 'critical' ? 'bg-rose-600 text-white shadow-lg shadow-rose-200 dark:shadow-none' :
                      'text-slate-400 bg-slate-50 dark:bg-slate-800'
                    }`}>
                      {log.level}
                    </div>
                 </div>
               ))}
             </div>

             <button className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest mt-8 hover:opacity-90 transition-opacity">
               Purge Operational Log
             </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Dashboard;
