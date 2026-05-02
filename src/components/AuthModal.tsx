import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, LogIn, UserPlus, X, Loader2, Stethoscope, Fingerprint, ScanFace, ShieldCheck, ArrowLeft, CheckCircle2, Github, Facebook, Instagram } from 'lucide-react';
import { api, User as UserType } from '../api';
import { startAuthentication } from '@simplewebauthn/browser';
import { signInWithSocial, googleProvider, githubProvider, facebookProvider, instagramProvider } from '../firebase';

import { Logo } from './Logo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserType) => void;
  initialView?: AuthView;
}

type AuthView = 'login' | 'signup' | 'forgot-password' | 'verify-code' | 'reset-password';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess, initialView = 'login' }) => {
  const [view, setView] = useState<AuthView>(initialView);
  const [authMethod, setAuthMethod] = useState<'password' | 'biometric'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [biometricSuccess, setBiometricSuccess] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [resetCode, setResetCode] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsOverlay, setShowTermsOverlay] = useState<'terms' | 'privacy' | null>(null);

  useEffect(() => {
    if (isOpen && initialView) {
      setView(initialView);
    }
  }, [isOpen, initialView]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('resetToken');
    if (token) {
      setResetToken(token);
      setView('reset-password');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleBiometricAuth = async (type: 'fingerprint' | 'face') => {
    if (!email) {
      setError('Please enter your email first to use biometric login');
      return;
    }

    setIsBiometricLoading(true);
    setError(null);
    
    try {
      // 1. Get authentication options from server
      const { options, userId } = await api.auth.webauthn.loginOptions(email);

      if (!options.allowCredentials || options.allowCredentials.length === 0) {
        throw new Error('No biometric credentials found for this email. Please log in with password first and register your device.');
      }

      // 2. Start WebAuthn authentication
      const asseResp = await startAuthentication({ optionsJSON: options });

      // 3. Verify authentication with server
      const verification = await api.auth.webauthn.loginVerify(asseResp, userId, email);

      if (verification.verified) {
        setBiometricSuccess(true);
        const user = verification.user;
        
        // Verify user's role after successful biometric authentication
        if (user.role === 'admin' || user.role === 'doctor') {
          setSuccessMessage(`Administrator access verified: ${user.role.toUpperCase()}`);
        } else {
          setSuccessMessage(`Welcome back, ${user.displayName || 'User'}!`);
        }

        await new Promise(resolve => setTimeout(resolve, 1500));
        onSuccess(user);
        onClose();
      } else {
        throw new Error('Biometric verification failed');
      }
    } catch (err: any) {
      console.error("Biometric error:", err);
      setError(err.message || 'Biometric scan failed');
    } finally {
      setIsBiometricLoading(false);
    }
  };

  const isPasswordSecure = (pass: string) => {
    const hasLetter = /[a-zA-Z]/.test(pass);
    const hasNumber = /\d/.test(pass);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    return hasLetter && hasNumber && hasSymbol && pass.length >= 8;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (view === 'login') {
        const user = await api.auth.login(email, password);
        
        // Verify user's role after successful login
        if (user.role === 'admin' || user.role === 'doctor') {
          setSuccessMessage(`Administrator access verified: ${user.role.toUpperCase()}`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        onSuccess(user);
        onClose();
      } else if (view === 'signup') {
        if (!isPasswordSecure(password)) {
          throw new Error("Password must be at least 8 characters and include letters, numbers, and symbols");
        }
        const user = await api.auth.signup(email, password, displayName);
        onSuccess(user);
        onClose();
      } else if (view === 'forgot-password') {
        const res = await api.auth.forgotPassword(email);
        setSuccessMessage(res.message);
        setTimeout(() => setView('verify-code'), 1500);
      } else if (view === 'verify-code') {
        const res = await api.auth.verifyResetCode(email, resetCode);
        setResetToken(res.token);
        setSuccessMessage("Code verified successfully!");
        setTimeout(() => setView('reset-password'), 1000);
      } else if (view === 'reset-password') {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        if (!isPasswordSecure(password)) {
          throw new Error("Password must be at least 8 characters and include letters, numbers, and symbols");
        }
        if (!resetToken) throw new Error("Reset token missing");
        await api.auth.resetPassword(resetToken, password);
        setSuccessMessage("Password reset successfully. You can now sign in.");
        setTimeout(() => setView('login'), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: any, providerName: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const firebaseUser = await signInWithSocial(provider);
      if (firebaseUser.email) {
        const user = await api.auth.socialLogin({
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          photoURL: firebaseUser.photoURL || undefined,
          providerId: providerName
        });
        onSuccess(user);
        onClose();
      } else {
        throw new Error("No email returned from social provider");
      }
    } catch (err: any) {
      setError(err.message || `Failed to sign in with ${providerName}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              aria-label="Close authentication modal"
            >
              <X aria-hidden="true" size={20} />
            </button>

            <div className="p-8 sm:p-10">
              <div className="flex flex-col items-center text-center mb-8">
                <Logo size="lg" className="mb-4" />
                <h2 id="auth-modal-title" className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                  {view === 'login' ? 'Welcome Back' : 
                   view === 'signup' ? 'Create Account' : 
                   view === 'forgot-password' ? 'Reset Password' : 
                   view === 'verify-code' ? 'Verify Code' : 'New Password'}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">
                  {view === 'login' ? 'Sign in for Doctors, Patients, or Mentors' : 
                   view === 'signup' ? 'Join Doctorian AI for personalized health insights' :
                   view === 'forgot-password' ? 'Enter your email to receive a verification code' : 
                   view === 'verify-code' ? 'Enter the 6-digit code sent to your email' : 'Enter your new secure password'}
                </p>
              </div>

              {view === 'login' && (
                <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-8" role="tablist" aria-label="Sign in method">
                  <button
                    onClick={() => setAuthMethod('password')}
                    role="tab"
                    aria-selected={authMethod === 'password'}
                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      authMethod === 'password' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                  >
                    Password
                  </button>
                  <button
                    onClick={() => setAuthMethod('biometric')}
                    role="tab"
                    aria-selected={authMethod === 'biometric'}
                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      authMethod === 'biometric' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                  >
                    Biometric
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {view === 'signup' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-blue-600 transition-colors" size={18} />
                      <input
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Joseph Brian"
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white"
                      />
                    </div>
                  </div>
                )}

                {(view === 'login' || view === 'signup' || view === 'forgot-password') && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-blue-600 transition-colors" size={18} />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white"
                      />
                    </div>
                  </div>
                )}

                {view === 'verify-code' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Verification Code</label>
                    <div className="relative group">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-blue-600 transition-colors" size={18} />
                      <input
                        type="text"
                        required
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="123456"
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white tracking-[0.5em] text-center"
                      />
                    </div>
                  </div>
                )}

                {(view === 'signup' || (view === 'login' && authMethod === 'password') || view === 'reset-password') && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                      {view === 'reset-password' ? 'New Password' : 'Password'}
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-blue-600 transition-colors" size={18} />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white"
                      />
                    </div>
                    {(view === 'signup' || view === 'reset-password') && (
                      <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 ml-1 mt-1 uppercase tracking-tight">
                        Required: 8+ chars, letters, numbers & symbols
                      </p>
                    )}
                  </div>
                )}

                {view === 'reset-password' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Confirm New Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-blue-600 transition-colors" size={18} />
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white"
                      />
                    </div>
                  </div>
                )}

                {view === 'login' && authMethod === 'password' && (
                  <>
                    <div className="relative my-8">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
                      </div>
                      <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 dark:text-slate-500">
                        <span className="bg-white dark:bg-slate-900 px-4">Instant Access</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { id: 'google', icon: null, color: 'hover:text-red-500', provider: googleProvider },
                        { id: 'facebook', icon: Facebook, color: 'hover:text-blue-600', provider: facebookProvider },
                        { id: 'instagram', icon: Instagram, color: 'hover:text-pink-500', provider: instagramProvider },
                        { id: 'github', icon: Github, color: 'hover:text-slate-900 dark:hover:text-white', provider: githubProvider },
                      ].map((social) => (
                        <button
                          key={social.id}
                          type="button"
                          onClick={() => handleSocialLogin(social.provider, social.id)}
                          className={`flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl transition-all hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/20 group ${social.color}`}
                          title={`Sign in with ${social.id}`}
                        >
                          {social.id === 'google' ? (
                            <span className="font-black text-lg transition-transform group-hover:scale-110">G</span>
                          ) : social.icon ? (
                            // @ts-ignore
                            <social.icon size={20} className="transition-transform group-hover:scale-110" />
                          ) : null}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl text-rose-600 dark:text-rose-400 text-xs font-bold text-center"
                    role="alert"
                  >
                    {error}
                  </motion.div>
                )}

                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center flex flex-col items-center gap-2"
                    role="status"
                  >
                    <CheckCircle2 aria-hidden="true" size={24} />
                    {successMessage}
                  </motion.div>
                )}

                {view === 'login' && authMethod === 'biometric' && (
                  <div className="flex items-start gap-3 px-1 mb-6">
                    <div className="relative flex items-center">
                      <input 
                        type="checkbox" 
                        id="terms-agree-bio"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="w-5 h-5 rounded-lg border-2 border-slate-200 dark:border-slate-700 text-blue-600 focus:ring-blue-500/20 transition-all cursor-pointer appearance-none checked:bg-blue-600 checked:border-blue-600"
                      />
                      {agreedToTerms && (
                        <CheckCircle2 className="absolute pointer-events-none text-white left-0.5" size={16} />
                      )}
                    </div>
                    <label htmlFor="terms-agree-bio" className="text-[11px] font-bold text-blue-600 dark:text-blue-400 leading-tight cursor-pointer select-none">
                      I have read and agree to the <button type="button" onClick={() => setShowTermsOverlay('terms')} className="underline">Terms & Conditions</button> and <button type="button" onClick={() => setShowTermsOverlay('privacy')} className="underline">Privacy Policy</button>.
                    </label>
                  </div>
                )}

                {view === 'login' && authMethod === 'biometric' && (
                  <div className="flex flex-col items-center justify-center py-6 mb-8 relative">
                    <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                       <Logo size="lg" className="scale-[3] blur-3xl grayscale rotate-12" />
                    </div>
                    
                    <motion.div 
                      animate={isBiometricLoading ? { 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0],
                        opacity: [0.5, 1, 0.5]
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="relative z-10 w-24 h-24 rounded-full border-4 border-blue-500/20 flex items-center justify-center mb-6 overflow-hidden"
                    >
                       <div className="absolute inset-0 bg-blue-500/5" />
                       <Fingerprint size={48} className={isBiometricLoading ? "text-blue-500 animate-pulse" : biometricSuccess ? "text-emerald-500" : "text-slate-200 dark:text-slate-700"} />
                       {isBiometricLoading && (
                         <motion.div 
                           animate={{ y: [-48, 48, -48] }}
                           transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                           className="absolute w-full h-0.5 bg-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.8)]"
                         />
                       )}
                    </motion.div>

                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-1 relative z-10">
                      {isBiometricLoading ? 'Synchronizing Neural Link...' : biometricSuccess ? 'Identity Verified' : 'Neural Identity Scan'}
                    </h4>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest relative z-10">
                      {isBiometricLoading ? 'Verifying biologic patterns' : biometricSuccess ? 'Protocol accepted' : 'Biometric validation required'}
                    </p>
                  </div>
                )}

                {(view === 'signup' || (view === 'login' && authMethod === 'password') || view === 'forgot-password' || view === 'verify-code' || view === 'reset-password') ? (
                  <div className="space-y-6">
                    {(view === 'login' || view === 'signup') && (
                      <div className="flex items-start gap-3 px-1">
                        <div className="relative flex items-center">
                          <input 
                            type="checkbox" 
                            id="terms-agree"
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            className="w-5 h-5 rounded-lg border-2 border-slate-200 dark:border-slate-700 text-blue-600 focus:ring-blue-500/20 transition-all cursor-pointer appearance-none checked:bg-blue-600 checked:border-blue-600"
                          />
                          {agreedToTerms && (
                            <CheckCircle2 className="absolute pointer-events-none text-white left-0.5" size={16} />
                          )}
                        </div>
                        <label htmlFor="terms-agree" className="text-[11px] font-bold text-blue-600 dark:text-blue-400 leading-tight cursor-pointer select-none">
                          I have read and agree to the <button type="button" onClick={() => setShowTermsOverlay('terms')} className="underline">Terms & Conditions</button> and <button type="button" onClick={() => setShowTermsOverlay('privacy')} className="underline">Privacy Policy</button>.
                        </label>
                      </div>
                    )}
                    
                    <button
                      type="submit"
                      disabled={isLoading || ((view === 'login' || view === 'signup') && !agreedToTerms)}
                      className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-4 rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 dark:shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    >
                      {isLoading ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : view === 'login' ? (
                        <>
                          <LogIn size={20} />
                          <span>SIGN IN</span>
                        </>
                      ) : view === 'signup' ? (
                        <>
                          <UserPlus size={20} />
                          <span>SIGN UP</span>
                        </>
                      ) : view === 'forgot-password' ? (
                        <>
                          <Mail size={20} />
                          <span>SEND CODE</span>
                        </>
                      ) : view === 'verify-code' ? (
                        <>
                          <ShieldCheck size={20} />
                          <span>VERIFY CODE</span>
                        </>
                      ) : (
                        <>
                          <Lock size={20} />
                          <span>RESET PASSWORD</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className={`pt-2 transition-opacity ${!agreedToTerms ? 'opacity-50 pointer-events-none' : ''}`}>
                    <button
                      type="button"
                      onClick={() => handleBiometricAuth('fingerprint')}
                      disabled={isBiometricLoading || biometricSuccess || !agreedToTerms}
                      className={`w-full flex items-center justify-center gap-4 p-5 rounded-3xl border-2 transition-all group ${
                        biometricSuccess ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400' : 'bg-blue-600 text-white border-transparent hover:bg-blue-700 shadow-xl shadow-blue-500/20'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl transition-all ${
                        biometricSuccess ? 'bg-emerald-500 text-white' : 'bg-white/20 text-white'
                      }`}>
                        {biometricSuccess ? <ShieldCheck size={24} /> : <Fingerprint size={24} />}
                      </div>
                      <span className="text-sm font-black uppercase tracking-widest">
                        {isBiometricLoading ? 'SCANNING...' : biometricSuccess ? 'IDENTITY VERIFIED' : 'INITIATE NEURAL SCAN'}
                      </span>
                    </button>
                    
                    {!biometricSuccess && !isBiometricLoading && (
                      <p className="mt-4 text-[9px] font-bold text-slate-400 dark:text-slate-500 text-center uppercase tracking-widest">
                        System supports Face ID, Fingerprint, and Hardware Keys
                      </p>
                    )}
                  </div>
                )}
              </form>

              <div className="mt-8 text-center">
                {view === 'forgot-password' || view === 'verify-code' || view === 'reset-password' ? (
                  <button
                    onClick={() => setView('login')}
                    className="flex items-center justify-center gap-2 mx-auto text-sm text-slate-400 dark:text-slate-500 font-bold hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <ArrowLeft size={16} />
                    Back to Sign In
                  </button>
                ) : (
                  <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">
                    {view === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
                    <button
                      onClick={() => setView(view === 'login' ? 'signup' : 'login')}
                      className="text-blue-600 dark:text-blue-400 font-black hover:underline"
                    >
                      {view === 'login' ? 'Sign Up' : 'Sign In'}
                    </button>
                  </p>
                )}
              </div>

              {/* Terms Overlay */}
              <AnimatePresence>
                {showTermsOverlay && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="absolute inset-0 z-50 bg-white dark:bg-slate-900 flex flex-col"
                  >
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        {showTermsOverlay === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}
                      </h3>
                      <button 
                        onClick={() => setShowTermsOverlay(null)}
                        className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                      {showTermsOverlay === 'terms' ? (
                        <>
                          <section>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white mb-2 uppercase tracking-widest">1. Acceptance of Terms</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                              By accessing or using Doctorian AI ("the Service"), you agree to be bound by these Terms and Conditions. These terms constitute a legally binding agreement between you and Doctorian AI.
                            </p>
                          </section>
                          <section>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white mb-2 uppercase tracking-widest">2. MEDICAL DISCLAIMER</h4>
                            <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-400 text-[10px] font-black leading-relaxed">
                              WARNING: DOCTORIAN AI IS AN ARTIFICIAL INTELLIGENCE TOOL DESIGNED FOR INFORMATIONAL AND EDUCATIONAL PURPOSES ONLY. IT IS NOT A MEDICAL DEVICE AND DOES NOT PROVIDE MEDICAL DIAGNOSES.
                              <br /><br />
                              IF YOU ARE EXPERIENCING A MEDICAL EMERGENCY, CALL 911 IMMEDIATELY.
                            </div>
                          </section>
                          <section>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white mb-2 uppercase tracking-widest">3. User Responsibilities</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                              You are responsible for providing accurate health data and for the security of your account. You acknowledge that the responsibility for any medical decisions remains solely with you and your healthcare provider.
                            </p>
                          </section>
                          <section>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white mb-2 uppercase tracking-widest">4. Intellectual Property</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                              All content, features, and functionality of the Service are the exclusive property of Doctorian AI and its licensors.
                            </p>
                          </section>
                          <section>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white mb-2 uppercase tracking-widest">5. Service Limitations</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                              While we strive for accuracy, medical knowledge is constantly evolving. The AI-generated insights may contain errors, be outdated, or be incomplete.
                            </p>
                          </section>
                        </>
                      ) : (
                        <>
                          <section>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white mb-2 uppercase tracking-widest">1. Data Collection</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                              We collect information you provide directly to us, such as when you create an account, sync medical devices, or communicate with our AI.
                            </p>
                          </section>
                          <section>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white mb-2 uppercase tracking-widest">2. How We Use Your Data</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                              Your data is primarily used to provide personalized health insights and improve our AI models. We use end-to-end encryption to ensure privacy.
                            </p>
                          </section>
                          <section>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white mb-2 uppercase tracking-widest">3. Data Sharing</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                              Doctorian AI does not sell or rent your personal data to third parties. We only share data with medical professionals you explicitly authorize.
                            </p>
                          </section>
                        </>
                      )}
                    </div>
                    <div className="p-6 border-t border-slate-100 dark:border-slate-800">
                      <button 
                        onClick={() => setShowTermsOverlay(null)}
                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 dark:shadow-blue-900/20"
                      >
                        I UNDERSTAND
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
