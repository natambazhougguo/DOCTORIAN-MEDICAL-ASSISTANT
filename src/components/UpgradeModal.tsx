import React, { useState } from 'react';
import { 
  Zap, Crown, Check, Shield, Activity, Sparkles, 
  Brain, Rocket, Globe, CreditCard, X, Loader2, ArrowLeft,
  MessageSquare, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api, User } from '../api';

import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';

interface UpgradeModalProps {
  user: User | null;
  onClose: () => void;
  onUpdate: (user: User) => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ user, onClose, onUpdate }) => {
  const [loading, setLoading] = useState<string | null>(null);

  const tiers = [
    {
      id: 'free',
      name: 'Standard',
      price: '0',
      description: 'Community node',
      features: [
        '5 Consultation Credits',
        'Standard AI Chat',
        'Basic Health Tracking',
        'Public Community Access'
      ],
      color: 'bg-slate-100 dark:bg-slate-800',
      textColor: 'text-slate-600 dark:text-slate-400',
      buttonText: 'Current Plan',
      active: user?.subscriptionTier === 'free'
    },
    {
      id: 'pro',
      name: 'Doctorian Pro',
      price: '15,000',
      description: 'Advanced clinical suite',
      features: [
        'Unlimited AI Consults',
        'OCR Prescription Reading',
        'PDF Medical Reports',
        'Priority SMS Alerts',
        'Advanced Bio-Metrics'
      ],
      color: 'bg-blue-600',
      textColor: 'text-blue-600',
      buttonText: 'Upgrade to Pro',
      active: ['pro', 'silver', 'enterprise', 'business'].includes(user?.subscriptionTier || ''),
      highlight: true
    },
    {
      id: 'business',
      name: 'Clinic Matrix',
      price: '85,000',
      description: 'Institutional license',
      features: [
        'Up to 10 Practitioners',
        'Institutional API Access',
        'White-Label Dashboard',
        'B2B SACCO Licensing',
        'Full Data Export',
        '24/7 Clinical Support'
      ],
      color: 'bg-emerald-600',
      textColor: 'text-emerald-600',
      buttonText: 'Activate Business',
      active: user?.subscriptionTier === 'business' || user?.subscriptionTier === 'gold'
    }
  ];

  const creditBundles = [
    {
      id: 'bundle_starter',
      name: 'Starter Pulse',
      credits: 20,
      price: '5,000',
      icon: <Sparkles size={16} />
    },
    {
      id: 'bundle_pro',
      name: 'Power Pulse',
      credits: 50,
      price: '10,000',
      icon: <Zap size={16} />
    },
    {
      id: 'bundle_unlimited',
      name: 'Neural Zap',
      credits: 200,
      price: '30,000',
      icon: <Rocket size={16} />
    }
  ];

  const [currency, setCurrency] = useState('USD');
  const [selectedTier, setSelectedTier] = useState<any>(null);
  const [success, setSuccess] = useState(false);

  const currencies = [
    { code: 'UGX', label: 'UGX (Uganda)' },
    { code: 'USD', label: 'USD (United States)' },
    { code: 'KES', label: 'KES (Kenya)' },
    { code: 'EUR', label: 'EUR (Europe)' },
  ];

  const flutterwavePublicKey = (import.meta as any).env.VITE_FLUTTERWAVE_PUBLIC_KEY || 'FLWPUBK_TEST-SANDBOX-KEY';

  const config = {
    public_key: flutterwavePublicKey,
    tx_ref: `DOCTORIAN-${Date.now()}`,
    amount: selectedTier ? (parseInt(selectedTier.id.startsWith('bundle') ? (selectedTier.price.replace(',', '')) : (selectedTier.price.replace(',', ''))) / (currency === 'UGX' ? 1 : (currency === 'USD' ? 3800 : 3800))) : 0, 
    currency: currency,
    payment_options: 'card,mobilemoney,ussd',
    customer: {
      email: user?.email || 'patient@doctorian.ai',
      phone_number: '',
      name: user?.displayName || 'Valued Patient',
    },
    customizations: {
      title: 'Doctorian AI Protocol',
      description: `Activation of ${selectedTier?.name} Neural Framework`,
      logo: 'https://doctorian.ai/logo.svg',
    },
  };

  if (currency === 'UGX') {
    config.amount = selectedTier ? parseInt(selectedTier.price.replace(',', '')) : 0;
  } else if (currency === 'USD') {
     // Approx conversion if prices are in UGX in the tiers object
     config.amount = selectedTier ? Math.ceil(parseInt(selectedTier.price.replace(',', '')) / 3800) : 0;
  }

  const handleFlutterPayment = useFlutterwave(config);

  const handleUpgrade = () => {
    if (!selectedTier || !user) return;
    setLoading(selectedTier.id);

    handleFlutterPayment({
      callback: async (response) => {
        if (response.status === "successful" || response.status === "completed") {
          try {
            const planId = selectedTier.id === 'pro' ? 'catalyst' : (selectedTier.id === 'business' ? 'quantum' : selectedTier.id);
            const res = await fetch('/api/billing/subscribe', {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                planId,
                externalId: response.transaction_id.toString()
              }),
            });
            const data = await res.json();
            if (data.success) {
              setSuccess(true);
              const userRes = await fetch('/api/auth/me');
              const userData = await userRes.json();
              if (userData.user) onUpdate(userData.user);
            }
          } catch (err) {
            console.error("Subscription update failed:", err);
          }
        }
        closePaymentModal();
        setLoading(null);
      },
      onClose: () => {
        setLoading(null);
      },
    });
  };

  const whatsappLink = `https://wa.me/256787674140?text=Hello Doctorian Admin, I have just initiated a ${selectedTier?.name || 'Pro'} upgrade and submitted my evidence. Please verify.`;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-slate-950 w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden relative border border-white/10"
      >
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all z-10"
        >
          <X size={20} />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[90vh] overflow-y-auto no-scrollbar">
          {/* Left Panel: Promo */}
          <div className="lg:col-span-4 bg-slate-900 p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] -mr-32 -mt-32 rounded-full" />
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/20 blur-[100px] -ml-32 -mb-32 rounded-full" />
             
             <div className="relative z-10">
               <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-blue-600/40">
                 <Sparkles size={24} className="text-white" />
               </div>
               <h2 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase leading-none mb-6">Unleash <br /><span className="text-blue-500">Clinical</span> Power</h2>
               <p className="text-slate-400 font-medium text-sm leading-relaxed mb-8">Upgrade to Pro or Premium to unlock real-time operational health ideas and elite AI performance.</p>
               
               <div className="space-y-4">
                 {[
                   { icon: <Zap size={16} />, text: 'Real MTN/Airtel Support' },
                   { icon: <Shield size={16} />, text: 'Verification System' },
                   { icon: <Globe size={16} />, text: '0787 674140' }
                 ].map((item, i) => (
                   <div key={i} className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-300">
                     <span className="text-blue-500">{item.icon}</span>
                     {item.text}
                   </div>
                 ))}
               </div>
             </div>

             <div className="mt-12 relative z-10">
               <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Developed By</p>
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-black text-xs">AJ</div>
                    <span className="text-xs font-black">Akora Joseph</span>
                 </div>
               </div>
             </div>
          </div>

          <div className="lg:col-span-8 p-8 sm:p-12">
            {success ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto"
              >
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-3xl flex items-center justify-center text-emerald-600 mb-8">
                  <Check size={40} strokeWidth={3} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">Verification Initiated</h3>
                <p className="text-sm font-medium text-slate-500 mb-8">Your payment evidence has been delivered to Akora Joseph. Please wait 5-10 minutes for neural link activation.</p>
                <div className="space-y-4 w-full">
                  <a 
                    href={whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-3 w-full py-4 bg-[#25D366] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-emerald-500/20"
                  >
                    <MessageSquare size={16} />
                    Message Admin Now
                  </a>
                  <button 
                    onClick={onClose}
                    className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Close Window
                  </button>
                </div>
              </motion.div>
            ) : !selectedTier ? (
              <>
                <header className="mb-12">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full mb-4 inline-block">Subscription Matrix</span>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Choose Your Performance Level</h3>
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800">
                       <span className="text-[9px] font-black text-slate-400 uppercase">Currency</span>
                       <select 
                        value={currency} 
                        onChange={(e) => setCurrency(e.target.value)}
                        className="bg-transparent border-none text-[10px] font-black uppercase outline-none focus:ring-0 cursor-pointer"
                       >
                         {currencies.map(c => <option key={c.code} value={c.code} className="bg-white dark:bg-slate-900">{c.code}</option>)}
                       </select>
                    </div>
                  </div>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                  {tiers.map((tier) => (
                    <div 
                      key={tier.id}
                      className={`relative p-6 sm:p-8 rounded-[2.5rem] border transition-all flex flex-col h-full ${
                        tier.highlight 
                          ? 'bg-slate-50 dark:bg-slate-900 border-blue-200 dark:border-blue-900 shadow-xl shadow-blue-100 dark:shadow-none ring-4 ring-blue-50 dark:ring-blue-900/10' 
                          : 'bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800'
                      }`}
                    >
                      {tier.highlight && (
                        <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[8px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">Recommended</span>
                      )}
                      
                      <div className="mb-6">
                        <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase mb-1">{tier.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{tier.description}</p>
                      </div>

                      <div className="mb-8">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">
                            {currency === 'UGX' ? tier.price : (parseInt(tier.price.replace(',', '')) / (currency === 'USD' ? 3800 : currency === 'KES' ? 28 : 4100)).toFixed(1)}
                          </span>
                          <span className="text-xs font-black text-slate-400 uppercase">{currency}</span>
                        </div>
                      </div>

                      <ul className="space-y-3 mb-8 flex-1">
                        {tier.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                            <Check size={14} className="text-blue-500 shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <button
                        disabled={tier.active}
                        onClick={() => setSelectedTier(tier)}
                        className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 ${
                          tier.active
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800'
                            : tier.id === 'free'
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                            : tier.id === 'business'
                            ? 'bg-emerald-600 text-white hover:shadow-xl shadow-emerald-500/20'
                            : 'bg-slate-900 dark:bg-blue-600 text-white hover:shadow-xl'
                        }`}
                      >
                        {tier.active ? <><Check size={16} /> Active</> : tier.buttonText}
                      </button>
                    </div>
                  ))}
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-px bg-slate-100 dark:bg-slate-800 flex-1" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Or Neural Credit Bundles</span>
                    <div className="h-px bg-slate-100 dark:bg-slate-800 flex-1" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {creditBundles.map((bundle) => (
                      <button
                        key={bundle.id}
                        onClick={() => setSelectedTier({...bundle, id: bundle.id})}
                        className="p-6 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[2rem] hover:border-blue-600 transition-all text-left group"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            {bundle.icon}
                          </div>
                          <span className="text-xs font-black text-slate-900 dark:text-white">{bundle.price} {currency}</span>
                        </div>
                        <h5 className="text-[11px] font-black text-slate-900 dark:text-white uppercase mb-1">{bundle.name}</h5>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">{bundle.credits} Consultations</p>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="max-w-md mx-auto"
              >
                <button 
                  onClick={() => {
                    setSelectedTier(null);
                  }}
                  className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <ArrowLeft size={14} /> Back to Plans
                </button>

                <div className="p-8 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] mb-8">
                   <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase mb-4">Neural Gateway</h4>
                   
                   <div className="space-y-6">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                        You are about to activate the <span className="font-bold text-blue-600">{selectedTier?.name}</span> protocol for <span className="font-bold">{currency === 'USD' ? '$' : ''}{config.amount} {currency}</span>. 
                      </p>
                      
                      <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col gap-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                          <span className="text-slate-400">Recipient</span>
                          <span className="text-slate-900 dark:text-white">Doctorian AI Suite</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                          <span className="text-slate-400">Network</span>
                          <span className="text-slate-900 dark:text-white">Secure Global Mesh</span>
                        </div>
                      </div>

                      <button
                        onClick={handleUpgrade}
                        className="w-full py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2 transition-all hover:bg-blue-700 disabled:opacity-50"
                      >
                        {loading === selectedTier?.id ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Establishing Secure Link...
                          </>
                        ) : (
                          <>
                            <CreditCard size={16} />
                            Authorize Payment
                          </>
                        )}
                      </button>
                   </div>
                </div>

                <div className="p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-dashed border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <Shield size={16} className="text-emerald-500 shrink-0" />
                    <div>
                      <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">Flutterwave Protection Active</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase leading-tight">Your transaction is encrypted at the hardware level. Neural link activation is instantaneous upon successful gateway authorization.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <footer className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-slate-100 dark:border-slate-800">
               <div className="flex items-center gap-4">
                 <div className="flex -space-x-2">
                   {[1,2,3].map(i => <div key={i} className={`w-8 h-8 rounded-full border-2 border-white dark:border-slate-950 bg-slate-${200 + i * 100}`} />)}
                 </div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Secured by Akora Joseph's Direct Verification</p>
               </div>
            </footer>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
