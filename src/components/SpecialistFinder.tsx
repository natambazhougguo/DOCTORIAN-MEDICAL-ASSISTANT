import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Star, Calendar, MessageSquare, Phone, ShieldCheck, Stethoscope, Heart, Brain, Bone, Eye, Zap, X } from 'lucide-react';
import { AppointmentScheduler } from './AppointmentScheduler';

const Specialists = [
  { id: '1', name: 'Dr. Sarah Johnson', specialty: 'Cardiologist', rating: 4.9, distance: '2.5 km', availability: 'Available Tomorrow', icon: <Heart className="text-rose-500" />, verified: true },
  { id: '2', name: 'Dr. Michael Chen', specialty: 'Cognis Specialist', rating: 4.8, distance: '3.8 km', availability: 'Available Today', icon: <Brain className="text-purple-500" />, verified: true },
  { id: '3', name: 'Dr. Emily Brown', specialty: 'Orthopedic', rating: 4.7, distance: '1.2 km', availability: 'Mon, 20 Oct', icon: <Bone className="text-amber-500" />, verified: false },
  { id: '4', name: 'Dr. David Wilson', specialty: 'Ophthalmologist', rating: 4.9, distance: '5.0 km', availability: 'Next Week', icon: <Eye className="text-blue-500" />, verified: true },
  { id: '5', name: 'Dr. Lisa Garcia', specialty: 'General Practitioner', rating: 4.6, distance: '0.8 km', availability: 'Available Today', icon: <Stethoscope className="text-emerald-500" />, verified: true },
];

export const SpecialistFinder: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [bookingSpecialist, setBookingSpecialist] = useState<any>(null);

  const categories = ['All', 'Cardiologist', 'Cognis Specialist', 'Orthopedic', 'Ophthalmologist', 'General Practitioner'];

  const filtered = Specialists.filter(s => 
    (activeCategory === 'All' || s.specialty === activeCategory) &&
    (s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.specialty.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-12 pb-24 px-6 relative">
      <AnimatePresence>
        {bookingSpecialist && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12 overflow-hidden"
          >
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setBookingSpecialist(null)} />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl h-full flex flex-col pointer-events-auto"
            >
              <AppointmentScheduler 
                specialist={bookingSpecialist} 
                onClose={() => setBookingSpecialist(null)}
                onConfirm={(appt) => {
                  const saved = localStorage.getItem('doctorian_appointments');
                  const current = saved ? JSON.parse(saved) : [];
                  const newAppt = { ...appt, id: Math.random().toString(36).substr(2, 9) };
                  localStorage.setItem('doctorian_appointments', JSON.stringify([...current, newAppt]));
                  window.dispatchEvent(new Event('storage'));
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <header className="flex flex-col gap-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-7xl font-[1000] text-slate-900 dark:text-white tracking-[-0.05em] uppercase leading-none mb-4">
              Expert <span className="text-blue-600">Network</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-lg md:text-xl leading-relaxed">
              Connect with top-tier medical specialists authorized for cognitive synchronization.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 dark:border-slate-800 shadow-sm">
                <MapPin size={22} />
             </div>
             <div className="text-right">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Region</p>
               <p className="text-sm font-black text-slate-900 dark:text-white uppercase">London, UK</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={24} />
            <input 
              type="text" 
              placeholder="Search by physician, specialty or hospital..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] py-6 pl-16 pr-6 text-base font-bold shadow-2xl shadow-slate-100 dark:shadow-none focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
            />
          </div>
          
          <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar py-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-8 py-3 rounded-[1.5rem] text-[10px] whitespace-nowrap font-black uppercase tracking-widest transition-all ${
                  activeCategory === cat 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' 
                    : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800 hover:text-slate-600'
                }`}
              >
                {cat === 'General Practitioner' ? 'GP' : cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Fast Lane Header */}
      <div className="bg-slate-950 rounded-[3rem] p-8 sm:p-12 text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
          <Zap size={200} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-blue-600 p-2 rounded-xl">
                <Zap size={18} className="fill-white" />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.3em] text-blue-400">Clinical Priority</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-[1000] mb-6 tracking-tighter uppercase leading-[0.9]">Fast Lane <br /><span className="text-blue-500">Synchronized</span> Booking</h2>
            <p className="text-slate-400 font-bold text-lg leading-relaxed">
              Skip the clinical queue with enterprise-grade priority. Verified specialists available for immediate bio-sync consultations within 120 minutes of authorization.
            </p>
          </div>
          <button 
            onClick={() => setBookingSpecialist(Specialists[1])}
            className="px-10 py-5 bg-white text-slate-950 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-50 transition-all active:scale-95 whitespace-nowrap shadow-xl"
          >
             Launch Rapid-Sync
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((specialist) => (
          <motion.div
            key={specialist.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-50 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all group"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-2xl relative">
                  {specialist.icon}
                  {specialist.verified && (
                    <div className="absolute -right-1 -top-1 bg-blue-600 text-white p-1 rounded-full border-2 border-white dark:border-slate-900 shadow-lg">
                      <ShieldCheck size={10} />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-slate-900 dark:text-white">{specialist.name}</h3>
                    {specialist.verified && (
                      <span className="text-[8px] font-black bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded uppercase tracking-widest border border-blue-100 dark:border-blue-800">Verified</span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">{specialist.specialty}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg text-amber-600 dark:text-amber-400 text-[10px] font-black">
                <Star size={12} fill="currentColor" /> {specialist.rating}
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <MapPin size={14} className="text-slate-400" /> {specialist.distance} away
              </div>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <Calendar size={14} className="text-slate-400" /> {specialist.availability}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                <MessageSquare size={14} /> Chat
              </button>
              <button 
                onClick={() => setBookingSpecialist(specialist)}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/20"
              >
                <Calendar size={14} /> Book
              </button>
            </div>
          </motion.div>
        ))}
      </section>

      <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              <ShieldCheck size={16} /> Verified Coverage
            </div>
            <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">Need help with insurance?</h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              We've partnered with leading healthcare providers to ensure your consultations are covered. Check your eligibility in seconds.
            </p>
          </div>
          <button className="bg-white text-slate-900 px-8 py-4 rounded-[1.5rem] font-black text-sm hover:bg-slate-50 transition-all shadow-xl active:scale-95 whitespace-nowrap">
            CHECK ELIGIBILITY
          </button>
        </div>
      </section>
    </div>
  );
};
