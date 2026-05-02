import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  ChevronRight, 
  ArrowRight,
  TrendingUp,
  Globe,
  Database,
  Lock,
  Plus,
  QrCode,
  DollarSign
} from 'lucide-react';

interface BillingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
}

const PLANS: BillingPlan[] = [
  {
    id: 'core',
    name: 'Clinical Core',
    price: '$0',
    period: 'Forever',
    description: 'Essential neural monitoring for individual health tracking.',
    features: [
      'Real-time Bio-Monitor',
      'Advanced Symptom Mapper',
      'Basic Digital Twin Analysis',
      'Clinical Protocol Access',
      'Standard Encryption'
    ]
  },
  {
    id: 'catalyst',
    name: 'Neural Catalyst',
    price: '$29',
    period: 'Per Month',
    description: 'Autonomous AI synthesis and specialist network priority.',
    isPopular: true,
    features: [
      'Unlimited AI Synthesis',
      '3D Organ Bio-Simulation',
      'Priority Support Queue',
      'Genetic Marker Analysis',
      'Enhanced Digital Twin v4',
      'Health Data Export (PDF/JSON)'
    ]
  },
  {
    id: 'quantum',
    name: 'Universal Quantum',
    price: '$99',
    period: 'Per Month',
    description: 'The ultimate healthcare framework for elite performance.',
    features: [
      'Everything in Catalyst',
      'Direct Clinical API Access',
      'Family Neural Cloud (5 users)',
      'Real-time Concierge MD',
      'Advanced Longevity Suite',
      'Custom Bio-Simulations'
    ]
  }
];

export const Billing: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>('catalyst');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto' | 'apple'>('card');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-16">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-800 mb-4"
        >
          <DollarSign size={12} className="animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Financial Protocols Active</span>
        </motion.div>
        <h1 className="text-4xl sm:text-6xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-4">
          Neural <span className="text-blue-600">Subscriptions</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">Scale your clinical intelligence with autonomous tiers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Plans Grid */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <motion.div
              key={plan.id}
              whileHover={{ y: -5 }}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative flex flex-col p-8 rounded-[2.5rem] border transition-all cursor-pointer ${
                selectedPlan === plan.id 
                  ? 'bg-white dark:bg-slate-900 border-blue-600 shadow-2xl ring-4 ring-blue-500/10' 
                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 hover:border-slate-200'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-blue-600 text-white text-[8px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg">
                  Most Synergy
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">{plan.name}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{plan.description}</p>
              </div>

              <div className="mb-10 flex items-baseline gap-1">
                <span className="text-4xl font-[1000] text-slate-900 dark:text-white tracking-tighter">{plan.price}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{plan.period}</span>
              </div>

              <ul className="space-y-4 mb-12 flex-grow">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-tight">{feature}</span>
                  </li>
                ))}
              </ul>

              <button className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                selectedPlan === plan.id 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' 
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300'
              }`}>
                {selectedPlan === plan.id ? 'Current Configuration' : 'Select Plan'}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Checkout / Payment Section */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl p-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
               <DollarSign size={160} />
            </div>
            
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
               <ShieldCheck className="text-emerald-500" /> Secure Terminal
            </h2>

            <div className="space-y-8 relative z-10">
              {/* Payment Methods */}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Payment Node</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'card', icon: <CreditCard size={16} /> },
                    { id: 'apple', icon: <Globe size={16} /> },
                    { id: 'crypto', icon: <Database size={16} /> }
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as any)}
                      className={`h-14 flex items-center justify-center rounded-2xl border transition-all ${
                        paymentMethod === method.id 
                          ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-600 text-blue-600' 
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      {method.icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary Card */}
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800/50">
                 <div className="flex justify-between items-center mb-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Configuration</p>
                    <p className="text-xs font-black uppercase text-blue-600">{PLANS.find(p => p.id === selectedPlan)?.name}</p>
                 </div>
                 <div className="flex justify-between items-center mb-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Renewal</p>
                    <p className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-300">Monthly</p>
                 </div>
                 <div className="h-px bg-slate-200 dark:bg-slate-700/50 mb-6" />
                 <div className="flex justify-between items-baseline">
                    <p className="text-sm font-black uppercase">Total Due</p>
                    <p className="text-3xl font-[1000] tracking-tighter">{PLANS.find(p => p.id === selectedPlan)?.price}</p>
                 </div>
              </div>

              {/* Submit */}
              <button className="w-full py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                 <Zap size={16} /> Activate Protocol
                 <ArrowRight size={16} />
              </button>

              <div className="flex items-center justify-center gap-3">
                 <Lock size={12} className="text-slate-400" />
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Quantum-level 256-bit AES encryption active</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
