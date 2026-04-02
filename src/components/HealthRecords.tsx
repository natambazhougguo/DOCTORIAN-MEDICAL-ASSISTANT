import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Pill, Plus, Trash2, Clock, Calendar, AlertTriangle,
  FileText, Search, ChevronDown, Printer, Download,
  CheckCircle2, XCircle, Info, User, Hash,
  ClipboardList, Beaker, Stethoscope, ChevronUp,
  Sparkles, Shield, Heart, Activity, Eye, EyeOff, Share2,
  Scale
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
  Antibiotic: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  NSAID: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  Antidiabetic: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  Statin: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  Analgesic: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  Antihistamine: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  Bronchodilator: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
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
  return warnings;
};

// ─── Sub Components ────────────────────────────────────────

const SectionHeader: React.FC<{
  icon: React.ReactNode; title: string; subtitle?: string;
  action?: React.ReactNode;
}> = ({ icon, title, subtitle, action }) => (
  <div className="flex items-start justify-between gap-4 mb-6">
    <div className="flex items-start gap-3">
      <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-2.5 rounded-xl h-fit shadow-sm">{icon}</div>
      <div>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {action}
  </div>
);

const InputField: React.FC<{
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; icon?: React.ReactNode; error?: boolean;
}> = ({ label, value, onChange, type = 'text', placeholder, icon, error }) => (
  <div>
    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">{label}</label>
    <div className="relative group">
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors">{icon}</div>}
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className={`w-full bg-white/70 border rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 focus:bg-white transition-all ${icon ? 'pl-10' : ''} ${error ? 'border-red-300 focus:ring-red-500/20 focus:border-red-300' : 'border-gray-200'}`}
      />
    </div>
  </div>
);

const SelectField: React.FC<{
  label: string; value: string; onChange: (v: string) => void; options: string[];
}> = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">{label}</label>
    <div className="relative group">
      <select
        value={value} onChange={e => onChange(e.target.value)}
        className="w-full appearance-none bg-white/70 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 focus:bg-white transition-all pr-8"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
    </div>
  </div>
);

const ToastContainer: React.FC<{ toasts: Toast[]; onDismiss: (id: string) => void }> = ({ toasts, onDismiss }) => (
  <div className="fixed top-4 right-4 z-[100] space-y-2 pointer-events-none">
    {toasts.map(t => (
      <div
        key={t.id}
        className={`animate-toastIn pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border backdrop-blur-md text-sm font-medium ${
          t.type === 'success' ? 'bg-emerald-50/95 border-emerald-200 text-emerald-800' :
          t.type === 'error' ? 'bg-red-50/95 border-red-200 text-red-800' :
          t.type === 'warning' ? 'bg-amber-50/95 border-amber-200 text-amber-800' :
          'bg-blue-50/95 border-blue-200 text-blue-800'
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
  const [savedPrescriptions, setSavedPrescriptions] = useState<Prescription[]>([
    {
      id: 'rx-782',
      doctorName: 'Dr. Akora Joseph',
      date: new Date().toISOString().split('T')[0],
      diagnosis: 'Acute Bronchitis & Seasonal Allergies',
      patient: {
        name: 'Jane Cooper',
        age: '28',
        gender: 'Female',
        weight: '62',
        bloodType: 'A+',
        allergies: 'Penicillin, Dust Mites',
        phone: '+1 555-0123',
        address: '456 Medical Pkwy, Suite 200'
      },
      medications: [
        {
          id: 'med-1',
          name: 'Amoxicillin 500mg',
          dosage: '500mg',
          frequency: 'Three times daily',
          duration: '7 days',
          route: 'Oral (PO)',
          instructions: 'Take after meals. Complete the full course.',
          startDate: new Date().toISOString().split('T')[0],
          endDate: calcEndDate(new Date().toISOString().split('T')[0], '7 days'),
          quantity: 21,
          refills: 0,
          status: 'active'
        },
        {
          id: 'med-2',
          name: 'Cetirizine 10mg',
          dosage: '10mg',
          frequency: 'Once daily',
          duration: '14 days',
          route: 'Oral (PO)',
          instructions: 'Take at bedtime. May cause mild drowsiness.',
          startDate: new Date().toISOString().split('T')[0],
          endDate: calcEndDate(new Date().toISOString().split('T')[0], '14 days'),
          quantity: 14,
          refills: 1,
          status: 'active'
        }
      ],
      notes: 'Patient presents with persistent cough and nasal congestion. Lungs clear on auscultation. Advised increased fluid intake and rest.'
    },
    {
      id: 'rx-901',
      doctorName: 'Dr. Sarah Wilson',
      date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
      diagnosis: 'Essential Hypertension',
      patient: {
        name: 'Robert Fox',
        age: '54',
        gender: 'Male',
        weight: '88',
        bloodType: 'O-',
        allergies: 'None',
        phone: '+1 555-0199',
        address: '789 Health Blvd'
      },
      medications: [
        {
          id: 'med-3',
          name: 'Lisinopril 10mg',
          dosage: '10mg',
          frequency: 'Once daily',
          duration: '30 days',
          route: 'Oral (PO)',
          instructions: 'Take in the morning. Monitor blood pressure weekly.',
          startDate: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
          endDate: calcEndDate(new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0], '30 days'),
          quantity: 30,
          refills: 3,
          status: 'active'
        }
      ],
      notes: 'Blood pressure remains elevated (145/92). Starting low dose ACE inhibitor. Follow up in 4 weeks.'
    }
  ]);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'compose' | 'saved' | 'templates'>('compose');
  const [toasts, setToasts] = useState<Toast[]>([]);
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

  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = generateId();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const updatePatient = useCallback((field: keyof PatientInfo, value: string) => {
    setPrescription(prev => ({ ...prev, patient: { ...prev.patient, [field]: value } }));
  }, []);

  const updatePrescription = useCallback((field: string, value: string) => {
    setPrescription(prev => ({ ...prev, [field]: value }));
  }, []);

  const addMedication = () => {
    const newMed = emptyMedication();
    setPrescription(prev => ({ ...prev, medications: [...prev.medications, newMed] }));
    setExpandedMeds(prev => new Set([...prev, newMed.id]));
    showToast('New medication slot added', 'info');
  };

  const updateMedication = useCallback((id: string, field: keyof Medication, value: string | number) => {
    setPrescription(prev => ({
      ...prev,
      medications: prev.medications.map(m => m.id === id ? { ...m, [field]: value } : m),
    }));
  }, []);

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

  const savePrescription = () => {
    if (!prescription.patient.name.trim()) { showToast('Patient name is required', 'error'); return; }
    const filledMeds = prescription.medications.filter(m => m.name.trim());
    if (filledMeds.length === 0) { showToast('Add at least one medication', 'error'); return; }
    setSavedPrescriptions(prev => [{ ...prescription, id: generateId() }, ...prev]);
    setPrescription(prev => ({
      ...prev, id: generateId(), medications: [emptyMedication()], notes: '', diagnosis: '',
    }));
    setStep(1);
    setActiveTab('saved');
    showToast('Prescription saved successfully!', 'success');
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

  // ─── Render ─────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
      <ToastContainer toasts={toasts} onDismiss={id => setToasts(prev => prev.filter(t => t.id !== id))} />

      {/* ── Header ────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-start sm:items-center gap-4 mb-1">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-blue-500/20">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Health Records</h1>
              <span className="hidden sm:inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                Verified
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-0.5">Comprehensive medical history and prescription tracking</p>
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <div className="text-center px-5 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-2xl font-black text-slate-800">{savedPrescriptions.length}</p>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Total Records</p>
            </div>
            <div className="text-center px-5 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-2xl font-black text-blue-600">{totalMeds}</p>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Active Meds</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Patient Overview ──────────────────────────── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Blood Type', value: 'A+', icon: <Heart className="text-rose-500" />, color: 'bg-rose-50' },
          { label: 'Height', value: '175 cm', icon: <Scale className="text-blue-500" />, color: 'bg-blue-50' },
          { label: 'Weight', value: '68 kg', icon: <Activity className="text-emerald-500" />, color: 'bg-emerald-50' },
          { label: 'Last Checkup', value: 'Mar 15, 2026', icon: <Calendar className="text-indigo-500" />, color: 'bg-indigo-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`${stat.color} p-3 rounded-2xl`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-lg font-black text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Progress Bar ──────────────────────────────── */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Prescription Progress</span>
          <span className="text-xs font-black text-blue-600">{completeness}%</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completeness}%` }}
            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600"
          />
        </div>
        <div className="flex gap-6 mt-4">
          {[
            { label: 'Patient Info', done: isPatientValid },
            { label: 'Diagnosis', done: isDiagnosisValid },
            { label: 'Medications', done: totalMeds > 0 },
            { label: 'Complete', done: completeness === 100 },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full transition-colors ${s.done ? 'bg-emerald-500' : 'bg-slate-200'}`} />
              <span className={`text-[11px] font-bold uppercase tracking-wider transition-colors ${s.done ? 'text-emerald-700' : 'text-slate-400'}`}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tab Navigation ────────────────────────────── */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 bg-white/50 backdrop-blur-md rounded-[2rem] p-2 shadow-inner border border-slate-100 mb-10">
        {(['compose', 'saved', 'templates'] as const).map(tab => (
          <button
            key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 px-6 py-4 rounded-[1.5rem] text-sm font-black transition-all duration-300 ${
              activeTab === tab
                ? 'bg-slate-900 text-white shadow-xl shadow-slate-400/20 scale-[1.02]'
                : 'text-slate-500 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            {tab === 'compose' && <Pill size={18} />}
            {tab === 'saved' && <ClipboardList size={18} />}
            {tab === 'templates' && <Sparkles size={18} />}
            <span className="capitalize">{tab === 'compose' ? 'New Prescription' : tab === 'saved' ? `Saved (${savedPrescriptions.length})` : tab}</span>
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════
          COMPOSE TAB
          ═══════════════════════════════════════════════════ */}
      {activeTab === 'compose' && (
        <div className="space-y-8">
          {/* Step Indicator */}
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <button
                  onClick={() => setStep(s)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-sm font-black transition-all shrink-0 ${
                    step === s
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                      : step > s
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {step > s ? <CheckCircle2 size={18} /> : <span className="w-6 h-6 flex items-center justify-center rounded-full border-2 border-current text-xs">{s}</span>}
                  <span>{s === 1 ? 'Patient' : s === 2 ? 'Diagnosis' : 'Medications'}</span>
                </button>
                {s < 3 && <div className={`w-12 h-1 rounded-full shrink-0 ${step > s ? 'bg-emerald-200' : 'bg-slate-100'}`} />}
              </React.Fragment>
            ))}
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100"
              >
                <SectionHeader icon={<User className="text-blue-600" />} title="Patient Information" subtitle="Basic identity and contact details" />
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <InputField label="Full Name *" value={prescription.patient.name} onChange={v => updatePatient('name', v)} placeholder="John Doe" icon={<User size={16} />} error={!isPatientValid} />
                  <InputField label="Age" value={prescription.patient.age} onChange={v => updatePatient('age', v)} placeholder="35" type="number" icon={<Calendar size={16} />} />
                  <SelectField label="Gender" value={prescription.patient.gender} onChange={v => updatePatient('gender', v)} options={['Male', 'Female', 'Other']} />
                  <InputField label="Weight (kg)" value={prescription.patient.weight} onChange={v => updatePatient('weight', v)} placeholder="70" type="number" icon={<Hash size={16} />} />
                  <SelectField label="Blood Type" value={prescription.patient.bloodType} onChange={v => updatePatient('bloodType', v)} options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown']} />
                  <InputField label="Phone" value={prescription.patient.phone} onChange={v => updatePatient('phone', v)} placeholder="+1 234 567 890" type="tel" />
                  <div className="sm:col-span-2">
                    <InputField label="Address" value={prescription.patient.address} onChange={v => updatePatient('address', v)} placeholder="123 Medical Street, City" />
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
                  <InputField value={prescription.patient.allergies} onChange={v => updatePatient('allergies', v)} placeholder="Other allergies..." />
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
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100"
              >
                <SectionHeader icon={<Stethoscope className="text-indigo-600" />} title="Clinical Assessment" subtitle="Diagnosis and medical notes" />
                <div className="space-y-6">
                  <InputField label="Primary Diagnosis *" value={prescription.diagnosis} onChange={v => updatePrescription('diagnosis', v)} placeholder="e.g., Acute bronchitis" error={!isDiagnosisValid} />
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Additional Notes</label>
                    <textarea
                      value={prescription.notes} onChange={e => updatePrescription('notes', e.target.value)}
                      placeholder="Clinical observations, lifestyle advice..."
                      rows={4}
                      className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-50 transition-all outline-none"
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
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100"
              >
                <div className="flex items-center justify-between mb-8">
                  <SectionHeader icon={<Pill className="text-emerald-600" />} title="Medications" subtitle="Prescribe drugs and dosages" />
                  <div className="flex gap-3" ref={searchRef}>
                    <div className="relative">
                      <button onClick={() => setShowMedSearch(!showMedSearch)} className="bg-slate-100 text-slate-600 px-5 py-3 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all flex items-center gap-2">
                        <Search size={16} /> Quick Add
                      </button>
                      <AnimatePresence>
                        {showMedSearch && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute right-0 top-full mt-4 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
                          >
                            <div className="p-4 bg-slate-50 border-b border-slate-100">
                              <input
                                type="text" value={medSearch} onChange={e => setMedSearch(e.target.value)}
                                placeholder="Search drugs..."
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                                autoFocus
                              />
                            </div>
                            <div className="max-h-64 overflow-y-auto p-2 space-y-1">
                              {COMMON_MEDICATIONS.filter(m => m.name.toLowerCase().includes(medSearch.toLowerCase())).map((med, i) => (
                                <button
                                  key={i} onClick={() => selectCommonMed(med)}
                                  className="w-full text-left px-4 py-3 rounded-xl hover:bg-blue-50 transition-colors group"
                                >
                                  <p className="text-sm font-bold text-slate-800 group-hover:text-blue-700">{med.name}</p>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{med.category}</p>
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <button onClick={addMedication} className="bg-blue-600 text-white px-5 py-3 rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2">
                      <Plus size={16} /> Add Med
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {prescription.medications.map((med, index) => {
                    const isExpanded = expandedMeds.has(med.id);
                    const category = getMedCategory(med.name);
                    const catColor = CATEGORY_COLORS[category] || { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100' };

                    return (
                      <div key={med.id} className={`rounded-3xl border-2 transition-all ${isExpanded ? 'border-blue-100 bg-blue-50/10' : 'border-slate-50 bg-white'}`}>
                        <button
                          onClick={() => setExpandedMeds(prev => {
                            const s = new Set(prev);
                            s.has(med.id) ? s.delete(med.id) : s.add(med.id);
                            return s;
                          })}
                          className="w-full flex items-center gap-4 px-6 py-5 text-left"
                        >
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm ${med.name ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            {med.name ? (
                              <div className="flex items-center gap-3">
                                <span className="font-black text-slate-900">{med.name}</span>
                                {category && <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest ${catColor.bg} ${catColor.text}`}>{category}</span>}
                              </div>
                            ) : (
                              <span className="text-slate-400 font-bold">Add medication details...</span>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <button onClick={e => { e.stopPropagation(); removeMedication(med.id); }} className="text-slate-300 hover:text-rose-500 transition-colors">
                              <Trash2 size={18} />
                            </button>
                            {isExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                          </div>
                        </button>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="px-6 pb-8 pt-2 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                <InputField label="Drug Name *" value={med.name} onChange={v => updateMedication(med.id, 'name', v)} placeholder="e.g., Amoxicillin" />
                                <InputField label="Dosage" value={med.dosage} onChange={v => updateMedication(med.id, 'dosage', v)} placeholder="e.g., 500mg" />
                                <SelectField label="Frequency" value={med.frequency} onChange={v => updateMedication(med.id, 'frequency', v)} options={FREQUENCIES} />
                                <SelectField label="Route" value={med.route} onChange={v => updateMedication(med.id, 'route', v)} options={ROUTES} />
                                <InputField label="Duration" value={med.duration} onChange={v => updateMedication(med.id, 'duration', v)} placeholder="e.g., 7 days" />
                                <InputField label="Start Date" value={med.startDate} onChange={v => updateMedication(med.id, 'startDate', v)} type="date" />
                                <div className="sm:col-span-3">
                                  <InputField label="Instructions" value={med.instructions} onChange={v => updateMedication(med.id, 'instructions', v)} placeholder="Take after meals..." />
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

                {interactions.length > 0 && (
                  <div className="mt-8 space-y-3">
                    {interactions.map((w, i) => (
                      <div key={i} className={`p-4 rounded-2xl border-2 flex gap-4 items-center ${w.severity === 'high' ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
                        <AlertTriangle size={20} />
                        <p className="text-sm font-bold">{w.message}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-12 flex flex-col sm:flex-row gap-4">
                  <button onClick={savePrescription} disabled={completeness < 50} className="flex-1 bg-slate-900 text-white py-5 rounded-3xl font-black text-lg hover:bg-slate-800 transition-all shadow-2xl shadow-slate-400/20 disabled:opacity-30">
                    Save Prescription
                  </button>
                  <button onClick={() => setShowPrintPreview(true)} className="px-10 py-5 rounded-3xl border-2 border-slate-100 font-black text-slate-900 hover:bg-slate-50 transition-all">
                    Preview & Print
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          SAVED TAB
          ═══════════════════════════════════════════════════ */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          {savedPrescriptions.length === 0 ? (
            <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-slate-100">
              <ClipboardList size={64} className="mx-auto text-slate-200 mb-6" />
              <h3 className="text-2xl font-black text-slate-900 mb-2">No Records Yet</h3>
              <p className="text-slate-400 font-medium mb-8">Start by creating a new prescription for your patient.</p>
              <button onClick={() => setActiveTab('compose')} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                Create First Record
              </button>
            </div>
          ) : (
            savedPrescriptions.map((rx) => (
              <motion.div
                key={rx.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col sm:flex-row items-center gap-6"
              >
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                  <FileText size={32} />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-xl font-black text-slate-900 mb-1">{rx.patient.name}</h3>
                  <p className="text-slate-400 text-sm font-bold tracking-tight">
                    {rx.diagnosis} • {formatDate(rx.date)} • {rx.medications.length} Medications
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => loadPrescription(rx)} className="bg-slate-50 text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-slate-100 transition-all">Edit</button>
                  <button onClick={() => deletePrescription(rx.id)} className="bg-rose-50 text-rose-600 px-6 py-3 rounded-xl font-bold hover:bg-rose-100 transition-all">Delete</button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          TEMPLATES TAB
          ═══════════════════════════════════════════════════ */}
      {activeTab === 'templates' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: 'Respiratory Infection', icon: <Activity />, color: 'bg-emerald-50 text-emerald-600', meds: ['Amoxicillin', 'Paracetamol'], diagnosis: 'Acute Respiratory Infection' },
            { name: 'Hypertension', icon: <Heart />, color: 'bg-rose-50 text-rose-600', meds: ['Lisinopril', 'Amlodipine'], diagnosis: 'Essential Hypertension' },
            { name: 'Diabetes Care', icon: <Beaker />, color: 'bg-purple-50 text-purple-600', meds: ['Metformin', 'Atorvastatin'], diagnosis: 'Type 2 Diabetes' },
          ].map((t, i) => (
            <button
              key={i}
              onClick={() => {
                const templateMeds = t.meds.map(name => ({ ...emptyMedication(), name }));
                setPrescription(prev => ({ ...prev, medications: templateMeds, diagnosis: t.diagnosis }));
                setExpandedMeds(new Set(templateMeds.map(m => m.id)));
                setStep(3);
                setActiveTab('compose');
                showToast(`${t.name} template applied`);
              }}
              className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 text-left hover:scale-[1.02] transition-all group"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${t.color} group-hover:scale-110 transition-transform`}>
                {t.icon}
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">{t.name}</h3>
              <p className="text-slate-400 text-sm font-medium mb-6">{t.diagnosis}</p>
              <div className="flex flex-wrap gap-2">
                {t.meds.map((m, j) => (
                  <span key={j} className="bg-slate-50 text-slate-500 text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">{m}</span>
                ))}
              </div>
            </button>
          ))}
        </div>
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
              className="bg-white rounded-[3rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-12"
              onClick={e => e.stopPropagation()}
            >
              <div className="border-b-4 border-blue-600 pb-8 mb-8 text-center">
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter">DOCTORIAN<span className="text-blue-600">AI</span> MEDICAL</h1>
                <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-2">Digital Prescription Record</p>
              </div>
              
              <div className="grid grid-cols-2 gap-12 mb-12">
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Patient Details</h4>
                  <p className="text-lg font-black text-slate-900">{prescription.patient.name || 'N/A'}</p>
                  <p className="text-slate-500 font-bold">{prescription.patient.age} Years • {prescription.patient.gender}</p>
                </div>
                <div className="text-right">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Record Info</h4>
                  <p className="font-black text-slate-900">{formatDate(prescription.date)}</p>
                  <p className="text-blue-600 font-black text-xs uppercase tracking-widest">ID: {prescription.id.toUpperCase()}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-3xl mb-8">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Diagnosis</h4>
                <p className="text-lg font-black text-slate-900">{prescription.diagnosis || 'No diagnosis recorded'}</p>
              </div>

              <div className="space-y-6 mb-12">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Medications</h4>
                {prescription.medications.filter(m => m.name).map((m, i) => (
                  <div key={i} className="flex justify-between items-start border-b border-slate-100 pb-4 last:border-0">
                    <div>
                      <p className="font-black text-slate-900">{m.name}</p>
                      <p className="text-slate-500 text-sm font-medium">{m.dosage} • {m.frequency}</p>
                    </div>
                    <p className="text-slate-400 font-bold text-sm">{m.duration}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button onClick={() => window.print()} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-slate-800 transition-all">Print Record</button>
                <button onClick={() => setShowPrintPreview(false)} className="flex-1 bg-slate-100 text-slate-900 py-4 rounded-2xl font-black hover:bg-slate-200 transition-all">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
