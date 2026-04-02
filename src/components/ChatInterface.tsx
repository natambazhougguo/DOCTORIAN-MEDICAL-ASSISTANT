import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

const SYSTEM_INSTRUCTION = `You are a professional medical intelligence companion. 
Respond directly to the user's questions. 
Do not mention your identity as an AI, your name (Doctorian AI), or your creator (AKORA JOSEPH) unless explicitly asked.

CREATOR INFORMATION (Only share if asked):
- Creator: AKORA JOSEPH
- School: Dr. Obote College
- Headteacher: Mr. ALENGO DICK
- Deputy Administration: Mr. Ogwang Tom
- Deputy in charge Academics: Mr. Okumu Samuel
- Deputy in charge Welfare: Mr. Epilla Banana Andrew
- Head of ICT Department: Mr. ANGURA JAMES
-The director of studies are Mr. Achuma Richard, Mr. Ongol Fred, Oyol James
-Dr. Obote College Boroboro, a top-tier government-aided boarding school in Lira, typically charges school fees ranging approximately from UGX 865,000 per term for tuition and boarding, based on historical data. Fees generally include boarding costs, academic tuition, and school maintenance. 
Key Considerations:
Structure: As an all-residential school, fees include tuition, accommodation, and food.
Variations: The final fee structure depends on the academic level (S.1–S.6) and often includes additional costs for uniforms, development fees, and personal items.
Updates: Parents are advised to visit the Dr. Obote College Boroboro official portal or contact the school administration directly for the most current academic year fees. 
drobotecollege.sc.ug

Provide empathetic, evidence-based health insights.
CRITICAL: Advise emergency services for severe symptoms. No prescriptions.`;

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { role: 'user', parts: [{ text: `System: ${SYSTEM_INSTRUCTION}\n\nUser: ${input}` }] }
        ],
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: response.text || "I'm sorry, I couldn't process that request.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("AI Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: "I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-xl overflow-hidden">
      <div className="bg-white px-4 py-4 border-b border-slate-100 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Bot size={24} className="text-blue-600" />
          <span className="text-lg font-black text-blue-600 uppercase tracking-tighter">Doctorian Chatbot</span>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 px-2 py-1 rounded-full">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          <span className="text-[10px] text-blue-600 uppercase tracking-widest font-bold">Live</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-100 relative">
        {messages.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10 pointer-events-none select-none">
            <Bot size={80} className="text-blue-600 mb-4" />
            <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tighter">Doctorian Chatbot</h2>
          </div>
        )}
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`shrink-0 h-7 w-7 rounded-full flex items-center justify-center ${
                  msg.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600'
                }`}>
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className={`p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-2 items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <Loader2 size={14} className="text-indigo-500 animate-spin" />
              <span className="text-xs text-slate-500">Doctorian is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-50/50 border-t border-slate-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about symptoms, health tips..."
            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white p-2 rounded-xl transition-all shadow-sm"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
