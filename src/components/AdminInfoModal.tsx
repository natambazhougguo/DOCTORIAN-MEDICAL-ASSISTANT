import React, { useState, useEffect } from 'react';
import { Bell, PlusCircle, Heart, GraduationCap, Wallet, Info, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../api';

interface AdminInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminInfoModal: React.FC<AdminInfoModalProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const fetchNotifications = async () => {
        setLoading(true);
        try {
          const data = await api.notifications.list();
          setNotifications(data);
        } catch (err) {
          console.error("Failed to fetch notifications:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchNotifications();
    }
  }, [isOpen]);

  const STATIC_INFO = [
    {
      icon: <Heart className="w-5 h-5 text-rose-500" />,
      label: "Health & Wellness",
      content: "Prioritize your health by staying hydrated (8+ glasses/day), maintaining a balanced diet, and getting 7-9 hours of sleep."
    },
    {
      icon: <Wallet className="w-5 h-5 text-emerald-500" />,
      label: "School Fees (Dr. Obote College)",
      content: "Estimated at UGX 865,000 per term for tuition and boarding. Fees include accommodation and meals."
    },
    {
      icon: <GraduationCap className="w-5 h-5 text-blue-500" />,
      label: "Admission Information",
      content: "Applications are open for the current academic year. Visit drobotecollege.sc.ug for requirements."
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-info-modal-title"
          className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-md p-4 flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-blue-600 text-white">
              <div className="flex items-center gap-3">
                <Bell size={24} aria-hidden="true" />
                <h3 id="admin-info-modal-title" className="text-xl font-black tracking-tight uppercase">Platform Updates</h3>
              </div>
              <button 
                onClick={onClose}
                aria-label="Close modal"
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              >
                <PlusCircle size={24} className="rotate-45" aria-hidden="true" />
              </button>
            </div>
            
            <div className="p-8 max-h-[60vh] overflow-y-auto space-y-8 custom-scrollbar">
              {/* Real Admin Notifications */}
              <section className="space-y-4" aria-labelledby="latest-broadcasts-title">
                <h4 id="latest-broadcasts-title" className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2">
                  <Bell size={14} aria-hidden="true" />
                  Latest Broadcasts
                </h4>
                
                {loading ? (
                  <div className="flex justify-center py-8" role="status">
                    <Loader2 className="animate-spin text-blue-600" size={24} />
                    <span className="sr-only">Loading broadcasts...</span>
                  </div>
                ) : notifications.length > 0 ? (
                  <div className="space-y-4">
                    {notifications.map((n) => (
                      <article key={n.id} className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-3xl border border-blue-100 dark:border-blue-800/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                            n.type === 'alert' ? 'bg-rose-100 text-rose-600' : 
                            n.type === 'update' ? 'bg-blue-100 text-blue-600' : 
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {n.type}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h5 className="font-black text-slate-900 dark:text-white text-sm mb-1">{n.title}</h5>
                        <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">{n.content}</p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 text-center">
                    <p className="text-slate-400 text-xs font-bold">No new broadcasts from administration.</p>
                  </div>
                )}
              </section>

              {/* Static Platform Info */}
              <section className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800" aria-labelledby="platform-resources-title">
                <h4 id="platform-resources-title" className="text-xs font-black text-slate-400 uppercase tracking-widest">Platform Resources</h4>
                <div className="space-y-4">
                  {STATIC_INFO.map((section, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-2xl border border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="shrink-0 mt-1" aria-hidden="true">
                        {section.icon}
                      </div>
                      <div>
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{section.label}</h5>
                        <p className="text-slate-900 dark:text-slate-200 font-bold text-xs leading-relaxed">{section.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="p-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button 
                onClick={onClose}
                className="px-8 py-3 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-slate-800 dark:hover:bg-blue-700 transition-all"
              >
                DISMISS
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
