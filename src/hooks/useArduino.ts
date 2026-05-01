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
  type: 'bluetooth' | 'wifi' | 'serial' | 'demo' | null;
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
  const [error, setError] = useState<string | null>(null);

  const demoIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const wifiIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const bluetoothDeviceRef = useRef<any>(null);
  const serialPortRef = useRef<any>(null);
  const serialReaderRef = useRef<any>(null);

  const calculateHealthStatus = useCallback((v: Vitals): HealthStatus => {
    const alerts: string[] = [];
    let score = 100;

    // Heart Rate Analysis
    if (v.heartRate > 160 || v.heartRate < 35) {
      alerts.push('CRITICAL: Life-threatening Arrhythmia (Emergency)');
      score -= 60;
    } else if (v.heartRate > 130) {
      alerts.push('Severe Tachycardia: Risk of Cardiac Strain');
      score -= 35;
    } else if (v.heartRate > 100) {
      alerts.push('Tachycardia: Elevated Heart Rate');
      score -= 15;
    } else if (v.heartRate < 45) {
      alerts.push('Severe Bradycardia: Risk of Syncope');
      score -= 35;
    } else if (v.heartRate < 60) {
      alerts.push('Bradycardia: Low Heart Rate');
      score -= 10;
    }

    // Temperature Analysis
    if (v.temperature > 41) {
      alerts.push('CRITICAL: Hyperpyrexia (Brain Damage Risk)');
      score -= 60;
    } else if (v.temperature > 39) {
      alerts.push('High Fever: Systemic Infection Risk');
      score -= 35;
    } else if (v.temperature > 37.8) {
      alerts.push('Pyrexia: Low-grade Fever');
      score -= 10;
    } else if (v.temperature < 34) {
      alerts.push('CRITICAL: Severe Hypothermia');
      score -= 50;
    } else if (v.temperature < 35.5) {
      alerts.push('Mild Hypothermia');
      score -= 15;
    }

    // Oxygen Saturation Analysis
    if (v.spo2 < 80) {
      alerts.push('CRITICAL: Respiratory Arrest Imminent (Very Low SpO2)');
      score -= 70;
    } else if (v.spo2 < 88) {
      alerts.push('Severe Hypoxia: Supplemental Oxygen Required');
      score -= 45;
    } else if (v.spo2 < 92) {
      alerts.push('Hypoxia: Impaired Oxygenation');
      score -= 25;
    } else if (v.spo2 < 95) {
      alerts.push('Mild Desaturation');
      score -= 10;
    }

    // Blood Pressure Analysis (Hypertension/Hypotension)
    if (v.systolicBP > 200 || v.diastolicBP > 130) {
      alerts.push('CRITICAL: Hypertensive Emergency (Stroke Risk)');
      score -= 60;
    } else if (v.systolicBP > 180 || v.diastolicBP > 110) {
      alerts.push('Hypertensive Urgency');
      score -= 40;
    } else if (v.systolicBP > 140 || v.diastolicBP > 90) {
      alerts.push('Hypertension Stage 2');
      score -= 20;
    } else if (v.systolicBP < 80) {
      alerts.push('CRITICAL: Severe Hypotension (Shock Risk)');
      score -= 45;
    } else if (v.systolicBP < 95) {
      alerts.push('Hypotension: Low Blood Pressure');
      score -= 15;
    }

    // Respiratory Rate Analysis
    if (v.respiratoryRate > 35 || v.respiratoryRate < 6) {
      alerts.push('CRITICAL: Respiratory Distress/Apnea');
      score -= 50;
    } else if (v.respiratoryRate > 24) {
      alerts.push('Tachypnea: Rapid Breathing');
      score -= 20;
    } else if (v.respiratoryRate < 10) {
      alerts.push('Bradypnea: Abnormally Slow Breathing');
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

  const parseData = useCallback((data: string) => {
    try {
      // Expected format: HR,TEMP,SPO2,SYS,DIA,RR
      // Example: 72,36.5,98,120,80,16
      const parts = data.trim().split(',');
      if (parts.length >= 6) {
        updateVitals({
          heartRate: parseFloat(parts[0]),
          temperature: parseFloat(parts[1]),
          spo2: parseFloat(parts[2]),
          systolicBP: parseFloat(parts[3]),
          diastolicBP: parseFloat(parts[4]),
          respiratoryRate: parseFloat(parts[5]),
          timestamp: Date.now(),
        });
      } else {
        // Try JSON if CSV fails
        const json = JSON.parse(data);
        updateVitals({
          heartRate: json.hr || json.heartRate,
          temperature: json.temp || json.temperature,
          spo2: json.spo2,
          systolicBP: json.sys || json.systolicBP,
          diastolicBP: json.dia || json.diastolicBP,
          respiratoryRate: json.rr || json.respiratoryRate,
          timestamp: Date.now(),
        });
      }
    } catch (err) {
      console.warn('Failed to parse incoming data:', data);
    }
  }, [updateVitals]);

  const disconnect = useCallback(async () => {
    setError(null);
    if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
    if (wifiIntervalRef.current) clearInterval(wifiIntervalRef.current);
    
    if (bluetoothDeviceRef.current && bluetoothDeviceRef.current.gatt.connected) {
      bluetoothDeviceRef.current.gatt.disconnect();
    }
    
    if (serialReaderRef.current) {
      await serialReaderRef.current.cancel();
      serialReaderRef.current = null;
    }
    
    if (serialPortRef.current) {
      await serialPortRef.current.close();
      serialPortRef.current = null;
    }

    setConnection({ connected: false, type: null, deviceName: null });
    setVitals(null);
    setHistory([]);
    setHealthStatus(null);
  }, []);

  const startDemo = useCallback((forceCritical: boolean = false) => {
    disconnect();
    setConnection({ connected: true, type: 'demo', deviceName: 'Simulated Patient' });
    
    let tickCount = 0;
    demoIntervalRef.current = setInterval(() => {
      const isCriticalEvent = forceCritical || (Math.random() < 0.1);
      
      const newVitals: Vitals = {
        heartRate: isCriticalEvent ? (Math.random() > 0.5 ? 130 + Math.random() * 20 : 40 + Math.random() * 10) : 70 + Math.random() * 10,
        temperature: isCriticalEvent ? 39 + Math.random() * 1 : 36.5 + Math.random() * 0.5,
        spo2: isCriticalEvent ? 85 + Math.random() * 5 : 97 + Math.random() * 2,
        systolicBP: isCriticalEvent ? 190 + Math.random() * 20 : 115 + Math.random() * 10,
        diastolicBP: isCriticalEvent ? 110 + Math.random() * 10 : 75 + Math.random() * 10,
        respiratoryRate: isCriticalEvent ? 28 + Math.random() * 5 : 14 + Math.random() * 4,
        timestamp: Date.now(),
      };
      updateVitals(newVitals);
      tickCount++;
    }, 2000);
  }, [disconnect, updateVitals]);

  const connectBluetooth = useCallback(async () => {
    setError(null);
    disconnect();
    try {
      const nav = navigator as any;
      if (!nav.bluetooth) {
        throw new Error('Web Bluetooth is not supported in this browser.');
      }
      
      const device = await nav.bluetooth.requestDevice({
        filters: [{ services: [0xffe0] }], // Standard HM-10 service
        optionalServices: ['battery_service', 'device_information']
      });

      bluetoothDeviceRef.current = device;
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(0xffe0);
      const characteristic = await service.getCharacteristic(0xffe1);

      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
        const value = event.target.value;
        const decoder = new TextDecoder();
        const data = decoder.decode(value);
        parseData(data);
      });

      device.addEventListener('gattserverdisconnected', () => {
        setConnection({ connected: false, type: null, deviceName: null });
      });

      setConnection({ connected: true, type: 'bluetooth', deviceName: device.name || 'Arduino BLE' });
    } catch (err: any) {
      console.error('Bluetooth error:', err);
      let friendlyMessage = 'Bluetooth connection failed.';
      
      if (err.name === 'NotFoundError') {
        friendlyMessage = 'Connection cancelled. Please select your Arduino device from the list.';
      } else if (err.name === 'SecurityError') {
        friendlyMessage = 'Bluetooth access denied. Please ensure Bluetooth is enabled on your computer and this site has permission to use it.';
      } else if (err.name === 'NetworkError') {
        friendlyMessage = 'Could not connect to the device. Ensure your Arduino is powered on, in pairing mode, and within range.';
      } else if (err.message?.includes('User cancelled')) {
        friendlyMessage = 'Connection cancelled. Please try again and select your device.';
      } else {
        friendlyMessage = `Bluetooth Error: ${err.message || 'Unknown error'}. Please check if your device is in pairing mode and Bluetooth is on.`;
      }
      
      setError(friendlyMessage);
    }
  }, [parseData]);

  const connectSerial = useCallback(async () => {
    setError(null);
    disconnect();
    try {
      const nav = navigator as any;
      if (!nav.serial) {
        throw new Error('Web Serial is not supported in this browser.');
      }

      const port = await nav.serial.requestPort();
      await port.open({ baudRate: 9600 });
      serialPortRef.current = port;

      setConnection({ connected: true, type: 'serial', deviceName: 'Arduino Serial' });

      const decoder = new TextDecoderStream();
      const inputDone = port.readable.pipeTo(decoder.writable);
      const inputStream = decoder.readable;
      const reader = inputStream.getReader();
      serialReaderRef.current = reader;

      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += value;
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (line.trim()) parseData(line);
        }
      }
    } catch (err: any) {
      console.error('Serial error:', err);
      setError(err.message || 'Serial connection failed.');
    }
  }, [parseData]);

  const connectWiFi = useCallback(async (endpoint: string) => {
    setError(null);
    disconnect();
    setWifiEndpoint(endpoint);
    setConnection({ connected: true, type: 'wifi', deviceName: endpoint });

    wifiIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${endpoint}/vitals`, { mode: 'cors' });
        const data = await res.json();
        updateVitals({
          heartRate: data.hr || data.heartRate,
          temperature: data.temp || data.temperature,
          spo2: data.spo2,
          systolicBP: data.sys || data.systolicBP,
          diastolicBP: data.dia || data.diastolicBP,
          respiratoryRate: data.rr || data.respiratoryRate,
          timestamp: Date.now(),
        });
      } catch (err: any) {
        console.error('WiFi Fetch Error:', err);
        // Don't disconnect immediately on one failure, but maybe show a warning
      }
    }, 3000);
  }, [disconnect, updateVitals]);

  useEffect(() => {
    return () => {
      if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
      if (wifiIntervalRef.current) clearInterval(wifiIntervalRef.current);
    };
  }, []);

  const simulateEmergency = useCallback(() => {
    const emergencyVitals: Vitals = {
      heartRate: 145 + Math.random() * 10,
      temperature: 39.8 + Math.random() * 0.5,
      spo2: 84 + Math.random() * 3,
      systolicBP: 195 + Math.random() * 10,
      diastolicBP: 115 + Math.random() * 5,
      respiratoryRate: 32 + Math.random() * 4,
      timestamp: Date.now(),
    };
    updateVitals(emergencyVitals);
  }, [updateVitals]);

  return {
    vitals,
    history,
    healthStatus,
    connection,
    wifiEndpoint,
    setWifiEndpoint,
    connectBluetooth,
    connectSerial,
    connectWiFi,
    disconnect,
    startDemo,
    simulateEmergency,
    error,
  };
};
