import React, { useState, useEffect } from 'react';
import { 
  User, Camera, Mail, Shield, Save, Loader2, 
  CheckCircle2, AlertCircle, LogOut, Fingerprint,
  ScanFace, Bell, Globe, Lock, ArrowLeft, Plus,
  X, RefreshCw, QrCode, Download, Share2,
  Activity,
  Syringe as Pill
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api, User as UserType } from '../api';
import { useRef } from 'react';

interface ProfileSettingsProps {
  user: UserType | null;
  onUpdate: (user: UserType) => void;
  onLogout: () => void;
  onBack: () => void;
  onNavigate?: (view: any) => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, onUpdate, onLogout, onBack, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'language' | 'medical-id'>('profile');
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isRegisteringBiometrics, setIsRegisteringBiometrics] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Notification settings (mock)
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    marketing: false
  });

  // Language settings (mock)
  const [language, setLanguage] = useState('English (US)');

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName);
      setPhotoURL(user.photoURL || '');
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    setMessage(null);
    try {
      const updatedUser = await api.auth.updateProfile({ displayName, photoURL });
      onUpdate(updatedUser);
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (error: any) {
      console.error("Profile update error:", error);
      setMessage({ text: error.message || 'Failed to update profile', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ text: 'Image must be less than 2MB', type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoURL(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (isCameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCameraOpen]);

  const startCamera = async () => {
    setCameraError(null);
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 400 }, height: { ideal: 400 } } 
      });
      streamRef.current = stream;
      // If videoRef is already available, set it
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError("Could not access camera. Please check permissions.");
      // Don't close immediately so user can see error
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Square crop
        const size = Math.min(video.videoWidth, video.videoHeight);
        const startX = (video.videoWidth - size) / 2;
        const startY = (video.videoHeight - size) / 2;
        
        canvas.width = 400;
        canvas.height = 400;
        context.drawImage(video, startX, startY, size, size, 0, 0, 400, 400);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setPhotoURL(dataUrl);
        stopCamera();
      }
    }
  };

  const handleRegisterBiometrics = async () => {
    setIsRegisteringBiometrics(true);
    setMessage(null);
    try {
      const options = await api.auth.webauthn.registerOptions();
      const { startRegistration } = await import('@simplewebauthn/browser');
      
      // The browser will show the biometric prompt
      const attResp = await startRegistration({ optionsJSON: options });
      const verified = await api.auth.webauthn.registerVerify(attResp);
      
      if (verified) {
        setMessage({ text: 'Neural identity pattern synchronized successfully!', type: 'success' });
      } else {
        throw new Error('Neural verification failed. Pattern mismatch.');
      }
    } catch (error: any) {
      console.error("Biometric registration error:", error);
      if (error.name === 'NotAllowedError') {
        setMessage({ text: 'Registration cancelled by user or timed out.', type: 'error' });
      } else {
        setMessage({ text: error.message || 'Device biometric registration failed', type: 'error' });
      }
    } finally {
      setIsRegisteringBiometrics(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <div className="mb-8 sm:mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 font-bold text-xs uppercase tracking-widest mb-4 transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Account Settings</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">Manage your clinical profile and preferences</p>
        </div>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8 pb-32">
        {/* Sidebar Navigation - Horizontal on mobile, Vertical on desktop */}
        <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0 gap-2 pb-6 lg:pb-0 sticky top-0 bg-white dark:bg-slate-950 z-20" role="tablist" aria-label="Profile settings sections">
          {[
            { id: 'profile', label: 'Public', icon: <User size={18} /> },
            { id: 'security', label: 'Security', icon: <Lock size={18} /> },
            { id: 'medical-id', label: 'Medical ID', icon: <QrCode size={18} /> },
            { id: 'notifications', label: 'Alerts', icon: <Bell size={18} /> },
            { id: 'language', label: 'Lang', icon: <Globe size={18} /> },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                setMessage(null);
              }}
              role="tab"
              aria-selected={activeTab === item.id}
              className={`whitespace-nowrap flex items-center gap-3 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/20' 
                  : 'bg-slate-50 dark:bg-slate-800 lg:bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {item.icon}
              <span className="hidden sm:inline lg:inline">{item.label}</span>
              <span className="inline sm:hidden lg:hidden">{item.label}</span>
            </button>
          ))}
          <div className="hidden lg:block pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
              aria-label="Log out of your account"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>

        {/* mobile Sign Out button */}
        <div className="lg:hidden flex justify-end">
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-50 dark:bg-rose-900/20 transition-all"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>

        {/* Main Content */}
        <div 
          className="lg:col-span-2 space-y-8"
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
        >
          {/* Profile Section */}
          {activeTab === 'profile' && (
            <motion.section 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center gap-6 mb-8">
                <div className="relative group">
                  <button 
                    onClick={startCamera}
                    className="w-24 h-24 rounded-3xl bg-slate-100 dark:bg-slate-800 overflow-hidden border-4 border-white dark:border-slate-900 shadow-lg relative group transition-transform active:scale-95"
                    aria-label="Open camera to take profile photo"
                  >
                    {photoURL ? (
                      <img src={photoURL} alt={`Current profile photo of ${displayName}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                        <User aria-hidden="true" size={40} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera aria-hidden="true" size={24} className="text-white" />
                    </div>
                  </button>
                  <div className="absolute -bottom-2 -right-2 flex gap-1">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-blue-600 text-white p-2 rounded-xl shadow-lg hover:scale-110 transition-transform"
                      title="Upload Photo"
                      aria-label="Upload profile photo from files"
                    >
                      <Plus aria-hidden="true" size={16} />
                    </button>
                    <button 
                      onClick={startCamera}
                      className="bg-slate-900 dark:bg-slate-800 text-white p-2 rounded-xl shadow-lg hover:scale-110 transition-transform"
                      title="Take Photo"
                      aria-label="Take profile photo with camera"
                    >
                      <Camera aria-hidden="true" size={16} />
                    </button>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">{displayName || 'User'}</h3>
                  <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">{user.email}</p>
                  <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-1 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-lg inline-block">
                    {user.role}
                  </p>
                </div>
              </div>

              <AnimatePresence>
                {isCameraOpen && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4"
                  >
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl relative border border-slate-100 dark:border-slate-800">
                      <button 
                        onClick={stopCamera}
                        className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      >
                        <X size={24} />
                      </button>
                      
                      <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">Take Profile Photo</h3>
                      
                      <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-3xl overflow-hidden mb-8 relative">
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          className="w-full h-full object-cover"
                        />
                        <canvas ref={canvasRef} className="hidden" />
                      </div>

                      {cameraError && (
                        <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl flex items-center gap-3 text-rose-600 dark:text-rose-400 text-xs font-bold">
                          <AlertCircle size={16} />
                          {cameraError}
                        </div>
                      )}

                      <div className="flex gap-4">
                        <button 
                          onClick={stopCamera}
                          className="flex-1 px-6 py-3.5 rounded-2xl font-black text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={capturePhoto}
                          className="flex-1 bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 dark:shadow-blue-900/20 flex items-center justify-center gap-2"
                        >
                          <Camera size={18} />
                          Capture
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-6">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Display Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={18} />
                    <input
                      type="text"
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-blue-100 dark:focus:border-blue-900 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/20 transition-all outline-none"
                      placeholder="Your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Photo URL</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={18} />
                    <input
                      type="text"
                      value={photoURL}
                      onChange={e => setPhotoURL(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-blue-100 dark:focus:border-blue-900 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/20 transition-all outline-none"
                      placeholder="https://example.com/photo.jpg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={18} />
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-slate-900 dark:text-white opacity-50 cursor-not-allowed outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 ml-1">Email cannot be changed for security reasons.</p>
                </div>
              </div>

              <div className="mt-10 flex items-center justify-between">
                {message && (
                  <div className={`flex items-center gap-2 text-xs font-bold ${message.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                    {message.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                    {message.text}
                  </div>
                )}
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="ml-auto bg-slate-900 dark:bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black text-sm hover:bg-slate-800 dark:hover:bg-blue-700 transition-all shadow-xl shadow-slate-200 dark:shadow-blue-900/20 flex items-center gap-2 disabled:opacity-50 active:scale-95"
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Save Changes
                </button>
              </div>
            </motion.section>
          )}

          {/* Security Section */}
          {activeTab === 'security' && (
            <motion.section 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-indigo-50 dark:bg-indigo-900/30 p-2.5 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <Shield size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Neural Security Control</h3>
                  <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">Manage your biometric identity and passkeys</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-slate-50/50 dark:bg-slate-800/30 rounded-3xl border border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm text-blue-600 dark:text-blue-400">
                        <Fingerprint size={28} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white mb-1">Neural Node Registration</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium leading-relaxed max-w-md">
                          Enabling biometric authentication allows you to access Doctorian AI using your device's fingerprint or face scanner without typing a password.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRegisterBiometrics}
                      disabled={isRegisteringBiometrics}
                      className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-xs font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 dark:shadow-blue-900/20 flex items-center justify-center gap-3 disabled:opacity-50 min-w-[160px]"
                    >
                      {isRegisteringBiometrics ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>SYNCHRONIZING...</span>
                        </>
                      ) : (
                        <>
                          <Plus size={16} />
                          <span>REGISTER DEVICE</span>
                        </>
                      )}
                    </button>
                  </div>

                  {message && activeTab === 'security' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className={`mt-6 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold ${
                        message.type === 'success' 
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800' 
                          : 'bg-rose-50 dark:bg-rose-900/20 text-rose-500 dark:text-rose-400 border border-rose-100 dark:border-rose-800'
                      }`}
                    >
                      {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                      {message.text}
                    </motion.div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <ScanFace size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Hardware Target</p>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Face ID / Touch ID</p>
                    </div>
                  </div>
                  <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <Lock size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Auth Protocol</p>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">FIDO2 / WebAuthn</p>
                      </div>
                    </div>
                    <div className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[8px] font-black uppercase tracking-widest rounded-md">
                      Secure
                    </div>
                  </div>
                </div>

                {onNavigate && (
                  <div className="pt-4 flex justify-center">
                    <button 
                      onClick={() => onNavigate('biosecurity')}
                      className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:underline flex items-center gap-2"
                    >
                      <Activity size={12} />
                      View Neural Security Dashboard
                    </button>
                  </div>
                )}
              </div>
            </motion.section>
          )}

          {/* Notifications Section */}
          {activeTab === 'notifications' && (
            <motion.section 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-2.5 rounded-xl text-blue-600 dark:text-blue-400">
                  <Bell size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Notifications</h3>
                  <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">Configure how you want to be notified</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { id: 'email', label: 'Email Notifications', desc: 'Receive health alerts via email' },
                  { id: 'sms', label: 'SMS Alerts', desc: 'Get urgent notifications on your phone' },
                  { id: 'push', label: 'Push Notifications', desc: 'Real-time updates in your browser' },
                  { id: 'marketing', label: 'Marketing Emails', desc: 'News and updates from Doctorian AI' }
                ].map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <div>
                      <p className="text-sm font-black text-slate-900 dark:text-white">{item.label}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{item.desc}</p>
                    </div>
                    <button 
                      onClick={() => setNotifications(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof prev] }))}
                      className={`w-12 h-6 rounded-full transition-all relative ${notifications[item.id as keyof typeof notifications] ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                      aria-pressed={notifications[item.id as keyof typeof notifications]}
                      aria-label={`Toggle ${item.label}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications[item.id as keyof typeof notifications] ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Language Section */}
          {activeTab === 'language' && (
            <motion.section 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-emerald-50 dark:bg-emerald-900/30 p-2.5 rounded-xl text-emerald-600 dark:text-emerald-400">
                  <Globe size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Language & Region</h3>
                  <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">Choose your preferred language</p>
                </div>
              </div>

              <div className="space-y-4">
                {['English (US)', 'English (UK)', 'Spanish', 'French', 'German'].map(lang => (
                  <button 
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${language === lang ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                  >
                    <span className={`text-sm font-bold ${language === lang ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>{lang}</span>
                    {language === lang && <CheckCircle2 size={18} className="text-blue-600 dark:text-blue-400" />}
                  </button>
                ))}
              </div>
            </motion.section>
          )}

          {/* Medical ID Section */}
          {activeTab === 'medical-id' && (
            <motion.section 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
                <div className="w-48 h-48 bg-slate-50 dark:bg-slate-800 rounded-3xl p-4 flex items-center justify-center mb-8 border-4 border-slate-100 dark:border-slate-700 shadow-inner">
                   <QrCode size={120} className="text-slate-900 dark:text-white" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-4 text-slate-900 dark:text-white leading-none">Clinical <span className="text-blue-600 font-serif italic normal-case">Rapid Access</span></h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-bold max-w-sm mb-8 font-serif leading-relaxed">"First responders scan this token to access critical metabolic data, blood type, and emergency protocols instantly."</p>
                
                <div className="flex gap-4">
                   <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                     <Download size={14} />
                     Save to Wallet
                   </button>
                   <button className="flex items-center gap-2 px-6 py-3 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-100 dark:border-slate-700 hove:text-blue-600 transition-colors">
                     <Share2 size={14} />
                     Clinical Share
                   </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {[
                   { label: 'Blood Type', val: 'O Pos (Rh+)', icon: <Fingerprint size={16} /> },
                   { label: 'Allergies', val: 'Penicillin, Latex', icon: <Shield size={16} /> },
                   { label: 'Medications', val: 'Lisinopril, Omega-3', icon: <Pill size={16} /> },
                   { label: 'Emergency Contact', val: 'Clinic Alpha-9', icon: <Plus size={16} /> }
                 ].map((card, i) => (
                   <div key={i} className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                      <div className="text-blue-600 mb-4">{card.icon}</div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{card.label}</p>
                      <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{card.val}</p>
                   </div>
                 ))}
              </div>
            </motion.section>
          )}
        </div>

      </div>
    </div>
  );
};
