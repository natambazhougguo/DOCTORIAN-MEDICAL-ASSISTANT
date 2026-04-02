import React from 'react';
import { Users, Target, Heart, Award, ShieldCheck, Globe } from 'lucide-react';
import { motion } from 'motion/react';

export const About: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 relative z-10">
      {/* Hero Section */}
      <div className="text-center mb-16 sm:mb-24">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tight"
        >
          About <span className="text-blue-600">Doctorian AI</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg sm:text-xl text-slate-500 max-w-2xl md:max-w-3xl mx-auto leading-relaxed"
        >
          We are on a mission to bridge the gap between advanced artificial intelligence and accessible, 
          reliable healthcare information for everyone, everywhere.
        </motion.p>
      </div>

      {/* Mission & Vision */}
      <div className="grid md:grid-cols-2 gap-8 sm:gap-12 mb-20 sm:mb-32">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-8 sm:p-12 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-shadow group"
        >
          <div className="bg-blue-50 w-14 sm:w-16 h-14 sm:h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
            <Target className="w-7 sm:w-8 h-7 sm:h-8 text-blue-600 group-hover:text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4 tracking-tight">Our Mission</h2>
          <p className="text-slate-500 leading-relaxed text-base sm:text-lg font-medium">
            To democratize access to medical information by providing a reliable, intelligent, and accessible AI assistant that empowers individuals to make informed health decisions with confidence.
          </p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-8 sm:p-12 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-shadow group"
        >
          <div className="bg-indigo-50 w-14 sm:w-16 h-14 sm:h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500">
            <Heart className="w-7 sm:w-8 h-7 sm:h-8 text-indigo-600 group-hover:text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4 tracking-tight">Our Vision</h2>
          <p className="text-slate-500 leading-relaxed text-base sm:text-lg font-medium">
            A world where quality health guidance is instantly available to everyone, reducing medical anxiety and promoting proactive health management through cutting-edge technology.
          </p>
        </motion.div>
      </div>

      {/* Core Values */}
      <div className="mb-20 sm:mb-32">
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-3xl sm:text-4xl font-black text-center text-slate-900 mb-12 sm:mb-16 tracking-tight"
        >
          Our Core Values
        </motion.h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center p-6"
          >
            <div className="bg-sky-50 w-16 sm:w-20 h-16 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <ShieldCheck className="w-8 sm:w-10 h-8 sm:h-10 text-sky-600" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black mb-3 text-slate-900 tracking-tight">Integrity</h3>
            <p className="text-slate-500 text-sm sm:text-base font-medium leading-relaxed">We prioritize medical accuracy and ethical AI practices above all else.</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center p-6"
          >
            <div className="bg-blue-50 w-16 sm:w-20 h-16 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Award className="w-8 sm:w-10 h-8 sm:h-10 text-blue-600" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black mb-3 text-slate-900 tracking-tight">Excellence</h3>
            <p className="text-slate-500 text-sm sm:text-base font-medium leading-relaxed">Continuously improving our models to provide the highest quality health insights.</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center p-6"
          >
            <div className="bg-indigo-50 w-16 sm:w-20 h-16 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Globe className="w-8 sm:w-10 h-8 sm:h-10 text-indigo-600" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black mb-3 text-slate-900 tracking-tight">Accessibility</h3>
            <p className="text-slate-500 text-sm sm:text-base font-medium leading-relaxed">Breaking down barriers to ensure healthcare knowledge is available to all.</p>
          </motion.div>
        </div>
      </div>

      {/* Developer Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7 }}
        className="bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden text-white relative"
      >
        <div className="p-10 sm:p-16 md:p-24 text-center relative z-10">
          <div className="w-20 sm:w-24 md:w-32 h-20 sm:h-24 md:h-32 bg-blue-500/10 backdrop-blur-md rounded-[2rem] mx-auto mb-10 flex items-center justify-center border border-white/10 shadow-2xl">
            <Users className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-blue-400" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 tracking-tight">Meet the Developer</h2>
          <p className="text-blue-400 text-sm sm:text-base md:text-lg font-black mb-8 tracking-[0.3em] uppercase">Akora Joseph</p>
          <p className="text-slate-400 max-w-3xl mx-auto leading-relaxed text-base sm:text-lg md:text-xl font-medium">
            Doctorian AI was conceptualized and developed by Akora Joseph with a vision to leverage 
            technology for social good. By combining modern web engineering with state-of-the-art 
            AI, Akora has created a tool that makes complex medical information understandable and 
            accessible to everyone.
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent)] pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px]"></div>
      </motion.div>
    </div>
  );
};
