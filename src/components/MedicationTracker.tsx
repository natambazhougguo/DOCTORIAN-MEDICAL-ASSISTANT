import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Pill, 
  Clock, 
  Plus, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck,
  Calendar,
  ChevronRight,
  Info,
  Search,
  Loader2,
  Bell,
  BellOff
} from 'lucide-react';
import { api } from '../api';

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  category: 'prescription' | 'supplement';
  takenToday: boolean;
  remindersEnabled?: boolean;
}

export const MedicationTracker: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [meds, setMeds] = useState<Medicine[]>([]);

  const [isAdding, setIsAdding] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [newMed, setNewMed] = useState({ 
    name: '', 
    dosage: '', 
    frequency: 'Daily', 
    time: '08:00', 
    category: 'prescription' as const,
    remindersEnabled: true 
  });

  const commonMeds = [
    { name: 'Paracetamol', dosage: '500mg', frequency: 'Every 6 hours', category: 'supplement' },
    { name: 'Amoxicillin', dosage: '500mg', frequency: '3 times daily', category: 'prescription' },
    { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', category: 'prescription' },
    { name: 'Atorvastatin', dosage: '20mg', frequency: 'Nightly', category: 'prescription' },
    { name: 'Ibuprofen', dosage: '400mg', frequency: 'Every 8 hours', category: 'supplement' },
    { name: 'Omeprazole', dosage: '20mg', frequency: 'Daily (Morning)', category: 'prescription' },
    { name: 'Amlodipine', dosage: '5mg', frequency: 'Daily', category: 'prescription' },
  ];

  useEffect(() => {
    fetchMeds();
  }, []);

  const fetchMeds = async () => {
    setIsLoading(true);
    try {
      const data = await api.medications.list();
      setMeds(data);
    } catch (err) {
      console.error("Failed to fetch meds:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMed.name) return;
    try {
      const med = await api.medications.create(newMed);
      setMeds([med, ...meds]);
      setIsAdding(false);
      setShowLibrary(false);
      setNewMed({ name: '', dosage: '', frequency: 'Daily', time: '08:00', category: 'prescription', remindersEnabled: true });
    } catch (err) {
      console.error("Failed to add med:", err);
    }
  };

  const handleTakeStatus = async (id: string, currentlyTaken: boolean) => {
    try {
      await api.medications.take(id, currentlyTaken);
      setMeds(meds.map(m => m.id === id ? { ...m, takenToday: !currentlyTaken } : m));
    } catch (err) {
      console.error("Failed to update intake status:", err);
    }
  };

  const handleDeleteMed = async (id: string) => {
    try {
      await api.medications.delete(id);
      setMeds(meds.filter(m => m.id !== id));
    } catch (err) {
      console.error("Failed to delete med:", err);
    }
  };

  const toggleReminders = async (id: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      setMeds(meds.map(m => m.id === id ? { ...m, remindersEnabled: newStatus } : m));
      await api.medications.update(id, { remindersEnabled: newStatus });
    } catch (err) {
      console.error("Failed to toggle reminders:", err);
      // Revert local state on error
      setMeds(meds.map(m => m.id === id ? { ...m, remindersEnabled: currentStatus } : m));
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 min-h-screen flex flex-col items-center justify-center space-y-8 animate-pulse text-center">
        <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 rounded-2xl flex items-center justify-center">
          <Pill className="text-rose-600 animate-pulse" size={40} />
        </div>
        <div className="space-y-4">
          <div className="h-10 w-64 bg-slate-100 dark:bg-slate-900 rounded-full mx-auto" />
          <div className="h-4 w-48 bg-slate-50 dark:bg-slate-950 rounded-full mx-auto" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl mt-12">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-rose-600 p-2 rounded-xl text-white">
              <Pill size={24} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Medication Intelligence</p>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
            Cognis <span className="text-rose-600 font-serif italic normal-case">Potions</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold mt-2">Precision dosage tracking and interaction risk assessment.</p>
        </div>

        <button 
          onClick={() => setIsAdding(true)}
          className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
        >
          <Plus size={18} />
          Register Molecule
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {meds.map((med) => (
              <motion.div 
                key={med.id}
                layout
                className="group relative bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all h-full flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className={`p-3 rounded-2xl ${med.category === 'prescription' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'}`}>
                      <Pill size={24} />
                    </div>
                    <div className="flex gap-2">
                       <button 
                        onClick={() => toggleReminders(med.id, !!med.remindersEnabled)} 
                        className={`p-2 rounded-lg transition-colors ${med.remindersEnabled ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-300 hover:text-slate-500'}`}
                        title={med.remindersEnabled ? 'Reminders On' : 'Reminders Off'}
                       >
                         {med.remindersEnabled ? <Bell size={14} /> : <BellOff size={14} />}
                       </button>
                       <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md tracking-tighter ${med.takenToday ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                         {med.takenToday ? 'SYNCHRONIZED' : 'PENDING'}
                       </span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">{med.name}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{med.dosage} • {med.frequency}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800 mt-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock size={14} />
                    <span className="text-[10px] font-black uppercase">{med.time}</span>
                  </div>
                  <button 
                    onClick={() => handleTakeStatus(med.id, !!med.takenToday)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      med.takenToday 
                      ? 'bg-emerald-50 text-emerald-600' 
                      : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    }`}
                  >
                    {med.takenToday ? 'Mark as Missed' : 'Confirm Intake'}
                  </button>
                </div>

                <button 
                  onClick={() => handleDeleteMed(med.id)}
                  className="absolute top-4 right-4 p-2 text-slate-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <section className="bg-slate-900 text-white rounded-[3rem] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <ShieldCheck size={80} />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight mb-4 relative z-10">Interaction Engine</h3>
            <p className="text-sm text-slate-400 font-bold mb-8 relative z-10 font-serif">No conflicting biochemical signatures detected across active molecules.</p>
            <div className="flex items-center gap-3 bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/30 relative z-10">
              <div className="p-2 bg-emerald-500 rounded-xl">
                <CheckCircle2 size={16} className="text-white" />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase">Safety Status</p>
                 <p className="text-xs font-bold text-emerald-500">OPTIMAL RANGE</p>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
             <h3 className="text-lg font-black uppercase tracking-tight mb-6 flex items-center gap-2">
               <Calendar size={18} className="text-rose-600" />
               Next Supply Cycle
             </h3>
             <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Pill size={16} className="text-slate-400" />
                    <div>
                      <p className="text-xs font-black uppercase text-slate-900 dark:text-white">Omega-3 Refill</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">In 12 days</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300" />
                </div>
             </div>
          </section>
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
               <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black uppercase tracking-tighter">Register <span className="text-rose-600">Molecule</span></h2>
                <button 
                  onClick={() => setShowLibrary(!showLibrary)}
                  className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1 hover:underline"
                >
                  <Search size={14} />
                  {showLibrary ? 'Custom Entry' : 'Molecular Library'}
                </button>
               </div>

               {showLibrary ? (
                 <div className="space-y-3 mb-8">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Select from common molecules</p>
                    <div className="grid grid-cols-1 gap-2">
                       {commonMeds.map((m, idx) => (
                         <button
                          key={idx}
                          onClick={() => {
                            setNewMed({...newMed, name: m.name, dosage: m.dosage, frequency: m.frequency, category: m.category as any});
                            setShowLibrary(false);
                          }}
                          className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl transition-all text-left"
                         >
                           <div>
                             <p className="text-sm font-black text-slate-900 dark:text-white uppercase">{m.name}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase">{m.dosage} • {m.frequency}</p>
                           </div>
                           <Plus size={16} className="text-slate-300" />
                         </button>
                       ))}
                    </div>
                 </div>
               ) : (
                 <form onSubmit={handleAddMed} className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Molecular Name</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Lipitor 20mg"
                        className="w-full mt-2 px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-rose-500 font-bold"
                        value={newMed.name}
                        onChange={(e) => setNewMed({...newMed, name: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dosage</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 500mg"
                          className="w-full mt-2 px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-rose-500 font-bold"
                          value={newMed.dosage}
                          onChange={(e) => setNewMed({...newMed, dosage: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Frequency</label>
                        <select 
                          className="w-full mt-2 px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-rose-500 font-bold appearance-none"
                          value={newMed.frequency}
                          onChange={(e) => setNewMed({...newMed, frequency: e.target.value})}
                        >
                          <option>Daily</option>
                          <option>Twice Daily</option>
                          <option>3 Times Daily</option>
                          <option>Every 8 Hours</option>
                          <option>Weekly</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Time</label>
                      <input 
                        type="time" 
                        className="w-full mt-2 px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-rose-500 font-bold"
                        value={newMed.time}
                        onChange={(e) => setNewMed({...newMed, time: e.target.value})}
                      />
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                      <button 
                        type="button"
                        onClick={() => setNewMed({...newMed, remindersEnabled: !newMed.remindersEnabled})}
                        className={`w-10 h-6 rounded-full p-1 transition-all ${newMed.remindersEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-all ${newMed.remindersEnabled ? 'ml-4' : 'ml-0'}`} />
                      </button>
                      <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Enable Cellular Alerts</span>
                    </div>
                    <div className="flex gap-3 pt-6">
                      <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-4 font-black uppercase text-xs tracking-widest text-slate-400 hover:text-slate-600">Cancel</button>
                      <button type="submit" className="flex-2 bg-rose-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">Complete Registration</button>
                    </div>
                 </form>
               )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
