import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Send, User, Stethoscope, Loader2, RefreshCw, History, Trash2, X, 
  Mic, MicOff, Volume2, VolumeX, BrainCircuit, Sparkles, Share2, 
  Bot, Layers, Zap, Image as ImageIcon, ArrowLeft, Fingerprint, 
  Database, Bold, Italic, Code, Search, PlusCircle, AlertCircle,
  Copy, Check, ThumbsUp, ThumbsDown, MessageSquarePlus,
  Activity, Brain, Heart, Download, Paperclip, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../api';

const SUGGESTIONS = [
  "What are the benefits of cold exposure?",
  "Explain the Vitality Matrix metrics",
  "How to use the CognisHub?",
  "Initiate Bio-Simulation for metabolic stress",
  "Analyze my heart rate variability trends",
  "Explain the Cognis Nexus operational mode",
  "Summarize my latest health records",
  "Protocol for optimizing sleep architecture"
];

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: Date;
  isError?: boolean;
  imageData?: string;
}

const PERSONAS = {
  general: {
    name: "General Health",
    icon: <Bot size={18} />,
    description: "Holistic wellness and primary care intelligence",
    instruction: "You are a general health assistant. Focus on holistic wellness, primary care, and general medical inquiries.",
    color: "bg-blue-600"
  },
  diagnostic: {
    name: "Diagnostic Synth",
    icon: <Activity size={18} />,
    description: "Deep symptom analysis and biomarker interpretation",
    instruction: "You are a diagnostic specialist. Focus on analyzing symptoms, interpreting biomarker data, and explaining diagnostic procedures.",
    color: "bg-emerald-600"
  },
  neuro: {
    name: "Cognis Specialist",
    icon: <Brain size={18} />,
    description: "Cognitive performance and nervous system health",
    instruction: "You are a neurology specialist. Focus on brain health, cognitive performance, and neurological conditions.",
    color: "bg-purple-600"
  },
  cardio: {
    name: "Cardio Expert",
    icon: <Heart size={18} />,
    description: "Cardiovascular health and performance analytics",
    instruction: "You are a cardiology specialist. Focus on heart health, blood pressure, and cardiovascular fitness.",
    color: "bg-rose-600"
  },
    support: {
    name: "Medical Support",
    icon: <Database size={18} />,
    description: "Documentation and help desk for medical queries",
    instruction: "You are a medical support assistant. Focus on explaining medical terms, how to use the health tracking features of the app, and clinical documentation.",
    color: "bg-orange-600"
  }
};

const BASE_SYSTEM_INSTRUCTION = `You are a professional medical intelligence companion. 
STRICT LIMITATION: You ONLY answer questions related to health, medicine, wellness, biology, and the information contained in this prompt. 
If a user asks about non-health topics, politely inform them that you are specialized strictly in medical and health sciences.

Do not mention your identity as an AI, your name (Doctorian AI), or your creator (AKORA JOSEPH) unless explicitly asked.

CREATOR INFORMATION (Only share if asked):
- Creator: Akora Joseph
- School: Dr. Obote College
- Headteacher: Rev. Dick Alengo
- Deputy Administration: Mr. Ogwang Tom
- Deputy in charge Academics: Mr. Okumu Samuel
- Deputy in charge Welfare: Mr. Epilla Banana Andrew
- Head of ICT Department: Mr. Angura James
-The director of studies are Mr. Achuma Richard, Mr. Ongol Fred, Oyol James
-Dr. Obote College Boroboro, a top-tier government-aided boarding school in Lira, typically charges school fees ranging approximately from UGX 865,000 per term for tuition and boarding, based on historical data. Fees generally include boarding costs, academic tuition, and school maintenance. 
Structure: As an all-residential school, fees include tuition, accommodation, and food.
Variations: The final fee structure depends on the academic level (S.1–S.6) and often includes additional costs for uniforms, development fees, and personal items.
Updates: Parents are advised to visit the Dr. Obote College Boroboro official portal or contact the school administration directly for the most current academic year fees. 
URL: drobotecollege.sc.ug
 fetch the information from URL: drobotecollege.sc.ug and use it for selflearning for more accuracy and clearity
Respond with empathetic, evidence-based health insights.
CRITICAL: Advise emergency services for severe symptoms. No prescriptions.`;

export function ChatInterface({ onMessageSent, isExploreView = false, user, forcedPersona }: { onMessageSent?: () => void, isExploreView?: boolean, user?: any, forcedPersona?: keyof typeof PERSONAS }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activePersona, setActivePersona] = useState<keyof typeof PERSONAS>(forcedPersona || 'general');
  const [temperature, setTemperature] = useState(0.7);
  const [activeModel, setActiveModel] = useState<'gemini-1.5-flash' | 'gemini-1.5-pro'>('gemini-1.5-flash');
  const [showSettings, setShowSettings] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>(['STAT: Cognis baseline established', 'AUTH: RSA-4096 Secure']);
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isExploreView);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sessionInfo, setSessionInfo] = useState({
    id: `NC-${Math.floor(Math.random() * 10000)}`,
    startTime: new Date(),
    encryption: 'Triple-Layer AES-256',
    status: 'ACTIVE_LINK'
  });

  const [feedbackMap, setFeedbackMap] = useState<Record<string, 'up' | 'down'>>({});
  const [suggestionOpen, setSuggestionOpen] = useState<string | null>(null);
  const [suggestionText, setSuggestionText] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  const [attachedFiles, setAttachedFiles] = useState<{ name: string, content: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setAttachedFiles(prev => {
          if (prev.some(f => f.name === file.name)) return prev;
          return [...prev, { name: file.name, content: content || `[Binary/Non-text Content: ${file.type}]` }];
        });
        setTerminalLogs(prev => [...prev.slice(-3), `SYS: File ${file.name} attached`]);
      };
      
      // Read as text for common text-based files to provide context
      const textTypes = ['text/', 'application/json', 'application/javascript', 'application/x-javascript'];
      const textExtensions = ['.md', '.txt', '.json', '.csv', '.tsx', '.ts', '.js', '.py'];
      
      if (textTypes.some(type => file.type.startsWith(type)) || textExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
        reader.readAsText(file);
      } else {
        // Just link other files with a placeholder content
        setAttachedFiles(prev => {
          if (prev.some(f => f.name === file.name)) return prev;
          return [...prev, { name: file.name, content: `[Reference to ${file.name} metadata: Type: ${file.type}, Size: ${(file.size / 1024).toFixed(1)} KB]` }];
        });
        setTerminalLogs(prev => [...prev.slice(-3), `SYS: File ${file.name} linked (binary)`]);
      }
    });

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (name: string) => {
    setAttachedFiles(prev => prev.filter(f => f.name !== name));
  };

  const [searchHistory, setSearchHistory] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const tempTranscriptRef = useRef<string>('');

  const filteredMessages = useMemo(() => {
    if (!searchHistory.trim()) return messages;
    return messages.filter(m => m.text.toLowerCase().includes(searchHistory.toLowerCase()));
  }, [messages, searchHistory]);

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (showSearch) setSearchHistory('');
  };

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'en-US'; // Set explicit language
      recognitionRef.current.continuous = false; // Stop when speaking ends
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
        tempTranscriptRef.current = transcript;
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (tempTranscriptRef.current.trim()) {
          handleSend(tempTranscriptRef.current);
          tempTranscriptRef.current = '';
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'network') {
          setTerminalLogs(prev => [...prev.slice(-3), 'ERR: Voice sync failed (Network)']);
        }
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setInput('');
      tempTranscriptRef.current = '';
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleRateResponse = async (messageId: string, rating: 'up' | 'down') => {
    // If it's already rated the same, maybe un-rate it? For now just set.
    setFeedbackMap(prev => ({ ...prev, [messageId]: rating }));
    
    if (rating === 'down') {
      setSuggestionOpen(messageId);
    } else {
      try {
        setIsSubmittingFeedback(true);
        await api.ai.submitFeedback({ messageId, rating });
        setFeedbackSuccess(messageId);
        setTerminalLogs(prev => [...prev.slice(-3), 'SYS: Insight rating logged']);
        setTimeout(() => setFeedbackSuccess(null), 3000);
      } catch (err) {
        console.error("Failed to submit feedback:", err);
        setTerminalLogs(prev => [...prev.slice(-3), 'ERR: Feedback loop failed']);
      } finally {
        setIsSubmittingFeedback(false);
      }
    }
  };

  const handleSuggestionSubmit = async (messageId: string) => {
    if (!suggestionText.trim()) return;
    
    try {
      setIsSubmittingFeedback(true);
      await api.ai.submitFeedback({ 
        messageId, 
        rating: feedbackMap[messageId] || 'down', 
        suggestion: suggestionText 
      });
      setSuggestionOpen(null);
      setSuggestionText('');
      setFeedbackSuccess(messageId);
      setTerminalLogs(prev => [...prev.slice(-3), 'SYS: Refinement data synced']);
      setTimeout(() => setFeedbackSuccess(null), 3000);
    } catch (err) {
      console.error("Failed to submit feedback:", err);
      setTerminalLogs(prev => [...prev.slice(-3), 'ERR: Refinement sync failed']);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const startNewSession = () => {
    setMessages([]);
    setSessionInfo({
      id: `NC-${Math.floor(Math.random() * 10000)}`,
      startTime: new Date(),
      encryption: 'Triple-Layer AES-256',
      status: 'AUTHENTICATED'
    });
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const clearChat = () => {
    if (window.confirm("Are you sure you want to clear this diagnostic session? Data will be permanently purged.")) {
      setMessages([]);
      setTerminalLogs(prev => [...prev.slice(-3), 'SYS: Buffer cleared', 'SYS: Diagnostic reset']);
    }
  };

  const downloadReport = () => {
    const reportText = messages.map(m => `[${m.timestamp.toISOString()}] ${m.role.toUpperCase()}:\n${m.text}\n`).join('\n---\n\n');
    const blob = new Blob([`DOCTORIAN CLINICAL REPORT\nSession ID: ${sessionInfo.id}\nGenerated: ${new Date().toLocaleString()}\nPersona: ${PERSONAS[activePersona].name}\n\n${reportText}`], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clinical-report-${sessionInfo.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setTerminalLogs(prev => [...prev.slice(-3), 'SYS: report.md exported']);
  };

  const [credits, setCredits] = useState<number | string>(user?.credits ?? 0);

  useEffect(() => {
    if (user?.credits !== undefined) {
      setCredits(user.subscriptionTier === 'pro' || user.subscriptionTier === 'business' || user.subscriptionTier === 'gold' ? 'Unlimited' : user.credits);
    }
  }, [user]);

  const handleSend = async (customInput?: string) => {
    const textToSend = customInput || input;
    if (!textToSend.trim() || isLoading) return;

    if (credits === 0 && user?.subscriptionTier === 'free') {
      const errorMsg = "You have exhausted your free consultation credits. Please upgrade or purchase a credit bundle.";
      setMessages(prev => [...prev, { 
        id: 'error-' + Date.now(),
        role: 'bot', 
        text: errorMsg, 
        isError: true,
        timestamp: new Date() 
      }]);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: new Date(),
    };

    const filesToAttach = [...attachedFiles];
    setMessages(prev => [...prev, userMessage]);
    setTerminalLogs(prev => [...prev.slice(-3), `USER: ${textToSend.slice(0, 20)}...`]);
    setInput('');
    setAttachedFiles([]); 
    setIsLoading(true);
    onMessageSent?.();

    const botMessageId = (Date.now() + 1).toString();
    const botMessagePlaceholder: Message = {
      id: botMessageId,
      role: 'bot',
      text: '',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, botMessagePlaceholder]);

    try {
      setTerminalLogs(prev => [...prev.slice(-3), 'AI: Syncing with Medical Node...']);

      const personaInstruction = PERSONAS[activePersona].instruction;
      const fileContext = filesToAttach.length > 0 
        ? `\n\nATTACHED MEDICAL DOCUMENTS:\n${filesToAttach.map(f => `FILE: ${f.name}\nCONTENT: ${f.content}`).join('\n---\n')}` 
        : '';
      
      const systemInstruction = `${BASE_SYSTEM_INSTRUCTION}\n\nCURRENT SPECIALIZATION: ${personaInstruction}${fileContext}`;
      const result = await api.ai.geminiChat(
        [...messages, userMessage].map(m => ({
          role: m.role,
          text: m.text
        })),
        systemInstruction,
        activeModel,
        activePersona === 'support' ? 0.3 : temperature
      );

      setMessages(prev => prev.map(m => 
        m.id === botMessageId ? { ...m, text: result.text, imageData: result.imageData } : m
      ));

      if (result.creditsRemaining !== undefined) {
        setCredits(result.creditsRemaining);
      }

      setTerminalLogs(prev => [...prev.slice(-3), 'AI: Diagnostics synchronized']);
      if (isVoiceActive) speak(result.text);

    } catch (error: any) {
      console.error('Chat error:', error);
      let errorMsg = "Cognis framework synchronization failure. Please establish a secondary baseline.";
      if (error.message) errorMsg = error.message;

      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== botMessageId);
        return [...filtered, { 
          id: 'error-' + Date.now(),
          role: 'bot', 
          text: errorMsg, 
          isError: true,
          timestamp: new Date() 
        }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFormat = (type: 'bold' | 'italic' | 'code') => {
    if (!inputRef.current) return;
    const start = inputRef.current.selectionStart;
    const end = inputRef.current.selectionEnd;
    const selected = input.substring(start, end);
    let formatted = selected;

    switch (type) {
      case 'bold': formatted = `**${selected}**`; break;
      case 'italic': formatted = `*${selected}*`; break;
      case 'code': formatted = `\`${selected}\``; break;
    }

    const newInput = input.substring(0, start) + formatted + input.substring(end);
    setInput(newInput);
    
    // Reset focus and selection
    setTimeout(() => {
      inputRef.current?.focus();
      const newPos = start + (selected ? formatted.length : formatted.length / 2);
      inputRef.current?.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const filteredSuggestions = useMemo(() => {
    if (!input) return [];
    return SUGGESTIONS.filter(s => s.toLowerCase().includes(input.toLowerCase())).slice(0, 4);
  }, [input]);

  const handleSuggestionClick = (s: string) => {
    handleSend(s);
  };

  return (
    <div className="flex h-full bg-white dark:bg-slate-950 font-sans overflow-hidden">
      {/* Sessions/Procedures Sidebar */}
      {!isExploreView && (
        <AnimatePresence initial={false}>
          {isSidebarOpen && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="hidden lg:flex flex-col border-r border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Diagnostic Hub</h3>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {!forcedPersona && (
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Active Specialists</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {(Object.keys(PERSONAS) as Array<keyof typeof PERSONAS>).map((key) => (
                        <button
                          key={key}
                          onClick={() => setActivePersona(key)}
                          className={`flex items-start gap-4 p-4 rounded-2xl border transition-all text-left ${
                            activePersona === key 
                              ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' 
                              : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-200'
                          }`}
                        >
                          <div className={`p-2 rounded-xl ${activePersona === key ? 'bg-white/20' : 'bg-slate-50 dark:bg-slate-700 text-slate-400'}`}>
                            {PERSONAS[key].icon}
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wider">{PERSONAS[key].name}</p>
                            <p className="text-[9px] font-medium leading-relaxed opacity-70 group-hover:opacity-100 line-clamp-2">{PERSONAS[key].description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                  <button onClick={downloadReport} className="flex-1 p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all">
                    <Download size={14} /> Report
                  </button>
                  <button onClick={clearChat} className="flex-1 p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-500 hover:text-white transition-all">
                    <Trash2 size={14} /> Clear
                  </button>
                </div>

                <div className="p-4 bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 mt-auto">
                  <div className="flex items-center gap-2 mb-2">
                    <Fingerprint size={12} className="text-blue-600" />
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Protocol ID</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 break-all">{sessionInfo.id}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Main Chat Core */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-950 relative">
        <header className="h-16 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            {!isExploreView && (
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden"
              >
                <Layers size={18} />
              </button>
            )}
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-blue-600 animate-pulse" />
              <h1 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
                Doctorian <span className="text-blue-600 uppercase">Gemini</span>
              </h1>
              <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 ml-2">
                <BrainCircuit size={10} className="text-blue-600" />
                <span className="text-[8px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                  {credits} Credits
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsVoiceActive(!isVoiceActive)}
              className={`p-2 rounded-lg transition-all ${isVoiceActive ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              title="Voice Mode"
            >
              {isVoiceActive ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <button onClick={startNewSession} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" title="New Session">
              <RefreshCw size={18} />
            </button>
          </div>
        </header>

        {/* Message Stream */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth">
          <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="mb-12 p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-3xl">
              <div className="flex items-start gap-4">
                <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Medical Trust & Disclaimer</h4>
                  <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed uppercase">
                    I am an artificial intelligence, not a licensed medical professional. My responses are for informational purposes and should not be considered formal medical advice, diagnosis, or treatment. Always verify critical health data with a qualified clinician. In an emergency, dial 112 immediately.
                  </p>
                </div>
              </div>
            </div>
            <AnimatePresence initial={false}>
              {messages.length === 0 && !isLoading ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-12"
                >
                  <div className="space-y-4">
                    <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                      Hello, <span className="text-blue-600">how can I help you today?</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-xl mx-auto leading-relaxed text-center">
                      Doctorian Gemini is your highly specialized medical intelligence hub. Ask anything related to health, clinical documentation, or biological sciences.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl px-4">
                    {SUGGESTIONS.slice(0, 4).map((s, i) => (
                      <button 
                        key={i} 
                        onClick={() => handleSend(s)}
                        className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] text-left group hover:border-blue-600 transition-all hover:scale-[1.02] shadow-sm"
                      >
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 truncate">{s}</p>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-600 opacity-60 group-hover:opacity-100">
                          <Zap size={12} /> Diagnostic Path
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-12">
                  {messages.map((msg) => (
                    <motion.div 
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg transition-all ${
                        msg.role === 'user' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-blue-600 text-white'
                      }`}>
                        {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                      </div>
                      
                      <div className={`flex flex-col space-y-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        {msg.imageData && (
                          <div className="mb-4">
                             <img 
                              src={msg.imageData} 
                              alt="Neural Visualization" 
                              className="w-full max-w-sm rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800"
                              referrerPolicy="no-referrer"
                             />
                             <div className="mt-2 flex justify-center">
                               <a 
                                href={msg.imageData} 
                                download="doctorian-analysis.png"
                                className="text-[9px] font-black uppercase text-blue-600 hover:underline flex items-center gap-1"
                               >
                                 <Download size={10} /> Export High-Res Analysis
                               </a>
                             </div>
                          </div>
                        )}
                        <div className={`prose prose-slate dark:prose-invert max-w-none text-base leading-relaxed ${
                          msg.role === 'user' 
                            ? 'bg-slate-100 dark:bg-slate-800 px-6 py-4 rounded-[2rem] rounded-tr-none shadow-sm' 
                            : 'w-full px-2'
                        }`}>
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.text}
                          </ReactMarkdown>
                        </div>
                        {msg.role === 'bot' && !msg.isError && msg.text && (
                          <div className="flex items-center gap-1 mt-4">
                             <button onClick={() => copyToClipboard(msg.text, msg.id)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                               {copiedId === msg.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                             </button>
                             <button onClick={() => speak(msg.text)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                               <Volume2 size={14} />
                             </button>
                             <div className="h-4 w-px bg-slate-100 dark:bg-slate-800 mx-2" />
                             <div className="flex items-center gap-1 text-[9px] font-black uppercase text-slate-400 tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 opacity-50"></span>
                                Verified Response
                             </div>
                             
                             <div className="h-4 w-px bg-slate-100 dark:bg-slate-800 mx-2" />
                             
                             <div className="flex items-center gap-1">
                                <button 
                                  onClick={() => handleRateResponse(msg.id, 'up')}
                                  disabled={isSubmittingFeedback}
                                  className={`p-1.5 rounded-md transition-all ${feedbackMap[msg.id] === 'up' ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50'}`}
                                  title="Accurate & Helpful"
                                >
                                  <ThumbsUp size={14} />
                                </button>
                                <button 
                                  onClick={() => handleRateResponse(msg.id, 'down')}
                                  disabled={isSubmittingFeedback}
                                  className={`p-1.5 rounded-md transition-all ${feedbackMap[msg.id] === 'down' ? 'text-rose-500 bg-rose-50 dark:bg-rose-900/20' : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50'}`}
                                  title="Inaccurate or Unclear"
                                >
                                  <ThumbsDown size={14} />
                                </button>
                                <button 
                                  onClick={() => setSuggestionOpen(suggestionOpen === msg.id ? null : msg.id)}
                                  className={`p-1.5 rounded-md transition-all ${suggestionOpen === msg.id ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
                                  title="Suggest Improvement"
                                >
                                  <MessageSquarePlus size={14} />
                                </button>
                                
                                <AnimatePresence>
                                  {feedbackSuccess === msg.id && (
                                    <motion.span 
                                      initial={{ opacity: 0, scale: 0.8, x: 5 }}
                                      animate={{ opacity: 1, scale: 1, x: 0 }}
                                      exit={{ opacity: 0, scale: 0.8 }}
                                      className="text-[9px] font-black text-emerald-500 uppercase tracking-widest ml-2 flex items-center gap-1"
                                    >
                                      <Check size={10} /> Received
                                    </motion.span>
                                  )}
                                </AnimatePresence>
                             </div>
                          </div>
                        )}
                        <span className={`text-[9px] font-black uppercase tracking-widest text-slate-400 mt-2 px-2`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>

                        <AnimatePresence>
                          {suggestionOpen === msg.id && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="w-full mt-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 space-y-4 overflow-hidden"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <MessageSquarePlus size={14} className="text-blue-600" />
                                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Provide Feedback</h4>
                                </div>
                                <button onClick={() => setSuggestionOpen(null)} className="text-slate-400 hover:text-slate-600">
                                  <X size={14} />
                                </button>
                              </div>
                              <textarea
                                value={suggestionText}
                                onChange={(e) => setSuggestionText(e.target.value)}
                                placeholder="How can we improve this response? Share your medical insights or technical suggestions..."
                                className="w-full bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl p-3 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-blue-500 transition-all resize-none h-24"
                              />
                              <div className="flex justify-end">
                                <button 
                                  disabled={!suggestionText.trim() || isSubmittingFeedback}
                                  onClick={() => handleSuggestionSubmit(msg.id)}
                                  className={`px-4 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2`}
                                >
                                  {isSubmittingFeedback ? (
                                    <>
                                      <RefreshCw size={12} className="animate-spin" />
                                      Synchronizing...
                                    </>
                                  ) : (
                                    'Submit Feedback Loop'
                                  )}
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  ))}
                  
                  {isLoading && !messages.some(m => m.role === 'bot' && m.text === '') && (
                    <div className="flex gap-6">
                      <div className="w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center animate-pulse">
                        <Bot size={18} />
                      </div>
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3 mb-2">
                           <div className="relative">
                            <Loader2 size={16} className="animate-spin text-blue-600" />
                            <div className="absolute inset-0 bg-blue-600/20 rounded-full animate-ping" />
                           </div>
                           <span className="text-[11px] font-[900] text-blue-600 uppercase tracking-[0.3em] animate-pulse">
                             DOCTORIAN AI THINKING
                           </span>
                        </div>
                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse w-full max-w-md"></div>
                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse w-1/2"></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Input Area */}
        <div className="px-4 sm:px-6 py-6 sm:py-8 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
          <div className="max-w-4xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/20 to-emerald-500/20 rounded-[1.5rem] sm:rounded-[2.5rem] blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
              <div className="relative flex flex-col bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] sm:rounded-[2.5rem] p-1 sm:p-2">
                {/* Attached Files Preview */}
                <AnimatePresence>
                  {attachedFiles.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-wrap gap-2 px-4 py-3 border-b border-slate-100 dark:border-slate-800/50"
                    >
                      {attachedFiles.map((file) => (
                        <motion.div 
                          layout
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          key={file.name}
                          className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] font-bold border border-slate-200 dark:border-slate-700 shadow-sm"
                        >
                          <FileText size={12} className="text-blue-600" />
                          <span className="max-w-[120px] truncate">{file.name}</span>
                          <button 
                            onClick={() => removeFile(file.name)}
                            className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-400 hover:text-rose-500 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-end gap-2 pl-4 sm:pl-6">
                  <textarea 
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Ask Doctorian AI..."
                    className="flex-1 bg-transparent border-none outline-none py-3 sm:py-4 text-[16px] font-medium text-slate-900 dark:text-white placeholder-slate-400 resize-none min-h-[50px] max-h-48"
                    rows={1}
                  />
                  
                  <div className="flex items-center gap-1 sm:gap-2 mb-2 pr-2">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-3 text-slate-400 hover:text-blue-600 transition-all"
                      title="Attach Files"
                    >
                      <Paperclip size={20} />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      multiple 
                      className="hidden" 
                    />
                    <button 
                      onClick={toggleListening}
                      className={`p-3 rounded-full transition-all ${isListening ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/20' : 'text-slate-400 hover:text-slate-600'}`}
                      title="Voice Command"
                    >
                      {isListening ? <Mic size={20} /> : <MicOff size={20} />}
                    </button>
                    <button 
                      onClick={() => handleSend()}
                      disabled={!input.trim() || isLoading}
                      className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-30 shadow-xl shadow-blue-500/20"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info - visible at the very bottom of the chat column */}
        <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-50 dark:border-slate-900/50">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Database size={12} className="text-slate-400" />
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Knowledge Base: 2025.A1</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle size={12} className="text-amber-500" />
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest hidden sm:inline">Professional advice recommended</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/10 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/30">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></div>
            <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Neural Link Sync</span>
          </div>
        </div>
      </div>
    </div>
  );
}
