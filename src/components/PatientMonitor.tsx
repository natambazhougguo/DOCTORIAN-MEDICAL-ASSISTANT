import React, { useState } from 'react';
import {
  Wifi, Bluetooth, Play, Square, Thermometer,
  Heart, Droplets, Wind, Activity, AlertTriangle,
  CheckCircle, Info, Radio, Signal, XCircle, Monitor
} from 'lucide-react';
import { useArduino, HealthStatus } from '../hooks/useArduino';
import { motion, AnimatePresence } from 'motion/react';

const VitalCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  color: string;
  bgColor: string;
  status?: 'normal' | 'warning' | 'critical';
}> = ({ icon, label, value, unit, color, bgColor, status }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all"
  >
    <div className="flex items-center justify-between mb-3">
      <div className={`p-2 rounded-xl ${bgColor}`}>
        {icon}
      </div>
      {status === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
      {status === 'critical' && <XCircle className="w-4 h-4 text-red-500" />}
    </div>
    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">{label}</p>
    <div className="flex items-baseline gap-1.5">
      <span className={`text-3xl font-black ${color}`}>{value}</span>
      <span className="text-xs font-semibold text-slate-400">{unit}</span>
    </div>
  </motion.div>
);

const StatusBadge: React.FC<{ status: HealthStatus }> = ({ status }) => {
  const config = {
    excellent: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: <CheckCircle className="w-5 h-5" />, label: 'Excellent' },
    normal: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: <Info className="w-5 h-5" />, label: 'Normal' },
    warning: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: <AlertTriangle className="w-5 h-5" />, label: 'Warning' },
    critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: <XCircle className="w-5 h-5" />, label: 'Critical' },
  };

  const c = config[status.overall];

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${c.bg} border ${c.border} rounded-3xl p-6 shadow-sm`}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className={`${c.text} bg-white p-3 rounded-2xl shadow-sm`}>{c.icon}</div>
        <div>
          <p className="font-bold text-slate-900 text-lg leading-tight">Patient Status</p>
          <span className={`${c.text} font-black text-2xl tracking-tight`}>{c.label}</span>
        </div>
        <div className="ml-auto text-right bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-3xl font-black text-slate-800 leading-none">{status.score}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Health Score</p>
        </div>
      </div>
      <div className="space-y-2 bg-white/50 p-4 rounded-2xl border border-white/50 backdrop-blur-sm">
        {status.alerts.map((alert, i) => (
          <div key={i} className={`text-sm font-medium ${i === 0 && status.alerts.length > 1 ? c.text : 'text-slate-600'} flex items-start gap-2`}>
            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-current shrink-0"></span>
            {alert}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export const PatientMonitor: React.FC = () => {
  const {
    vitals, history, healthStatus, connection,
    connectBluetooth, connectWiFi, disconnect, startDemo,
  } = useArduino();

  const [wifiInput, setWifiInput] = useState('http://192.168.1.100');
  const [connectionTab, setConnectionTab] = useState<'bluetooth' | 'wifi'>('bluetooth');

  const getStatus = (label: string, value: number): 'normal' | 'warning' | 'critical' | undefined => {
    if (!vitals) return undefined;
    switch (label) {
      case 'heartRate': return value < 60 || value > 100 ? 'warning' : value < 50 || value > 120 ? 'critical' : 'normal';
      case 'temperature': return value > 37.5 ? 'warning' : value > 38.5 ? 'critical' : 'normal';
      case 'spo2': return value < 95 ? 'warning' : value < 90 ? 'critical' : 'normal';
      case 'systolicBP': return value > 140 ? 'warning' : value > 180 ? 'critical' : 'normal';
      case 'diastolicBP': return value > 90 ? 'warning' : value > 110 ? 'critical' : 'normal';
      case 'respiratoryRate': return value > 20 ? 'warning' : value < 12 || value > 25 ? 'critical' : 'normal';
      default: return 'normal';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-600 p-2 rounded-2xl shadow-lg shadow-blue-100">
                <Monitor className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Patient Monitor</h1>
            </div>
            <p className="text-slate-500 text-sm font-medium">Real-time health data from Arduino via Bluetooth & WiFi</p>
          </div>
          {connection.connected && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-2xl self-start sm:self-auto shadow-sm"
            >
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                {connection.type === 'demo' ? 'Demo Mode' : connection.deviceName}
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Connection Panel */}
      {!connection.connected ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200 p-6 sm:p-10 mb-8 overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
          
          <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3 relative z-10">
            <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
              <Radio className="w-5 h-5" />
            </div>
            Connect to Arduino
          </h2>

          {/* Tabs */}
          <div className="flex gap-3 mb-8 relative z-10">
            <button
              onClick={() => setConnectionTab('bluetooth')}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all ${
                connectionTab === 'bluetooth'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              <Bluetooth className="w-4 h-4" />
              Bluetooth
            </button>
            <button
              onClick={() => setConnectionTab('wifi')}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all ${
                connectionTab === 'wifi'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              <Wifi className="w-4 h-4" />
              WiFi
            </button>
          </div>

          <div className="relative z-10">
            {connectionTab === 'bluetooth' ? (
              <div className="space-y-6">
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="bg-white p-2 rounded-xl text-blue-600 shadow-sm">
                      <Info className="w-5 h-5" />
                    </div>
                    <div className="text-sm text-blue-900">
                      <p className="font-bold mb-1">Bluetooth Connection Setup</p>
                      <p className="opacity-80 leading-relaxed">Make sure your Arduino BLE module (e.g., HM-10, ESP32 BLE) is powered on and in pairing mode. The Arduino should broadcast the service UUID: <code className="bg-blue-100/50 px-1.5 py-0.5 rounded font-mono text-xs">0000ffe0</code></p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={connectBluetooth}
                  className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
                >
                  <Bluetooth className="w-5 h-5" />
                  Connect via Bluetooth
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Arduino WiFi Endpoint</label>
                  <input
                    type="text"
                    value={wifiInput}
                    onChange={(e) => setWifiInput(e.target.value)}
                    placeholder="http://192.168.1.100"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="bg-white p-2 rounded-xl text-blue-600 shadow-sm">
                      <Info className="w-5 h-5" />
                    </div>
                    <div className="text-sm text-blue-900">
                      <p className="font-bold mb-1">WiFi Connection Setup</p>
                      <p className="opacity-80 leading-relaxed">Enter the IP address of your Arduino. The Arduino should run a simple HTTP server that responds to <code className="bg-blue-100/50 px-1.5 py-0.5 rounded font-mono text-xs">/vitals</code> with JSON data.</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => connectWiFi(wifiInput)}
                  className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
                >
                  <Wifi className="w-5 h-5" />
                  Connect via WiFi
                </button>
              </div>
            )}

            {/* Demo Button */}
            <div className="mt-10 pt-10 border-t border-slate-100 text-center">
              <button
                onClick={startDemo}
                className="inline-flex items-center justify-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
              >
                <Play className="w-5 h-5" />
                Launch Demo Mode
              </button>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-4">Try the monitor with simulated patient data</p>
            </div>
          </div>
        </motion.div>
      ) : (
        /* Disconnect Bar */
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200 p-4 mb-8 flex items-center justify-between"
        >
          <div className="flex items-center gap-4 ml-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-200"></div>
            <span className="text-sm font-bold text-slate-700">
              Connected via <span className="text-blue-600 uppercase tracking-wider text-xs ml-1">{connection.type}</span>
              {connection.type !== 'demo' && <span className="text-slate-400 font-medium ml-2">— {connection.deviceName}</span>}
            </span>
          </div>
          <button
            onClick={disconnect}
            className="flex items-center gap-2 text-rose-600 hover:text-white px-6 py-2.5 rounded-2xl text-sm font-bold border border-rose-100 hover:bg-rose-600 transition-all active:scale-95"
          >
            <Square className="w-4 h-4" />
            Disconnect
          </button>
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
            {/* Health Status */}
            {healthStatus && (
              <div className="mb-8">
                <StatusBadge status={healthStatus} />
              </div>
            )}

            {/* Vital Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <VitalCard
                icon={<Heart className="w-5 h-5 text-rose-500" />}
                label="Heart Rate"
                value={Math.round(vitals.heartRate).toString()}
                unit="bpm"
                color="text-rose-600"
                bgColor="bg-rose-50"
                status={getStatus('heartRate', vitals.heartRate)}
              />
              <VitalCard
                icon={<Thermometer className="w-5 h-5 text-orange-500" />}
                label="Temperature"
                value={vitals.temperature.toFixed(1)}
                unit="°C"
                color="text-orange-600"
                bgColor="bg-orange-50"
                status={getStatus('temperature', vitals.temperature)}
              />
              <VitalCard
                icon={<Droplets className="w-5 h-5 text-blue-500" />}
                label="SpO2"
                value={Math.round(vitals.spo2).toString()}
                unit="%"
                color="text-blue-600"
                bgColor="bg-blue-50"
                status={getStatus('spo2', vitals.spo2)}
              />
              <VitalCard
                icon={<Activity className="w-5 h-5 text-purple-500" />}
                label="Systolic BP"
                value={Math.round(vitals.systolicBP).toString()}
                unit="mmHg"
                color="text-purple-600"
                bgColor="bg-purple-50"
                status={getStatus('systolicBP', vitals.systolicBP)}
              />
              <VitalCard
                icon={<Activity className="w-5 h-5 text-indigo-500" />}
                label="Diastolic BP"
                value={Math.round(vitals.diastolicBP).toString()}
                unit="mmHg"
                color="text-indigo-600"
                bgColor="bg-indigo-50"
                status={getStatus('diastolicBP', vitals.diastolicBP)}
              />
              <VitalCard
                icon={<Wind className="w-5 h-5 text-teal-500" />}
                label="Resp. Rate"
                value={Math.round(vitals.respiratoryRate).toString()}
                unit="br/min"
                color="text-teal-600"
                bgColor="bg-teal-50"
                status={getStatus('respiratoryRate', vitals.respiratoryRate)}
              />
            </div>

            {/* Heart Rate Chart */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200 p-8 mb-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-slate-900 flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                    <Signal className="w-5 h-5" />
                  </div>
                  Heart Rate Trend
                </h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">Last {history.length} readings</span>
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
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200 p-8 mb-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-slate-900 flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
                    <Activity className="w-5 h-5" />
                  </div>
                  Blood Pressure Trend
                </h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">Systolic / Diastolic</span>
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
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200 p-8">
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
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200 p-8">
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
              <Monitor className="w-10 h-10 text-slate-300" />
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
