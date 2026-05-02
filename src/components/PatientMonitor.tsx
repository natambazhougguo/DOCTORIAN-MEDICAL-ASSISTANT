import React, { useState } from 'react';
import {
  Wifi, Bluetooth, Play, Square, Thermometer,
  Heart, Droplets, Wind, Activity, AlertTriangle,
  CheckCircle, Info, Radio, Signal, XCircle, Monitor, Stethoscope, WifiOff,
  Smartphone, MessageSquare, Phone, Cpu, Loader2, Zap, Settings, Brain, Sparkles, X
} from 'lucide-react';
import { useArduino, HealthStatus, Vitals } from '../hooks/useArduino';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../api';
import { NeuralHealthSummary } from './NeuralHealthSummary';
import { VitalWaveform } from './VitalWaveform';

const VitalCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  color: string;
  bgColor: string;
  status?: 'normal' | 'warning' | 'critical';
  isLive?: boolean;
  history?: number[];
  maxVal?: number;
}> = ({ icon, label, value, unit, color, bgColor, status, isLive, history = [], maxVal }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ 
      opacity: 1, 
      scale: 1,
      boxShadow: status === 'critical' ? ['0 0 0 0px rgba(239, 68, 68, 0)', '0 0 0 4px rgba(239, 68, 68, 0.2)', '0 0 0 0px rgba(239, 68, 68, 0)'] : 'none'
    }}
    transition={{ 
      boxShadow: { repeat: Infinity, duration: 2 }
    }}
    className={`bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-[2.5rem] p-6 border shadow-sm hover:shadow-xl transition-all relative overflow-hidden flex flex-col justify-between h-full ${status === 'critical' ? 'border-red-200 dark:border-red-900 bg-red-50/30' : 'border-slate-100 dark:border-slate-800'}`}
    role="group"
    aria-label={`${label} monitoring`}
  >
    {isLive && (
      <div 
        className="absolute top-0 right-0 px-4 py-1.5 bg-emerald-500 text-[9px] font-black text-white uppercase tracking-[0.2em] rounded-bl-2xl shadow-lg"
        role="status"
        aria-label="Live data"
      >
        Live Matrix
      </div>
    )}
    
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className={`p-4 rounded-2xl ${bgColor} dark:bg-opacity-10 border border-current opacity-20`} aria-hidden="true">
          {React.cloneElement(icon as any, { size: 28 })}
        </div>
        <div className="flex gap-2">
          {status === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" aria-label="Warning status" />}
          {status === 'critical' && <XCircle className="w-5 h-5 text-red-500" aria-label="Critical status" />}
        </div>
      </div>
      
      <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2" id={`label-${label.replace(/\s+/g, '-')}`}>{label}</p>
      <div className="flex items-baseline gap-2 mb-6" aria-labelledby={`label-${label.replace(/\s+/g, '-')}`}>
        <span className={`text-5xl font-black tracking-tighter ${color}`} aria-live="polite">{value}</span>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{unit}</span>
      </div>
    </div>

    <div className="mt-auto pt-4 border-t border-slate-50 dark:border-slate-800/50">
      <div className="h-16 flex items-center justify-center">
        {history.length > 0 ? (
          <VitalWaveform 
            data={history} 
            color={status === 'critical' ? '#ef4444' : status === 'warning' ? '#f59e0b' : color.replace('text-', '').replace('[', '').replace(']', '') === 'blue-600' ? '#2563eb' : color.includes('#') ? color : '#3b82f6'} 
            maxVal={maxVal}
            width={240}
            height={60}
          />
        ) : (
          <div className="flex items-center gap-2 text-[8px] font-black text-slate-300 uppercase tracking-widest">
            <Radio size={10} className="animate-pulse" />
            Initializing Waveform
          </div>
        )}
      </div>
    </div>
  </motion.div>
);

const StatusBadge: React.FC<{ status: HealthStatus }> = ({ status }) => {
  const config = {
    excellent: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800', icon: <CheckCircle className="w-5 h-5" />, label: 'Excellent' },
    normal: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800', icon: <Info className="w-5 h-5" />, label: 'Normal' },
    warning: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800', icon: <AlertTriangle className="w-5 h-5" />, label: 'Warning' },
    critical: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-800', icon: <XCircle className="w-5 h-5" />, label: 'Critical' },
  };

  const c = config[status.overall];

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${c.bg} dark:bg-slate-900 border ${c.border} dark:border-slate-800 rounded-3xl p-6 sm:p-6 shadow-sm`}
      role="status"
      aria-label={`Overall Patient Status: ${c.label}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-4 mb-6 sm:mb-4">
        <div className="flex items-center gap-5">
          <div className={`${c.text} bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm`} aria-hidden="true">
            {React.cloneElement(c.icon as any, { size: 32 })}
          </div>
          <div>
            <h2 className="font-black text-slate-900 dark:text-white text-lg sm:text-lg leading-tight uppercase tracking-tight text-high-visibility">Patient Status</h2>
            <span className={`${c.text} font-black text-3xl sm:text-2xl tracking-tighter uppercase`}>{c.label}</span>
          </div>
        </div>
        <div 
          className="sm:ml-auto text-right bg-white dark:bg-slate-900 px-6 py-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2"
          aria-label={`Health score: ${status.score}`}
        >
          <p className="text-4xl sm:text-3xl font-black text-slate-800 dark:text-slate-200 leading-none text-high-visibility">{status.score}</p>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-high-visibility">Score</p>
        </div>
      </div>
      <div className="space-y-3 bg-white/50 dark:bg-slate-800/50 p-5 rounded-2xl border border-white/50 dark:border-slate-700/50 backdrop-blur-sm">
        {status.alerts.map((alert, i) => (
          <div key={i} className={`text-base sm:text-sm font-bold ${i === 0 && status.alerts.length > 1 ? c.text : 'text-slate-600 dark:text-slate-400'} flex items-start gap-3`}>
            <span className="mt-2 w-2 h-2 rounded-full bg-current shrink-0"></span>
            {alert}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const DiagnosticAnalysisView: React.FC<{ vitals: Vitals | null; history: Vitals[] }> = ({ vitals, history }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Brain size={120} />
          </div>
          <div className="relative z-10">
            <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] mb-8">Neural Connectivity Map</h3>
            <div className="h-64 flex items-center justify-center relative">
               {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.1, 0.3, 0.1],
                    }}
                    transition={{ duration: 4 + i, repeat: Infinity }}
                    className="absolute w-48 h-48 rounded-full border border-blue-500/20"
                    style={{ left: `${10 + i * 15}%`, top: `${20 + (i % 2) * 10}%` }}
                  />
               ))}
               <div className="text-center">
                  <span className="text-6xl font-black tracking-tighter block mb-2">99.2%</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Synaptic Efficiency</span>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-8">
               <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                  <p className="text-[9px] font-black text-slate-500 uppercase mb-2">Cognitive Load</p>
                  <p className="text-lg font-black italic">LOW</p>
               </div>
               <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                  <p className="text-[9px] font-black text-slate-500 uppercase mb-2">Stability</p>
                  <p className="text-lg font-black italic">OPTIMAL</p>
               </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl">
           <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <Activity size={14} className="text-blue-600" /> Bio-Waveform Synchronization
           </h3>
           <div className="space-y-10">
              <div>
                <div className="flex justify-between items-baseline mb-4">
                   <p className="text-xs font-black uppercase">Alpha Wave Synthesis</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase">8.4 - 12.0 Hz</p>
                </div>
                <div className="h-2 w-full bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                   <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '84%' }}
                    className="h-full bg-blue-600" 
                   />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-baseline mb-4">
                   <p className="text-xs font-black uppercase">Delta Pattern Registry</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase">0.5 - 4.0 Hz</p>
                </div>
                <div className="h-2 w-full bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                   <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '32%' }}
                    className="h-full bg-purple-600" 
                   />
                </div>
              </div>
              <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-800/50">
                 <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 leading-relaxed uppercase tracking-widest text-center">System detecting high coherence in lower-frequency ranges. Patient in deep rest-mode protocols.</p>
              </div>
           </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-12 border border-slate-100 dark:border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
             <Zap size={240} />
          </div>
          <div className="relative z-10">
             <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-6">Autonomous Biological Insight</h3>
             <p className="text-slate-500 dark:text-slate-400 font-medium max-w-3xl leading-relaxed mb-10">
                The Cognis AI framework has synthesized the last {history.length} data packets. 
                Initial metabolic modeling suggests a 94% probability of hyper-recovery state. 
                Recommended adjustment: Maintain current hydration loop and initiate REM-synchronization within 120 minutes.
             </p>
             <div className="flex flex-wrap gap-4">
                <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 dark:shadow-none">
                  Export Clinical Mapping
                </button>
                <button className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                  Contact Specialist
                </button>
             </div>
          </div>
      </div>
    </div>
  );
};

export const PatientMonitor: React.FC = () => {
  const {
    vitals, history, healthStatus, connection,
    connectBluetooth, connectSerial, connectWiFi, disconnect, startDemo, simulateEmergency,
    error
  } = useArduino();

  const [wifiInput, setWifiInput] = useState('http://192.168.1.100');
  const [connectionTab, setConnectionTab] = useState<'bluetooth' | 'wifi' | 'serial'>('bluetooth');
  const [isAlarmMuted, setIsAlarmMuted] = useState(false);
  const [alarmAcknowledgeTime, setAlarmAcknowledgeTime] = useState<number | null>(null);
  const [criticalDuration, setCriticalDuration] = useState(0);
  const [alertError, setAlertError] = useState<string | null>(null);
  const [lastAlertSent, setLastAlertSent] = useState<number | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [isAiReasoningOpen, setIsAiReasoningOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAdvancedAnalysis, setShowAdvancedAnalysis] = useState(false);
  const [showNeuralSummary, setShowNeuralSummary] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isEmergencyCalling, setIsEmergencyCalling] = useState(false);

  const getEmergencyContacts = () => {
    const saved = localStorage.getItem('emergency_contacts');
    return saved ? JSON.parse(saved) : [];
  };

  const fetchAiAnalysis = async () => {
    if (!vitals || !healthStatus) return;
    setIsAiLoading(true);
    try {
      const prompt = `Act as a clinical medical analyst. Analyze these real-time patient vitals: 
      Heart Rate: ${vitals.heartRate} bpm
      Temperature: ${vitals.temperature}°C
      SpO2: ${vitals.spo2}%
      BP: ${vitals.systolicBP}/${vitals.diastolicBP} mmHg
      Respiratory Rate: ${vitals.respiratoryRate} rpm
      Health Score: ${healthStatus.score}/100
      Current Alerts: ${healthStatus.alerts.join(', ')}

      Provide a concise 2-sentence clinical interpretation of the physiological drift and a specific recommended action.`;
      
      const response = await api.ai.geminiChat(prompt);
      setAiAnalysis(response.text);
    } catch (err) {
      setAiAnalysis("Analysis synchronization failed. Clinical markers suggest maintenance of current protocols until matrix restabilizes.");
    } finally {
      setIsAiLoading(false);
    }
  };

  React.useEffect(() => {
    if (healthStatus?.overall === 'critical' || healthStatus?.overall === 'warning') {
      // Auto-trigger analysis for anomalies if not already loading
      if (!isAiLoading && !aiAnalysis) {
        fetchAiAnalysis();
      }
    }
  }, [healthStatus?.overall]);
  
  // Alert Thresholds Configuration
  const [thresholds, setThresholds] = useState({
    heartRate: { min: 50, max: 120, warningMin: 60, warningMax: 100 },
    temperature: { max: 38.5, warningMax: 37.5 },
    spo2: { min: 90, warningMin: 95 },
    systolicBP: { max: 180, warningMax: 140 },
    diastolicBP: { max: 110, warningMax: 90 },
    respiratoryRate: { min: 12, max: 25, warningMax: 20 }
  });

  const handleConnectBluetooth = async () => {
    setIsConnecting('bluetooth');
    await connectBluetooth();
    setIsConnecting(null);
    // If there's an error, scroll to the connection panel to show it
    setTimeout(() => {
      const errorEl = document.getElementById('connection-panel');
      if (errorEl && !connection.connected) {
        errorEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleConnectSerial = async () => {
    setIsConnecting('serial');
    await connectSerial();
    setIsConnecting(null);
    // If there's an error, scroll to the connection panel to show it
    setTimeout(() => {
      const errorEl = document.getElementById('connection-panel');
      if (errorEl && !connection.connected) {
        errorEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleConnectWiFi = async (url: string) => {
    setIsConnecting('wifi');
    await connectWiFi(url);
    setIsConnecting(null);
    // If there's an error, scroll to the connection panel to show it
    setTimeout(() => {
      const errorEl = document.getElementById('connection-panel');
      if (errorEl && !connection.connected) {
        errorEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  React.useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const isCritical = vitals ? (
    vitals.heartRate < thresholds.heartRate.min || vitals.heartRate > thresholds.heartRate.max ||
    vitals.temperature > thresholds.temperature.max ||
    vitals.spo2 < thresholds.spo2.min ||
    vitals.systolicBP > thresholds.systolicBP.max ||
    vitals.diastolicBP > thresholds.diastolicBP.max ||
    vitals.respiratoryRate < thresholds.respiratoryRate.min || vitals.respiratoryRate > thresholds.respiratoryRate.max
  ) : false;
  
  // Smart Alarm Logic: Only trigger if critical for > 5 seconds
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCritical) {
      timer = setInterval(() => {
        setCriticalDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCriticalDuration(0);
      setAlarmAcknowledgeTime(null);
    }
    return () => clearInterval(timer);
  }, [isCritical]);

  const isSustainedCritical = criticalDuration >= 5;
  const isCurrentlyAcknowledged = alarmAcknowledgeTime && (Date.now() - alarmAcknowledgeTime < 120000); // 2 mins mute
  const shouldShowAlarm = isSustainedCritical && !isCurrentlyAcknowledged;

  const acknowledgeAlarm = () => {
    setAlarmAcknowledgeTime(Date.now());
  };

  // Handle SMS and Voice Alert
  React.useEffect(() => {
    if (isCritical && (!lastAlertSent || Date.now() - lastAlertSent > 300000)) { // Alert every 5 minutes if still critical
      const alertMessage = `CRITICAL ALERT: Patient condition has worsened. Vitals: HR: ${Math.round(vitals?.heartRate || 0)}bpm, SpO2: ${Math.round(vitals?.spo2 || 0)}%, Temp: ${vitals?.temperature.toFixed(1)}°C. Please check immediately.`;
      
      const contacts = getEmergencyContacts();
      const doctor = contacts.find((c: any) => c.role === 'Doctor');
      const mentor = contacts.find((c: any) => c.role === 'Mentor');

      const doctorPhone = doctor ? `${doctor.countryCode}${doctor.phone}` : undefined;
      const mentorPhone = mentor ? `${mentor.countryCode}${mentor.phone}` : undefined;

      // Send SMS
      api.alerts.sendSms(alertMessage, doctorPhone, mentorPhone)
        .then(res => {
          if (res.simulated && res.message.includes('TWILIO CONFIGURATION ERROR')) {
            setAlertError(res.message);
            console.warn('⚠️ SMS Alert Simulated:', res.message);
          } else {
            setAlertError(null);
            console.log('✅ SMS Alert Status:', res.message);
          }
        })
        .catch(err => console.error('❌ Failed to send SMS alert:', err));

      // Initiate Voice Call
      setIsEmergencyCalling(true);
      const voiceMessage = `Critical alert for patient. Heart rate is ${Math.round(vitals?.heartRate || 0)} beats per minute. Oxygen saturation is ${Math.round(vitals?.spo2 || 0)} percent. Temperature is ${vitals?.temperature.toFixed(1)} degrees Celsius. Please check the patient immediately.`;
      api.alerts.makeCall(voiceMessage, doctorPhone, mentorPhone)
        .then(res => {
          if (res.simulated && res.message.includes('TWILIO CONFIGURATION ERROR')) {
            setAlertError(res.message);
            console.warn('⚠️ Voice Call Simulated:', res.message);
          } else {
            console.log('✅ Voice Call Status:', res.message);
          }
          // Reset UI after showing call in progress for 15s
          setTimeout(() => setIsEmergencyCalling(false), 15000);
        })
        .catch(err => {
          console.error('❌ Failed to initiate voice call:', err);
          setIsEmergencyCalling(false);
        });

      setLastAlertSent(Date.now());
    }
  }, [isCritical, vitals, lastAlertSent]);

  // Handle Alarm Sound (Professional Pulse)
  React.useEffect(() => {
    let audio: HTMLAudioElement | null = null;
    let pulseInterval: NodeJS.Timeout;

    if (shouldShowAlarm) {
      // Professional medical-grade soft pulse sound
      audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      
      const playPulse = () => {
        audio?.play().catch(e => console.warn('Audio playback failed:', e));
      };

      // Initial play
      playPulse();
      
      // Pulse every 3 seconds for a professional, non-constant alert
      pulseInterval = setInterval(playPulse, 3000);
    }

    return () => {
      if (audio) {
        audio.pause();
        audio = null;
      }
      if (pulseInterval) clearInterval(pulseInterval);
    };
  }, [shouldShowAlarm]);

  const getStatus = (label: string, value: number): 'normal' | 'warning' | 'critical' | undefined => {
    if (!vitals) return undefined;
    switch (label) {
      case 'heartRate': 
        if (value < thresholds.heartRate.min || value > thresholds.heartRate.max) return 'critical';
        if (value < thresholds.heartRate.warningMin || value > thresholds.heartRate.warningMax) return 'warning';
        return 'normal';
      case 'temperature': 
        if (value > thresholds.temperature.max) return 'critical';
        if (value > thresholds.temperature.warningMax) return 'warning';
        return 'normal';
      case 'spo2': 
        if (value < thresholds.spo2.min) return 'critical';
        if (value < thresholds.spo2.warningMin) return 'warning';
        return 'normal';
      case 'systolicBP': 
        if (value > thresholds.systolicBP.max) return 'critical';
        if (value > thresholds.systolicBP.warningMax) return 'warning';
        return 'normal';
      case 'diastolicBP': 
        if (value > thresholds.diastolicBP.max) return 'critical';
        if (value > thresholds.diastolicBP.warningMax) return 'warning';
        return 'normal';
      case 'respiratoryRate': 
        if (value < thresholds.respiratoryRate.min || value > thresholds.respiratoryRate.max) return 'critical';
        if (value > thresholds.respiratoryRate.warningMax) return 'warning';
        return 'normal';
      default: return 'normal';
    }
  };

  const ThresholdInput: React.FC<{
    label: string;
    value: number;
    onChange: (val: number) => void;
    min?: number;
    max?: number;
    step?: number;
    unit: string;
  }> = ({ label, value, onChange, min, max, step = 1, unit }) => (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
        <span className="text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      {/* Emergency Calling Overlay */}
      <AnimatePresence>
        {isEmergencyCalling && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-rose-600/95 backdrop-blur-2xl flex items-center justify-center p-8 text-white overflow-hidden"
          >
            {/* Pulsing Rings */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
              <motion.div 
                animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-64 h-64 border-8 border-white rounded-full absolute"
              />
            </div>

            <div className="relative z-10 text-center max-w-lg">
              <motion.div 
                animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center text-rose-600 mx-auto mb-10 shadow-2xl"
              >
                <PhoneCall size={56} />
              </motion.div>
              <h2 className="text-4xl font-[1000] uppercase tracking-tighter mb-4 animate-pulse">Emergency Alarm</h2>
              <p className="text-xs font-black uppercase tracking-[0.3em] mb-12 text-rose-100 opacity-80">Autonomous Calling Protocol Active</p>
              
              <div className="space-y-4">
                <div className="p-5 bg-white/10 rounded-3xl border border-white/20 backdrop-blur-md flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Stethoscope size={20} />
                   </div>
                   <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-widest text-rose-200">Calling Point ALPHA</p>
                      <p className="text-sm font-black uppercase">Registered Specialist Node</p>
                   </div>
                </div>
                <div className="p-5 bg-white/10 rounded-3xl border border-white/20 backdrop-blur-md flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center">
                      <User size={20} />
                   </div>
                   <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-widest text-rose-200">Calling Point BETA</p>
                      <p className="text-sm font-black uppercase">Patient Mentorship Node</p>
                   </div>
                </div>
              </div>

              <button 
                onClick={() => setIsEmergencyCalling(false)}
                className="mt-12 px-10 py-4 bg-white text-rose-600 rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:scale-105 active:scale-95 transition-all"
              >
                Reset Emergency Loop
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Neural Summary Modal */}
      <AnimatePresence>
        {showNeuralSummary && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNeuralSummary(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
              <NeuralHealthSummary 
                vitals={vitals} 
                history={history} 
                onClose={() => setShowNeuralSummary(false)} 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 sm:p-10 border border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400">
                    <Settings size={22} className="animate-spin-slow" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Alert Configuration</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Adjust vital safety bounds</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="space-y-8 max-h-[60vh] overflow-y-auto px-2 custom-scrollbar">
                {/* Heart Rate */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Heart size={14} className="text-rose-500" /> Heart Rate Bounds (BPM)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <ThresholdInput
                      label="Critical Low"
                      value={thresholds.heartRate.min}
                      onChange={(v) => setThresholds(prev => ({ ...prev, heartRate: { ...prev.heartRate, min: v } }))}
                      min={30}
                      max={80}
                      unit="bpm"
                    />
                    <ThresholdInput
                      label="Critical High"
                      value={thresholds.heartRate.max}
                      onChange={(v) => setThresholds(prev => ({ ...prev, heartRate: { ...prev.heartRate, max: v } }))}
                      min={100}
                      max={200}
                      unit="bpm"
                    />
                  </div>
                </div>

                {/* SpO2 */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Droplets size={14} className="text-blue-500" /> Oxygen Saturation (%)
                  </h3>
                  <ThresholdInput
                    label="Critical Low SpO2"
                    value={thresholds.spo2.min}
                    onChange={(v) => setThresholds(prev => ({ ...prev, spo2: { ...prev.spo2, min: v } }))}
                    min={70}
                    max={98}
                    unit="%"
                  />
                </div>

                {/* Temperature */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Thermometer size={14} className="text-orange-500" /> Body Temperature (°C)
                  </h3>
                  <ThresholdInput
                    label="Critical High Temp"
                    value={thresholds.temperature.max}
                    onChange={(v) => setThresholds(prev => ({ ...prev, temperature: { ...prev.temperature, max: v } }))}
                    min={37}
                    max={42}
                    step={0.1}
                    unit="°C"
                  />
                </div>
              </div>

              <div className="mt-10">
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-full bg-slate-900 dark:bg-blue-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-blue-700 transition-all shadow-xl active:scale-95"
                >
                  Apply Settings
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Alarm Overlay */}
      <AnimatePresence>
        {shouldShowAlarm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-red-600/20 animate-pulse pointer-events-none" />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-2xl border-4 border-red-600 pointer-events-auto flex flex-col items-center gap-6 max-w-md mx-4 text-center"
              role="alertdialog"
              aria-labelledby="alarm-title"
              aria-describedby="alarm-desc"
            >
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center animate-bounce">
                <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" aria-hidden="true" />
              </div>
              <div>
                <h2 id="alarm-title" className="text-3xl font-black text-red-600 dark:text-red-400 mb-2">CRITICAL ALARM</h2>
                <p id="alarm-desc" className="text-slate-600 dark:text-slate-400 font-bold">Patient vitals are in critical range! SMS alerts and emergency voice calls have been initiated to the doctor and mentor.</p>
              </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                <a
                  href="tel:+256787674140"
                  className="w-full bg-emerald-600 text-white py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 text-sm"
                >
                  <Signal className="w-4 h-4" />
                  Call Doctor
                </a>
                <a
                  href="sms:+256787674140?body=CRITICAL%20ALERT:%20Patient%20condition%20has%20worsened.%20Please%20check%20immediately."
                  className="w-full bg-blue-600 text-white py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 text-sm"
                >
                  <Droplets className="w-4 h-4" />
                  SMS Doctor
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Mute Button removed as alarm is automatic */}

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-3 mb-2">
              <div className="bg-blue-600 p-2 rounded-2xl shadow-lg shadow-blue-100 dark:shadow-blue-900/20">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Patient Monitor</h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">Real-time health data from Arduino via Bluetooth & WiFi</p>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3">
             <button
              onClick={() => setShowNeuralSummary(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
            >
              <Brain size={14} />
              Neural Insight
            </button>
             <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-2 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-wider border border-slate-200 dark:border-slate-700 transition-all active:scale-95"
            >
              <Settings size={14} />
              Set Alerts
            </button>
            {connection.connected && (
              <div className="flex items-center gap-3">
                <button
                  onClick={simulateEmergency}
                  className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 px-4 py-2 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-wider border border-red-100 dark:border-red-900 transition-all active:scale-95"
                  aria-label="Simulate emergency vitals"
                >
                  <AlertTriangle aria-hidden="true" size={12} />
                  Simulate Emergency
                </button>
                <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-4 py-2 rounded-2xl shadow-sm">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] sm:text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                    {connection.type === 'demo' ? 'Demo Mode' : connection.deviceName}
                  </span>
                </div>
                <button
                  onClick={disconnect}
                  className="flex items-center gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 px-4 py-2 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-wider border border-rose-100 dark:border-rose-900 transition-all active:scale-95"
                >
                  <Square size={12} />
                  Disconnect
                </button>
              </div>
            )}
            {shouldShowAlarm && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-2 rounded-2xl shadow-sm"
              >
                <AlertTriangle size={14} className="text-red-600 dark:text-red-400 animate-bounce" />
                <span className="text-[10px] sm:text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">
                  Active Alarm
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Connect Bar */}
      {!connection.connected && (
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quick Setup:</span>
          <button 
            onClick={handleConnectBluetooth}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all border border-blue-100 dark:border-blue-800"
          >
            <Bluetooth size={12} />
            Bluetooth
          </button>
          <button 
            onClick={() => setConnectionTab('wifi')}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all border border-emerald-100 dark:border-emerald-800"
          >
            <Wifi size={12} />
            WiFi
          </button>
          <button 
            onClick={handleConnectSerial}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
          >
            <Cpu size={12} />
            USB Serial
          </button>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>
          <button 
            onClick={() => startDemo()}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
          >
            <Play size={12} />
            Try Demo
          </button>
        </div>
      )}

      {/* Local SIM Emergency Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-[2.5rem] p-6 sm:p-8 text-white shadow-2xl shadow-orange-200 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                <Smartphone size={24} />
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Local SIM Emergency</h2>
            </div>
            <p className="text-orange-50 text-sm font-bold opacity-90">Use your MTN/Airtel SIM card to send alerts directly from your phone</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-auto">
            <a 
              href={`sms:+256787674140?body=EMERGENCY ALERT: Patient vitals are critical! HR: ${Math.round(vitals?.heartRate || 0)}bpm, SpO2: ${Math.round(vitals?.spo2 || 0)}%. Please check immediately.`}
              className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-orange-600 rounded-2xl font-black text-sm hover:bg-orange-50 transition-all shadow-xl active:scale-95"
            >
              <MessageSquare size={18} />
              <span>SEND LOCAL SMS</span>
            </a>
            <a 
              href="tel:+256787674140"
              className="flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl active:scale-95"
            >
              <Phone size={18} />
              <span>CALL VIA SIM</span>
            </a>
          </div>
        </div>
      </motion.div>

      {/* Connection Panel */}
      {!connection.connected && (
        <motion.div 
          id="connection-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200 dark:shadow-blue-900/10 p-6 sm:p-10 mb-8 overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 dark:bg-blue-900/10 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
          
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3 relative z-10">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
              <Radio className="w-5 h-5" />
            </div>
            Connect to Arduino
          </h2>

          {/* Tabs */}
          <div className="flex flex-wrap gap-3 mb-8 relative z-10">
            <button
              onClick={() => setConnectionTab('bluetooth')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-sm font-black transition-all border-2 ${
                connectionTab === 'bluetooth'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200 dark:shadow-blue-900/20'
                  : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800'
              }`}
            >
              <Bluetooth className="w-4 h-4" />
              BLUETOOTH
            </button>
            <button
              onClick={() => setConnectionTab('serial')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-sm font-black transition-all border-2 ${
                connectionTab === 'serial'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200 dark:shadow-none'
                  : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <Cpu className="w-4 h-4" />
              SERIAL
            </button>
            <button
              onClick={() => setConnectionTab('wifi')}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-sm font-black transition-all border-2 ${
                connectionTab === 'wifi'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200 dark:shadow-blue-900/20'
                  : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800'
              }`}
            >
              <Wifi className="w-4 h-4" />
              WIFI
            </button>
          </div>

          <div className="relative z-10">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold"
              >
                <AlertTriangle size={16} />
                {error}
              </motion.div>
            )}

            {connectionTab === 'bluetooth' ? (
              <div className="space-y-6">
                <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-2xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-xl text-blue-600 dark:text-blue-400 shadow-sm">
                      <Bluetooth className="w-5 h-5" />
                    </div>
                    <div className="text-sm text-blue-900 dark:text-blue-200">
                      <p className="font-bold mb-1">Wireless Bluetooth Link</p>
                      <p className="opacity-80 leading-relaxed">Connect to your Arduino BLE module (HM-10, ESP32). Ensure your device is discoverable.</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleConnectBluetooth}
                  disabled={isConnecting !== null}
                  className="w-full flex items-center justify-center gap-4 bg-blue-600 text-white py-5 rounded-[2rem] font-black text-lg hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 active:scale-95 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConnecting === 'bluetooth' ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Bluetooth className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  )}
                  <span>START BLUETOOTH PAIRING</span>
                </button>
              </div>
            ) : connectionTab === 'serial' ? (
              <div className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-xl text-slate-600 dark:text-slate-400 shadow-sm">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div className="text-sm text-slate-900 dark:text-slate-300">
                      <p className="font-bold mb-1">Wired Serial Link</p>
                      <p className="opacity-80 leading-relaxed">Connect your Arduino via USB. Ensure the baud rate is set to 9600 in your code.</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleConnectSerial}
                  disabled={isConnecting !== null}
                  className="w-full flex items-center justify-center gap-4 bg-slate-900 text-white py-5 rounded-[2rem] font-black text-lg hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 active:scale-95 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConnecting === 'serial' ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Activity className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  )}
                  <span>CONNECT ARDUINO (USB)</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Arduino IP Address</label>
                  <input
                    type="text"
                    id="wifi-ip-input"
                    value={wifiInput}
                    onChange={(e) => setWifiInput(e.target.value)}
                    placeholder="http://192.168.1.100"
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    aria-label="Arduino IP Address"
                  />
                </div>
                <div className="bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-2xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-xl text-emerald-600 dark:text-emerald-400 shadow-sm">
                      <Wifi className="w-5 h-5" />
                    </div>
                    <div className="text-sm text-emerald-900 dark:text-emerald-200">
                      <p className="font-bold mb-1">Network WiFi Link</p>
                      <p className="opacity-80 leading-relaxed">Enter the local IP of your Arduino WiFi module. It must serve JSON vitals at the <code className="bg-emerald-100/50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded font-mono text-xs">/vitals</code> endpoint.</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleConnectWiFi(wifiInput)}
                  disabled={isConnecting !== null}
                  className="w-full flex items-center justify-center gap-4 bg-emerald-600 text-white py-5 rounded-[2rem] font-black text-lg hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-200 active:scale-95 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConnecting === 'wifi' ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Wifi className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  )}
                  <span>CONNECT VIA WIFI</span>
                </button>
              </div>
            )}

            {/* Demo Button */}
            <div className="mt-10 pt-10 border-t border-slate-100 text-center">
              <button
                onClick={() => startDemo()}
                className="inline-flex items-center justify-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
              >
                <Play className="w-5 h-5" />
                Launch Demo Mode
              </button>
              <button
                onClick={() => startDemo(true)}
                className="inline-flex items-center justify-center gap-3 bg-red-50 text-red-600 px-8 py-4 rounded-2xl font-bold hover:bg-red-100 transition-all border border-red-100 ml-4 active:scale-95"
              >
                <AlertTriangle className="w-5 h-5" />
                Test Alarm System
              </button>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-4">Try the monitor with simulated patient data</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Vitals Dashboard */}
      <AnimatePresence mode="wait">
        {vitals ? (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex flex-col sm:flex-row gap-4 mb-10 items-start sm:items-center justify-between">
              <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-2xl border border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setShowAdvancedAnalysis(false)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!showAdvancedAnalysis ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Bio-Baseline
                </button>
                <button
                  onClick={() => setShowAdvancedAnalysis(true)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${showAdvancedAnalysis ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                   Neural Analysis
                </button>
              </div>
            </div>

            {showAdvancedAnalysis ? (
              <DiagnosticAnalysisView vitals={vitals} history={history} />
            ) : (
              <>
                {/* Alert Configuration Error */}
            <AnimatePresence>
              {alertError && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-700 text-xs font-bold shadow-sm"
                >
                  <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="uppercase tracking-wider mb-1">Twilio Alert Warning</p>
                    <p className="font-medium opacity-90 leading-relaxed mb-3">{alertError}</p>
                    <div className="flex flex-wrap gap-2">
                      <a 
                        href={`sms:+256787674140?body=EMERGENCY: Patient vitals critical! HR: ${Math.round(vitals?.heartRate || 0)}, SpO2: ${Math.round(vitals?.spo2 || 0)}%`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                      >
                        <MessageSquare size={12} />
                        <span>SEND LOCAL SMS</span>
                      </a>
                      <a 
                        href="tel:+256787674140"
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
                      >
                        <Phone size={12} />
                        <span>CALL VIA SIM</span>
                      </a>
                    </div>
                  </div>
                  <button onClick={() => setAlertError(null)} className="p-1 hover:bg-amber-100 rounded-lg transition-colors">
                    <XCircle size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Smart Alarm Banner */}
            <AnimatePresence>
              {isSustainedCritical && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`mb-8 rounded-[2rem] p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl transition-colors duration-500 ${isCurrentlyAcknowledged ? 'bg-slate-900 border-slate-800' : 'bg-red-600 border-red-500 shadow-red-200'}`}
                >
                  <div className="flex items-center gap-4 text-center sm:text-left">
                    <div className={`p-4 rounded-2xl shadow-lg ${isCurrentlyAcknowledged ? 'bg-slate-800 text-slate-400' : 'bg-white text-red-600 animate-pulse'}`}>
                      <AlertTriangle size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white uppercase tracking-tight">
                        {isCurrentlyAcknowledged ? 'Alarm Silenced' : 'Critical Vitals Detected'}
                      </h3>
                      <p className="text-white/80 text-sm font-bold">
                        {isCurrentlyAcknowledged 
                          ? 'Monitoring continues. Alarm will reactivate in 2 minutes if condition persists.' 
                          : 'Patient requires immediate attention. Emergency contacts have been notified.'}
                      </p>
                    </div>
                  </div>
                  
                  {!isCurrentlyAcknowledged && (
                    <button 
                      onClick={acknowledgeAlarm}
                      className="px-8 py-4 bg-white text-red-600 rounded-2xl font-black text-sm hover:bg-red-50 transition-all shadow-xl active:scale-95 whitespace-nowrap"
                    >
                      ACKNOWLEDGE ALARM
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Health Status & Clinical Intel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-2">
                {healthStatus && <StatusBadge status={healthStatus} />}
              </div>
              <div className="bg-slate-950 text-white p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Monitor size={120} />
                 </div>
                 <div className="relative z-10">
                    <h3 className="text-xs font-black text-blue-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                       <Zap size={14} /> Clinical Intel
                    </h3>
                    <div className="space-y-4">
                       <div className="flex gap-4">
                          <div className="w-1 h-12 bg-blue-500 rounded-full shrink-0" />
                          <div>
                             <p className="text-sm font-black mb-1">Hydration Index</p>
                             <p className="text-[10px] font-bold text-slate-500 leading-tight">Current metabolic markers indicate peak processing. No adjustment required.</p>
                          </div>
                       </div>
                       <div className="flex gap-4">
                          <div className="w-1 h-12 bg-amber-500 rounded-full shrink-0" />
                          <div>
                             <p className="text-sm font-black mb-1">Recovery Phase</p>
                             <p className="text-[10px] font-bold text-slate-500 leading-tight">Elevated HR detected post-exertion. Recommended: 5m focused breathlight.</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            </div>

            {/* Vital Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              <VitalCard
                icon={<Heart />}
                label="Heart Rate"
                value={vitals ? Math.round(vitals.heartRate).toString() : '--'}
                unit="BPM"
                color="text-blue-600"
                bgColor="bg-blue-50"
                status={getStatus('heartRate', vitals?.heartRate || 0)}
                isLive={connection.connected}
                history={history.map(h => h.heartRate)}
                maxVal={200}
              />
              <VitalCard
                icon={<Droplets />}
                label="SpO2 Level"
                value={vitals ? Math.round(vitals.spo2).toString() : '--'}
                unit="%"
                color="text-emerald-600"
                bgColor="bg-emerald-50"
                status={getStatus('spo2', vitals?.spo2 || 0)}
                isLive={connection.connected}
                history={history.map(h => h.spo2)}
                maxVal={100}
              />
              <VitalCard
                icon={<Thermometer />}
                label="Temperature"
                value={vitals ? vitals.temperature.toFixed(1) : '--'}
                unit="°C"
                color="text-orange-600"
                bgColor="bg-orange-50"
                status={getStatus('temperature', vitals?.temperature || 0)}
                isLive={connection.connected}
                history={history.map(h => h.temperature)}
                maxVal={42}
              />
              <VitalCard
                icon={<Activity />}
                label="Systolic BP"
                value={vitals ? Math.round(vitals.systolicBP).toString() : '--'}
                unit="mmHg"
                color="text-indigo-600"
                bgColor="bg-indigo-50"
                status={getStatus('systolicBP', vitals?.systolicBP || 0)}
                isLive={connection.connected}
                history={history.map(h => h.systolicBP)}
                maxVal={220}
              />
              <VitalCard
                icon={<Wind />}
                label="Respiration"
                value={vitals ? Math.round(vitals.respiratoryRate).toString() : '--'}
                unit="RPM"
                color="text-blue-500"
                bgColor="bg-blue-50"
                status={getStatus('respiratoryRate', vitals?.respiratoryRate || 0)}
                isLive={connection.connected}
                history={history.map(h => h.respiratoryRate)}
                maxVal={40}
              />
              {/* Dynamic Health Score Matrix */}
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
                 <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Neural Health Index</p>
                      <div className="flex items-baseline gap-2 mb-8">
                         <span className="text-6xl font-black tracking-tighter text-blue-400">{healthStatus?.score || '--'}</span>
                         <span className="text-sm font-black text-slate-500 uppercase">Points</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {aiAnalysis ? (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white/10 dark:bg-slate-800/10 backdrop-blur-md rounded-2xl p-4 border border-white/10"
                        >
                          <div className="flex items-center gap-2 mb-2">
                             <Brain size={14} className="text-blue-400" />
                             <span className="text-[9px] font-black uppercase tracking-widest text-blue-300">AI Neural Analysis</span>
                          </div>
                          <p className="text-[10px] font-bold text-slate-300 leading-relaxed italic line-clamp-3">"{aiAnalysis}"</p>
                        </motion.div>
                      ) : isAiLoading ? (
                        <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl animate-pulse">
                           <Loader2 size={16} className="animate-spin text-blue-400" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-high-visibility">Synthesizing Bio-Markers...</span>
                        </div>
                      ) : (
                        <button 
                          onClick={fetchAiAnalysis}
                          className="w-full py-4 bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
                        >
                          <Zap size={14} />
                          Force AI Insight
                        </button>
                      )}
                    </div>
                 </div>
              </div>
            </div>

            {/* Heart Rate Chart */}
            <div className="bg-white rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200 p-4 sm:p-8 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <h3 className="font-black text-slate-900 flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                    <Signal className="w-5 h-5" />
                  </div>
                  Heart Rate Trend
                </h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full self-start sm:self-auto">Last {history.length} readings</span>
              </div>
              <div className="overflow-x-auto no-scrollbar">
                <div className="h-48 flex items-end gap-1.5 min-w-[300px]">
                  {history.length > 0 ? history.map((h, i) => {
                    const height = Math.max(5, ((h.heartRate - 40) / 140) * 100);
                    const isHigh = h.heartRate > 100;
                    const isLow = h.heartRate < 60;
                    return (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        className="flex-1 rounded-t-lg transition-all duration-300"
                        style={{
                          backgroundColor: isHigh ? '#f43f5e' : isLow ? '#f59e0b' : '#3b82f6',
                          opacity: 0.3 + (i / history.length) * 0.7,
                        }}
                      />
                    );
                  }) : (
                    <div className="flex-1 flex items-center justify-center text-slate-300 text-sm font-bold italic">
                      Waiting for data stream...
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mt-6 px-2">
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div> 60 bpm</span>
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"></div> 100 bpm</span>
              </div>
            </div>

            {/* Blood Pressure Chart */}
            <div className="bg-white rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200 p-4 sm:p-8 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <h3 className="font-black text-slate-900 flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
                    <Activity className="w-5 h-5" />
                  </div>
                  Blood Pressure Trend
                </h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full self-start sm:self-auto">Systolic / Diastolic</span>
              </div>
              <div className="overflow-x-auto no-scrollbar">
                <div className="h-48 flex items-end gap-1.5 min-w-[300px] relative">
                  {history.length > 0 ? history.map((h, i) => {
                    const sysHeight = Math.max(5, ((h.systolicBP - 40) / 160) * 100);
                    const diaHeight = Math.max(5, ((h.diastolicBP - 40) / 160) * 100);
                    
                    return (
                      <div key={i} className="flex-1 flex flex-col justify-end gap-0.5 group relative">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${sysHeight}%` }}
                          className="w-full rounded-t-sm bg-purple-500 transition-all duration-300"
                          style={{ opacity: 0.4 + (i / history.length) * 0.6 }}
                        />
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${diaHeight}%` }}
                          className="w-full rounded-t-sm bg-indigo-500 transition-all duration-300"
                          style={{ opacity: 0.4 + (i / history.length) * 0.6 }}
                        />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                          {Math.round(h.systolicBP)}/{Math.round(h.diastolicBP)}
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="flex-1 flex items-center justify-center text-slate-300 text-sm font-bold italic">
                      Waiting for data stream...
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mt-6 px-2">
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-purple-500"></div> Systolic</span>
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Diastolic</span>
              </div>
            </div>

            {/* SpO2 & Temperature Charts Side by Side */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* SpO2 Chart */}
              <div className="bg-white rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200 p-4 sm:p-8">
                <h3 className="font-black text-slate-900 mb-8 flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                    <Droplets className="w-5 h-5" />
                  </div>
                  Oxygen Saturation
                </h3>
                <div className="overflow-x-auto no-scrollbar">
                  <div className="h-32 flex items-end gap-1.5 min-w-[200px]">
                    {history.length > 0 ? history.map((h, i) => {
                      const height = Math.max(5, h.spo2);
                      return (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          className="flex-1 rounded-t-lg bg-blue-500 transition-all duration-300"
                          style={{
                            opacity: 0.3 + (i / history.length) * 0.7,
                          }}
                        />
                      );
                    }) : (
                      <div className="flex-1 flex items-center justify-center text-slate-300 text-sm font-bold italic">
                        Waiting for data...
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Temperature Chart */}
              <div className="bg-white rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200 p-4 sm:p-8">
                <h3 className="font-black text-slate-900 mb-8 flex items-center gap-3">
                  <div className="p-2 bg-orange-50 rounded-xl text-orange-600">
                    <Thermometer className="w-5 h-5" />
                  </div>
                  Body Temperature
                </h3>
                <div className="overflow-x-auto no-scrollbar">
                  <div className="h-32 flex items-end gap-1.5 min-w-[200px]">
                    {history.length > 0 ? history.map((h, i) => {
                      const height = Math.max(5, ((h.temperature - 34) / 10) * 100);
                      return (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          className="flex-1 rounded-t-lg transition-all duration-300"
                          style={{
                            backgroundColor: h.temperature > 37.5 ? '#f43f5e' : h.temperature > 37 ? '#f59e0b' : '#10b981',
                            opacity: 0.3 + (i / history.length) * 0.7,
                          }}
                        />
                      );
                    }) : (
                      <div className="flex-1 flex items-center justify-center text-slate-300 text-sm font-bold italic">
                        Waiting for data...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Data Log */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200 p-8 overflow-hidden">
              <h3 className="font-black text-slate-900 mb-8 flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-xl text-slate-600">
                  <Activity className="w-5 h-5" />
                </div>
                Detailed Data Log
              </h3>
              <div className="overflow-x-auto -mx-8 px-8">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                      <th className="pb-4 pr-4 font-black">Time</th>
                      <th className="pb-4 pr-4 font-black">HR (bpm)</th>
                      <th className="pb-4 pr-4 font-black">Temp (°C)</th>
                      <th className="pb-4 pr-4 font-black">SpO2 (%)</th>
                      <th className="pb-4 pr-4 font-black">BP (mmHg)</th>
                      <th className="pb-4 font-black">RR (br/min)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {history.slice().reverse().slice(0, 10).map((h, i) => (
                      <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 pr-4 text-xs font-bold text-slate-400">{new Date(h.timestamp).toLocaleTimeString()}</td>
                        <td className={`py-4 pr-4 text-sm font-black ${h.heartRate > 100 ? 'text-rose-600' : h.heartRate < 60 ? 'text-amber-600' : 'text-slate-900'}`}>
                          {Math.round(h.heartRate)}
                        </td>
                        <td className={`py-4 pr-4 text-sm font-black ${h.temperature > 37.5 ? 'text-rose-600' : 'text-slate-900'}`}>
                          {h.temperature.toFixed(1)}
                        </td>
                        <td className={`py-4 pr-4 text-sm font-black ${h.spo2 < 95 ? 'text-rose-600' : 'text-slate-900'}`}>
                          {Math.round(h.spo2)}
                        </td>
                        <td className="py-4 pr-4 text-sm font-black text-slate-900">{Math.round(h.systolicBP)}/{Math.round(h.diastolicBP)}</td>
                        <td className="py-4 text-sm font-black text-slate-900">{Math.round(h.respiratoryRate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </motion.div>
        ) : (
          /* Not Connected State */
          <motion.div 
            key="not-connected"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200"
          >
            <div className="bg-slate-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Stethoscope className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">No Device Connected</h3>
            <p className="text-slate-500 max-w-md mx-auto font-medium leading-relaxed px-6">
              Connect your Arduino via Bluetooth or WiFi to start monitoring patient vitals in real-time.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
