import { useState, useEffect, useCallback, useRef } from 'react';

export interface Vitals {
  heartRate: number;
  temperature: number;
  spo2: number;
  systolicBP: number;
  diastolicBP: number;
  respiratoryRate: number;
  timestamp: number;
}

export interface HealthStatus {
  overall: 'excellent' | 'normal' | 'warning' | 'critical';
  score: number;
  alerts: string[];
}

export interface ConnectionState {
  connected: boolean;
  type: 'bluetooth' | 'wifi' | 'demo' | null;
  deviceName: string | null;
}

export const useArduino = () => {
  const [vitals, setVitals] = useState<Vitals | null>(null);
  const [history, setHistory] = useState<Vitals[]>([]);
  const [connection, setConnection] = useState<ConnectionState>({
    connected: false,
    type: null,
    deviceName: null,
  });
  const [wifiEndpoint, setWifiEndpoint] = useState('http://192.168.1.100');
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);

  const demoIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const wifiIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const calculateHealthStatus = useCallback((v: Vitals): HealthStatus => {
    const alerts: string[] = [];
    let score = 100;

    if (v.heartRate > 100) {
      alerts.push('Tachycardia detected (High Heart Rate)');
      score -= 15;
    } else if (v.heartRate < 60) {
      alerts.push('Bradycardia detected (Low Heart Rate)');
      score -= 10;
    }

    if (v.temperature > 37.5) {
      alerts.push('Fever detected');
      score -= 10;
    }

    if (v.spo2 < 95) {
      alerts.push('Low Oxygen Saturation (SpO2)');
      score -= 20;
    }

    if (v.systolicBP > 140) {
      alerts.push('Hypertension detected (High Blood Pressure)');
      score -= 15;
    }

    let overall: HealthStatus['overall'] = 'excellent';
    if (score < 60) overall = 'critical';
    else if (score < 80) overall = 'warning';
    else if (score < 95) overall = 'normal';

    if (alerts.length === 0) {
      alerts.push('All vitals are within normal ranges.');
    }

    return { overall, score, alerts };
  }, []);

  const updateVitals = useCallback((newVitals: Vitals) => {
    setVitals(newVitals);
    setHistory(prev => [...prev.slice(-49), newVitals]);
    setHealthStatus(calculateHealthStatus(newVitals));
  }, [calculateHealthStatus]);

  const disconnect = useCallback(() => {
    if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
    if (wifiIntervalRef.current) clearInterval(wifiIntervalRef.current);
    setConnection({ connected: false, type: null, deviceName: null });
    setVitals(null);
    setHistory([]);
    setHealthStatus(null);
  }, []);

  const startDemo = useCallback(() => {
    disconnect();
    setConnection({ connected: true, type: 'demo', deviceName: 'Simulated Patient' });
    
    demoIntervalRef.current = setInterval(() => {
      const newVitals: Vitals = {
        heartRate: 70 + Math.random() * 10,
        temperature: 36.5 + Math.random() * 0.5,
        spo2: 97 + Math.random() * 2,
        systolicBP: 115 + Math.random() * 10,
        diastolicBP: 75 + Math.random() * 10,
        respiratoryRate: 14 + Math.random() * 4,
        timestamp: Date.now(),
      };
      updateVitals(newVitals);
    }, 2000);
  }, [disconnect, updateVitals]);

  const connectBluetooth = useCallback(async () => {
    // Note: Web Bluetooth might be restricted in iframes
    try {
      const nav = navigator as any;
      if (!nav.bluetooth) {
        throw new Error('Bluetooth not supported in this browser/environment.');
      }
      
      const device = await nav.bluetooth.requestDevice({
        filters: [{ services: [0xffe0] }], // Common Arduino BLE service
        optionalServices: [0xffe1]
      });

      setConnection({ connected: true, type: 'bluetooth', deviceName: device.name || 'Arduino BLE' });
      
      // In a real app, you'd connect to GATT server and subscribe to characteristics
      // For this demo, we'll simulate data once connected
      startDemo(); 
      setConnection(prev => ({ ...prev, type: 'bluetooth', deviceName: device.name || 'Arduino BLE' }));
    } catch (err) {
      console.error('Bluetooth error:', err);
      // Log error instead of alert as per guidelines
      console.warn('Bluetooth connection failed. Make sure you are in a secure context (HTTPS) and the device is nearby.');
    }
  }, [startDemo]);

  const connectWiFi = useCallback(async (endpoint: string) => {
    disconnect();
    setWifiEndpoint(endpoint);
    setConnection({ connected: true, type: 'wifi', deviceName: endpoint });

    wifiIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${endpoint}/vitals`);
        const data = await res.json();
        updateVitals({
          heartRate: data.hr,
          temperature: data.temp,
          spo2: data.spo2,
          systolicBP: data.sys,
          diastolicBP: data.dia,
          respiratoryRate: data.rr,
          timestamp: Date.now(),
        });
      } catch (err) {
        console.error('WiFi Fetch Error:', err);
      }
    }, 3000);
  }, [disconnect, updateVitals]);

  useEffect(() => {
    return () => {
      if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
      if (wifiIntervalRef.current) clearInterval(wifiIntervalRef.current);
    };
  }, []);

  return {
    vitals,
    history,
    healthStatus,
    connection,
    wifiEndpoint,
    setWifiEndpoint,
    connectBluetooth,
    connectWiFi,
    disconnect,
    startDemo,
  };
};
