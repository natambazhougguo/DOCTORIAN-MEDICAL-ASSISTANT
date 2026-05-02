import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, 
  X, Loader2, Sparkles, Activity, Shield, Waves
} from 'lucide-react';
import { api } from '../api';
// Deleted direct SDK import

interface NeuralVoiceCallProps {
  onClose: () => void;
  user: any;
}

export function NeuralVoiceCall({ onClose, user }: NeuralVoiceCallProps) {
  const [status, setStatus] = useState<'idle' | 'calling' | 'connected'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOff, setIsSpeakerOff] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    let interval: any;
    if (status === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startCall = () => {
    setStatus('calling');
    setTimeout(() => {
      setStatus('connected');
      initializeSpeech();
    }, 2000);
  };

  const initializeSpeech = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const current = event.results[event.results.length - 1];
        const text = current[0].transcript;
        setTranscript(text);
        if (current.isFinal) {
          handleAiVoiceResponse(text);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
      };

      recognitionRef.current.start();
    }
  };

  const handleAiVoiceResponse = async (text: string) => {
    setIsAiThinking(true);
    try {
      const result = await api.ai.voiceChat(text);
      if (result.text) {
        setAiResponse(result.text);
        // Simple client-side synthesis for now
        speak(result.text);
      }
    } catch (err) {
      console.error("AI Voice failed:", err);
    } finally {
      setIsAiThinking(false);
    }
  };

  const speak = (text: string) => {
    if (isSpeakerOff) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = window.speechSynthesis.getVoices().find(v => v.name.includes('Google') || v.name.includes('Male')) || null;
    window.speechSynthesis.speak(utterance);
  };

  const playAudio = async (base64Audio: string) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const binary = atob(base64Audio);
    const arrayBuffer = new ArrayBuffer(binary.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < binary.length; i++) {
      uint8Array[i] = binary.charCodeAt(i);
    }

    const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);
    source.start(0);
  };

  const endCall = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setStatus('idle');
    setCallDuration(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-3xl overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-20">
         <div className="absolute inset-x-0 bottom-0 h-[50vh] bg-gradient-to-t from-blue-600/50 to-transparent blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col"
      >
        <div className="p-8 sm:p-12 flex-1 flex flex-col items-center justify-center text-center">
           <AnimatePresence mode="wait">
             {status === 'idle' ? (
                <motion.div key="idle" exit={{ opacity: 0, y: -20 }}>
                   <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center mb-8 mx-auto shadow-2xl shadow-blue-500/40">
                      <Phone size={40} className="text-white" />
                   </div>
                   <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Neural Call Link</h2>
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-10">Secure AI Clinical Voice Interface</p>
                   <button 
                    onClick={startCall}
                    className="px-12 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-blue-500/20"
                   >
                     Initiate Session
                   </button>
                </motion.div>
             ) : (
                <motion.div 
                  key="active" 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full"
                >
                   <div className="flex items-center justify-center gap-6 mb-12">
                      <div className="flex flex-col items-center">
                         <div className={`w-2 h-2 rounded-full mb-1 ${status === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500 animate-pulse'}`} />
                         <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{status === 'connected' ? 'SECURE' : 'CALLING'}</span>
                      </div>
                      <div className="text-2xl font-black text-white font-mono tracking-tighter">
                        {status === 'connected' ? formatTime(callDuration) : '...'}
                      </div>
                   </div>

                   <div className="relative mb-16">
                      <div className="absolute inset-0 flex items-center justify-center">
                         <div className="flex items-center gap-1">
                            {[1,2,3,4,5,6,1,2,3,4,5,6].map((i, idx) => (
                              <motion.div 
                                key={idx}
                                animate={{ height: status === 'connected' ? [10, Math.random() * 60 + 20, 10] : [10, 10, 10] }}
                                transition={{ repeat: Infinity, duration: 0.5, delay: idx * 0.05 }}
                                className="w-1.5 bg-blue-500/40 rounded-full"
                              />
                            ))}
                         </div>
                      </div>
                      <div className="w-32 h-32 bg-slate-800 rounded-full border-4 border-white/5 relative z-10 flex items-center justify-center mx-auto overflow-hidden">
                         <Activity size={48} className="text-blue-500 animate-pulse" />
                      </div>
                   </div>

                   <div className="space-y-6 max-w-sm mx-auto mb-16 h-40 overflow-y-auto no-scrollbar">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2">Patient Transcript</p>
                        <p className="text-sm font-medium text-slate-300 italic">"{transcript || 'Listening for neural data...'}"</p>
                      </div>
                      <AnimatePresence>
                        {aiResponse && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-blue-600/10 rounded-2xl border border-blue-500/20"
                          >
                            <p className="text-[9px] font-black text-white uppercase tracking-widest mb-2 flex items-center gap-2">
                              <Sparkles size={10} /> Doctorian AI
                            </p>
                            <p className="text-sm font-medium text-white">"{aiResponse}"</p>
                          </motion.div>
                        )}
                        {isAiThinking && (
                          <div className="flex items-center gap-2 px-4">
                            <Loader2 size={12} className="animate-spin text-blue-500" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Processing</span>
                          </div>
                        )}
                      </AnimatePresence>
                   </div>
                </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* Call Controls */}
        {status !== 'idle' && (
          <div className="p-8 bg-slate-950 border-t border-white/5 flex items-center justify-center gap-8">
             <button 
               onClick={() => setIsMuted(!isMuted)}
               className={`p-5 rounded-2xl transition-all ${isMuted ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/20' : 'bg-white/5 text-slate-400 hover:text-white'}`}
             >
               {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
             </button>
             
             <button 
               onClick={endCall}
               className="p-8 bg-rose-600 hover:bg-rose-700 text-white rounded-[2.5rem] shadow-2xl shadow-rose-600/40 transition-all hover:scale-110 active:scale-95"
             >
               <PhoneOff size={32} />
             </button>

             <button 
               onClick={() => setIsSpeakerOff(!isSpeakerOff)}
               className={`p-5 rounded-2xl transition-all ${isSpeakerOff ? 'bg-slate-800 text-slate-500' : 'bg-white/5 text-slate-400 hover:text-white'}`}
             >
               {isSpeakerOff ? <VolumeX size={24} /> : <Volume2 size={24} />}
             </button>
          </div>
        )}

        {status === 'idle' && (
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-3 text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        )}
      </motion.div>
      
      {/* Background Decorative */}
      <div className="fixed top-12 left-12 flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 opacity-40">
         <Waves size={16} className="text-blue-500" />
         <span className="text-[10px] font-black text-white uppercase tracking-widest">Atmospheric Encryption: Active</span>
      </div>
    </div>
  );
}
