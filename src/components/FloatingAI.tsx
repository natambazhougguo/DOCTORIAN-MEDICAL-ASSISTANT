import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, X, Sparkles, Send, Brain, MessageSquare, 
  Zap, Fingerprint, Layers, Maximize2, Minimize2,
  Stethoscope, Activity, FileText, Search, UserPlus,
  Compass, ShieldCheck, Cpu
} from 'lucide-react';
import { ChatInterface } from './ChatInterface';

interface FloatingAIProps {
  user?: any;
  currentView?: string;
  onNavigate?: (view: any) => void;
}

export function FloatingAI({ user, currentView, onNavigate }: FloatingAIProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'tools'>('tools');

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setActiveTab('tools');
  };

  const quickTools = [
    { label: 'Diagnostic Lab', icon: <Stethoscope size={18} />, view: 'symptoms', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Bio-Monitor', icon: <Activity size={18} />, view: 'monitor', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
    { label: 'Clinical Vault', icon: <FileText size={18} />, view: 'records', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Specialists', icon: <UserPlus size={18} />, view: 'specialist', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'CognisHub', icon: <Brain size={18} />, view: 'neuro', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { label: 'Global Search', icon: <Search size={18} />, view: 'home', color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-800' },
  ];

  return (
    <div className={`fixed z-[120] transition-all duration-500 ${isMaximized && isOpen ? 'inset-4 sm:inset-10' : 'bottom-24 right-4 sm:bottom-10 sm:right-10'}`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50, transformOrigin: 'bottom right' }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              width: isMaximized ? '100%' : undefined,
              height: isMaximized ? '100%' : undefined,
              borderRadius: isMaximized ? '2rem' : '2.5rem'
            }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className={`absolute bottom-0 right-0 bg-white dark:bg-slate-900 shadow-[0_30px_100px_rgba(0,0,0,0.2)] dark:shadow-[0_30px_100px_rgba(0,0,0,0.5)] border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col z-50 transition-all duration-500 ${
              isMaximized 
                ? 'w-full h-full' 
                : 'w-[calc(100vw-2rem)] sm:w-[450px] h-[70vh] max-h-[800px] min-h-[500px]'
            }`}
          >
            {/* Header */}
            <div className="bg-slate-950 p-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Bot className="text-white" size={24} />
                </div>
                <div>
                   <h3 className="text-white font-black text-sm uppercase tracking-tighter">Doctorian Core <span className="text-blue-500 italic">v4.0</span></h3>
                   <div className="flex items-center gap-2 mt-0.5">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Link Synchronized</span>
                   </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="p-2.5 hover:bg-white/10 rounded-xl text-slate-400 transition-colors hover:text-white hidden sm:block"
                >
                  {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
                <button 
                  onClick={toggleChat}
                  className="p-2.5 hover:bg-rose-500/10 rounded-xl text-slate-400 transition-colors hover:text-rose-500"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* View Switcher */}
            <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800/50 mx-6 mt-4 rounded-2xl border border-slate-200 dark:border-slate-800">
               <button 
                 onClick={() => setActiveTab('tools')}
                 className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'tools' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 <Compass size={14} /> Intelligence
               </button>
               <button 
                 onClick={() => setActiveTab('chat')}
                 className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'chat' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 <MessageSquare size={14} /> AI Support
               </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden relative">
              <AnimatePresence mode="wait">
                {activeTab === 'tools' ? (
                  <motion.div 
                    key="tools"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="h-full overflow-y-auto p-6 md:p-8 custom-scrollbar"
                  >
                    <div className="mb-8">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Precision Suite</h4>
                       <div className="grid grid-cols-2 gap-4">
                          {quickTools.map((tool, i) => (
                             <button
                               key={i}
                               onClick={() => {
                                 if (onNavigate) onNavigate(tool.view);
                                 setIsOpen(false);
                               }}
                               className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 transition-all text-left group"
                             >
                                <div className={`w-10 h-10 ${tool.bg} ${tool.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                   {tool.icon}
                                </div>
                                <h5 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{tool.label}</h5>
                                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Launch Module</p>
                             </button>
                          ))}
                       </div>
                    </div>

                    <div className="p-6 bg-slate-900 rounded-[2rem] text-white relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                          <Cpu size={80} />
                       </div>
                       <h5 className="text-xs font-black uppercase tracking-widest text-blue-400 mb-2">Automated Insight</h5>
                       <p className="text-sm font-bold text-slate-300 leading-relaxed italic">
                         "Synthesizing your 24h bio-markers... Diagnostic confidence at 98.4%. No immediate triage required."
                       </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="chat"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="h-full"
                  >
                    <ChatInterface user={user} isExploreView={isMaximized} onMessageSent={() => {}} forcedPersona="support" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-blue-600" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Enterprise Privacy Active</span>
               </div>
               <div className="flex items-center gap-3">
                  <div className="h-1 w-8 bg-slate-200 dark:bg-slate-800 rounded-full" />
                  <span className="text-[9px] font-black text-slate-300">DOCTORIAN P8-V9</span>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Toggle Button */}
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleChat}
          className={`relative group h-16 w-16 sm:h-20 sm:w-20 bg-slate-950 rounded-3xl flex items-center justify-center shadow-[0_25px_60px_rgba(0,0,0,0.3)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.5)] transition-all overflow-hidden border-4 border-white dark:border-slate-800`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={isOpen ? 'close' : 'open'}
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              {isOpen ? <X className="text-white" size={32} /> : <Bot className="text-white" size={32} />}
            </motion.div>
          </AnimatePresence>

          {!isOpen && (
            <div className="absolute top-3 right-3 flex gap-0.5">
               <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            </div>
          )}
        </motion.button>
      </div>
    </div>
  );
}
