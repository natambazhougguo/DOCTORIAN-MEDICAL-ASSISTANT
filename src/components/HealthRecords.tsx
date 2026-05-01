import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Pill, Plus, Trash2, Clock, Calendar, AlertTriangle,
  FileText, Search, ChevronDown, Printer, Download,
  CheckCircle2, XCircle, Info, User, Hash,
  ClipboardList, Beaker, Stethoscope, ChevronUp,
  Sparkles, Shield, Heart, Activity, Eye, EyeOff, Share2,
  Scale, Loader2, Wind, Zap, Brain, Droplets, Thermometer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../api';

// ─── Types ────────────────────────────────────────────────
interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  route: string;
  instructions: string;
  startDate: string;
  endDate: string;
  quantity: number;
  refills: number;
  status: 'active' | 'completed' | 'discontinued';
}

interface PatientInfo {
  name: string;
  age: string;
  gender: string;
  weight: string;
  bloodType: string;
  allergies: string;
  phone: string;
  address: string;
}

interface Prescription {
  id: string;
  doctorName: string;
  date: string;
  patient: PatientInfo;
  medications: Medication[];
  notes: string;
  diagnosis: string;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

// ─── Constants ────────────────────────────────────────────
const FREQUENCIES = [
  'Once daily', 'Twice daily', 'Three times daily', 'Four times daily',
  'Every 4 hours', 'Every 6 hours', 'Every 8 hours', 'Every 12 hours',
  'Weekly', 'As needed (PRN)', 'Before meals', 'After meals', 'At bedtime',
];

const ROUTES = [
  'Oral (PO)', 'Intravenous (IV)', 'Intramuscular (IM)', 'Subcutaneous (SC)',
  'Topical', 'Inhalation', 'Rectal', 'Sublingual', 'Ophthalmic', 'Otic',
];

const COMMON_MEDICATIONS = [
  { name: 'Amoxicillin 500mg', category: 'Antibiotic', dosage: '500mg', route: 'Oral (PO)', frequency: 'Three times daily' },
  { name: 'Ibuprofen 400mg', category: 'NSAID', dosage: '400mg', route: 'Oral (PO)', frequency: 'Every 6 hours' },
  { name: 'Metformin 500mg', category: 'Antidiabetic', dosage: '500mg', route: 'Oral (PO)', frequency: 'Twice daily' },
  { name: 'Lisinopril 10mg', category: 'ACE Inhibitor', dosage: '10mg', route: 'Oral (PO)', frequency: 'Once daily' },
  { name: 'Omeprazole 20mg', category: 'PPI', dosage: '20mg', route: 'Oral (PO)', frequency: 'Once daily' },
  { name: 'Paracetamol 500mg', category: 'Analgesic', dosage: '500mg', route: 'Oral (PO)', frequency: 'Every 6 hours' },
  { name: 'Atorvastatin 20mg', category: 'Statin', dosage: '20mg', route: 'Oral (PO)', frequency: 'Once daily' },
  { name: 'Cetirizine 10mg', category: 'Antihistamine', dosage: '10mg', route: 'Oral (PO)', frequency: 'Once daily' },
  { name: 'Azithromycin 250mg', category: 'Antibiotic', dosage: '250mg', route: 'Oral (PO)', frequency: 'Once daily' },
  { name: 'Salbutamol Inhaler', category: 'Bronchodilator', dosage: '100mcg', route: 'Inhalation', frequency: 'As needed (PRN)' },
  { name: 'Metoprolol 25mg', category: 'Beta Blocker', dosage: '25mg', route: 'Oral (PO)', frequency: 'Twice daily' },
  { name: 'Amlodipine 5mg', category: 'Calcium Channel Blocker', dosage: '5mg', route: 'Oral (PO)', frequency: 'Once daily' },
];

const ALLERGEN_LIST = ['Penicillin', 'Sulfa drugs', 'Aspirin', 'Ibuprofen', 'Latex', 'Codeine', 'Morphine'];

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Antibiotic: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' },
  NSAID: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800' },
  Antidiabetic: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800' },
  Statin: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
  Analgesic: { bg: 'bg-pink-50 dark:bg-pink-900/20', text: 'text-pink-700 dark:text-pink-400', border: 'border-pink-200 dark:border-pink-800' },
  Antihistamine: { bg: 'bg-cyan-50 dark:bg-cyan-900/20', text: 'text-cyan-700 dark:text-cyan-400', border: 'border-cyan-200 dark:border-cyan-800' },
  Bronchodilator: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' },
};

// ─── Utility ──────────────────────────────────────────────
const generateId = () => Math.random().toString(36).substr(2, 9);

const formatDate = (date: string) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const calcEndDate = (start: string, duration: string): string => {
  if (!start || !duration) return '';
  const match = duration.match(/(\d+)/);
  if (!match) return '';
  const days = parseInt(match[1], 10);
  const unit = duration.toLowerCase();
  let totalDays = days;
  if (unit.includes('week')) totalDays = days * 7;
  if (unit.includes('month')) totalDays = days * 30;
  const result = new Date(start);
  result.setDate(result.getDate() + totalDays);
  return result.toISOString().split('T')[0];
};

const getMedCategory = (name: string): string => {
  const found = COMMON_MEDICATIONS.find(m => m.name.toLowerCase() === name.toLowerCase());
  return found?.category || '';
};

const emptyMedication = (): Medication => ({
  id: generateId(), name: '', dosage: '', frequency: 'Twice daily', route: 'Oral (PO)',
  instructions: '', startDate: new Date().toISOString().split('T')[0], endDate: '',
  duration: '', quantity: 30, refills: 0, status: 'active',
});

const defaultPatient: PatientInfo = {
  name: '', age: '', gender: 'Male', weight: '', bloodType: '', allergies: '', phone: '', address: '',
};

const checkInteractions = (meds: Medication[]): { severity: 'high' | 'medium' | 'low'; message: string }[] => {
  const names = meds.map(m => m.name.toLowerCase());
  const warnings: { severity: 'high' | 'medium' | 'low'; message: string }[] = [];
  
  // Drug-Drug Interactions
  if (names.some(n => n.includes('ibuprofen')) && names.some(n => n.includes('aspirin')))
    warnings.push({ severity: 'high', message: 'Increased risk of GI bleeding — Ibuprofen + Aspirin' });
  if (names.some(n => n.includes('ibuprofen')) && names.some(n => n.includes('lisinopril')))
    warnings.push({ severity: 'medium', message: 'NSAIDs may reduce antihypertensive effect of ACE inhibitors' });
  if (names.some(n => n.includes('metformin')) && names.some(n => n.includes('omeprazole')))
    warnings.push({ severity: 'low', message: 'Omeprazole may increase Metformin absorption — monitor blood sugar' });
  if (names.some(n => n.includes('amoxicillin')) && names.some(n => n.includes('methotrexate')))
    warnings.push({ severity: 'high', message: 'Amoxicillin may increase Methotrexate toxicity' });
  if (names.some(n => n.includes('atorvastatin')) && names.some(n => n.includes('azithromycin')))
    warnings.push({ severity: 'medium', message: 'Azithromycin may increase risk of statin-induced myopathy' });
  if (names.some(n => n.includes('warfarin')) && names.some(n => n.includes('aspirin')))
    warnings.push({ severity: 'high', message: 'Severe bleeding risk — Warfarin + Aspirin' });
  if (names.some(n => n.includes('sildenafil')) && names.some(n => n.includes('nitroglycerin')))
    warnings.push({ severity: 'high', message: 'Life-threatening hypotension — Sildenafil + Nitroglycerin' });
  if (names.some(n => n.includes('lisinopril')) && names.some(n => n.includes('spironolactone')))
    warnings.push({ severity: 'medium', message: 'Risk of hyperkalemia (high potassium) — Lisinopril + Spironolactone' });
  if (names.some(n => n.includes('digoxin')) && names.some(n => n.includes('amiodarone')))
    warnings.push({ severity: 'high', message: 'Increased digoxin levels — monitor for toxicity' });
  
  return warnings;
};

const checkContraindications = (meds: Medication[], patient: PatientInfo): { severity: 'high'; message: string }[] => {
  const warnings: { severity: 'high'; message: string }[] = [];
  const allergies = patient.allergies.toLowerCase();
  const medNames = meds.map(m => m.name.toLowerCase());

  if (allergies.includes('penicillin') && medNames.some(n => n.includes('amoxicillin') || n.includes('penicillin'))) {
    warnings.push({ severity: 'high', message: 'ALLERGY ALERT: Patient is allergic to Penicillin. Amoxicillin/Penicillin is contraindicated.' });
  }
  if (allergies.includes('aspirin') && medNames.some(n => n.includes('aspirin'))) {
    warnings.push({ severity: 'high', message: 'ALLERGY ALERT: Patient is allergic to Aspirin.' });
  }
  if (allergies.includes('sulfa') && medNames.some(n => n.includes('sulfamethoxazole') || n.includes('septra') || n.includes('bactrim'))) {
    warnings.push({ severity: 'high', message: 'ALLERGY ALERT: Patient has Sulfa allergy.' });
  }
  if (allergies.includes('ibuprofen') && medNames.some(n => n.includes('ibuprofen') || n.includes('advil') || n.includes('motrin'))) {
    warnings.push({ severity: 'high', message: 'ALLERGY ALERT: Patient is allergic to Ibuprofen/NSAIDs.' });
  }

  return warnings;
};

// ─── Sub Components ────────────────────────────────────────

const SectionHeader: React.FC<{
  icon: React.ReactNode; title: string; subtitle?: string;
  action?: React.ReactNode;
}> = ({ icon, title, subtitle, action }) => (
  <div className="flex items-start justify-between gap-4 mb-6">
    <div className="flex items-start gap-3">
      <div className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 p-2.5 rounded-xl h-fit shadow-sm">{icon}</div>
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
        {subtitle && <p className="text-sm text-gray-400 dark:text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {action}
  </div>
);

const InputField: React.FC<{
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; icon?: React.ReactNode; error?: boolean;
  errorMessage?: string; id?: string;
}> = ({ label, value, onChange, type = 'text', placeholder, icon, error, errorMessage, id }) => {
  const inputId = id || React.useId();
  return (
    <div>
      <label htmlFor={inputId} className="block text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">{label}</label>
      <div className="relative group">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-slate-600 group-focus-within:text-blue-500 transition-colors" aria-hidden="true">{icon}</div>}
        <input
          id={inputId}
          type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          aria-invalid={!!errorMessage}
          aria-describedby={errorMessage ? `${inputId}-error` : undefined}
          className={`w-full bg-white/70 dark:bg-slate-800/70 border rounded-xl px-3 py-2.5 text-sm text-gray-800 dark:text-slate-200 placeholder:text-gray-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 dark:focus:border-blue-700 focus:bg-white dark:focus:bg-slate-800 transition-all ${icon ? 'pl-10' : ''} ${error || errorMessage ? 'border-red-300 dark:border-red-900 focus:ring-red-500/20 focus:border-red-300' : 'border-gray-200 dark:border-slate-700'}`}
        />
      </div>
      {errorMessage && (
        <motion.p 
          id={`${inputId}-error`}
          initial={{ opacity: 0, y: -5 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="text-[10px] text-red-500 font-bold mt-1 ml-1"
          role="alert"
        >
          {errorMessage}
        </motion.p>
      )}
    </div>
  );
};

const SelectField: React.FC<{
  label: string; value: string; onChange: (v: string) => void; options: string[]; id?: string;
}> = ({ label, value, onChange, options, id }) => {
  const selectId = id || React.useId();
  return (
    <div>
      <label htmlFor={selectId} className="block text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">{label}</label>
      <div className="relative group">
        <select
          id={selectId}
          value={value} onChange={e => onChange(e.target.value)}
          className="w-full appearance-none bg-white/70 dark:bg-slate-800/70 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 dark:focus:border-blue-700 focus:bg-white dark:focus:bg-slate-800 transition-all pr-8"
        >
          {options.map(o => <option key={o} value={o} className="dark:bg-slate-900">{o}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 dark:text-slate-600 pointer-events-none" aria-hidden="true" />
      </div>
    </div>
  );
};

const ToastContainer: React.FC<{ toasts: Toast[]; onDismiss: (id: string) => void }> = ({ toasts, onDismiss }) => (
  <div className="fixed top-4 right-4 z-[100] space-y-2 pointer-events-none">
    {toasts.map(t => (
      <div
        key={t.id}
        className={`animate-toastIn pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border backdrop-blur-md text-sm font-medium ${
          t.type === 'success' ? 'bg-emerald-50/95 dark:bg-emerald-900/90 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200' :
          t.type === 'error' ? 'bg-red-50/95 dark:bg-red-900/90 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200' :
          t.type === 'warning' ? 'bg-amber-50/95 dark:bg-amber-900/90 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200' :
          'bg-blue-50/95 dark:bg-blue-900/90 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
        }`}
      >
        {t.type === 'success' && <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
        {t.type === 'error' && <XCircle className="w-4 h-4 flex-shrink-0" />}
        {t.type === 'warning' && <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
        {t.type === 'info' && <Info className="w-4 h-4 flex-shrink-0" />}
        {t.message}
        <button onClick={() => onDismiss(t.id)} className="ml-2 opacity-50 hover:opacity-100"><XCircle className="w-3.5 h-3.5" /></button>
      </div>
    ))}
  </div>
);

// ─── Main Component ────────────────────────────────────────

export const HealthRecords: React.FC = () => {
  const [prescription, setPrescription] = useState<Prescription>({
    id: generateId(), doctorName: 'Dr. Smith', date: new Date().toISOString().split('T')[0],
    patient: { ...defaultPatient }, medications: [emptyMedication()], notes: '', diagnosis: '',
  });

  const [medSearch, setMedSearch] = useState('');
  const [showMedSearch, setShowMedSearch] = useState(false);
  const [savedPrescriptions, setSavedPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter States
  const [filterPatientName, setFilterPatientName] = useState('');
  const [filterMedName, setFilterMedName] = useState('');
  const [filterMedType, setFilterMedType] = useState('All Types');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const validateField = useCallback((field: string, value: string, context?: string) => {
    let error = '';
    const trimmed = value.trim();

    if (field === 'name' && context === 'patient') {
      if (!trimmed) error = 'Patient name is required';
      else if (trimmed.length < 2) error = 'Name is too short';
    } else if (field === 'age') {
      const age = parseInt(trimmed);
      if (trimmed && (isNaN(age) || age < 0 || age > 150)) error = 'Enter a valid age (0-150)';
    } else if (field === 'phone') {
      const phoneRegex = /^\+?[\d\s-]{8,20}$/;
      if (trimmed && !phoneRegex.test(trimmed)) error = 'Enter a valid phone number';
    } else if (field === 'diagnosis') {
      if (!trimmed) error = 'Diagnosis is required';
    } else if (field === 'medName') {
      if (!trimmed) error = 'Medication name is required';
    } else if (field === 'startDate' || field === 'endDate') {
      if (trimmed && isNaN(Date.parse(trimmed))) error = 'Invalid date format';
    }

    setErrors(prev => {
      const newErrors = { ...prev };
      const key = context ? `${context}.${field}` : field;
      if (error) newErrors[key] = error;
      else delete newErrors[key];
      return newErrors;
    });

    return !error;
  }, []);

  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = generateId();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  // Fetch records on mount
  useEffect(() => {
    let isMounted = true;
    const fetchRecords = async () => {
      try {
        const records = await api.records.list();
        if (!isMounted) return;
        
        const prescriptions = records
          .filter(r => r.type === 'prescription')
          .map(r => JSON.parse(r.value) as Prescription);
        setSavedPrescriptions(prescriptions);
      } catch (error: any) {
        if (!isMounted) return;
        console.error("Failed to fetch records:", error);
        
        // Don't show toast for unauthorized if we're likely logging out
        if (error.message !== "Unauthorized") {
          showToast('Failed to load records', 'error');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchRecords();
    return () => { isMounted = false; };
  }, [showToast]);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'compose' | 'saved' | 'templates'>('compose');
  const [expandedMeds, setExpandedMeds] = useState<Set<string>>(new Set([prescription.medications[0]?.id]));
  const [step, setStep] = useState(1);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowMedSearch(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const updatePatient = useCallback((field: keyof PatientInfo, value: string) => {
    setPrescription(prev => ({ ...prev, patient: { ...prev.patient, [field]: value } }));
    validateField(field, value, 'patient');
  }, [validateField]);

  const updatePrescription = useCallback((field: string, value: string) => {
    setPrescription(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  }, [validateField]);

  const addMedication = () => {
    const newMed = emptyMedication();
    setPrescription(prev => ({ ...prev, medications: [...prev.medications, newMed] }));
    setExpandedMeds(prev => new Set([...prev, newMed.id]));
    showToast('New medication slot added', 'info');
    // Initialize error for new med if needed, but usually we wait for interaction
  };

  const updateMedication = useCallback((id: string, field: keyof Medication, value: string | number) => {
    setPrescription(prev => ({
      ...prev,
      medications: prev.medications.map(m => m.id === id ? { ...m, [field]: value } : m),
    }));
    if (typeof value === 'string') {
      validateField(field === 'name' ? 'medName' : field, value, id);
    }
  }, [validateField]);

  const removeMedication = (id: string) => {
    if (prescription.medications.length <= 1) { showToast('Cannot remove the last medication', 'warning'); return; }
    setPrescription(prev => ({ ...prev, medications: prev.medications.filter(m => m.id !== id) }));
    setExpandedMeds(prev => { const s = new Set(prev); s.delete(id); return s; });
    showToast('Medication removed', 'info');
  };

  const selectCommonMed = (med: typeof COMMON_MEDICATIONS[0]) => {
    const lastMed = prescription.medications[prescription.medications.length - 1];
    if (lastMed && !lastMed.name) {
      updateMedication(lastMed.id, 'name', med.name);
      updateMedication(lastMed.id, 'dosage', med.dosage);
      updateMedication(lastMed.id, 'route', med.route);
      updateMedication(lastMed.id, 'frequency', med.frequency);
      setExpandedMeds(prev => new Set([...prev, lastMed.id]));
    } else {
      const newMed = { ...emptyMedication(), name: med.name, dosage: med.dosage, route: med.route, frequency: med.frequency };
      setPrescription(prev => ({ ...prev, medications: [...prev.medications, newMed] }));
      setExpandedMeds(prev => new Set([...prev, newMed.id]));
    }
    setShowMedSearch(false);
    setMedSearch('');
    showToast(`${med.name} added`, 'success');
  };

  const savePrescription = async () => {
    // Final validation check
    const hasErrors = Object.keys(errors).length > 0;
    if (hasErrors) {
      showToast('Please fix the errors before saving', 'error');
      return;
    }

    if (!prescription.patient.name.trim()) { 
      validateField('name', prescription.patient.name, 'patient');
      showToast('Patient name is required', 'error'); 
      return; 
    }
    const filledMeds = prescription.medications.filter(m => m.name.trim());
    if (filledMeds.length === 0) { 
      showToast('Add at least one medication', 'error'); 
      return; 
    }
    
    setIsSaving(true);
    try {
      const newRx = { ...prescription, id: generateId() };
      await api.records.create({
        type: 'prescription',
        value: JSON.stringify(newRx),
        date: new Date().toISOString(),
        notes: newRx.diagnosis
      });
      
      setSavedPrescriptions(prev => [newRx, ...prev]);
      setPrescription(prev => ({
        ...prev, id: generateId(), medications: [emptyMedication()], notes: '', diagnosis: '',
      }));
      setStep(1);
      setActiveTab('saved');
      showToast('Prescription saved successfully!', 'success');
    } catch (error) {
      console.error("Save failed:", error);
      showToast('Failed to save prescription', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const deletePrescription = (id: string) => {
    setSavedPrescriptions(prev => prev.filter(p => p.id !== id));
    showToast('Prescription deleted', 'info');
  };

  const loadPrescription = (rx: Prescription) => {
    setPrescription(rx);
    setExpandedMeds(new Set(rx.medications.map(m => m.id)));
    setStep(3);
    setActiveTab('compose');
    showToast('Prescription loaded for editing', 'info');
  };

  const interactions = checkInteractions(prescription.medications.filter(m => m.name));
  const contraindications = checkContraindications(prescription.medications.filter(m => m.name), prescription.patient);
  const allWarnings = [...contraindications, ...interactions];
  const totalMeds = prescription.medications.filter(m => m.name).length;
  const isPatientValid = prescription.patient.name.trim().length > 0;
  const isDiagnosisValid = prescription.diagnosis.trim().length > 0;

  // Prescription completeness
  const completeness = Math.min(100,
    (isPatientValid ? 25 : 0) +
    (isDiagnosisValid ? 25 : 0) +
    (totalMeds > 0 ? 30 : 0) +
    (prescription.medications.every(m => !m.name || m.duration) ? 20 : 0)
  );

  const ALL_CATEGORIES = ['All Types', ...Array.from(new Set(COMMON_MEDICATIONS.map(m => m.category)))];

  const filteredPrescriptions = savedPrescriptions.filter(rx => {
    const matchesName = rx.patient.name.toLowerCase().includes(filterPatientName.toLowerCase());
    const matchesMedName = !filterMedName || rx.medications.some(m => m.name.toLowerCase().includes(filterMedName.toLowerCase()));
    const matchesType = filterMedType === 'All Types' || rx.medications.some(m => getMedCategory(m.name) === filterMedType);
    
    const rxDate = new Date(rx.date).getTime();
    const start = filterStartDate ? new Date(filterStartDate).getTime() : -Infinity;
    // Set end date to end of day
    const end = filterEndDate ? new Date(filterEndDate + 'T23:59:59').getTime() : Infinity;
    const matchesDate = rxDate >= start && rxDate <= end;

    return matchesName && matchesMedName && matchesType && matchesDate;
  });

  // ─── Render ─────────────────────────────────────────────
  return (
    <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
      <ToastContainer toasts={toasts} onDismiss={id => setToasts(prev => prev.filter(t => t.id !== id))} />

      {/* ── Header ────────────────────────────────────── */}
      <header className="mb-8">
        <div className="flex items-start sm:items-center gap-4 mb-1">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-blue-500/20" aria-hidden="true">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 id="health-records-title" className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Health Records</h1>
              <span className="hidden sm:inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold px-2.5 py-0.5 rounded-full" role="status">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" aria-hidden="true" />
                Verified
              </span>
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5">Comprehensive medical history and prescription tracking</p>
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <div className="text-center px-5 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm" role="status" aria-label={`${savedPrescriptions.length} Total Records`}>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-200">{savedPrescriptions.length}</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">Total Records</p>
            </div>
            <div className="text-center px-5 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm" role="status" aria-label={`${totalMeds} Active Medications`}>
              <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{totalMeds}</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">Active Meds</p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Patient Overview ──────────────────────────── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8" aria-label="Patient Vitals Overview">
        {[
          { label: 'Blood Type', value: 'A+', icon: <Heart className="text-rose-500" />, color: 'bg-rose-50 dark:bg-rose-900/20' },
          { label: 'Height', value: '175 cm', icon: <Scale className="text-blue-500" />, color: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Weight', value: '68 kg', icon: <Activity className="text-emerald-500" />, color: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Last Checkup', value: 'Mar 15, 2026', icon: <Calendar className="text-indigo-500" />, color: 'bg-indigo-50 dark:bg-indigo-900/20' },
        ].map((stat, i) => (
          <article key={i} className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center sm:items-center gap-3 sm:gap-4 text-center sm:text-left">
            <div className={`${stat.color} p-2.5 sm:p-3 rounded-xl sm:rounded-2xl shrink-0`} aria-hidden="true">
              {stat.icon}
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white">{stat.value}</p>
            </div>
          </article>
        ))}
      </section>

      {/* ── Progress Bar ──────────────────────────────── */}
      <section className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-blue-900/10 border border-slate-100 dark:border-slate-800 p-4 sm:p-6 mb-8" aria-labelledby="progress-title">
        <div className="flex items-center justify-between mb-3">
          <span id="progress-title" className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Prescription Progress</span>
          <span className="text-xs font-black text-blue-600 dark:text-blue-400" aria-hidden="true">{completeness}%</span>
        </div>
        <div className="h-2.5 sm:h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden" role="progressbar" aria-valuenow={completeness} aria-valuemin={0} aria-valuemax={100} aria-label="Prescription completion progress">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completeness}%` }}
            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600"
          />
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4" aria-label="Progress checklist">
          {[
            { label: 'Patient Info', done: isPatientValid },
            { label: 'Diagnosis', done: isDiagnosisValid },
            { label: 'Medications', done: totalMeds > 0 },
            { label: 'Complete', done: completeness === 100 },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors ${s.done ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`} aria-hidden="true" />
              <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-colors ${s.done ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                {s.label}
                <span className="sr-only">{s.done ? ": Completed" : ": Not started"}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tab Navigation ────────────────────────────── */}
      <nav className="flex overflow-x-auto no-scrollbar gap-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl sm:rounded-[2rem] p-1.5 sm:p-2 shadow-inner border border-slate-100 dark:border-slate-800 mb-8 sm:mb-10" role="tablist" aria-label="Prescription options">
        {(['compose', 'saved', 'templates'] as const).map(tab => (
          <button
            key={tab} 
            onClick={() => setActiveTab(tab)}
            role="tab"
            aria-selected={activeTab === tab}
            aria-controls={`${tab}-panel`}
            id={`tab-${tab}`}
            className={`flex-1 min-w-[120px] sm:min-w-[140px] flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-[1.5rem] text-xs sm:text-sm font-black transition-all duration-300 ${
              activeTab === tab
                ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-xl shadow-slate-400/20 dark:shadow-blue-900/20 scale-[1.02]'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-800'
            }`}
          >
            {tab === 'compose' && <Pill size={16} className="sm:w-[18px] sm:h-[18px]" aria-hidden="true" />}
            {tab === 'saved' && <ClipboardList size={16} className="sm:w-[18px] sm:h-[18px]" aria-hidden="true" />}
            {tab === 'templates' && <Sparkles size={16} className="sm:w-[18px] sm:h-[18px]" aria-hidden="true" />}
            <span className="capitalize">{tab === 'compose' ? 'New Rx' : tab === 'saved' ? `Saved (${savedPrescriptions.length})` : tab}</span>
          </button>
        ))}
      </nav>

      {/* ═══════════════════════════════════════════════════
          COMPOSE TAB
          ═══════════════════════════════════════════════════ */}
      {activeTab === 'compose' && (
        <section 
          id="compose-panel"
          role="tabpanel"
          aria-labelledby="tab-compose"
          className="space-y-8"
        >
          {/* Step Indicator */}
          <nav className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2" aria-label="Prescription steps">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <button
                  onClick={() => setStep(s)}
                  aria-current={step === s ? 'step' : undefined}
                  aria-label={`Step ${s}: ${s === 1 ? 'Patient Information' : s === 2 ? 'Clinical Assessment' : 'Medications'}`}
                  className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-sm font-black transition-all shrink-0 ${
                    step === s
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/20'
                      : step > s
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {step > s ? <CheckCircle2 size={18} aria-hidden="true" /> : <span className="w-6 h-6 flex items-center justify-center rounded-full border-2 border-current text-xs" aria-hidden="true">{s}</span>}
                  <span>{s === 1 ? 'Patient' : s === 2 ? 'Diagnosis' : 'Medications'}</span>
                </button>
                {s < 3 && <div className={`w-12 h-1 rounded-full shrink-0 ${step > s ? 'bg-emerald-200 dark:bg-emerald-800' : 'bg-slate-100 dark:bg-slate-800'}`} aria-hidden="true" />}
              </React.Fragment>
            ))}
          </nav>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                id="patient-info-step"
                role="region"
                aria-labelledby="patient-info-title"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-3xl sm:rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800"
              >
                <SectionHeader icon={<User className="text-blue-600 dark:text-blue-400" aria-hidden="true" />} title="Patient Information" subtitle="Basic identity and contact details" />
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <InputField label="Full Name *" value={prescription.patient.name} onChange={v => updatePatient('name', v)} placeholder="Joseph Brian" icon={<User size={16} />} errorMessage={errors['patient.name']} />
                  <InputField label="Age" value={prescription.patient.age} onChange={v => updatePatient('age', v)} placeholder="35" type="number" icon={<Calendar size={16} />} errorMessage={errors['patient.age']} />
                  <SelectField label="Gender" value={prescription.patient.gender} onChange={v => updatePatient('gender', v)} options={['Male', 'Female', 'Other']} />
                  <InputField label="Weight (kg)" value={prescription.patient.weight} onChange={v => updatePatient('weight', v)} placeholder="70" type="number" icon={<Hash size={16} />} errorMessage={errors['patient.weight']} />
                  <SelectField label="Blood Type" value={prescription.patient.bloodType} onChange={v => updatePatient('bloodType', v)} options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown']} />
                  <InputField label="Phone" value={prescription.patient.phone} onChange={v => updatePatient('phone', v)} placeholder="+1 234 567 890" type="tel" errorMessage={errors['patient.phone']} />
                  <div className="sm:col-span-2">
                    <InputField label="Address" value={prescription.patient.address} onChange={v => updatePatient('address', v)} placeholder="123 Medical Street, City" errorMessage={errors['patient.address']} />
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t border-slate-50">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Shield size={14} /> Known Allergies
                  </label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {ALLERGEN_LIST.map(allergy => {
                      const isActive = prescription.patient.allergies.toLowerCase().includes(allergy.toLowerCase());
                      return (
                        <button
                          key={allergy}
                          onClick={() => {
                            const current = prescription.patient.allergies;
                            if (isActive) {
                              updatePatient('allergies', current.split(',').map(s => s.trim()).filter(a => a.toLowerCase() !== allergy.toLowerCase()).join(', '));
                            } else {
                              updatePatient('allergies', current ? `${current}, ${allergy}` : allergy);
                            }
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            isActive ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          {allergy}
                        </button>
                      );
                    })}
                  </div>
                  <InputField label="Allergies" value={prescription.patient.allergies} onChange={v => updatePatient('allergies', v)} placeholder="Other allergies..." />
                </div>
                <div className="mt-10 flex justify-end">
                  <button onClick={() => setStep(2)} disabled={!isPatientValid} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black hover:bg-slate-800 transition-all disabled:opacity-30">
                    Next: Diagnosis
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                id="assessment-step"
                role="region"
                aria-labelledby="assessment-title"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-3xl sm:rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800"
              >
                <SectionHeader icon={<Stethoscope className="text-indigo-600 dark:text-indigo-400" aria-hidden="true" />} title="Clinical Assessment" subtitle="Diagnosis and medical notes" />
                <div className="space-y-6">
                  <InputField label="Primary Diagnosis *" value={prescription.diagnosis} onChange={v => updatePrescription('diagnosis', v)} placeholder="e.g., Acute bronchitis" errorMessage={errors['diagnosis']} />
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Additional Notes</label>
                    <textarea
                      value={prescription.notes} onChange={e => updatePrescription('notes', e.target.value)}
                      placeholder="Clinical observations, lifestyle advice..."
                      rows={4}
                      className="w-full bg-white/70 dark:bg-slate-800/70 border border-gray-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm text-gray-800 dark:text-slate-200 placeholder:text-gray-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 dark:focus:border-blue-700 focus:bg-white dark:focus:bg-slate-800 transition-all outline-none"
                    />
                  </div>
                </div>
                <div className="mt-10 flex justify-between">
                  <button onClick={() => setStep(1)} className="text-slate-400 font-bold hover:text-slate-900">Back</button>
                  <button onClick={() => setStep(3)} disabled={!isDiagnosisValid} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black hover:bg-slate-800 transition-all disabled:opacity-30">
                    Next: Medications
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                id="medications-step"
                role="region"
                aria-labelledby="medications-title"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-3xl sm:rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                  <SectionHeader icon={<Pill className="text-emerald-600 dark:text-emerald-400" aria-hidden="true" />} title="Medications" subtitle="Prescribe drugs and dosages" />
                  <div className="flex flex-wrap gap-3" ref={searchRef}>
                    <div className="relative">
                      <button 
                        onClick={() => setShowMedSearch(!showMedSearch)} 
                        aria-expanded={showMedSearch}
                        aria-haspopup="listbox"
                        className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-5 py-3 rounded-2xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
                      >
                        <Search size={16} aria-hidden="true" /> Quick Add
                      </button>
                      <AnimatePresence>
                        {showMedSearch && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute right-0 top-full mt-4 w-80 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 z-50 overflow-hidden"
                          >
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                              <label htmlFor="med-search-input" className="sr-only">Search medications</label>
                              <input
                                id="med-search-input"
                                type="text" value={medSearch} onChange={e => setMedSearch(e.target.value)}
                                placeholder="Search drugs..."
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                                autoFocus
                              />
                            </div>
                            <div className="max-h-64 overflow-y-auto p-2 space-y-1" role="listbox">
                              {COMMON_MEDICATIONS.filter(m => m.name.toLowerCase().includes(medSearch.toLowerCase())).map((med, i) => (
                                <button
                                  key={i} onClick={() => selectCommonMed(med)}
                                  role="option"
                                  className="w-full text-left px-4 py-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
                                >
                                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-400">{med.name}</p>
                                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">{med.category}</p>
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <button onClick={addMedication} className="bg-blue-600 text-white px-5 py-3 rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/20 flex items-center gap-2">
                      <Plus size={16} aria-hidden="true" /> Add Med
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {prescription.medications.map((med, index) => {
                    const isExpanded = expandedMeds.has(med.id);
                    const category = getMedCategory(med.name);
                    const catColor = CATEGORY_COLORS[category] || { bg: 'bg-slate-50 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-100 dark:border-slate-700' };

                    return (
                      <article key={med.id} className={`rounded-3xl border-2 transition-all ${isExpanded ? 'border-blue-100 dark:border-blue-900 bg-blue-50/10 dark:bg-blue-900/5' : 'border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900'}`}>
                        <button
                          id={`med-toggle-${med.id}`}
                          onClick={() => setExpandedMeds(prev => {
                            const s = new Set(prev);
                            s.has(med.id) ? s.delete(med.id) : s.add(med.id);
                            return s;
                          })}
                          aria-expanded={isExpanded}
                          aria-controls={`med-content-${med.id}`}
                          className="w-full flex items-center gap-4 px-6 py-5 text-left"
                        >
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm ${med.name ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`} aria-hidden="true">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            {med.name ? (
                              <div className="flex items-center gap-3">
                                <span className="font-black text-slate-900 dark:text-white">{med.name}</span>
                                {category && <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest ${catColor.bg} ${catColor.text}`}>{category}</span>}
                              </div>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-500 font-bold italic">Add medication details...</span>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <button 
                              onClick={e => { e.stopPropagation(); removeMedication(med.id); }} 
                              className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                              aria-label={`Remove medication ${med.name || index + 1}`}
                            >
                              <Trash2 size={18} aria-hidden="true" />
                            </button>
                            {isExpanded ? <ChevronUp size={20} className="text-slate-400 dark:text-slate-500" aria-hidden="true" /> : <ChevronDown size={20} className="text-slate-400 dark:text-slate-500" aria-hidden="true" />}
                          </div>
                        </button>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              id={`med-content-${med.id}`}
                              role="group"
                              aria-labelledby={`med-toggle-${med.id}`}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="px-6 pb-8 pt-2 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                <InputField label="Drug Name *" value={med.name} onChange={v => updateMedication(med.id, 'name', v)} placeholder="e.g., Amoxicillin" errorMessage={errors[`${med.id}.medName`]} />
                                <InputField label="Dosage" value={med.dosage} onChange={v => updateMedication(med.id, 'dosage', v)} placeholder="e.g., 500mg" errorMessage={errors[`${med.id}.dosage`]} />
                                <SelectField label="Frequency" value={med.frequency} onChange={v => updateMedication(med.id, 'frequency', v)} options={FREQUENCIES} />
                                <SelectField label="Route" value={med.route} onChange={v => updateMedication(med.id, 'route', v)} options={ROUTES} />
                                <InputField label="Duration" value={med.duration} onChange={v => updateMedication(med.id, 'duration', v)} placeholder="e.g., 7 days" errorMessage={errors[`${med.id}.duration`]} />
                                <InputField label="Start Date" value={med.startDate} onChange={v => updateMedication(med.id, 'startDate', v)} type="date" errorMessage={errors[`${med.id}.startDate`]} />
                                <div className="sm:col-span-3">
                                  <InputField label="Instructions" value={med.instructions} onChange={v => updateMedication(med.id, 'instructions', v)} placeholder="Take after meals..." errorMessage={errors[`${med.id}.instructions`]} />
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </article>
                    );
                  })}
                </div>

                {allWarnings.length > 0 && (
                  <div className="mt-8 space-y-3">
                    {allWarnings.map((w, i) => (
                      <div key={i} className={`p-4 rounded-2xl border-2 flex gap-4 items-center ${w.severity === 'high' ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800 text-rose-700 dark:text-rose-400' : w.severity === 'medium' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800 text-amber-700 dark:text-amber-400' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-400'}`}>
                        <AlertTriangle size={20} className={w.severity === 'high' ? 'text-rose-500' : 'text-amber-500'} />
                        <p className="text-sm font-bold">{w.message}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-12 flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={savePrescription} 
                    disabled={completeness < 50 || isSaving} 
                    className="flex-1 bg-slate-900 dark:bg-blue-600 text-white py-5 rounded-3xl font-black text-lg hover:bg-slate-800 dark:hover:bg-blue-700 transition-all shadow-2xl shadow-slate-400/20 dark:shadow-blue-900/20 disabled:opacity-30 flex items-center justify-center gap-3"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="animate-spin" size={24} />
                        <span>SAVING...</span>
                      </>
                    ) : (
                      <span>Save Prescription</span>
                    )}
                  </button>
                  <button onClick={() => setShowPrintPreview(true)} className="px-10 py-5 rounded-3xl border-2 border-slate-100 dark:border-slate-800 font-black text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                    Preview & Print
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════
          SAVED TAB
          ═══════════════════════════════════════════════════ */}
      {activeTab === 'saved' && (
        <section 
          id="saved-panel"
          role="tabpanel"
          aria-labelledby="tab-saved"
          className="space-y-12"
        >
          {/* Clinical Certification - NEW FEATURE */}
          <div className="bg-slate-950 rounded-[3rem] p-10 border border-slate-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
               <Shield size={240} className="text-white" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
               <div className="md:w-1/3 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest text-white mb-6">
                     <CheckCircle2 size={14} /> Active Certification
                  </div>
                  <h3 className="text-4xl font-black text-white uppercase tracking-tighter leading-none mb-6">Clinical <br /><span className="text-blue-500">Passport</span></h3>
                  <p className="text-slate-400 font-bold mb-8">Verified health status for international travel and specialized medical consults.</p>
                  <button className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-100 transition-all flex items-center gap-2 mx-auto md:mx-0">
                     <Download size={16} /> Export Passport
                  </button>
               </div>

               <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  {[
                    { label: 'Integrity Level', value: 'Level 4 (Elite)', desc: 'Full biological sync verified.' },
                    { label: 'Auth Status', value: 'Authorized', desc: 'Secure medical token active.' },
                    { label: 'Recent Audit', value: '27 Apr 2026', desc: 'Zero drift detected in vitals.' },
                    { label: 'Travel Rating', value: 'Class A+', desc: 'Unrestricted medical clearance.' }
                  ].map((item, i) => (
                    <div key={i} className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
                       <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">{item.label}</p>
                       <p className="text-xl font-black text-white tracking-tight mb-2">{item.value}</p>
                       <p className="text-xs font-bold text-slate-500 leading-tight">{item.desc}</p>
                    </div>
                  ))}
               </div>
            </div>
          </div>
          {/* Filters Section */}
          <section className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-blue-900/10 border border-slate-100 dark:border-slate-800" aria-labelledby="filters-title">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/40 rounded-xl text-blue-600 dark:text-blue-400" aria-hidden="true">
                <Search size={18} />
              </div>
              <h3 id="filters-title" className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Filter Records</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <InputField 
                label="Patient Name" 
                value={filterPatientName} 
                onChange={setFilterPatientName} 
                placeholder="Search by name..." 
                icon={<User size={14} />} 
              />
              
              <InputField 
                label="Medication Name" 
                value={filterMedName} 
                onChange={setFilterMedName} 
                placeholder="Search medications..." 
                icon={<Pill size={14} />} 
              />

              <SelectField 
                label="Medication Type" 
                value={filterMedType} 
                onChange={setFilterMedType} 
                options={ALL_CATEGORIES} 
              />
              
              <div className="grid grid-cols-2 gap-2">
                <InputField 
                  label="From Date" 
                  value={filterStartDate} 
                  onChange={setFilterStartDate} 
                  type="date" 
                />
                
                <InputField 
                  label="To Date" 
                  value={filterEndDate} 
                  onChange={setFilterEndDate} 
                  type="date" 
                />
              </div>
            </div>
            
            {(filterPatientName || filterMedType !== 'All Types' || filterStartDate || filterEndDate) && (
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={() => {
                    setFilterPatientName('');
                    setFilterMedType('All Types');
                    setFilterStartDate('');
                    setFilterEndDate('');
                  }}
                  className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </section>

          {isLoading ? (
            <div className="space-y-4" role="status" aria-label="Loading records">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-6 animate-pulse">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded-full w-48" />
                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full w-64" />
                  </div>
                </div>
              ))}
            </div>
          ) : savedPrescriptions.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-20 rounded-[3rem] text-center border-2 border-dashed border-slate-100 dark:border-slate-800" role="status">
              <ClipboardList size={64} className="mx-auto text-slate-200 dark:text-slate-800 mb-6" aria-hidden="true" />
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No Records Yet</h3>
              <p className="text-slate-400 dark:text-slate-500 font-medium mb-8">Start by creating a new prescription for your patient.</p>
              <button onClick={() => setActiveTab('compose')} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/20">
                Create First Record
              </button>
            </div>
          ) : filteredPrescriptions.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-16 rounded-[2.5rem] text-center border border-slate-100 dark:border-slate-800 shadow-sm" role="status">
              <Search size={48} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" aria-hidden="true" />
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">No matches found</h3>
              <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">Try adjusting your filters to find what you're looking for.</p>
            </div>
          ) : (
            <div className="space-y-4" role="list">
              {filteredPrescriptions.map((rx) => (
                <motion.article
                  key={rx.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="listitem"
                  className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-blue-900/10 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-6"
                >
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0" aria-hidden="true">
                    <FileText size={32} />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">{rx.patient.name}</h3>
                    <p className="text-slate-400 dark:text-slate-500 text-sm font-bold tracking-tight">
                      {rx.diagnosis} • {formatDate(rx.date)} • {rx.medications.length} Medications
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => loadPrescription(rx)} 
                      className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                      aria-label={`Edit ${rx.patient.name}'s record`}
                    >Edit</button>
                    <button 
                      onClick={() => deletePrescription(rx.id)} 
                      className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 px-6 py-3 rounded-xl font-bold hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all"
                      aria-label={`Delete ${rx.patient.name}'s record`}
                    >Delete</button>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ═══════════════════════════════════════════════════
          TEMPLATES TAB
          ═══════════════════════════════════════════════════ */}
      {activeTab === 'templates' && (
        <section 
          id="templates-panel"
          role="tabpanel"
          aria-labelledby="tab-templates"
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {[
            { name: 'Respiratory Infection', icon: <Thermometer />, color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400', meds: ['Amoxicillin 500mg', 'Paracetamol 500mg'], diagnosis: 'Acute Respiratory Infection' },
            { name: 'Hypertension', icon: <Heart />, color: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400', meds: ['Lisinopril 10mg', 'Amlodipine 5mg'], diagnosis: 'Essential Hypertension' },
            { name: 'Diabetes Care', icon: <Activity />, color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400', meds: ['Metformin 500mg', 'Atorvastatin 20mg'], diagnosis: 'Type 2 Diabetes Mellitus' },
            { name: 'Asthma Management', icon: <Wind />, color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400', meds: ['Salbutamol Inhaler', 'Cetirizine 10mg'], diagnosis: 'Bronchial Asthma' },
            { name: 'GERD / Acid Reflux', icon: <Droplets />, color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400', meds: ['Omeprazole 20mg'], diagnosis: 'Gastroesophageal Reflux Disease' },
            { name: 'Migraine Relief', icon: <Zap />, color: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400', meds: ['Ibuprofen 400mg', 'Paracetamol 500mg'], diagnosis: 'Acute Migraine Attack' },
            { name: 'Mental Wellness', icon: <Brain />, color: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400', meds: ['Cetirizine 10mg'], diagnosis: 'Generalized Anxiety Disorder' },
            { name: 'Hyperlipidemia', icon: <Activity />, color: 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400', meds: ['Atorvastatin 20mg'], diagnosis: 'Hypercholesterolemia' },
            { name: 'UTI Protocol', icon: <Droplets />, color: 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400', meds: ['Amoxicillin 500mg'], diagnosis: 'Urinary Tract Infection' },
          ].map((t, i) => (
            <button
              key={i}
              onClick={() => {
                const templateMeds = t.meds.map(name => {
                  const common = COMMON_MEDICATIONS.find(cm => cm.name === name);
                  return { 
                    ...emptyMedication(), 
                    name,
                    dosage: common?.dosage || '',
                    route: common?.route || 'Oral (PO)',
                    frequency: common?.frequency || 'Once daily'
                  };
                });
                setPrescription(prev => ({ ...prev, medications: templateMeds, diagnosis: t.diagnosis }));
                setExpandedMeds(new Set(templateMeds.map(m => m.id)));
                setStep(3);
                setActiveTab('compose');
                showToast(`${t.name} template applied`);
              }}
              className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 text-left hover:scale-[1.02] transition-all group"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${t.color} group-hover:scale-110 transition-transform`} aria-hidden="true">
                {t.icon}
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{t.name}</h3>
              <p className="text-slate-400 dark:text-slate-500 text-sm font-medium mb-6">{t.diagnosis}</p>
              <div className="flex flex-wrap gap-2" aria-label="Medications in template">
                {t.meds.map((m, j) => (
                  <span key={j} className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">{m}</span>
                ))}
              </div>
            </button>
          ))}
        </section>
      )}

      {/* Print Preview Modal */}
      <AnimatePresence>
        {showPrintPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowPrintPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="print-preview-title"
              className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-12 border border-slate-100 dark:border-slate-800"
              onClick={e => e.stopPropagation()}
            >
              <div className="border-b-4 border-blue-600 pb-8 mb-8 text-center">
                <h1 id="print-preview-title" className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">DOCTORIAN<span className="text-blue-600">AI</span> MEDICAL</h1>
                <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] mt-2">Digital Prescription Record</p>
              </div>
              
              <div className="grid grid-cols-2 gap-12 mb-12">
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Patient Details</h4>
                  <p className="text-lg font-black text-slate-900 dark:text-white">{prescription.patient.name || 'N/A'}</p>
                  <p className="text-slate-500 dark:text-slate-400 font-bold">{prescription.patient.age} Years • {prescription.patient.gender}</p>
                </div>
                <div className="text-right">
                  <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Record Info</h4>
                  <p className="font-black text-slate-900 dark:text-white">{formatDate(prescription.date)}</p>
                  <p className="text-blue-600 dark:text-blue-400 font-black text-xs uppercase tracking-widest">ID: {prescription.id.toUpperCase()}</p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl mb-8">
                <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Diagnosis</h4>
                <p className="text-lg font-black text-slate-900 dark:text-white">{prescription.diagnosis || 'No diagnosis recorded'}</p>
              </div>

              <div className="space-y-6 mb-12">
                <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Medications</h4>
                {prescription.medications.filter(m => m.name).map((m, i) => (
                  <div key={i} className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4 last:border-0">
                    <div>
                      <p className="font-black text-slate-900 dark:text-white">{m.name}</p>
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{m.dosage} • {m.frequency}</p>
                    </div>
                    <p className="text-slate-400 dark:text-slate-500 font-bold text-sm">{m.duration}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button onClick={() => window.print()} className="flex-1 bg-slate-900 dark:bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-slate-800 dark:hover:bg-blue-700 transition-all">Print Record</button>
                <button onClick={() => setShowPrintPreview(false)} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white py-4 rounded-2xl font-black hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};
