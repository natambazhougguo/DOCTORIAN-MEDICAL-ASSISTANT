import React, { useState } from 'react';
import { Shield, Clock, Brain, Image as ImageIcon, MessageSquare, Lock, Activity, Bell, Video, FileText, Heart, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Features: React.FC = () => {
  const [activeCard, setActiveCard] = useState<number | null>(null);

  const features = [
    {
      icon: <MessageSquare className="w-6 h-6 text-blue-600" />,
      title: "AI Health Chat",
      description: "Get instant answers to your health questions using our advanced conversational AI trained on medical knowledge.",
      details: "Our AI-powered chat provides 24/7 medical guidance, symptom analysis, and health recommendations based on the latest medical research."
    },
    {
      icon: <ImageIcon className="w-6 h-6 text-blue-600" />,
      title: "Medical Illustrations",
      description: "Generate detailed medical diagrams and illustrations to better understand conditions and anatomy.",
      details: "Create custom medical visuals for educational purposes, patient communication, and health documentation."
    },
    {
      icon: <Activity className="w-6 h-6 text-blue-600" />,
      title: "Health Dashboard",
      description: "Track your vital signs, activity levels, and health metrics in one centralized, easy-to-read dashboard.",
      details: "Monitor your health trends over time with interactive charts, set goals, and receive insights about your wellbeing."
    },
    {
      icon: <Bell className="w-6 h-6 text-blue-600" />,
      title: "Medication Reminders",
      description: "Set smart notifications for your medications and never miss a dose again with our intelligent scheduling.",
      details: "Customizable reminders, dosage tracking, and refill alerts to keep you on top of your medication regimen."
    },
    {
      icon: <Video className="w-6 h-6 text-blue-600" />,
      title: "Telehealth Integration",
      description: "Seamlessly connect with healthcare professionals for virtual consultations directly through the app.",
      details: "Schedule appointments, join video calls, and share your health data with doctors securely."
    },
    {
      icon: <Brain className="w-6 h-6 text-blue-600" />,
      title: "AI Symptom Checker",
      description: "Describe your symptoms and get potential causes and recommendations for next steps based on medical data.",
      details: "Input your symptoms and receive AI-generated insights, urgency levels, and suggested actions."
    },
    {
      icon: <FileText className="w-6 h-6 text-blue-600" />,
      title: "Medical Records",
      description: "Securely store and manage your health history, lab results, and prescriptions in an encrypted vault.",
      details: "All your medical documents in one place, accessible anywhere with bank-level security."
    },
    {
      icon: <Heart className="w-6 h-6 text-blue-600" />,
      title: "Wellness Tips",
      description: "Receive personalized daily advice for a healthier lifestyle, including nutrition and exercise tips.",
      details: "Daily personalized recommendations based on your health profile, goals, and preferences."
    },
    {
      icon: <Zap className="w-6 h-6 text-blue-600" />,
      title: "Emergency Access",
      description: "Quick access to emergency services and your medical ID for first responders in critical situations.",
      details: "One-tap emergency calling and instant access to your critical medical information for first responders."
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center mb-12 sm:mb-20">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight"
        >
          Advanced <span className="text-blue-600">Medical Features</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed"
        >
          Doctorian AI provides a comprehensive suite of tools designed to empower your health journey.
        </motion.p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {features.map((feature, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => setActiveCard(activeCard === index ? null : index)}
            className={`bg-white p-6 sm:p-8 rounded-[2rem] shadow-xl transition-all cursor-pointer border-2 relative overflow-hidden group ${
              activeCard === index 
                ? 'border-blue-500 shadow-blue-100 scale-[1.02]' 
                : 'border-slate-50 hover:border-blue-200 hover:shadow-slate-200'
            }`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
              activeCard === index ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'
            }`}>
              {feature.icon}
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight">{feature.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              {feature.description}
            </p>
            
            <AnimatePresence>
              {activeCard === index && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <p className="text-sm text-blue-700 font-bold leading-relaxed">
                      {feature.details}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Decorative element */}
            <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full blur-3xl transition-opacity ${
              activeCard === index ? 'bg-blue-400/20 opacity-100' : 'bg-blue-400/5 opacity-0 group-hover:opacity-100'
            }`}></div>
          </motion.div>
        ))}
      </div>

      {/* Trust Section */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-20 p-10 sm:p-16 bg-slate-900 rounded-[3rem] text-white relative overflow-hidden"
      >
        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black mb-6 tracking-tight leading-tight">
              Your Health Data, <br />
              <span className="text-blue-400">Protected & Secure</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              We employ military-grade encryption and strict privacy protocols to ensure your medical information remains confidential and under your control.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold uppercase tracking-widest">HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                <Lock className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold uppercase tracking-widest">End-to-End Encrypted</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-6 rounded-3xl border border-white/5 backdrop-blur-sm">
              <Clock className="w-8 h-8 text-blue-400 mb-4" />
              <h4 className="font-bold mb-2">24/7 Access</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Your records available whenever and wherever you need them.</p>
            </div>
            <div className="bg-white/5 p-6 rounded-3xl border border-white/5 backdrop-blur-sm mt-8">
              <Brain className="w-8 h-8 text-indigo-400 mb-4" />
              <h4 className="font-bold mb-2">Smart Insights</h4>
              <p className="text-xs text-slate-500 leading-relaxed">AI-driven analysis to help you understand your health trends.</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>
      </motion.div>
    </div>
  );
};
