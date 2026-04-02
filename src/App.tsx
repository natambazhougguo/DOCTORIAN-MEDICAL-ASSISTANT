/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChatInterface } from "./components/ChatInterface";
import { ImageGenerator } from "./components/ImageGenerator";
import { PatientMonitor } from "./components/PatientMonitor";
import { Features } from "./components/Features";
import { About } from "./components/About";
import { HealthRecords } from "./components/HealthRecords";
import { 
  Activity, 
  Heart, 
  Thermometer, 
  Scale, 
  PlusCircle, 
  Stethoscope,
  ShieldCheck,
  Menu,
  Bell,
  Search,
  Monitor,
  LayoutGrid,
  Info,
  Home,
  FileText,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'monitor' | 'features' | 'about' | 'records'>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Dashboard', icon: null },
    { id: 'features', label: 'Features', icon: <LayoutGrid size={16} /> },
    { id: 'monitor', label: 'Patient Monitor', icon: <Monitor size={16} /> },
    { id: 'records', label: 'Health Records', icon: <FileText size={16} /> },
    { id: 'about', label: 'About', icon: <Info size={16} /> },
  ];

  const quickTools = [
    { icon: <Thermometer className="w-5 h-5 text-orange-500" />, label: "Symptom Check", color: "bg-orange-50", action: () => setCurrentView('features') },
    { icon: <Scale className="w-5 h-5 text-green-500" />, label: "BMI Calculator", color: "bg-green-50", action: () => {} },
    { icon: <Activity className="w-5 h-5 text-blue-500" />, label: "Vital Tracker", color: "bg-blue-50", action: () => setCurrentView('monitor') },
    { icon: <Heart className="w-5 h-5 text-red-500" />, label: "Heart Rate", color: "bg-red-50", action: () => setCurrentView('monitor') },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group"
          onClick={() => setCurrentView('home')}
        >
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
            <Stethoscope size={24} />
          </div>
          <span className="text-xl font-black tracking-tighter text-slate-900 uppercase">DOCTORIAN<span className="text-blue-600">AI</span></span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-500">
          <button 
            onClick={() => setCurrentView('home')}
            className={`${currentView === 'home' ? 'text-blue-600' : 'hover:text-slate-900'} transition-colors`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setCurrentView('features')}
            className={`${currentView === 'features' ? 'text-blue-600' : 'hover:text-slate-900'} transition-colors flex items-center gap-2`}
          >
            <LayoutGrid size={16} />
            Features
          </button>
          <button 
            onClick={() => setCurrentView('monitor')}
            className={`${currentView === 'monitor' ? 'text-blue-600' : 'hover:text-slate-900'} transition-colors flex items-center gap-2`}
          >
            <Monitor size={16} />
            Patient Monitor
          </button>
          <button 
            onClick={() => setCurrentView('records')}
            className={`${currentView === 'records' ? 'text-blue-600' : 'hover:text-slate-900'} transition-colors flex items-center gap-2`}
          >
            <FileText size={16} />
            Health Records
          </button>
          <button 
            onClick={() => setCurrentView('about')}
            className={`${currentView === 'about' ? 'text-blue-600' : 'hover:text-slate-900'} transition-colors flex items-center gap-2`}
          >
            <Info size={16} />
            About
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
            <Search size={20} />
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
          </button>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-slate-900 transition-colors z-50"
          >
            <Menu size={20} />
          </button>
          <div className="hidden sm:block h-8 w-8 rounded-full bg-slate-100 border border-slate-200"></div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[280px] bg-white z-[70] md:hidden shadow-2xl p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-10">
                <span className="text-lg font-black tracking-tighter text-slate-900 uppercase">
                  MENU
                </span>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
                >
                  <PlusCircle size={24} className="rotate-45" />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => {
                      setCurrentView(link.id as any);
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center gap-4 p-4 rounded-2xl text-sm font-bold transition-all ${
                      currentView === link.id 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {link.icon || <LayoutGrid size={16} />}
                    {link.label}
                  </button>
                ))}
              </div>
              <div className="mt-auto pt-6 border-t border-slate-100">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                  <div className="h-10 w-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900">Guest User</p>
                    <p className="text-[10px] font-bold text-slate-400">View Profile</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Home Button */}
      <AnimatePresence>
        {currentView !== 'home' && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setCurrentView('home')}
            className="fixed bottom-8 right-8 z-[100] bg-slate-900 text-white p-4 rounded-3xl shadow-2xl shadow-slate-900/40 hover:scale-110 active:scale-95 transition-all group"
          >
            <Home size={24} />
            <span className="absolute right-full mr-4 bg-slate-900 text-white px-3 py-1 rounded-lg text-xs font-black opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Back to Home
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {currentView === 'home' ? (
          <motion.main 
            key="home"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10"
          >
            {/* Hero Section */}
            <div className="text-center mb-10 sm:mb-16">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-xs sm:text-sm font-bold mb-6 border border-blue-100 shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Next-Gen Medical Intelligence</span>
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-[1.1]"
              >
                Your Intelligent <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Medical Companion</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-base sm:text-lg md:text-xl text-slate-500 max-w-2xl md:max-w-3xl mx-auto leading-relaxed"
              >
                Experience the future of healthcare with Doctorian AI. Get instant medical insights, 
                generate anatomical illustrations, and manage your wellness with precision.
              </motion.p>
            </div>

            {/* Quick Tools Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12 sm:mb-20">
              {quickTools.map((tool, index) => (
                <motion.button 
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  onClick={tool.action}
                  className={`${tool.color} p-4 sm:p-6 rounded-3xl flex flex-col items-center gap-3 hover:shadow-xl hover:shadow-slate-200 transition-all border-2 border-transparent hover:border-white group`}
                >
                  <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                    {tool.icon}
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-700">{tool.label}</span>
                </motion.button>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8 sm:gap-12 items-start">
              {/* Chat Section - Takes up 2 columns */}
              <div className="lg:col-span-2 space-y-8">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white p-1 rounded-3xl shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden"
                >
                  <ChatInterface />
                </motion.div>
                
                {/* Health Tip Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 sm:p-10 rounded-[2.5rem] text-white shadow-2xl shadow-blue-200 relative overflow-hidden group"
                >
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                        <Activity size={20} />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black">Daily Health Tip</h3>
                    </div>
                    <p className="text-blue-50 opacity-90 mb-6 text-base sm:text-lg leading-relaxed max-w-2xl">
                      "Staying hydrated is crucial for cognitive function. Aim for at least 8 glasses of water today to keep your brain sharp and body energized."
                    </p>
                    <button className="bg-white text-blue-600 px-8 py-3 rounded-2xl font-bold text-sm hover:bg-blue-50 transition-all shadow-lg active:scale-95">
                      Learn More
                    </button>
                  </div>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>
                </motion.div>
              </div>

              {/* Sidebar / Tools Section */}
              <div className="space-y-8">
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white p-1 rounded-3xl shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden"
                >
                  <ImageGenerator />
                </motion.div>
                
                {/* Trust Badges / Info */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-50"
                >
                  <h3 className="font-black text-slate-900 text-lg mb-8 flex items-center gap-2">
                    <ShieldCheck className="text-blue-600" size={20} />
                    Why Trust Doctorian?
                  </h3>
                  <div className="space-y-8">
                    <div className="flex gap-4 group">
                      <div className="bg-blue-50 p-3 rounded-2xl h-fit group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                        <Activity className="w-5 h-5 text-blue-600 group-hover:text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">Verified Knowledge</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">Trained on peer-reviewed medical journals and clinical guidelines.</p>
                      </div>
                    </div>
                    <div className="flex gap-4 group">
                      <div className="bg-indigo-50 p-3 rounded-2xl h-fit group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                        <Heart className="w-5 h-5 text-indigo-600 group-hover:text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">Patient-Centric</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">Designed to provide empathetic and easy-to-understand health guidance.</p>
                      </div>
                    </div>
                    <div className="flex gap-4 group">
                      <div className="bg-sky-50 p-3 rounded-2xl h-fit group-hover:bg-sky-600 group-hover:text-white transition-colors duration-300">
                        <PlusCircle className="w-5 h-5 text-sky-600 group-hover:text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">Privacy First</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">Your data is encrypted and never shared with third parties.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.main>
        ) : currentView === 'monitor' ? (
          <motion.div
            key="monitor"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <PatientMonitor />
          </motion.div>
        ) : currentView === 'features' ? (
          <motion.div
            key="features"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Features />
          </motion.div>
        ) : currentView === 'records' ? (
          <motion.div
            key="records"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
          >
            <HealthRecords />
          </motion.div>
        ) : (
          <motion.div
            key="about"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <About />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-20 py-12 text-center border-t border-slate-200 bg-white">
        <div className="flex items-center justify-center gap-2 mb-2 opacity-50">
          <Stethoscope size={16} />
          <span className="text-sm font-black tracking-tighter">DOCTORIAN<span className="text-blue-600">AI</span></span>
        </div>
        <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4">Developed by Akora Joseph</p>
        <p className="text-xs text-slate-400 max-w-md mx-auto px-4 leading-relaxed">
          © 2026 Doctorian AI. All rights reserved. Not for emergency use. 
          Always consult with a professional healthcare provider.
        </p>
      </footer>
    </div>
  );
}
