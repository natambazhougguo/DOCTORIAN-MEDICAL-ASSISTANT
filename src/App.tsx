/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ImageGenerator } from "./components/ImageGenerator";
import { ChatInterface } from "./components/ChatInterface";
import { DoctorianAI } from "./components/DoctorianAI";
import CognisAnalytics from "./components/CognisAnalytics";
import BioSimulation from "./components/BioSimulation";
import { PatientMonitor } from "./components/PatientMonitor";
import { Features } from "./components/Features";
import { Dashboard } from "./components/Dashboard";
import { About } from "./components/About";
import { HealthRecords } from "./components/HealthRecords";
import { ProfileSettings } from "./components/ProfileSettings";
import { HealthTipModal, HealthTip } from "./components/HealthTipModal";
import { AdminDashboard } from "./components/AdminDashboard";
import { SpecialistFinder } from "./components/SpecialistFinder";
import { CognisHub } from "./components/CognisHub";
import { VitalityMatrix } from "./components/VitalityMatrix";
import { Tasks } from "./components/Tasks";
import { SymptomChecker } from "./components/SymptomChecker";
import { MedicationTracker } from "./components/MedicationTracker";
import { BioSecurity } from "./components/BioSecurity";
import { 
  BrainCircuit,
  Activity, 
  Heart, 
  Thermometer, 
  Scale, 
  PlusCircle, 
  Stethoscope,
  Menu,
  Bell,
  Search,
  Monitor,
  LayoutGrid,
  Info,
  Home,
  FileText,
  User as UserIcon,
  Download,
  Cpu,
  Bluetooth,
  Facebook,
  Instagram,
  X,
  MessageCircle,
  Mail,
  LogIn,
  LogOut,
  ShieldAlert,
  ShieldCheck,
  Loader2,
  UserPlus,
  Fingerprint,
  Moon,
  Settings,
  ListTodo,
  Sun,
  Apple,
  Droplets,
  Zap,
  Brain,
  Smile,
  Shield,
  Eye,
  EyeOff,
  RefreshCw,
  Bot,
  Image as ImageIcon,
  Pill,
  ArrowLeft,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect } from 'react';
import { api, User } from './api';
import { Logo } from "./components/Logo";
import { AuthModal } from './components/AuthModal';
import { AdminInfoModal } from './components/AdminInfoModal';
import { ResourceView, ResourceType } from './components/ResourceView';
import { startRegistration } from '@simplewebauthn/browser';

const SEARCHABLE_ITEMS = [
  { label: 'Heart Rate Bio-Monitor', view: 'monitor', icon: <Activity size={18} />, category: 'Tools', description: 'Real-time heart rate and vitals monitoring.' },
  { label: 'Clinical Health Records', view: 'records', icon: <FileText size={18} />, category: 'Data', description: 'View and manage your medical history and records.' },
  { label: 'AI Cognis Lab', view: 'ai_lab', icon: <Bot size={18} />, category: 'AI Features', description: 'Advanced diagnostics and anatomical synthesis interface.' },
  { label: 'Clinical Roadmap', view: 'home', icon: <LayoutGrid size={18} />, category: 'Intelligence', description: 'Track your specialized health milestones and journey.' },
  { label: 'Bio-Simulation', view: 'home', icon: <Zap size={18} />, category: 'Intelligence', description: 'Real-time biological modeling and DNA synthesis.' },
  { label: 'Diagnostic Mapper', view: 'symptoms', icon: <Stethoscope size={18} />, category: 'AI Features', description: 'Analyze your symptoms with advanced AI intelligence.' },
  { label: 'Bio-Pharmacy Tracker', view: 'meds', icon: <Pill size={18} />, category: 'Management', description: 'Dosage tracking and interaction checks.' },
  { label: 'CognisHub', view: 'neuro', icon: <Brain size={18} />, category: 'Intelligence', description: 'Cognitive health and brain performance tracking.' },
  { label: 'Vitality Matrix', view: 'vitality', icon: <Activity size={18} />, category: 'Long-term Health', description: 'Longevity, metabolic age, and performance analytics.' },
  { label: 'Profile Settings', view: 'profile', icon: <UserIcon size={18} />, category: 'Account', description: 'Manage your personal information and security.' },
  { label: 'Admin Dashboard', view: 'admin', icon: <Shield size={18} />, category: 'System', description: 'System administration and user management.' },
  { label: 'Clinical Passport', view: 'records', icon: <ShieldCheck size={18} />, category: 'Data', description: 'Verified health status and travel authorization.' },
  { label: 'Specialist Finder', view: 'specialist', icon: <UserPlus size={18} />, category: 'Network', description: 'Connect with authorized medical practitioners.' },
  { label: 'Bio-Security Control', view: 'biosecurity', icon: <Fingerprint size={18} />, category: 'Security', description: 'Neural identity management and biometric vault.' },
  { label: 'About Doctorian AI', view: 'about', icon: <Info size={18} />, category: 'Info', description: 'Learn about our mission and technology.' },
  { label: 'Privacy Policy', view: 'privacy', icon: <Shield size={18} />, category: 'Legal', description: 'How we protect and manage your data.' },
  { label: 'Terms of Service', view: 'terms', icon: <FileText size={18} />, category: 'Legal', description: 'Our legal agreement and usage terms.' },
  { label: 'Fever & Chills', view: 'home', icon: <Thermometer size={18} />, category: 'Symptoms', description: 'Check symptoms related to high body temperature.', prompt: 'I have a fever and chills, what should I do?' },
  { label: 'Headache Relief', view: 'home', icon: <Brain size={18} />, category: 'Symptoms', description: 'Guidance for managing persistent headaches.', prompt: 'How can I relieve a severe headache?' },
  { label: 'Heart Health', view: 'home', icon: <Heart size={18} />, category: 'Wellness', description: 'Tips and monitoring for cardiovascular health.', prompt: 'Give me tips for maintaining a healthy heart.' },
];

const HEALTH_TIPS: HealthTip[] = [
  {
    title: "Stay Hydrated",
    description: "Drink at least 8 glasses of water daily to maintain energy levels and support vital organ functions.",
    details: "Hydration is essential for nearly every bodily function. It helps regulate temperature, keep joints lubricated, prevent infections, deliver nutrients to cells, and keep organs functioning properly. Being well-hydrated also improves sleep quality, cognition, and mood.",
    benefits: ["Regulates body temperature", "Lubricates joints", "Protects sensitive tissues", "Aids in digestion"],
    icon: <Droplets className="w-8 h-8 text-blue-600" />,
    color: "bg-blue-50"
  },
  {
    title: "Balanced Nutrition",
    description: "Focus on whole foods, lean proteins, and plenty of colorful vegetables to fuel your body effectively.",
    details: "A balanced diet provides the nutrients your body needs to function correctly. To get the proper nutrition from your diet, you should consume most of your daily calories in: fresh fruits, fresh vegetables, whole grains, legumes, nuts, and lean proteins.",
    benefits: ["Boosts immune system", "Supports healthy growth", "Reduces risk of chronic diseases", "Improves mental health"],
    icon: <Apple className="w-8 h-8 text-emerald-600" />,
    color: "bg-emerald-50"
  },
  {
    title: "Quality Sleep",
    description: "Aim for 7-9 hours of restful sleep each night to allow your body and mind to recover and recharge.",
    details: "Sleep is as important to health as diet and exercise. Good sleep improves brain performance, mood, and health. Not getting enough quality sleep regularly raises the risk of many diseases and disorders. These range from heart disease and stroke to obesity and dementia.",
    benefits: ["Improves concentration", "Lowers stress levels", "Supports heart health", "Enhances athletic performance"],
    icon: <Moon className="w-8 h-8 text-indigo-600" />,
    color: "bg-indigo-50"
  },
  {
    title: "Regular Exercise",
    description: "Incorporate at least 30 minutes of moderate physical activity into your daily routine for heart health.",
    details: "Physical activity or exercise can improve your health and reduce the risk of developing several diseases like type 2 diabetes, cancer and cardiovascular disease. Physical activity and exercise can have immediate and long-term health benefits. Most importantly, regular activity can improve your quality of life.",
    benefits: ["Strengthens heart and lungs", "Improves muscle tone", "Increases bone density", "Boosts mood and energy"],
    icon: <Zap className="w-8 h-8 text-amber-600" />,
    color: "bg-amber-50"
  },
  {
    title: "Mental Clarity",
    description: "Practice mindfulness or meditation for 10 minutes daily to reduce stress and improve focus.",
    details: "Mindfulness is the basic human ability to be fully present, aware of where we are and what we’re doing, and not overly reactive or overwhelmed by what’s going on around us. Meditation is a practice where an individual uses a technique – such as mindfulness – to train attention and awareness, and achieve a mentally clear and emotionally calm and stable state.",
    benefits: ["Reduces anxiety", "Improves emotional regulation", "Increases attention span", "Enhances self-awareness"],
    icon: <Brain className="w-8 h-8 text-purple-600" />,
    color: "bg-purple-50"
  },
  {
    title: "Stress Management",
    description: "Maintain a healthy work-life balance and engage in hobbies that bring you joy and relaxation.",
    details: "Stress management is a wide spectrum of techniques and psychotherapies aimed at controlling a person's level of stress, especially chronic stress, usually for the purpose of and for the motive of improving everyday functioning.",
    benefits: ["Lowers blood pressure", "Improves sleep quality", "Strengthens immune system", "Increases productivity"],
    icon: <Smile className="w-8 h-8 text-rose-600" />,
    color: "bg-rose-50"
  }
];

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'monitor' | 'features' | 'about' | 'records' | 'profile' | 'admin' | 'specialist' | 'neuro' | 'vitality' | 'tasks' | 'ai_lab' | 'meds' | 'symptoms' | 'biosecurity' | 'ai_nexus' | ResourceType>('home');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [hasNotification, setHasNotification] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<'login' | 'signup'>('login');
  const [isAdminInfoOpen, setIsAdminInfoOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isRegisteringBiometrics, setIsRegisteringBiometrics] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isInsightLoading, setIsInsightLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('doctorian_dark_mode');
      if (saved !== null) return saved === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [isEyeCareMode, setIsEyeCareMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('doctorian_eye_care') === 'true';
    }
    return false;
  });
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const [dailyTip, setDailyTip] = useState<HealthTip>(HEALTH_TIPS[0]);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);

  // All Effects
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = SEARCHABLE_ITEMS.filter(item => 
      item.label.toLowerCase().includes(query) || 
      item.category.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    );
    setSearchResults(filtered);
  }, [searchQuery]);

  useEffect(() => {
    const checkNotifications = async () => {
      try {
        const notifications = await api.notifications.list();
        if (notifications.length > 0) {
          const lastViewed = localStorage.getItem('doctorian_last_notification_view');
          const latestId = notifications[0].id;
          if (lastViewed !== latestId) {
            setHasNotification(true);
          }
        }
      } catch (err) {
        console.error("Failed to check notifications:", err);
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setDailyTip(HEALTH_TIPS[dayOfYear % HEALTH_TIPS.length]);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('doctorian_dark_mode', isDarkMode.toString());
  }, [isDarkMode]);

  useEffect(() => {
    if (isEyeCareMode) {
      document.body.classList.add('eye-care-mode');
    } else {
      document.body.classList.remove('eye-care-mode');
    }
    localStorage.setItem('doctorian_eye_care', isEyeCareMode.toString());
  }, [isEyeCareMode]);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                               (window.navigator as any).standalone || 
                               document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
      return isStandaloneMode;
    };

    setIsInIframe(window.self !== window.top);
    const standalone = checkStandalone();
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    const installedHandler = () => {
      setIsStandalone(true);
      setShowInstallButton(false);
      setDeferredPrompt(null);
      setToast({ message: '✨ Doctorian AI installed successfully!', type: 'success' });
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);
    
    // For iOS, there's no prompt, so we show the button if not standalone
    if (isIOS && !standalone) {
      setShowInstallButton(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (user && currentView === 'home' && !aiInsight) {
      fetchAiInsight();
    }
  }, [user, currentView, aiInsight]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await api.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsAuthReady(true);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } catch (err) {
      console.error("Logout failed:", err);
    }
    localStorage.removeItem('doctorian_user');
    setUser(null);
    setCurrentView('home');
  };

  const fetchAiInsight = async (retryCount = 0) => {
    if (isInsightLoading && retryCount === 0) return;
    setIsInsightLoading(true);
    try {
      // Use server-side Gemini call instead of client-side
      const response = await api.ai.geminiChat(
        [{ role: "user", text: "Provide a concise, professional daily health tip or insight for a medical app user. Focus on wellness, nutrition, or preventive care. Keep it under 2 sentences." }], 
        "You are a helpful medical assistant.",
        "gemini-3-flash-preview", 
        0.7
      );
      
      const responseText = response.text;
      if (responseText) {
        setAiInsight(responseText);
      } else {
        throw new Error("Empty response");
      }
    } catch (err: any) {
      const errorMsg = err?.message || String(err);
      const isQuotaError = errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('quota');
      const isTransientError = errorMsg.includes('500') || errorMsg.includes('503') || errorMsg.includes('fetch') || errorMsg.includes('NetworkError');

      if (isTransientError && retryCount < 2) {
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchAiInsight(retryCount + 1);
      }

      console.warn("Failed to fetch Gemini insight, using local fallbacks.", err);
      // Fallback tips
      const fallbacks = [
        "Hydration is key to cognitive function; aim for 2-3 liters of water daily.",
        "Walking for just 20 minutes a day can significantly improve cardiovascular health.",
        "Consistency in sleep patterns helps regulate your body's internal clock and improves mood."
      ];
      setAiInsight(fallbacks[Math.floor(Math.random() * fallbacks.length)]);
    } finally {
      setIsInsightLoading(false);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-12">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-slate-100 dark:border-slate-800 border-t-blue-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Logo size="sm" showText={false} className="animate-pulse" />
          </div>
        </div>
        
        <div className="space-y-4 max-w-sm">
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest">Synchronizing Intelligence</h2>
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] leading-relaxed">
            Initializing neural data pipelines and clinical security protocols...
          </p>
        </div>

        <div className="flex gap-1.5">
          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
        </div>
      </div>
    );
  }

  const addToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const triggerSOS = async () => {
    if (!window.confirm("Are you sure you want to trigger an EMERGENCY SOS? This will alert your doctor and mentor via SMS and Voice Call.")) return;
    
    try {
      const msg = `EMERGENCY SOS from ${user?.displayName || 'User'}: Immediate assistance required! Location: App Dashboard.`;
      const smsRes = await api.alerts.sendSms(msg);
      const callRes = await api.alerts.makeCall("Emergency. Emergency. Patient has triggered a manual SOS alert. Please check the dashboard immediately.");
      
      if (smsRes.simulated || callRes.simulated) {
        addToast("Alert sent (Simulated). Ensure Twilio keys are configured for live alerts.", "success");
      } else {
        addToast("Emergency SOS triggered and specialists notified!", "success");
      }
    } catch (err) {
      console.error("SOS Trigger failed:", err);
      addToast("Failed to trigger SOS. Please call emergency services directly.", "error");
    }
  };

  const showView = (view: any) => {
    setCurrentView(view);
  };

  const handleOpenAdminInfo = () => {
    setIsAdminInfoOpen(true);
  };

  const triggerPWAInstall = async () => {
    if (isInIframe) {
      addToast("Launching Doctorian AI in a standalone window...", "success");
      const url = window.location.href;
      window.open(url, '_blank');
      return;
    }

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIOS && !deferredPrompt) {
      addToast("To install Doctorian AI: Tap the 'Share' icon and select 'Add to Home Screen'.", "info");
      return;
    }

    if (!deferredPrompt) {
      addToast("Use your browser's 'Add to Home Screen' menu to install this native experience.", "info");
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        addToast("Successfully installed Doctorian AI!", "success");
        setShowInstallButton(false);
      }
    } catch (err) {
      console.error("Installation failed:", err);
      addToast("Installation failed. Please try the browser menu manually.", "error");
    } finally {
      setDeferredPrompt(null);
    }
  };

  const handleDirectInstall = () => {
    triggerPWAInstall();
  };

  const navLinks = [
    { id: 'home', label: 'Dashboard', icon: <Home size={16} /> },
    { id: 'ai_nexus', label: 'Doctorian AI', icon: <Bot size={16} /> },
    { id: 'symptoms', label: 'Diagnostic Lab', icon: <Stethoscope size={16} /> },
    { id: 'tasks', label: 'Clinical Protocols', icon: <ListTodo size={16} /> },
    { id: 'meds', label: 'Bio-Pharmacy', icon: <Pill size={16} /> },
    { id: 'monitor', label: 'Bio-Monitor', icon: <Monitor size={16} /> },
    { id: 'neuro', label: 'CognisHub', icon: <Brain size={16} /> },
    { id: 'vitality', label: 'Vitality Matrix', icon: <Zap size={16} /> },
    { id: 'biosecurity', label: 'Bio-Security', icon: <Fingerprint size={16} /> },
    { id: 'about', label: 'Systems Info', icon: <Info size={16} /> },
    { id: 'specialist', label: 'Cognis Specialists', icon: <Stethoscope size={16} /> },
  ];

  const isAdmin = user?.role === 'admin' || user?.role === 'doctor';

  const allNavLinks = [
    ...navLinks,
    ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: <Shield size={16} /> }] : [])
  ];

  const quickTools = [
    { icon: <Thermometer className="w-5 h-5 text-orange-500" />, label: "Symptom Check", color: "bg-orange-50 dark:bg-orange-900/20", action: () => setCurrentView('features') },
    { icon: <Scale className="w-5 h-5 text-green-500" />, label: "BMI Calculator", color: "bg-green-50 dark:bg-green-900/20", action: () => {} },
    { icon: <Activity className="w-5 h-5 text-blue-500" />, label: "Vital Tracker", color: "bg-blue-50 dark:bg-blue-900/20", action: () => setCurrentView('monitor') },
    { icon: <Heart className="w-5 h-5 text-red-500" />, label: "Heart Rate", color: "bg-red-50 dark:bg-red-900/20", action: () => setCurrentView('monitor') },
  ];

  const filteredSearchResults = searchQuery.trim() === '' 
    ? [] 
    : SEARCHABLE_ITEMS.filter(item => 
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const mobileNavLinks = navLinks.slice(0, 5);


  return (
    <div className="h-screen bg-[#f8fafc] dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 selection:bg-blue-100 dark:selection:bg-blue-900 selection:text-blue-900 dark:selection:text-blue-100 transition-colors duration-300 flex flex-row overflow-hidden">
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[150] focus:px-6 focus:py-3 focus:bg-blue-600 focus:text-white focus:rounded-2xl focus:font-black focus:shadow-2xl"
      >
        Skip to main content
      </a>
      {/* Sidebar - Floating and Persistent */}
      <aside 
        className="hidden md:flex flex-col w-[80px] lg:w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 my-4 ml-4 rounded-[2.5rem] sticky top-4 h-[calc(100vh-2rem)] z-50 shrink-0 transition-all duration-300 shadow-2xl shadow-slate-200/50 dark:shadow-slate-950/50"
        aria-label="Sidebar navigation"
      >
        <button 
          className="p-6 lg:p-8 cursor-pointer w-full text-center lg:text-left flex items-center justify-center lg:justify-start"
          onClick={() => setCurrentView('home')}
          aria-label="Go to Doctorian AI Dashboard"
        >
          <div className="lg:hidden">
            <Logo size="sm" showText={false} />
          </div>
          <div className="hidden lg:block">
            <Logo />
          </div>
        </button>

        <nav className="flex-1 px-2 lg:px-4 space-y-2 overflow-y-auto custom-scrollbar pb-6 scrollbar-hide" aria-label="Main navigation">
          <p className="px-2 lg:px-4 text-[8px] lg:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 text-center lg:text-left">Menu</p>
          {allNavLinks.map((link) => (
            <button 
              key={link.id}
              onClick={() => setCurrentView(link.id as any)}
              title={link.label}
              className={`w-full flex flex-col lg:flex-row items-center gap-1 lg:gap-3 px-2 lg:px-4 py-3 rounded-2xl text-[10px] lg:text-sm font-bold transition-all ${
                currentView === link.id 
                  ? (link.id === 'admin' ? 'bg-purple-600 text-white shadow-lg shadow-purple-200/50' : 'bg-blue-600 text-white shadow-lg shadow-blue-200/50') 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="shrink-0">{link.icon}</div>
              <span className="hidden lg:inline flex-1 text-left truncate">{link.label}</span>
              <span className="lg:hidden text-[8px] font-black uppercase tracking-tighter truncate max-w-full">{link.label.split(' ')[0]}</span>
            </button>
          ))}
          
          {/* Resource Menu with Dropdown */}
          <div className="pt-6 mt-6 border-t border-slate-50 dark:border-slate-800 px-2">
            <button 
              onClick={() => setIsResourcesOpen(!isResourcesOpen)}
              className="w-full flex items-center justify-center lg:justify-between px-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <span className="hidden lg:inline">Resources</span>
              <motion.div
                animate={{ rotate: isResourcesOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className={!isResourcesOpen ? "lg:block" : ""}
              >
                <ChevronDown size={12} />
              </motion.div>
            </button>
            
            <AnimatePresence>
              {isResourcesOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-1 overflow-hidden"
                >
                  {[
                    { label: 'Help', id: 'help', icon: <Info size={14} /> },
                    { label: 'Network', id: 'community', icon: <UserPlus size={14} /> },
                    { label: 'Privacy', id: 'privacy', icon: <Shield size={14} /> },
                    { label: 'Terms', id: 'terms', icon: <FileText size={14} /> },
                    { label: 'Signal', id: 'feedback', icon: <MessageCircle size={14} /> }
                  ].map((res) => (
                    <button 
                      key={res.id}
                      onClick={() => setCurrentView(res.id as ResourceType)}
                      title={res.label}
                      className={`w-full flex flex-col lg:flex-row items-center gap-1 lg:gap-3 px-2 lg:px-4 py-2.5 rounded-xl text-[8px] lg:text-xs font-bold transition-all ${
                        currentView === res.id 
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm' 
                          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <span className="opacity-70 group-hover:opacity-100 transition-opacity">
                        {res.icon}
                      </span>
                      <span className="hidden lg:inline">{res.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        <div className="p-2 lg:p-4 mt-auto border-t border-slate-50 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl lg:rounded-3xl p-2 lg:p-4 border border-slate-100 dark:border-slate-800">
            <p className="hidden lg:block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">System</p>
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden lg:inline text-[10px] font-bold text-slate-600 dark:text-slate-300">Active</span>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-2">
              <div className={`w-2 h-2 rounded-full ${isOffline ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              <span className="hidden lg:inline text-[10px] font-bold text-slate-600 dark:text-slate-300">{isOffline ? 'Offline' : 'Connected'}</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-full min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar relative bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto w-full flex flex-col min-h-full">
          {/* Offline Banner */}
        <AnimatePresence>
          {isOffline && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-amber-500 text-white text-[10px] font-black uppercase tracking-[0.2em] py-2 text-center sticky top-0 z-[60] shadow-lg"
            >
              Offline Mode — Some AI features may be limited
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Sidebar Trigger (Optional but keep layout stable) */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between transition-colors">
          <button 
            className="lg:hidden flex items-center justify-center p-2 text-slate-500 hover:text-blue-600 transition-colors"
            onClick={() => setCurrentView('home')}
            aria-label="Go to Home"
          >
            <Home size={20} />
          </button>

          <div className="hidden md:flex flex-1 justify-center px-4 items-center gap-4">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="w-full max-w-md flex items-center gap-3 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl text-slate-400 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
              aria-label="Open search"
            >
              <Search aria-hidden="true" size={16} />
              <span className="text-xs font-bold">Search symptoms, records...</span>
            </button>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-full border border-emerald-100 dark:border-emerald-800">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest whitespace-nowrap">24k+ Active</span>
            </div>
            <button
              onClick={() => setIsEyeCareMode(!isEyeCareMode)}
              className={`p-2 rounded-xl transition-all flex items-center gap-2 border ${
                isEyeCareMode 
                  ? 'bg-amber-100 border-amber-200 text-amber-700 dark:bg-amber-900/40 dark:border-amber-800 dark:text-amber-400' 
                  : 'bg-slate-100 border-transparent text-slate-400 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700'
              }`}
              aria-label={isEyeCareMode ? "Disable Eye Care Mode" : "Enable Eye Care Mode"}
              aria-pressed={isEyeCareMode}
              title={isEyeCareMode ? "Disable Eye Care Mode" : "Enable Eye Care Mode"}
            >
              {isEyeCareMode ? <Eye aria-hidden="true" size={18} /> : <EyeOff aria-hidden="true" size={18} />}
              <span className="text-[10px] font-black uppercase tracking-widest hidden lg:inline">Eye Care</span>
            </button>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            {isAuthReady && (
              user ? (
                <div className="flex items-center gap-3 relative">
                  <div className="relative">
                    <button 
                      className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 overflow-hidden shadow-sm cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all flex items-center justify-center"
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      aria-label="User profile menu"
                      aria-haspopup="true"
                      aria-expanded={isProfileOpen}
                    >
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={`Profile of ${user.displayName || user.email}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-blue-600 font-black text-sm">
                          {user.displayName?.[0] || user.email[0].toUpperCase()}
                        </div>
                      )}
                    </button>

                    <AnimatePresence>
                      {isProfileOpen && (
                        <>
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40"
                            onClick={() => setIsProfileOpen(false)}
                          />
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 py-2 z-50 overflow-hidden"
                          >
                            <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-800">
                              <p className="text-xs font-black text-slate-900 dark:text-white truncate">{user.displayName || 'User'}</p>
                              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 truncate">{user.email}</p>
                            </div>
                            
                            <button
                              onClick={() => {
                                setCurrentView('profile');
                                setIsProfileOpen(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                              <UserIcon size={16} className="text-blue-500" />
                              Profile Settings
                            </button>

                            {isAdmin && (
                              <button
                                onClick={() => {
                                  setCurrentView('admin');
                                  setIsProfileOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                              >
                                <Shield size={16} className="text-purple-500" />
                                Admin Panel
                              </button>
                            )}

                            <div className="h-px bg-slate-50 dark:bg-slate-800 my-1" />
                            
                            <button
                              onClick={() => {
                                handleLogout();
                                setIsProfileOpen(false);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-black text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                            >
                              <LogOut size={16} />
                              LOGOUT
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      setAuthModalView('login');
                      setIsAuthModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] sm:text-xs font-black hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group border border-slate-100 dark:border-slate-800"
                  >
                    <LogIn size={16} className="group-hover:translate-x-1 transition-transform" />
                    <span className="inline">SIGN IN</span>
                  </button>
                  <button 
                    onClick={() => {
                      setAuthModalView('signup');
                      setIsAuthModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] sm:text-xs font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/20 group"
                  >
                    <UserPlus size={16} className="group-hover:scale-110 transition-transform" />
                    <span className="inline">SIGN UP</span>
                  </button>
                </div>
              )
            )}
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
              aria-label="Open search"
            >
              <Search aria-hidden="true" size={20} />
            </button>
            <button 
              onClick={() => setIsEyeCareMode(!isEyeCareMode)}
              className={`md:hidden p-2 rounded-xl transition-all ${
                isEyeCareMode 
                  ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' 
                  : 'text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
              }`}
              aria-label={isEyeCareMode ? "Disable Eye Care Mode" : "Enable Eye Care Mode"}
              aria-pressed={isEyeCareMode}
              title={isEyeCareMode ? "Disable Eye Care Mode" : "Enable Eye Care Mode"}
            >
              {isEyeCareMode ? <Eye aria-hidden="true" size={20} /> : <EyeOff aria-hidden="true" size={20} />}
            </button>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all group"
              aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun aria-hidden="true" size={20} /> : <Moon aria-hidden="true" size={20} />}
            </button>
            <button 
              onClick={handleOpenAdminInfo}
              className="p-2 text-slate-400 hover:text-slate-900 transition-colors relative group"
              aria-label={hasNotification ? "View notifications (new available)" : "View notifications"}
              title="Notifications"
            >
              <motion.div
                animate={hasNotification ? { 
                  rotate: [0, -10, 10, -10, 10, 0],
                  scale: [1, 1.1, 1.1, 1.1, 1.1, 1]
                } : {}}
                transition={{ repeat: hasNotification ? Infinity : 0, duration: 0.5 }}
              >
                <Bell aria-hidden="true" size={20} className={hasNotification ? "text-blue-600" : ""} />
              </motion.div>
              {hasNotification && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full border-2 border-white bg-rose-500" aria-hidden="true"></span>
              )}
            </button>
          </div>
        </header>

        <main className="flex-1 pb-20 relative flex flex-col pt-0 w-full" id="main-content">
          <div className="flex-1 flex flex-col relative py-6">
            <AnimatePresence mode="wait">
          {!user && currentView !== 'about' ? (
            <motion.div
              role="main"
              key="auth-landing"
              id="auth-landing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-20 text-center"
            >
              <div className="bg-white dark:bg-slate-900 p-6 sm:p-12 rounded-[2rem] sm:rounded-[3rem] shadow-2xl shadow-slate-200 dark:shadow-slate-950/50 border border-slate-100 dark:border-slate-800 max-w-3xl mx-auto">
               <div className="flex justify-center mb-6 sm:mb-8">
                 <Logo size="xl" showText={false} />
               </div>
                <h2 className="text-2xl sm:text-5xl font-black text-slate-900 dark:text-white mb-4 sm:mb-6 tracking-tighter uppercase leading-none">Clinical <br /><span className="text-blue-600">Intelligence</span> Vault</h2>
                <p className="text-base sm:text-xl text-slate-500 dark:text-slate-400 mb-10 leading-relaxed font-bold max-w-xl mx-auto">
                  Access your encrypted biological markers and personalized longevity protocols with enterprise-grade synchronization.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button 
                    onClick={() => setIsAuthModalOpen(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 sm:px-10 py-4 sm:py-5 bg-blue-600 text-white rounded-2xl font-black text-base sm:text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 dark:shadow-blue-900/20 group"
                  >
                    <LogIn size={20} className="sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
                    <span>GET STARTED</span>
                  </button>
                  <button 
                    onClick={() => setCurrentView('about')}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 sm:px-10 py-4 sm:py-5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-black text-base sm:text-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    <Info size={20} className="sm:w-6 sm:h-6" />
                    <span>LEARN MORE</span>
                  </button>
                </div>
                <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-slate-50 dark:border-slate-800 flex items-center justify-center gap-4 sm:gap-8 opacity-50">
                  <div className="flex items-center gap-2">
                    <Shield size={14} className="text-blue-600 dark:text-blue-400 sm:w-4 sm:h-4" />
                    <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">HIPAA Compliant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield size={14} className="text-blue-600 dark:text-blue-400 sm:w-4 sm:h-4" />
                    <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">End-to-End Encrypted</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : currentView === 'home' ? (
            <Dashboard 
              onNavigate={showView} 
              user={user} 
              aiInsight={aiInsight} 
              onRefreshInsight={fetchAiInsight} 
              isInsightLoading={isInsightLoading} 
              onInstall={handleDirectInstall}
            />
          ) : currentView === 'ai_nexus' ? (
            <DoctorianAI user={user} onNavigate={setCurrentView} />
          ) : currentView === 'specialist' ? (
            <motion.div
              role="main"
              key="specialist"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8"
            >
              <SpecialistFinder />
            </motion.div>
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
        ) : currentView === 'vitality' ? (
          <motion.div
            key="vitality"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <VitalityMatrix />
          </motion.div>
        ) : currentView === 'tasks' ? (
          <motion.div
            key="tasks"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
          >
            <Tasks />
          </motion.div>
        ) : currentView === 'symptoms' ? (
          <motion.div
            key="symptoms"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
          >
            <SymptomChecker />
          </motion.div>
        ) : currentView === 'meds' ? (
          <motion.div
            key="meds"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
          >
            <MedicationTracker />
          </motion.div>
        ) : currentView === 'biosecurity' ? (
          <motion.div
            key="biosecurity"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
          >
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Bio-Security Nexus</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Neural identity management and multi-factor biometric authentication.</p>
              </div>
              <button 
                onClick={() => setCurrentView('profile')}
                className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-colors flex items-center gap-2 text-xs font-black uppercase tracking-widest"
              >
                <ArrowLeft size={18} />
                Back to Settings
              </button>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-3xl border border-slate-100 dark:border-slate-800 overflow-hidden min-h-[600px] h-[70vh]">
              <BioSecurity />
            </div>
          </motion.div>
        ) : currentView === 'profile' ? (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ProfileSettings 
              user={user} 
              onUpdate={(updatedUser) => setUser(updatedUser)} 
              onLogout={handleLogout}
              onBack={() => setCurrentView('home')}
              onNavigate={setCurrentView}
            />
          </motion.div>
        ) : currentView === 'admin' ? (
          <motion.div
            key="admin"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
          >
            <AdminDashboard />
          </motion.div>
        ) : currentView === 'neuro' ? (
          <motion.div
            key="neuro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-7xl mx-auto px-4 py-12"
          >
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Cognis Pathway Laboratory</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Deep-layer cognitive synthesis and biological activity modeling.</p>
              </div>
              <button 
                onClick={() => setCurrentView('home')}
                className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
            </div>
            <div className="bg-slate-950 rounded-[4rem] shadow-3xl border border-slate-800 overflow-hidden">
              <CognisAnalytics />
            </div>
          </motion.div>
        ) : currentView === 'ai_lab' ? (
          <motion.div
            key="ai_lab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 flex flex-col"
          >
            <div className="flex-1 overflow-hidden relative">
              <ChatInterface user={user} onMessageSent={() => setHasNotification(true)} />
              
              {/* Specialized Navigation for Standalone Mode */}
              <div className="absolute top-8 left-8 z-[100] scale-90 md:scale-100 origin-top-left">
                  <button 
                    onClick={() => setCurrentView('home')}
                    className="group flex items-center gap-4 p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl rounded-full border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all shadow-2xl overflow-hidden pr-6"
                  >
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <ArrowLeft size={20} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Terminate Session</span>
                  </button>
              </div>
            </div>
          </motion.div>
        ) : ['help', 'community', 'privacy', 'terms', 'feedback'].includes(currentView) ? (
          <motion.div
            key="resource"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ResourceView 
              type={currentView as ResourceType} 
              onBack={() => setCurrentView('home')} 
            />
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
    </div>
  </main>

  {/* Footer */}
  <motion.footer 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.5 }}
    className="mt-20 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors relative overflow-hidden"
  >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-20"></div>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Stethoscope size={24} className="text-blue-600" />
                <span className="text-xl font-black tracking-tighter uppercase text-slate-900 dark:text-white">DOCTORIAN<span className="text-blue-600">AI</span></span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium">
                Pioneering the next generation of reactive longevity and Cognis diagnostics. Doctorian AI synthesizes biological data with advanced machine reasoning to empower your health journey.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center border border-blue-100 dark:border-blue-800 shadow-sm shadow-blue-500/10">
                  <ShieldCheck size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">HIPAA Certified</p>
                  <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Zero-Trust Privacy Protocol</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-8 border-l-2 border-blue-600 pl-4">Clinical Suite</h4>
              <ul className="space-y-4">
                {[
                  { label: 'AI Cognis Lab', view: 'ai_lab' },
                  { label: 'Cognis Lab', view: 'neuro' },
                  { label: 'Vital Matrix', view: 'vitality' },
                ].map(link => (
                  <li key={link.label}>
                    <button onClick={() => setCurrentView(link.view as any)} className="text-slate-500 hover:text-blue-600 text-sm font-bold transition-all hover:translate-x-1">{link.label}</button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-8 border-l-2 border-blue-600 pl-4">Resources</h4>
              <ul className="space-y-4">
                {[
                  { label: 'Community Lab', view: 'community' },
                  { label: 'Help Documentation', view: 'help' },
                  { label: 'System Status', view: 'home' },
                  { label: 'Specialist Network', view: 'specialist' },
                  { label: 'Project About', view: 'about' },
                ].map(link => (
                  <li key={link.label}>
                    <button onClick={() => setCurrentView(link.view as any)} className="text-slate-500 hover:text-blue-600 text-sm font-bold transition-all hover:translate-x-1">{link.label}</button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-8 border-l-2 border-blue-600 pl-4">Global Sync</h4>
              <div className="space-y-6">
                <a 
                  href="https://wa.me/256787674140" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 p-5 bg-emerald-500 text-white rounded-[2rem] transition-all hover:scale-[1.05] hover:shadow-2xl hover:shadow-emerald-500/20 active:scale-95 border border-white/20 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/0 via-emerald-600/0 to-emerald-400/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 bg-white/20 p-2.5 rounded-xl group-hover:rotate-12 transition-transform shadow-lg">
                    <MessageCircle size={20} />
                  </div>
                  <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase opacity-90 leading-none mb-1.5 tracking-[0.2em]">Live Support</p>
                    <p className="text-sm font-black tracking-tighter uppercase">WhatsApp Instant</p>
                  </div>
                </a>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { icon: <Facebook size={18} />, href: 'mailto:Josephhaxzy@gmail.com', color: 'bg-[#1877F2]' },
                    { icon: <Instagram size={18} />, href: 'mailto:Josephhaxzy@gmail.com', color: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]' },
                    { icon: <X size={18} />, href: 'mailto:Josephhaxzy@gmail.com', color: 'bg-black' },
                    { icon: <Mail size={18} />, href: 'mailto:Josephhaxzy@gmail.com', color: 'bg-blue-600' },
                  ].map((social, i) => (
                    <a key={i} href={social.href} target="_blank" rel="noopener noreferrer" className={`p-3 rounded-xl text-white flex items-center justify-center hover:scale-110 transition-all hover:-translate-y-1 shadow-lg ${social.color}`}>
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="text-center md:text-left">
              <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center justify-center md:justify-start gap-2">
                Developed by <span className="text-blue-600 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">Akora Joseph</span>
              </p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-3 flex items-center justify-center md:justify-start gap-3">
                <span className="w-6 h-[1px] bg-slate-200 dark:bg-slate-700"></span>
                Lead Medical Systems Architect
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8 md:gap-12">
              <button onClick={() => setCurrentView('privacy')} className="text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-[0.25em] transition-all hover:scale-110">Privacy Hub</button>
              <button onClick={() => setCurrentView('terms')} className="text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-[0.25em] transition-all hover:scale-110">Legal Terms</button>
              <button onClick={() => setCurrentView('feedback')} className="text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-[0.25em] transition-all hover:scale-110">Signal Feedback</button>
            </div>

            <div className="px-6 py-3 bg-white dark:bg-slate-950 rounded-full border border-slate-200 dark:border-slate-800 shadow-xl flex items-center gap-3">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
              </div>
              <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">© 2026 Core Intelligence</p>
            </div>
          </div>
        </div>
      </motion.footer>
      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-md p-4 sm:p-8 flex items-start justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="search-modal-title"
              className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden mt-12 border border-slate-100 dark:border-slate-800"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
                <Search className="text-blue-600 dark:text-blue-400" size={24} aria-hidden="true" />
                <h2 id="search-modal-title" className="sr-only">Search Doctorian AI</h2>
                <input 
                  autoFocus
                  type="text"
                  placeholder="Search for symptoms, doctors, or records..."
                  className="flex-1 bg-transparent border-none outline-none text-lg font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search symptoms, doctors, or records"
                />
                <button 
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  aria-label="Close search"
                >
                  <PlusCircle size={24} className="rotate-45" aria-hidden="true" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
                {searchQuery.trim() === '' ? (
                  <>
                    <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">Quick Suggestions</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {filteredSearchResults.slice(0, 4).map((sug, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setCurrentView(sug.view as any);
                            setIsSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-2xl transition-all group border border-transparent hover:border-blue-100 dark:hover:border-blue-800"
                        >
                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors shadow-sm">
                            {sug.icon}
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-black text-slate-700 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-400">{sug.label}</p>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{sug.category}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        Search Results ({searchResults.length})
                      </p>
                      {searchResults.length > 0 && (
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg">
                          Found in {new Set(searchResults.map(r => r.category)).size} categories
                        </span>
                      )}
                    </div>

                    {searchResults.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3">
                        {searchResults.map((result, i) => (
                          <motion.button
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            key={i}
                            onClick={() => {
                              setCurrentView(result.view as any);
                              setIsSearchOpen(false);
                              setSearchQuery('');
                              if (result.prompt) {
                                // We could pass the prompt to ChatInterface here if we had a way to trigger it
                                // For now, just navigating is good
                              }
                            }}
                            className="flex items-center gap-5 p-5 bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 rounded-3xl transition-all group border-2 border-transparent hover:border-blue-500 shadow-sm hover:shadow-xl hover:shadow-blue-100 dark:hover:shadow-blue-900/10"
                          >
                            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-600 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:scale-110 transition-all shadow-sm">
                              {result.icon}
                            </div>
                            <div className="text-left flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{result.label}</span>
                                <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                  {result.category}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-1">{result.description}</p>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                              <PlusCircle className="text-blue-600 rotate-45" size={20} />
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                          <Search size={32} />
                        </div>
                        <p className="text-slate-900 dark:text-white font-black">No results found for "{searchQuery}"</p>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-bold mt-2">Try searching for symptoms, tools, or help topics.</p>
                        <button 
                          onClick={() => setSearchQuery('')}
                          className="mt-6 text-blue-600 dark:text-blue-400 font-black text-xs hover:underline"
                        >
                          Clear Search
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Download Button */}
      <AnimatePresence>
        {showInstallButton && !isStandalone && (
          <div className="fixed bottom-20 left-4 sm:bottom-8 sm:left-8 z-[100] flex flex-col items-start gap-2">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-3 py-1 bg-blue-600/90 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg border border-white/20 ml-2"
            >
              DR. AI - INSTALLER
            </motion.div>
            <motion.button
              initial={{ scale: 0, opacity: 0, x: -20 }}
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: 1, 
                x: 0 
              }}
              transition={{
                scale: {
                  repeat: Infinity,
                  duration: 3,
                  ease: "easeInOut"
                }
              }}
              exit={{ scale: 0, opacity: 0, x: -20 }}
              onClick={handleDirectInstall}
              id="install-app"
              name="install-app"
              className="bg-blue-600 text-white p-4 sm:p-5 rounded-full shadow-[0_15px_30px_-5px_rgba(37,99,235,0.4),inset_0_-4px_0_0_#1d4ed8] hover:shadow-[0_20px_40px_-5px_rgba(37,99,235,0.6),inset_0_-4px_0_0_#1d4ed8] hover:-translate-y-1 active:translate-y-1 active:shadow-[0_5px_10px_-2px_rgba(37,99,235,0.4),inset_0_0px_0_0_#1d4ed8] transition-all group flex items-center gap-3 border-4 border-white dark:border-slate-900"
              title={isInIframe ? "Launch Standalone Window" : "Install Doctorian App (.APK)"}
            >
              <div className="relative">
                <Download size={24} className="sm:w-7 sm:h-7 stroke-[3px] drop-shadow-md" />
                <motion.div 
                  animate={{ y: [0, 3, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full shadow-sm"
                />
              </div>
              <span className="max-w-xs overflow-hidden transition-all duration-500 font-black text-xs sm:text-sm whitespace-nowrap drop-shadow-sm uppercase">
                {isInIframe ? "Launch App" : "INSTALL APP"}
              </span>
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      {/* Removed FloatingAI as features are now in Doctorian AI page */}

      <AdminInfoModal 
        isOpen={isAdminInfoOpen} 
        onClose={() => setIsAdminInfoOpen(false)} 
      />
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onSuccess={(u) => {
          setUser(u);
          setToast({ message: `Welcome ${u.displayName || u.email}!`, type: 'success' });
        }} 
        initialView={authModalView}
      />

      <HealthTipModal 
        isOpen={isTipModalOpen}
        onClose={() => setIsTipModalOpen(false)}
        tip={dailyTip}
      />

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl shadow-2xl font-black text-sm flex items-center gap-3 ${
              toast.type === 'success' ? 'bg-blue-600 text-white' : 
              toast.type === 'info' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border border-slate-700 dark:border-slate-200' :
              'bg-rose-600 text-white'
            }`}
          >
            {toast.type === 'success' ? <Stethoscope size={20} /> : 
             toast.type === 'info' ? <Info size={20} /> :
             <ShieldAlert size={20} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
        </div>
      </div>

      {/* Mobile Navigation Dock - Bottom Floating */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 z-[100] h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex items-center justify-around px-4">
        {mobileNavLinks.map((link) => (
          <button
            key={link.id}
            onClick={() => setCurrentView(link.id as any)}
            className={`p-3 rounded-xl transition-all ${
              currentView === link.id 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            {React.cloneElement(link.icon as any, { size: 20 })}
          </button>
        ))}
      </div>
    </div>
  );
}
