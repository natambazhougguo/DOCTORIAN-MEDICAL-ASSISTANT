import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  Video,
  MapPin,
  Stethoscope,
  ShieldCheck,
  X,
  CreditCard,
  User
} from 'lucide-react';

interface Specialist {
  id: string;
  name: string;
  specialty: string;
  image?: string;
  rating: number;
}

interface AppointmentSchedulerProps {
  specialist: Specialist;
  onClose: () => void;
  onConfirm: (appointment: any) => void;
}

export const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({ specialist, onClose, onConfirm }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [step, setStep] = useState<'calendar' | 'details' | 'confirm'>('calendar');
  const [isBooking, setIsBooking] = useState(false);
  const [appointmentType, setAppointmentType] = useState<'virtual' | 'physical'>('virtual');

  const timeSlots = [
    "09:00 AM", "10:30 AM", "11:00 AM", "01:30 PM", "02:00 PM", "04:30 PM"
  ];

  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const currentMonthDays = daysInMonth(selectedDate.getMonth(), selectedDate.getFullYear());
  const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();

  const handleDateClick = (day: number) => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day));
    setSelectedSlots([]);
  };

  const toggleSlot = (slot: string) => {
    setSelectedSlots(prev => 
      prev.includes(slot) 
        ? prev.filter(s => s !== slot) 
        : [...prev, slot]
    );
  };

  const handleBooking = async () => {
    setIsBooking(true);
    // Simulate biometric sync and booking
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsBooking(false);
    onConfirm({
      specialist,
      date: selectedDate,
      slots: selectedSlots,
      type: appointmentType
    });
    setStep('confirm');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col h-full max-h-[90vh]">
      {/* Header */}
      <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-950 text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <CalendarIcon size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tighter">Clinical Session Scheduler</h3>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Real-time Slot Verification</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <AnimatePresence mode="wait">
          {step === 'calendar' && (
            <motion.div 
              key="calendar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Specialist Info */}
              <div className="flex items-center gap-6 p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 overflow-hidden">
                  {specialist.image ? <img src={specialist.image} alt="" className="w-full h-full object-cover" /> : <User size={32} />}
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{specialist.name}</h4>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{specialist.specialty}</p>
                </div>
                <div className="ml-auto px-4 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500" />
                   <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase">Available Today</span>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Select Neural Slot</h5>
                  <div className="flex gap-2">
                    <button className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-blue-600 hover:text-white transition-all"><ChevronLeft size={16} /></button>
                    <button className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-blue-600 hover:text-white transition-all"><ChevronRight size={16} /></button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2 mb-8">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center py-2">{d}</div>
                  ))}
                  {Array.from({ length: 35 }).map((_, i) => {
                    const day = i - firstDayOfMonth + 1;
                    const isToday = day === new Date().getDate();
                    const isSelected = day === selectedDate.getDate();
                    const isValid = day > 0 && day <= currentMonthDays;

                    return (
                      <button
                        key={i}
                        disabled={!isValid}
                        onClick={() => isValid && handleDateClick(day)}
                        className={`aspect-square rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                          !isValid ? 'opacity-0 pointer-events-none' :
                          isSelected ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' :
                          'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {day}
                        {isToday && !isSelected && <div className="w-1 h-1 rounded-full bg-blue-600" />}
                      </button>
                    );
                  })}
                </div>

                {/* Time Slots */}
                <div className="space-y-4">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Available Synchronizations</h5>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {timeSlots.map(slot => (
                      <button
                        key={slot}
                        onClick={() => toggleSlot(slot)}
                        className={`py-4 rounded-2xl text-xs font-black transition-all border flex items-center justify-center gap-2 ${
                          selectedSlots.includes(slot)
                            ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-500/20 scale-105'
                            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-blue-200'
                        }`}
                      >
                        <Clock size={14} />
                        {slot}
                        {selectedSlots.includes(slot) && <CheckCircle2 size={12} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-8 space-y-4">
                {selectedSlots.length > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{selectedSlots.length} slot(s) selected</span>
                  </div>
                )}
                <button 
                  onClick={() => setStep('details')}
                  disabled={selectedSlots.length === 0}
                  className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] disabled:opacity-30 disabled:pointer-events-none hover:bg-blue-600 hover:text-white transition-all shadow-xl active:scale-95"
                >
                  Configure Session Details
                </button>
              </div>
            </motion.div>
          )}

          {step === 'details' && (
            <motion.div 
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <button 
                onClick={() => setStep('calendar')}
                className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors"
              >
                <ChevronLeft size={16} /> Back to Matrix
              </button>

              <div className="space-y-6">
                 <div>
                   <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Access Protocol</h4>
                   <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Select your preferred neural synchronization medium.</p>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button 
                      onClick={() => setAppointmentType('virtual')}
                      className={`p-6 rounded-[2rem] border-2 transition-all text-left flex flex-col gap-4 ${
                        appointmentType === 'virtual' 
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-600 shadow-xl shadow-blue-500/10' 
                          : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${appointmentType === 'virtual' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        <Video size={24} />
                      </div>
                      <div>
                        <h5 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Virtual Link</h5>
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">High-def clinical neural session</p>
                      </div>
                    </button>

                    <button 
                      onClick={() => setAppointmentType('physical')}
                      className={`p-6 rounded-[2rem] border-2 transition-all text-left flex flex-col gap-4 ${
                        appointmentType === 'physical' 
                          ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-600 shadow-xl shadow-rose-500/10' 
                          : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${appointmentType === 'physical' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        <MapPin size={24} />
                      </div>
                      <div>
                        <h5 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Physical Node</h5>
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">Visit official clinical facility</p>
                      </div>
                    </button>
                 </div>

                  <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Selected Intervals</h5>
                    <div className="grid grid-cols-2 gap-2">
                       {selectedSlots.map(slot => (
                         <div key={slot} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                           <Clock size={12} className="text-blue-500" />
                           <span className="text-[10px] font-black text-slate-900 dark:text-white">{slot}</span>
                         </div>
                       ))}
                    </div>
                  </div>

                 <div className="p-6 bg-slate-900 text-white rounded-3xl space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Consultation Fee ({selectedSlots.length}x)</span>
                       <span className="text-xl font-black">${selectedSlots.length * 120}.00 <span className="text-xs text-slate-500 font-bold uppercase tracking-widest ml-1">USD</span></span>
                    </div>
                    <div className="flex items-center gap-3 text-emerald-400">
                       <ShieldCheck size={16} />
                       <span className="text-[10px] font-black uppercase tracking-widest">Quantum-Secure Insurance Integration active</span>
                    </div>
                 </div>
              </div>

              <button 
                onClick={handleBooking}
                disabled={isBooking}
                className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-blue-500/30 active:scale-95 flex items-center justify-center gap-4 disabled:opacity-50"
              >
                {isBooking ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><Clock size={20} /></motion.div>
                    Syncing Neural Pattern...
                  </>
                ) : (
                  <>
                    <CreditCard size={20} />
                    Finalize Session Securely
                  </>
                )}
              </button>
            </motion.div>
          )}

          {step === 'confirm' && (
            <motion.div 
              key="confirm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 flex flex-col items-center text-center space-y-8"
            >
              <div className="w-32 h-32 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center relative">
                 <motion.div 
                   initial={{ scale: 0 }}
                   animate={{ scale: 1 }}
                   transition={{ type: "spring", damping: 10 }}
                   className="text-emerald-500"
                 >
                    <CheckCircle2 size={80} />
                 </motion.div>
                 <motion.div 
                   animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                   transition={{ duration: 2, repeat: Infinity }}
                   className="absolute inset-0 bg-emerald-500 rounded-full blur-2xl -z-10"
                 />
              </div>

              <div className="space-y-4">
                <h4 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Session Synchronized</h4>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-md mx-auto">Your neural clinic link has been established. Technical protocols have been dispatched to your secure clinical vault.</p>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 w-full text-left space-y-3">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Time Dimension Summary</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="px-2 py-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-black">
                        {selectedDate.toLocaleDateString()}
                      </div>
                      {selectedSlots.map(slot => (
                        <div key={slot} className="px-2 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-black">
                          {slot}
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest pt-2">
                      Access Node: {appointmentType === 'virtual' ? 'Secure Neural Link' : 'Physical Bio-Suite'}
                    </p>
              </div>

              <div className="w-full pt-8">
                <button 
                  onClick={onClose}
                  className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Return to Matrix
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
