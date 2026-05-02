import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HelpCircle, 
  BookOpen, 
  Users, 
  ShieldCheck, 
  FileText, 
  LifeBuoy, 
  MessageSquare,
  MessageCircle,
  ArrowLeft,
  Search,
  ExternalLink,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  MapPin,
  Send,
  Brain,
  Activity,
  Heart,
  Stethoscope,
  Shield
} from 'lucide-react';

export type ResourceType = 'help' | 'community' | 'privacy' | 'terms' | 'feedback' | 'protocols';

interface ResourceViewProps {
  type: ResourceType;
  onBack: () => void;
}

export const ResourceView: React.FC<ResourceViewProps> = ({ type, onBack }) => {
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState<string | null>(null);

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleContactWhatsApp = (message: string = "Hello, I need assistance with Doctorian AI.") => {
    const url = `https://wa.me/256787674140?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleContactEmail = (subject: string = "Doctorian AI Support Request", body: string = "Hello, I need assistance with...") => {
    const url = `mailto:josephhaxzy@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
  };

  const handleSubmitFeedback = () => {
    if (!feedbackText.trim()) return;
    setIsSubmitted(true);
    const message = `Feedback for Doctorian AI\nRating: ${rating || 'Not rated'}\n\nMessage: ${feedbackText}`;
    
    setTimeout(() => {
      handleContactEmail("Doctorian AI User Feedback", message);
      setFeedbackText('');
      setRating(null);
    }, 2000);
  };

  const renderContent = () => {
    switch (type) {
      case 'help':
        return (
          <section className="space-y-12" aria-labelledby="help-center-title">
            <div className="text-center max-w-2xl mx-auto">
              <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto mb-6" aria-hidden="true">
                <HelpCircle size={32} />
              </div>
              <h2 id="help-center-title" className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Help Center</h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold">Everything you need to know about using Doctorian AI effectively.</p>
            </div>

            <div className="space-y-8">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                <div className="w-2 h-8 bg-blue-600 rounded-full" aria-hidden="true" />
                Frequently Asked Questions
              </h3>
              <div className="grid md:grid-cols-2 gap-6" role="region" aria-label="FAQ list">
                {[
                  { q: "How does the AI analyze my symptoms?", a: "Doctorian AI uses advanced natural language processing trained on medical literature to identify potential health patterns. It is not a diagnostic tool but a guidance companion." },
                  { q: "Is my medical data secure?", a: "Yes, we use end-to-end encryption and are HIPAA compliant. Your data is stored securely and never shared with third parties without your consent." },
                  { q: "Can I connect my own medical devices?", a: "Currently, we support Arduino-based monitors via Bluetooth, WiFi, and Serial. We are working on integration with popular wearables like Apple Watch and Fitbit." },
                  { q: "What should I do in an emergency?", a: "Doctorian AI is for informational purposes only. In a life-threatening emergency, always contact your local emergency services (e.g., 911) immediately." },
                  { q: "Is Doctorian AI free to use?", a: "We offer a generous free tier for basic symptom analysis and health tracking. Premium features like advanced anatomical rendering are available via subscription." },
                  { q: "Does it support multiple languages?", a: "Yes, Doctorian AI currently supports over 50 languages. You can interact with the AI in your native language for better clarity." },
                  { q: "How do I sync my Arduino monitor?", a: "Go to the 'Vitals' section and click 'Connect Device'. Ensure your Arduino is in pairing mode or connected via Serial/USB." },
                  { q: "Can I share my reports with my doctor?", a: "Absolutely. You can export your health summaries and AI insights as a PDF directly from the 'Records' tab." }
                ].map((faq, i) => (
                  <motion.article 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group"
                  >
                    <h4 className="font-black text-slate-900 dark:text-white mb-3 flex items-start gap-3 group-hover:text-blue-600 transition-colors">
                      <span className="text-blue-600 dark:text-blue-400 mt-1" aria-hidden="true">Q:</span>
                      {faq.q}
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium pl-7">
                      <span className="sr-only">Answer: </span>
                      {faq.a}
                    </p>
                  </motion.article>
                ))}
              </div>
            </div>

            <section className="bg-blue-600 rounded-[2.5rem] p-8 sm:p-12 text-white relative overflow-hidden" aria-labelledby="support-title">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-center md:text-left">
                  <h3 id="support-title" className="text-2xl font-black mb-2">Still need help?</h3>
                  <p className="text-blue-100 font-bold opacity-90">Our support team is available 24/7 for technical assistance.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => handleContactWhatsApp()}
                    aria-label="Contact us via WhatsApp"
                    className="group relative bg-emerald-500 text-white px-8 py-5 rounded-[2rem] font-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-500/20 whitespace-nowrap flex items-center justify-center gap-3 border border-white/20 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/0 via-emerald-600/0 to-emerald-400/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10 bg-white/20 p-2 rounded-xl group-hover:rotate-12 transition-transform">
                      <MessageCircle size={20} aria-hidden="true" />
                    </div>
                    <span className="relative z-10 uppercase tracking-widest text-xs">WhatsApp Support</span>
                  </button>
                  <button 
                    onClick={() => handleContactEmail()}
                    aria-label="Contact us via Email"
                    className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black hover:bg-blue-50 transition-all shadow-xl hover:scale-105 active:scale-95 whitespace-nowrap flex items-center justify-center gap-2"
                  >
                    <Mail size={20} aria-hidden="true" />
                    EMAIL US
                  </button>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" aria-hidden="true"></div>
            </section>
          </section>
        );


      case 'community':
        return (
          <section className="space-y-12" aria-labelledby="community-hub-title">
            <div className="text-center max-w-2xl mx-auto">
              <div className="bg-sky-100 dark:bg-sky-900/30 w-16 h-16 rounded-2xl flex items-center justify-center text-sky-600 dark:text-sky-400 mx-auto mb-6" aria-hidden="true">
                <Users size={32} />
              </div>
              <h2 id="community-hub-title" className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Community Hub</h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold">Connect with health professionals and AI enthusiasts around the world.</p>
            </div>

            <div className="grid sm:grid-cols-3 gap-6" role="list" aria-label="Community Channels">
              {[
                { label: 'Discord Server', count: '12.4k members', icon: <MessageSquare className="text-indigo-500" />, color: 'bg-indigo-50' },
                { label: 'Medical Forum', count: '450 active topics', icon: <Users className="text-emerald-500" />, color: 'bg-emerald-50' },
                { label: 'Twitter / X', count: '85k followers', icon: <MessageSquare className="text-sky-500" />, color: 'bg-sky-50' }
              ].map((c, i) => (
                <div 
                  key={i} 
                  role="listitem"
                  tabIndex={0}
                  className={`${c.color} dark:bg-slate-900 p-6 rounded-3xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-sky-500`}
                >
                  <div className="bg-white dark:bg-slate-800 w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform" aria-hidden="true">
                    {c.icon}
                  </div>
                  <h4 className="font-black text-slate-900 dark:text-white mb-1">{c.label}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.count}</p>
                </div>
              ))}
            </div>

            <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 sm:p-12 shadow-sm" aria-labelledby="upcoming-events-title">
              <h3 id="upcoming-events-title" className="text-xl font-black text-slate-900 dark:text-white mb-8">Upcoming Community Events</h3>
              <div className="space-y-6">
                {[
                  { title: 'AI in Modern Diagnostics Webinar', date: 'April 15, 2026', host: 'Dr. Sarah Chen' },
                  { title: 'Developer Hackathon: Health Tech', date: 'May 02, 2026', host: 'Doctorian Dev Team' }
                ].map((ev, i) => (
                  <article key={i} className="flex items-center justify-between gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 rounded-xl flex flex-col items-center justify-center text-blue-600 dark:text-blue-400" aria-label={`Date: ${ev.date}`}>
                        <span className="text-[10px] font-black leading-none" aria-hidden="true">{ev.date.split(' ')[0]}</span>
                        <span className="text-sm font-black" aria-hidden="true">{ev.date.split(' ')[1].replace(',', '')}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{ev.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Hosted by {ev.host}</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black hover:bg-slate-800 transition-all uppercase tracking-widest" aria-label={`Register for ${ev.title}`}>REGISTER</button>
                  </article>
                ))}
              </div>
            </section>
          </section>
        );

      case 'privacy':
      case 'terms':
        const isPrivacy = type === 'privacy';
        return (
          <section className="space-y-12" aria-labelledby="policy-title">
            <div className="flex items-center gap-6">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isPrivacy ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'}`} aria-hidden="true">
                {isPrivacy ? <ShieldCheck size={32} /> : <FileText size={32} />}
              </div>
              <div>
                <h2 id="policy-title" className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{isPrivacy ? 'Privacy Policy' : 'Terms & Conditions'}</h2>
                <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Last updated: April 10, 2026</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 sm:p-12 shadow-sm space-y-8 max-w-4xl">
              {isPrivacy ? (
                <>
                  <section aria-labelledby="privacy-1">
                    <h3 id="privacy-1" className="text-lg font-black text-slate-900 dark:text-white mb-4">1. Data Collection</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      We collect information you provide directly to us, such as when you create an account, sync medical devices, or communicate with our AI. This includes health vitals, symptoms, and personal identifiers necessary for medical guidance.
                    </p>
                  </section>
                  <section aria-labelledby="privacy-2">
                    <h3 id="privacy-2" className="text-lg font-black text-slate-900 dark:text-white mb-4">2. How We Use Your Data</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      Your data is primarily used to provide personalized health insights and improve our AI models. We use end-to-end encryption to ensure that your sensitive medical information remains private and accessible only to you.
                    </p>
                  </section>
                  <section aria-labelledby="privacy-3">
                    <h3 id="privacy-3" className="text-lg font-black text-slate-900 dark:text-white mb-4">3. Data Sharing</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      Doctorian AI does not sell or rent your personal data to third parties. We only share data with medical professionals or services you explicitly authorize within the application.
                    </p>
                  </section>
                </>
              ) : (
                <>
                  <section aria-labelledby="terms-1">
                    <h3 id="terms-1" className="text-lg font-black text-slate-900 dark:text-white mb-4">1. Acceptance of Terms</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      By accessing or using Doctorian AI ("the Service"), you agree to be bound by these Terms and Conditions. These terms constitute a legally binding agreement between you and Doctorian AI.
                    </p>
                  </section>
                  <section aria-labelledby="terms-2">
                    <h3 id="terms-2" className="text-lg font-black text-slate-900 dark:text-white mb-4">2. MEDICAL DISCLAIMER - NOT FOR EMERGENCIES</h3>
                    <div className="p-6 bg-rose-50 dark:bg-rose-900/20 border-2 border-rose-100 dark:border-rose-800 rounded-3xl text-rose-700 dark:text-rose-400 text-sm font-black leading-relaxed" role="alert">
                      <span className="uppercase text-rose-800 dark:text-rose-300">Warning:</span> DOCTORIAN AI IS AN ARTIFICIAL INTELLIGENCE TOOL DESIGNED FOR INFORMATIONAL AND EDUCATIONAL PURPOSES ONLY. IT IS NOT A MEDICAL DEVICE, DOES NOT PROVIDE MEDICAL DIAGNOSES, AND IS NOT A SUBSTITUTE FOR PROFESSIONAL MEDICAL ADVICE, TREATMENT, OR JUDGMENT.
                      <br /><br />
                      IF YOU ARE EXPERIENCING A MEDICAL EMERGENCY, CALL YOUR LOCAL EMERGENCY SERVICES (E.G., 911) IMMEDIATELY. NEVER DELAY SEEKING PROFESSIONAL MEDICAL ADVICE BECAUSE OF SOMETHING YOU HAVE READ ON THIS SERVICE.
                    </div>
                  </section>
                  <section aria-labelledby="terms-3">
                    <h3 id="terms-3" className="text-lg font-black text-slate-900 dark:text-white mb-4">3. User Responsibilities</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      You are responsible for providing accurate health data and for the security of your account. You agree not to use the Service for any unlawful purpose or in any way that could damage, disable, or impair the Service. You acknowledge that the responsibility for any medical decisions remains solely with you and your healthcare provider.
                    </p>
                  </section>
                  <section aria-labelledby="terms-4">
                    <h3 id="terms-4" className="text-lg font-black text-slate-900 dark:text-white mb-4">4. Intellectual Property</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      All content, features, and functionality of the Service, including but not limited to the AI models, anatomical renderings, and user interface, are the exclusive property of Doctorian AI and its licensors. You are granted a limited, non-exclusive license to use the Service for personal, non-commercial purposes.
                    </p>
                  </section>
                  <section aria-labelledby="terms-5">
                    <h3 id="terms-5" className="text-lg font-black text-slate-900 dark:text-white mb-4">5. Service Limitations & Accuracy</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      While we strive for accuracy, medical knowledge is constantly evolving. The AI-generated insights may contain errors, be outdated, or be incomplete. The Service is provided "as is" and "as available" without any warranties of any kind. You should always verify any health-related information with a qualified healthcare professional.
                    </p>
                  </section>
                  <section aria-labelledby="terms-6">
                    <h3 id="terms-6" className="text-lg font-black text-slate-900 dark:text-white mb-4">6. Device Integration</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      The Service allows connection to external hardware (e.g., Arduino monitors). You acknowledge that Doctorian AI is not responsible for the accuracy, safety, or reliability of third-party hardware or the data transmitted from such devices.
                    </p>
                  </section>
                  <section aria-labelledby="terms-7">
                    <h3 id="terms-7" className="text-lg font-black text-slate-900 dark:text-white mb-4">7. Limitation of Liability</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      To the maximum extent permitted by law, Doctorian AI and its developers shall not be liable for any direct, indirect, incidental, or consequential damages resulting from your use of the Service or reliance on its AI-generated content.
                    </p>
                  </section>
                </>
              )}
            </div>
          </section>
        );


      case 'protocols':
        return (
          <section className="space-y-12" aria-labelledby="protocols-title">
            <div className="text-center max-w-2xl mx-auto">
              <div className="bg-purple-100 dark:bg-purple-900/30 w-16 h-16 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400 mx-auto mb-6" aria-hidden="true">
                <BookOpen size={32} />
              </div>
              <h2 id="protocols-title" className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight text-high-visibility uppercase">Clinical Protocols</h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold text-lg leading-relaxed">Standardized diagnostic frameworks and neuro-clinical guidelines for authorized personnel.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                { 
                  title: "Neuro-Anatomy Visualization", 
                  desc: "Protocols for multi-layered anatomical rendering and neural pathway mapping.",
                  status: "Certified",
                  icon: <Brain size={24} className="text-purple-500" />
                },
                { 
                  title: "Biometric Data Handling", 
                  desc: "Procedures for secure capture, transmission, and synthesis of real-time vital streams.",
                  status: "Standard",
                  icon: <Activity size={24} className="text-emerald-500" />
                },
                { 
                  title: "AI-Assisted Diagnostic Flow", 
                  desc: "Neural network validation steps for cross-referencing AI insights with clinical literature.",
                  status: "Verified",
                  icon: <Stethoscope size={24} className="text-blue-500" />
                },
                { 
                  title: "Surgical Simulation Pre-Op", 
                  desc: "Pre-operative digital twin modeling and risk assessment calibration protocols.",
                  status: "Critical",
                  icon: <Heart size={24} className="text-rose-500" />
                }
              ].map((protocol, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group">
                  <div className="flex items-start justify-between mb-6">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl group-hover:scale-110 transition-transform">
                      {protocol.icon}
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      protocol.status === 'Certified' ? 'bg-blue-100 text-blue-600' :
                      protocol.status === 'Verified' ? 'bg-emerald-100 text-emerald-600' :
                      protocol.status === 'Critical' ? 'bg-rose-100 text-rose-600 text-pulse' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {protocol.status}
                    </span>
                  </div>
                  <h4 className="text-xl font-black text-slate-900 dark:text-white mb-3 text-high-visibility uppercase tracking-tight">{protocol.title}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6">{protocol.desc}</p>
                  <button className="w-full py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all">
                    Initialize Protocol
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-slate-900 text-white p-10 rounded-[3rem] relative overflow-hidden">
               <div className="relative z-10">
                 <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter">System-Wide Compliance</h3>
                 <p className="text-slate-400 text-sm max-w-2xl mb-8 font-medium">All protocols are dynamically updated from the Cognis Global Repository. Last sync: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}.</p>
                 <div className="flex gap-4">
                   <div className="px-4 py-2 bg-white/10 rounded-xl flex items-center gap-2 border border-white/10">
                      <Shield size={16} className="text-emerald-400" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">ISO 27001 Certified</span>
                   </div>
                   <div className="px-4 py-2 bg-white/10 rounded-xl flex items-center gap-2 border border-white/10">
                      <CheckCircle2 size={16} className="text-blue-400" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">HIPAA Compliant</span>
                   </div>
                 </div>
               </div>
               <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-600 opacity-20 blur-3xl rounded-full"></div>
            </div>
          </section>
        );

      case 'feedback':
        return (
          <section className="space-y-12" aria-labelledby="feedback-title">
            <div className="text-center max-w-2xl mx-auto">
              <div className="bg-emerald-100 dark:bg-emerald-900/30 w-16 h-16 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-6" aria-hidden="true">
                <MessageSquare size={32} />
              </div>
              <h2 id="feedback-title" className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Share Your Feedback</h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold">Help us build the future of healthcare by sharing your thoughts.</p>
            </div>

            <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200 dark:shadow-slate-950/50 relative overflow-hidden">
              <AnimatePresence mode="wait">
                {isSubmitted ? (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="py-12 text-center space-y-6"
                  >
                    <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto border-4 border-emerald-50 dark:border-emerald-800 animate-bounce">
                      <CheckCircle2 size={48} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Feedback Synchronized</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-bold max-w-sm mx-auto">Your insights have been transmitted to the core intelligence protocols for processing. Thank you for building the future with us.</p>
                    <button 
                      onClick={() => setIsSubmitted(false)}
                      className="text-blue-600 font-black text-xs uppercase tracking-widest hover:underline pt-4"
                    >
                      SEND ANOTHER REPORT
                    </button>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-8"
                  >
                    <section aria-labelledby="rating-title">
                      <h3 id="rating-title" className="text-lg font-black text-slate-900 dark:text-white mb-6 text-center">How would you rate your experience?</h3>
                      <div className="flex justify-center gap-4 sm:gap-6" role="radiogroup" aria-labelledby="rating-title">
                        {[
                          { emoji: '😞', label: 'Unsatisfied' },
                          { emoji: '😐', label: 'Neutral' },
                          { emoji: '😊', label: 'Satisfied' },
                          { emoji: '🤩', label: 'Excellent' }
                        ].map((item, i) => (
                          <button 
                            key={i} 
                            onClick={() => setRating(item.emoji)}
                            aria-label={item.label}
                            aria-checked={rating === item.emoji}
                            role="radio"
                            className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl transition-all border outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20 ${
                              rating === item.emoji 
                                ? 'bg-blue-600 border-blue-500 scale-110 shadow-lg' 
                                : 'bg-slate-50 dark:bg-slate-800 border-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:scale-110'
                            }`}
                          >
                            <span aria-hidden="true">{item.emoji}</span>
                          </button>
                        ))}
                      </div>
                    </section>

                    <div className="space-y-4">
                      <section aria-labelledby="tags-title">
                        <label id="tags-title" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">What do you love most?</label>
                        <div className="flex flex-wrap gap-2" role="group" aria-labelledby="tags-title">
                          {['AI Accuracy', 'User Interface', 'Speed', 'Privacy', 'Features'].map((tag) => (
                            <button 
                              key={tag} 
                              onClick={() => setFeedbackText(prev => prev + (prev ? ', ' : '') + tag)}
                              className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700 hover:bg-blue-600 hover:text-white transition-all outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </section>
                      <div>
                        <label htmlFor="feedback-textarea" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Any suggestions for us?</label>
                        <textarea 
                          id="feedback-textarea"
                          rows={4}
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          placeholder="Tell us what we can do better..."
                          className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all resize-none dark:text-white placeholder:text-slate-500"
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <button 
                          onClick={handleSubmitFeedback}
                          className="flex-1 bg-white dark:bg-slate-800 text-emerald-600 py-5 rounded-2xl font-black text-base hover:bg-emerald-50 dark:hover:bg-slate-700 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 border border-emerald-100 dark:border-slate-700"
                        >
                          <Mail size={20} aria-hidden="true" />
                          SUBMIT VIA EMAIL
                        </button>
                        <button 
                          onClick={() => {
                            if (!feedbackText.trim()) return;
                            handleContactWhatsApp(`Feedback for Doctorian AI\nRating: ${rating || 'Not rated'}\n\nMessage: ${feedbackText}`);
                          }}
                          className="flex-1 group relative bg-emerald-500 text-white py-6 rounded-[2rem] font-black text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 border border-white/20 overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/0 via-emerald-600/0 to-emerald-400/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="relative z-10 bg-white/20 p-2.5 rounded-xl group-hover:rotate-12 transition-transform">
                            <MessageCircle size={24} aria-hidden="true" />
                          </div>
                          <span className="relative z-10 uppercase tracking-widest font-black">WHATSAPP</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors mb-8 group"
      >
        <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-all">
          <ArrowLeft size={16} />
        </div>
        <span className="text-xs font-black uppercase tracking-widest">Back to Dashboard</span>
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {renderContent()}
      </motion.div>
    </div>
  );
};
