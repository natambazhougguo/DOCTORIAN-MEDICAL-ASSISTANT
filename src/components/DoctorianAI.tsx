import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, Sparkles, Brain, MessageSquare, 
  Stethoscope, Activity, FileText, Search, UserPlus,
  Compass, ShieldCheck, Cpu, ChevronRight, Zap, RefreshCw,
  Globe, Database, Server, MessageSquarePlus, X, Send,
  Crown, Loader2, Phone, Scan
} from 'lucide-react';
import { ChatInterface } from './ChatInterface';
import { api, User } from '../api';
import { UpgradeModal } from './UpgradeModal';
import { NeuralVisualizer } from './NeuralVisualizer';
import { NeuralVoiceCall } from './NeuralVoiceCall';

import { NeuralHealthSummary } from './NeuralHealthSummary';

interface DoctorianAIProps {
  user: User | null;
  onUpdate?: (user: User) => void;
  onNavigate?: (view: any) => void;
}

export function DoctorianAI({ user, onUpdate, onNavigate }: DoctorianAIProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'lab'>('chat');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showVisualizer, setShowVisualizer] = useState(false);
  const [showVoiceCall, setShowVoiceCall] = useState(false);
  const [showNeuralSummary, setShowNeuralSummary] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'suggestion' | 'bug' | 'praise'>('suggestion');
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [stats, setStats] = useState({
    latency: 12,
    threads: 4802,
    users: 24012,
    confidence: 98.4
  });

  const handlePlatformFeedback = async () => {
    if (!feedbackText.trim()) return;
    setIsSubmitting(true);
    try {
      await api.ai.submitFeedback({
        messageId: 'PLATFORM_FEEDBACK',
        rating: feedbackType === 'bug' ? 'down' : 'up',
        suggestion: `[Type: ${feedbackType}] ${feedbackText}`
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        setShowFeedbackModal(false);
        setSubmitSuccess(false);
        setFeedbackText('');
      }, 2000);
    } catch (err) {
      console.error("Feedback failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [operationalIdea, setOperationalIdea] = useState<string | null>(null);
  const [isGeneratingIdea, setIsGeneratingIdea] = useState(false);

  const fetchOperationalIdea = async () => {
    if (user?.subscriptionTier !== 'gold' || user?.subscriptionStatus !== 'active') return;
    setIsGeneratingIdea(true);
    try {
      const idea = await api.auth.generateOperationalIdea();
      setOperationalIdea(idea);
    } catch (err) {
      console.error("Operational idea failed:", err);
    } finally {
      setIsGeneratingIdea(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const isSilver = user?.subscriptionTier === 'silver' && user?.subscriptionStatus === 'active';
      const isGold = user?.subscriptionTier === 'gold' && user?.subscriptionStatus === 'active';
      const baseLatency = isGold ? 4 : isSilver ? 8 : 12;

      setStats(prev => ({
        latency: Math.max(baseLatency - 2, Math.min(baseLatency + 5, prev.latency + (Math.random() > 0.5 ? 1 : -1))),
        threads: Math.max(4500, Math.min(5200, prev.threads + Math.floor(Math.random() * 20 - 10))),
        users: prev.users + Math.floor(Math.random() * 5),
        confidence: Math.max(97.0, Math.min(99.9, prev.confidence + (Math.random() > 0.5 ? 0.1 : -0.1)))
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, [user?.subscriptionTier]);

  const quickTools = [
    { label: 'Diagnostic Lab', description: 'Deep symptom mapping and pathology analysis', icon: <Stethoscope size={24} />, view: 'symptoms', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Neural Visualizer', description: 'Visual anatomical mapping & physical analysis', icon: <Scan size={24} />, view: 'visualizer', color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
    { label: 'Neural Health Report', description: 'Comprehensive AI synthesis of all bio-data', icon: <ClipboardList size={24} />, view: 'summary', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'AI Voice Link', description: 'Real-time clinical neural voice session', icon: <Phone size={24} />, view: 'voicecall', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { label: 'Bio-Monitor', description: 'Real-time physiological stream integration', icon: <Activity size={24} />, view: 'monitor', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
    { label: 'Clinical Vault', description: 'Secure blockchain-backed health records', icon: <FileText size={24} />, view: 'records', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Specialists', description: 'Direct link to authorized clinical networks', icon: <UserPlus size={24} />, view: 'specialist', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden mb-12 transition-all">
      <AnimatePresence>
        {user?.subscriptionTier === 'gold' && user?.subscriptionStatus === 'active' && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-purple-600 p-3 sm:px-8 flex items-center justify-between gap-4 border-b border-purple-500/30 shrink-0"
          >
            <div className="flex items-center gap-3">
              <Crown className="text-amber-300" size={18} />
              <span className="text-[10px] font-black text-white uppercase tracking-widest hidden sm:inline">Operational Health Matrix Active</span>
              <span className="text-[10px] font-black text-white uppercase tracking-widest sm:hidden">Neural Link: Elite</span>
            </div>
            <div className="flex items-center gap-4">
               <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/10 rounded-lg max-w-[200px] sm:max-w-[400px] overflow-hidden">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                 <span className="text-[9px] font-black text-white uppercase truncate">
                   {isGeneratingIdea ? 'Doctorian Ai Thinking...' : operationalIdea || 'Operational Strategy Live'}
                 </span>
               </div>
               <button 
                 onClick={fetchOperationalIdea}
                 disabled={isGeneratingIdea}
                 className="text-[10px] font-black text-white underline underline-offset-4 decoration-white/30 hover:decoration-white transition-all uppercase disabled:opacity-50"
               >
                 {isGeneratingIdea ? 'Thinking...' : 'Generate Elite Idea'}
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {user?.subscriptionStatus === 'pending' && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-600 p-3 sm:px-8 flex items-center justify-center gap-4 border-b border-blue-500/30 shrink-0"
          >
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin text-white" size={16} />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Neural Calibration Pending - Payment Evidence Delivered to Akora Joseph</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Dynamic Header */}
      <div className="px-6 py-6 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shrink-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Brain size={200} className="text-blue-500" />
        </div>
        
        <div className="relative z-10 flex items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-3">
             <div 
               className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-xl sm:rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-500/20 ring-2 sm:ring-4 ring-white/10"
             >
               <Bot className="text-white" size={24} />
             </div>
             <div>
               <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                 <h1 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tighter">Doctorian <span style={{ textDecorationLine: 'none', fontWeight: 'bold', textAlign: 'left', color: '#d01dc3', fontStyle: 'normal', fontFamily: 'Arial' }}>AI</span></h1>
                 <span className="px-1.5 py-0.5 bg-blue-500 text-[6px] sm:text-[8px] font-black text-white rounded-md uppercase tracking-widest leading-none">Nexus v4.2</span>
               </div>
               <div className="flex items-center gap-2 sm:gap-3">
                 <div className="flex items-center gap-1">
                   <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[8px] sm:text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
                 </div>
               </div>
             </div>
          </div>
        </div>

          <div className="relative z-10 flex p-2 bg-slate-800/90 backdrop-blur-md rounded-2xl border border-white/10 w-full sm:w-auto">
          <button 
            onClick={() => setActiveTab('chat')}
            className={`flex-1 sm:flex-none px-5 sm:px-8 py-3 sm:py-3 rounded-xl text-[11px] sm:text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'chat' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/40' : 'text-slate-400 hover:text-white'}`}
          >
            <MessageSquare size={16} className="shrink-0" /> Support
          </button>
          <button 
            onClick={() => setActiveTab('lab')}
            className={`flex-1 sm:flex-none px-5 sm:px-8 py-3 sm:py-3 rounded-xl text-[11px] sm:text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'lab' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/40' : 'text-slate-400 hover:text-white'}`}
          >
            <Compass size={16} className="shrink-0" /> Lab Suite
          </button>
        </div>

        <button 
          onClick={() => setShowFeedbackModal(true)}
          className="relative z-10 hidden md:flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-blue-600/20 text-slate-400 hover:text-blue-400 border border-white/5 rounded-xl transition-all"
        >
          <MessageSquarePlus size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">Feedback</span>
        </button>
      </div>

      <div className="flex-1 relative bg-slate-50 dark:bg-slate-950">
        <AnimatePresence mode="wait">
          {activeTab === 'chat' ? (
            <motion.div 
              key="chat"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col xl:flex-row h-full min-h-0"
            >
              <div className="flex-1 min-h-[60vh] xl:min-h-0 h-full">
                <ChatInterface user={user} isExploreView={true} onMessageSent={() => {}} />
              </div>
              
              {/* Context Panel - Visible on Large Screens, and scrollable content on small */}
              <div className="flex w-full xl:w-72 shrink-0 border-t xl:border-t-0 xl:border-l border-slate-100 dark:border-slate-800 flex-col bg-white dark:bg-slate-900 p-6 sm:p-8 xl:overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Session Metadata</h4>
                  <RefreshCw size={12} className="text-slate-400 animate-spin-slow" />
                </div>
                
                <div className="space-y-10">
                  <div className="p-6 bg-slate-900 rounded-3xl text-white relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                        <Cpu size={60} />
                     </div>
                     <h5 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-3">Live Bio-Feed</h5>
                     <p className="text-xs font-bold text-slate-300 leading-relaxed italic">
                       "Cognis Engine is monitoring your physiological state. Diagnostic confidence remains optimal at {stats.confidence.toFixed(1)}%."
                     </p>
                  </div>

                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Protocols</h5>
                    <div className="space-y-2">
                       {[
                         { name: 'Anatomical Mapping', icon: <Globe size={12} /> },
                         { name: 'Bioluminescence Filter', icon: <Sparkles size={12} /> },
                         { name: 'Pathogen Scan', icon: <ShieldCheck size={12} /> }
                       ].map((p, i) => (
                         <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-blue-500/50 transition-all cursor-pointer group">
                            <div className="flex items-center gap-2">
                              <div className="text-blue-500 opacity-50 group-hover:opacity-100 transition-opacity">{p.icon}</div>
                              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{p.name}</span>
                            </div>
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                         </div>
                       ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="p-5 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 rounded-3xl border border-blue-500/20">
                       {user?.subscriptionTier === 'gold' ? <Crown size={20} className="text-amber-500 mb-3" /> : <Zap size={20} className="text-blue-500 mb-3" />}
                       <h5 className="text-[10px] font-black text-slate-900 dark:text-white uppercase mb-2">
                         {user?.subscriptionTier === 'free' ? 'Upgrade to Pro' : 'Premium Neural Link'}
                       </h5>
                       <p className="text-[10px] text-slate-500 font-bold leading-relaxed mb-4">
                         {user?.subscriptionTier === 'free' ? 'Access deep neural simulation and priority diagnostic queues.' : 'Your neural interface is optimized for maximum performance.'}
                       </p>
                       <button 
                         onClick={() => setShowUpgradeModal(true)}
                         disabled={user?.subscriptionStatus === 'pending'}
                         className={`w-full py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg ${
                            user?.subscriptionStatus === 'pending'
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                            : 'bg-slate-900 dark:bg-blue-600 text-white hover:shadow-blue-500/25'
                         }`}
                       >
                         {user?.subscriptionStatus === 'pending' ? 'Verification Pending' : user?.subscriptionTier === 'free' ? 'Enable Pro Flow' : 'Manage Subscription'}
                       </button>
                    </div>
                  </div>

                  <div className="p-5 bg-rose-50 dark:bg-rose-900/10 rounded-3xl border border-rose-100 dark:border-rose-900/30">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center text-rose-600">
                        <Stethoscope size={16} />
                      </div>
                      <h5 className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">Medical Support</h5>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed mb-4">Are you experiencing an emergency? Instant triage is always active.</p>
                    <button 
                      onClick={() => onNavigate?.('symptoms')}
                      className="w-full py-2.5 bg-rose-600 text-white rounded-xl text-[8px] font-black uppercase tracking-[0.2em] hover:bg-rose-700 transition-all flex items-center justify-center gap-2"
                    >
                      Emergency Triage
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="lab"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full overflow-y-auto p-5 sm:p-12 md:p-20 custom-scrollbar"
            >
              <div className="max-w-6xl mx-auto">
                <div className="mb-10 sm:mb-12">
                   <h2 className="text-[11px] sm:text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-4 text-high-visibility">Neural Infrastructure</h2>
                   <h3 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-tight sm:leading-none">Diagnostic Intelligence <span className="text-slate-400 font-medium">Suite</span></h3>
                   <p className="text-slate-500 dark:text-slate-400 mt-4 text-base sm:text-lg font-bold max-w-2xl leading-relaxed">Access specialized clinical modules for deep anatomical mapping and predictive health modeling.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-6">
                  {quickTools.map((tool, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (tool.view === 'visualizer') setShowVisualizer(true);
                        else if (tool.view === 'voicecall') setShowVoiceCall(true);
                        else if (tool.view === 'summary') setShowNeuralSummary(true);
                        else if (onNavigate) onNavigate(tool.view);
                      }}
                      className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] sm:rounded-[2.5rem] hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all text-left group relative overflow-hidden"
                    >
                      <div className={`absolute -right-4 -top-4 w-24 h-24 ${tool.bg} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                      
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 ${tool.bg} ${tool.color} rounded-xl sm:rounded-2xl flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform relative z-10`}>
                        {React.cloneElement(tool.icon as any, { size: 24 })}
                      </div>
                      
                      <div className="relative z-10">
                        <h5 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2 flex items-center justify-between text-high-visibility">
                          {tool.label}
                          <ChevronRight size={20} className="sm:size-18 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all" />
                        </h5>
                        <p className="text-[12px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed uppercase tracking-wide">{tool.description}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-20 p-12 bg-slate-900 rounded-[3.5rem] text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-12 opacity-10">
                    <Sparkles size={200} className="text-blue-500" />
                  </div>
                  <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                      <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-4">Integrated Bio-Stream</h4>
                      <h5 className="text-3xl font-black text-white tracking-tight uppercase leading-tight mb-6">Autonomous Diagnostic Synchronization</h5>
                      <p className="text-slate-400 font-bold leading-relaxed mb-8">Doctorian AI maintains a persistent background link with your wearable biometric devices, providing automated triage and real-time stress synthesis without manual intervention.</p>
                      <div className="flex gap-4">
                        <div className="flex flex-col">
                           <span className="text-2xl font-black text-blue-500">{stats.users.toLocaleString()}+</span>
                           <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Active Users Supported</span>
                        </div>
                        <div className="w-px h-8 bg-slate-800 self-center" />
                        <div className="flex flex-col">
                           <span className="text-2xl font-black text-emerald-500">99.9%</span>
                           <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">System Uptime</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem]">
                       <div className="space-y-6">
                          <div className="flex items-center justify-between">
                             <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Diagnostic Confidence</span>
                             <span className="text-xs font-black text-blue-400">OPTIMAL</span>
                          </div>
                          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                             <div className="w-[98%] h-full bg-blue-600 rounded-full" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3">
                                <Server size={14} className="text-slate-500" />
                                <div>
                                  <p className="text-[8px] font-black uppercase text-slate-500 mb-1">Latency</p>
                                  <p className="text-sm font-black">{stats.latency}ms</p>
                                </div>
                             </div>
                             <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3">
                                <Database size={14} className="text-slate-500" />
                                <div>
                                  <p className="text-[8px] font-black uppercase text-slate-500 mb-1">Threads</p>
                                  <p className="text-sm font-black">{stats.threads.toLocaleString()}</p>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showUpgradeModal && (
          <UpgradeModal 
            user={user} 
            onClose={() => setShowUpgradeModal(false)} 
            onUpdate={(u) => {
              onUpdate?.(u);
              setShowUpgradeModal(false);
            }} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showVisualizer && (
          <NeuralVisualizer onClose={() => setShowVisualizer(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showVoiceCall && (
          <NeuralVoiceCall user={user} onClose={() => setShowVoiceCall(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNeuralSummary && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNeuralSummary(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
              <NeuralHealthSummary 
                vitals={null} 
                history={[]} 
                onClose={() => setShowNeuralSummary(false)} 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Feedback Modal */}
      <AnimatePresence>
        {showFeedbackModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setShowFeedbackModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
            >
              <div className="p-8 sm:p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                      <MessageSquarePlus size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">System Refinement</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contribute to the Nexus Intelligence Loop</p>
                    </div>
                  </div>
                  <button 
                    disabled={isSubmitting}
                    onClick={() => setShowFeedbackModal(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {submitSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                      <Sparkles size={40} className="animate-pulse" />
                    </div>
                    <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Feedback Synchronized</h4>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Your insights have been successfully indexed by the Doctorian AI core.</p>
                  </motion.div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex gap-2">
                      {['suggestion', 'bug', 'praise'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setFeedbackType(type as any)}
                          className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                            feedbackType === type 
                              ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                              : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-2">
                       <textarea 
                         value={feedbackText}
                         onChange={(e) => setFeedbackText(e.target.value)}
                         placeholder="How can we improve the Doctorian AI experience? Share your thoughts on features, UI, or general AI accuracy..."
                         className="w-full h-40 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all resize-none"
                       />
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-right">Encrypted Transmission Enabled</p>
                    </div>

                    <button 
                      onClick={handlePlatformFeedback}
                      disabled={!feedbackText.trim() || isSubmitting}
                      className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-600/30 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw size={18} className="animate-spin" />
                          Indexing Insights...
                        </>
                      ) : (
                        <>
                          Integrate Feedback <Send size={14} />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const ClipboardList: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = "" }) => (
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
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M12 11h4" />
    <path d="M12 16h4" />
    <path d="M8 11h.01" />
    <path d="M8 16h.01" />
  </svg>
);
