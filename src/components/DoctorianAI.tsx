import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, Sparkles, Brain, MessageSquare, 
  Stethoscope, Activity, FileText, Search, UserPlus,
  Compass, ShieldCheck, Cpu, ChevronRight, Zap, RefreshCw,
  Globe, Database, Server, MessageSquarePlus, X, Send
} from 'lucide-react';
import { ChatInterface } from './ChatInterface';
import { api } from '../api';

interface DoctorianAIProps {
  user?: any;
  onNavigate?: (view: any) => void;
}

export function DoctorianAI({ user, onNavigate }: DoctorianAIProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'lab'>('chat');
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

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        latency: Math.max(8, Math.min(25, prev.latency + (Math.random() > 0.5 ? 1 : -1))),
        threads: Math.max(4500, Math.min(5200, prev.threads + Math.floor(Math.random() * 20 - 10))),
        users: prev.users + Math.floor(Math.random() * 5),
        confidence: Math.max(97.0, Math.min(99.9, prev.confidence + (Math.random() > 0.5 ? 0.1 : -0.1)))
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const quickTools = [
    { label: 'Diagnostic Lab', description: 'Deep symptom mapping and pathology analysis', icon: <Stethoscope size={24} />, view: 'symptoms', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Bio-Monitor', description: 'Real-time physiological stream integration', icon: <Activity size={24} />, view: 'monitor', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
    { label: 'Clinical Vault', description: 'Secure blockchain-backed health records', icon: <FileText size={24} />, view: 'records', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Specialists', description: 'Direct link to authorized clinical networks', icon: <UserPlus size={24} />, view: 'specialist', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'CognisHub', description: 'Neural performance and cognitive metrics', icon: <Brain size={24} />, view: 'neuro', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { label: 'Deep Search', description: 'Global clinical database synchronization', icon: <Search size={24} />, view: 'home', color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-800' },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden mb-12 transition-all">
      {/* Dynamic Header */}
      <div className="px-6 py-8 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shrink-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Brain size={200} className="text-blue-500" />
        </div>
        
        <div className="relative z-10 flex items-center gap-6">
          <button 
            onClick={() => onNavigate?.('home')}
            className="w-16 h-16 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-500/20 ring-4 ring-white/10 hover:scale-110 active:scale-95 transition-all"
          >
            <Bot className="text-white" size={32} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Doctorian <span className="text-blue-500">AI</span></h1>
              <span className="px-2 py-0.5 bg-blue-500 text-[8px] font-black text-white rounded-md uppercase tracking-widest leading-none">Nexus v4.2</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Neural Stream Active</span>
              </div>
              <div className="w-px h-3 bg-slate-700" />
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-blue-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantum Encryption Stable</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex p-1.5 bg-slate-800/80 backdrop-blur-md rounded-2xl border border-white/5 w-full sm:w-auto">
          <button 
            onClick={() => setActiveTab('chat')}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'chat' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/40' : 'text-slate-400 hover:text-white'}`}
          >
            <MessageSquare size={14} /> AI Support
          </button>
          <button 
            onClick={() => setActiveTab('lab')}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'lab' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/40' : 'text-slate-400 hover:text-white'}`}
          >
            <Compass size={14} /> Precision Lab
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
              <div className="flex w-full xl:w-80 shrink-0 border-t xl:border-t-0 xl:border-l border-slate-100 dark:border-slate-800 flex-col bg-white dark:bg-slate-900 p-6 sm:p-8 xl:overflow-y-auto custom-scrollbar">
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
                       <Zap size={20} className="text-blue-500 mb-3" />
                       <h5 className="text-[10px] font-black text-slate-900 dark:text-white uppercase mb-2">Upgrade to Pro</h5>
                       <p className="text-[10px] text-slate-500 font-bold leading-relaxed mb-4">Access deep neural simulation and priority diagnostic queues.</p>
                       <button className="w-full py-3 bg-slate-900 dark:bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-blue-500/25">Enable Pro Flow</button>
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
              className="h-full overflow-y-auto p-6 sm:p-12 md:p-20 custom-scrollbar"
            >
              <div className="max-w-6xl mx-auto">
                <div className="mb-12">
                   <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-4">Neural Infrastructure</h2>
                   <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Diagnostic Intelligence <span className="text-slate-400 font-medium">Suite</span></h3>
                   <p className="text-slate-500 dark:text-slate-400 mt-4 text-lg font-medium max-w-2xl">Access individual modules for specialized medical analysis, biological monitoring, and predictive clinical modeling.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {quickTools.map((tool, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (onNavigate) onNavigate(tool.view);
                      }}
                      className="p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all text-left group relative overflow-hidden"
                    >
                      <div className={`absolute -right-4 -top-4 w-24 h-24 ${tool.bg} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                      
                      <div className={`w-14 h-14 ${tool.bg} ${tool.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform relative z-10`}>
                        {tool.icon}
                      </div>
                      
                      <div className="relative z-10">
                        <h5 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2 flex items-center justify-between">
                          {tool.label}
                          <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all" />
                        </h5>
                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed uppercase tracking-wide">{tool.description}</p>
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
