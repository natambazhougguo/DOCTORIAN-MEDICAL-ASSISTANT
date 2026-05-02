import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Phone, 
  User, 
  Stethoscope, 
  ShieldCheck, 
  Globe, 
  Save, 
  AlertCircle,
  CheckCircle2,
  PhoneCall,
  UserPlus
} from 'lucide-react';

interface EmergencyContact {
  id: string;
  role: 'Doctor' | 'Mentor';
  name: string;
  phone: string;
  countryCode: string;
  isVerified: boolean;
}

export const EmergencyRegistry: React.FC = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>(() => {
    const saved = localStorage.getItem('emergency_contacts');
    return saved ? JSON.parse(saved) : [
      { id: '1', role: 'Doctor', name: '', phone: '', countryCode: '+1', isVerified: false },
      { id: '2', role: 'Mentor', name: '', phone: '', countryCode: '+1', isVerified: false }
    ];
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const saveContacts = () => {
    localStorage.setItem('emergency_contacts', JSON.stringify(contacts));
    setToast({ message: 'Emergency protocols updated successfully.', type: 'success' });
    setTimeout(() => setToast(null), 3000);
  };

  const updateContact = (id: string, updates: Partial<EmergencyContact>) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-12 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 blur-[100px] -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-12">
          <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl text-rose-600">
            <PhoneCall size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter">Emergency <span className="text-rose-600">Registry</span></h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Global Clinical Response Network</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {contacts.map((contact) => (
            <div key={contact.id} className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 relative group transition-all hover:border-rose-200 dark:hover:border-rose-900/50">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  {contact.role === 'Doctor' ? <Stethoscope className="text-blue-600" size={18} /> : <User className="text-purple-600" size={18} />}
                  <span className="text-xs font-black uppercase tracking-widest">{contact.role} Node</span>
                </div>
                {contact.phone && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-lg text-[8px] font-black uppercase">
                    <ShieldCheck size={10} /> Active
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Legal Name</label>
                  <input 
                    type="text" 
                    value={contact.name}
                    onChange={(e) => updateContact(contact.id, { name: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border-none rounded-xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-rose-500/20"
                    placeholder="Full Clinical Name"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Global Telephone Link</label>
                  <div className="flex gap-2">
                    <select 
                      value={contact.countryCode}
                      onChange={(e) => updateContact(contact.id, { countryCode: e.target.value })}
                      className="bg-white dark:bg-slate-900 border-none rounded-xl px-3 py-3 text-xs font-black w-24"
                    >
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+256">🇺🇬 +256</option>
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+61">🇦🇺 +61</option>
                      <option value="+81">🇯🇵 +81</option>
                      <option value="+49">🇩🇪 +49</option>
                    </select>
                    <input 
                      type="tel" 
                      value={contact.phone}
                      onChange={(e) => updateContact(contact.id, { phone: e.target.value })}
                      className="flex-1 bg-white dark:bg-slate-900 border-none rounded-xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-rose-500/20"
                      placeholder="Phone Number"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-rose-50 dark:bg-rose-900/10 p-8 rounded-[2.5rem] border border-rose-100 dark:border-rose-900/20 mb-12 flex items-start gap-6">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl text-rose-600 shadow-sm">
            <AlertCircle />
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-tight text-rose-900 dark:text-rose-100 mb-2">Autonomous Alarm Protocol</h4>
            <p className="text-[10px] font-bold text-rose-800/60 dark:text-rose-200/60 leading-relaxed uppercase">The system will automatically bypass all silence modes and initiate high-priority VoIP calls to these nodes if clinical thresholds enter the CRITICAL zone. This is a global protocol supporting all international carriers.</p>
          </div>
        </div>

        <button 
          onClick={saveContacts}
          className="w-full py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <Save size={16} /> Update Emergency Matrix
        </button>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-8 py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-2xl z-[100] flex items-center gap-3"
          >
            <CheckCircle2 size={16} />
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
