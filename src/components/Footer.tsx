import React from 'react';
import { motion } from 'motion/react';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Github, 
  Mail, 
  Phone, 
  MapPin,
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe,
  ArrowUpRight
} from 'lucide-react';
import { Logo } from './Logo';

export const Footer: React.FC<{ onNavigate: (view: any) => void }> = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "System Nodes",
      links: [
        { label: "Dashboard", view: 'home' },
        { label: "AI Diagnostic Lab", view: 'diagnostic_lab' },
        { label: "Bio-Monitor", view: 'monitor' },
        { label: "Neural Network", view: 'ai_nexus' },
        { label: "CognisHub", view: 'neuro' }
      ]
    },
    {
      title: "Communication Matrix",
      links: [
        { label: "WhatsApp: 0787674140", href: "https://wa.me/256787674140" },
        { label: "X (Twitter)", href: "https://x.com" },
        { label: "Instagram", href: "https://instagram.com" },
        { label: "GitHub Architecture", href: "https://github.com" },
        { label: "Gmail Support", href: "mailto:gloriajayakullo@gmail.com" },
        { label: "Yahoo Systems", href: "mailto:doctorian.ai@yahoo.com" },
        { label: "LinkedIn Clinical", href: "https://linkedin.com" }
      ]
    },
    {
      title: "Clinical Resources",
      links: [
        { label: "Medical Records", view: 'records' },
        { label: "Specialist Network", view: 'specialist' },
        { label: "Bio-Pharmacy", view: 'meds' },
        { label: "Billing & Plans", view: 'billing' },
        { label: "Clinical Roadmaps", view: 'tasks' }
      ]
    }
  ];

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 pt-24 pb-12 px-4 relative overflow-hidden mt-auto">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-50/30 dark:bg-blue-900/10 rounded-full blur-[120px] -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-50/30 dark:bg-purple-900/10 rounded-full blur-[100px] translate-y-1/2" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Newsletter Synthesis Section */}
        <div className="mb-24 p-1 rounded-[3rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <div className="bg-white dark:bg-slate-900 rounded-[2.8rem] p-8 md:p-12 flex flex-col lg:flex-row items-center justify-between gap-12 shadow-sm">
            <div className="max-w-2xl text-center lg:text-left">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-4">
                Stay Synced with <span className="text-blue-600">Health Intelligence</span>
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest leading-relaxed">
                Join the neural network of over 50,000+ medical professionals and health-conscious individuals receiving weekly synthesis reports on longevity and clinical breakthroughs.
              </p>
            </div>
            <div className="w-full lg:w-auto">
              <form className="flex flex-col sm:flex-row gap-4 w-full max-w-md lg:max-w-none" onSubmit={(e) => e.preventDefault()}>
                <div className="relative flex-grow">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="email" 
                    placeholder="Enter your clinical address" 
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none dark:text-white"
                  />
                </div>
                <button className="px-8 py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/10 active:scale-95 whitespace-nowrap">
                  SYNC NOW
                </button>
              </form>
              <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center lg:text-left">
                Secured by HiPAA compliant encryption protocols.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-20">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center gap-3">
              <Logo className="w-10 h-10" />
              <span className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter">
                Doctorian <span className="text-blue-600">AI</span>
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-bold leading-relaxed uppercase tracking-widest max-w-sm">
              The world's most advanced neural healthcare synthesis framework. Bridging the gap between biological symptoms and clinical resolution through autonomous AI intelligence.
            </p>
            <div className="flex flex-wrap gap-4">
              {[Twitter, Instagram, Mail, Github, Globe].map((Icon, i) => {
                const links = [
                  "https://x.com", 
                  "https://instagram.com", 
                  "mailto:gloriajayakullo@gmail.com", 
                  "https://github.com",
                  "https://doctorian.ai"
                ];
                return (
                  <a 
                    key={i} 
                    href={links[i]} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all border border-slate-100 dark:border-slate-800"
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
            <div className="pt-4">
               <a 
                href="https://wa.me/256787674140" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-500/10 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all group shadow-sm shadow-emerald-500/10"
               >
                 <Phone size={14} className="group-hover:rotate-12 transition-transform" />
                 Secure WhatsApp: 0787674140
               </a>
            </div>
          </div>

          {/* Link Groups */}
          {footerLinks.map((group, i) => (
            <div key={i} className="space-y-6">
              <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.3em] border-l-2 border-blue-600 pl-4">{group.title}</h4>
              <ul className="space-y-4">
                {group.links.map((link: any, j) => (
                  <li key={j}>
                    {link.href ? (
                      <a 
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2 group"
                      >
                        <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                        {link.label}
                      </a>
                    ) : (
                      <button 
                        onClick={() => onNavigate(link.view)}
                        className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2 group"
                      >
                        <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                        {link.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Status Section */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.3em] border-l-2 border-emerald-500 pl-4">System Status</h4>
            <div className="bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50 rounded-2xl p-4">
               <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest">All Nodes Nominal</span>
               </div>
               <p className="text-[9px] font-bold text-emerald-800/60 dark:text-emerald-400/60 uppercase">Last Registry: {new Date().toLocaleTimeString()}</p>
            </div>
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
               <Globe className="text-slate-400" size={16} />
               <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Active Region</p>
                  <p className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase">Global Catalyst</p>
               </div>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">© {currentYear} Doctorian AI. All rights served.</p>
            <div className="hidden h-4 w-px bg-slate-200 dark:bg-slate-800 md:block" />
            <div className="flex items-center gap-2">
               <ShieldCheck size={14} className="text-emerald-500" />
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">HiPAA Compliant Encryption</span>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <button className="text-[10px] font-black text-slate-400 hover:text-slate-900 dark:hover:text-white uppercase tracking-widest">Version v4.0.2-Stable</button>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-10 h-10 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl"
            >
              <Zap size={16} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
