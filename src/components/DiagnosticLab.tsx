import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../api';
import { 
  Dna, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Activity,
  ArrowRight,
  Info,
  Thermometer,
  Wind,
  Plus,
  Trash2,
  Brain,
  Heart,
  Stethoscope as StethoscopeIcon,
  ShieldCheck,
  Zap,
  ChevronRight,
  Clock,
  History,
  RefreshCw,
  FlaskConical,
  Microscope,
  FileText,
  Upload,
  ArrowUpRight,
  Database,
  Beaker
} from 'lucide-react';
import { SymptomChecker } from './SymptomChecker';

interface LabTest {
  id: string;
  name: string;
  category: 'Blood' | 'Urine' | 'Imaging' | 'Genetic' | 'Cognitive';
  status: 'Pending' | 'Completed' | 'Analyzed';
  date: string;
  result?: string;
  unit?: string;
  referenceRange?: string;
  isNormal?: boolean;
}

export const DiagnosticLab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'symptoms' | 'tests' | 'analysis'>('symptoms');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [labTests, setLabTests] = useState<LabTest[]>([
    {
      id: '1',
      name: 'Glucose (HbA1c)',
      category: 'Blood',
      status: 'Completed',
      date: '2026-04-28',
      result: '5.4',
      unit: '%',
      referenceRange: '4.0 - 5.6',
      isNormal: true
    },
    {
      id: '2',
      name: 'Dopamine Synthesis Index',
      category: 'Genetic',
      status: 'Analyzed',
      date: '2026-04-10',
      result: '88',
      unit: 'PSI',
      referenceRange: '70 - 100',
      isNormal: true
    },
    {
      id: '3',
      name: 'Cortisol (Am)',
      category: 'Blood',
      status: 'Completed',
      date: '2026-05-01',
      result: '22.4',
      unit: 'µg/dL',
      referenceRange: '6.2 - 19.4',
      isNormal: false
    }
  ]);

  const [showAddTest, setShowAddTest] = useState(false);
  const [newTest, setNewTest] = useState<Partial<LabTest>>({
    category: 'Blood',
    status: 'Completed'
  });

  const handleAddTest = () => {
    if (newTest.name && newTest.result) {
      const test: LabTest = {
        id: Math.random().toString(36).substr(2, 9),
        name: newTest.name!,
        category: newTest.category as any,
        status: 'Completed',
        date: new Date().toISOString().split('T')[0],
        result: newTest.result,
        unit: newTest.unit || '',
        referenceRange: newTest.referenceRange || '',
        isNormal: true // Default normal for now
      };
      setLabTests([test, ...labTests]);
      setShowAddTest(false);
      setNewTest({ category: 'Blood', status: 'Completed' });
    }
  };

  const [aiSynthesisResult, setAiSynthesisResult] = useState<string | null>(null);

  const runClinicalSynthesis = async () => {
    setIsAnalyzing(true);
    setAiSynthesisResult(null);
    try {
      const testsSummary = labTests.map(t => `- ${t.name}: ${t.result} ${t.unit} (Normal: ${t.isNormal})`).join('\n');
      const prompt = `Act as a Senior Clinical Strategist. Synthesize the following lab test results and any identified symptoms into a cohesive medical insight.
      
      Lab Results:
      ${testsSummary}
      
      Provide a comprehensive 3-paragraph synthesis covering:
      1. Physiological State: Current metabolic and homeostatic baseline.
      2. Priority Drift: Any significant anomalies needing attention.
      3. Strategic Direction: Clinical next steps and specialized screenings recommended.
      
      Maintain a professional, highly technical, yet actionable tone. Use 'Cognis-Protocol' terminology.`;

      const response = await api.ai.geminiChat(prompt, "You are a clinical synthesis engine.");
      setAiSynthesisResult(response.text);
    } catch (err) {
      setAiSynthesisResult("Synthesis failed to achieve neural synchronization. Please verify biometric data stream integrity.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-slate-100 dark:border-slate-800 pb-8">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-800 mb-4"
          >
            <FlaskConical size={12} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Diagnostic Hub Active</span>
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-2">
            AI Cognis <span className="text-blue-600">Lab</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">Integrated Clinical Diagnostic System</p>
        </div>

        <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          {[
            { id: 'symptoms', label: 'Symptom Mapper', icon: <Activity size={16} /> },
            { id: 'tests', label: 'Lab Records', icon: <FlaskConical size={16} /> },
            { id: 'analysis', label: 'Clinical AI', icon: <Brain size={16} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-black uppercase tracking-tight transition-all ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'symptoms' && (
          <motion.div
            key="symptoms"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <SymptomChecker />
          </motion.div>
        )}

        {activeTab === 'tests' && (
          <motion.div
            key="tests"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Stats Sidebar */}
              <div className="lg:col-span-3 space-y-6">
                <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Microscope size={120} />
                  </div>
                  <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-6">Test Analytics</p>
                    <div className="space-y-6">
                      <div>
                        <span className="text-4xl font-black tracking-tighter block">{labTests.length}</span>
                        <span className="text-[10px] font-black uppercase text-blue-400">Total Recorded</span>
                      </div>
                      <div className="h-px bg-white/10" />
                      <div>
                        <span className="text-4xl font-black tracking-tighter block text-rose-500">
                          {labTests.filter(t => !t.isNormal).length}
                        </span>
                        <span className="text-[10px] font-black uppercase text-rose-400">Out of Range</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Quick Filters</h3>
                  <div className="space-y-3">
                    {['Ailment Sync', 'Full Metabolism', 'Hormonal Suite', 'Bio-Markers'].map((filter) => (
                      <button key={filter} className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group">
                        <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase group-hover:text-blue-600">{filter}</span>
                        <ArrowUpRight size={14} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-9 space-y-8">
                <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600">
                        <FileText size={24} />
                      </div>
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Clinical Records</h2>
                    </div>
                    <button 
                      onClick={() => setShowAddTest(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-xs font-black uppercase tracking-widest hover:scale-[1.05] transition-all shadow-xl active:scale-95"
                    >
                      <Plus size={16} />
                      Manual Entry
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800">
                          <th className="text-left py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Test / Marker</th>
                          <th className="text-left py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Category</th>
                          <th className="text-left py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Result</th>
                          <th className="text-left py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Reference</th>
                          <th className="text-left py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                        {labTests.map((test) => (
                          <tr key={test.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                            <td className="py-6 px-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                  test.isNormal ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 animate-pulse'
                                }`}>
                                  <Beaker size={14} />
                                </div>
                                <div>
                                  <p className="text-sm font-black text-slate-900 dark:text-white uppercase leading-none mb-1">{test.name}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{test.date}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-6 px-4">
                              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                {test.category}
                              </span>
                            </td>
                            <td className="py-6 px-4">
                              <div className="flex items-baseline gap-1">
                                <span className={`text-lg font-black ${test.isNormal ? 'text-slate-900 dark:text-white' : 'text-rose-600'}`}>
                                  {test.result}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">{test.unit}</span>
                              </div>
                            </td>
                            <td className="py-6 px-4">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">{test.referenceRange}</span>
                            </td>
                            <td className="py-6 px-4">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 size={14} className={test.status === 'Analyzed' ? 'text-blue-500' : 'text-slate-300'} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{test.status}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-emerald-600 text-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform duration-700">
                      <Upload size={140} />
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-2xl font-black uppercase tracking-tighter leading-none mb-4">Batch OCR Upload</h3>
                      <p className="text-emerald-50 text-sm font-bold opacity-80 mb-8 max-w-xs">Scan and digitize your physical lab results instantly using AI vision.</p>
                      <button className="px-8 py-4 bg-white text-emerald-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-50 transition-all shadow-xl">
                        Start Scanner
                      </button>
                    </div>
                  </div>

                  <div className="bg-blue-600 text-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform duration-700">
                      <Database size={140} />
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-2xl font-black uppercase tracking-tighter leading-none mb-4">Cognis Direct Sink</h3>
                      <p className="text-blue-50 text-sm font-bold opacity-80 mb-8 max-w-xs">Auto-import clinical data from authorized laboratory networks.</p>
                      <button className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-50 transition-all shadow-xl">
                        Link API Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'analysis' && (
          <motion.div
            key="analysis"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-5xl mx-auto"
          >
            {!aiSynthesisResult ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-xl">
                <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-[2.5rem] flex items-center justify-center text-blue-600 mb-8 border border-blue-100 dark:border-blue-800/50">
                  <Brain size={48} className="animate-pulse" />
                </div>
                <h2 className="text-4xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter mb-4">Neural Synthesis</h2>
                <p className="text-slate-500 dark:text-slate-400 font-bold max-w-md mx-auto mb-12 uppercase tracking-widest text-[10px]">Combine biological symptoms with recent lab markers for a 360° clinical insight.</p>
                <button 
                  onClick={runClinicalSynthesis}
                  disabled={isAnalyzing}
                  className="px-12 py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-4 disabled:opacity-50"
                >
                  {isAnalyzing ? <RefreshCw className="animate-spin" /> : <Zap />}
                  {isAnalyzing ? 'SYNTHESIZING MATRIX...' : 'START SYNTHESIS'}
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="bg-slate-900 text-white rounded-[3.5rem] p-12 border border-slate-800 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
                    <Activity size={240} />
                  </div>
                  <div className="relative z-10">
                     <div className="flex items-center gap-4 mb-10">
                        <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                           <Brain className="text-blue-400" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-1">Clinical Synthesis Engine</p>
                           <h3 className="text-3xl font-black uppercase tracking-tighter">Diagnostic Manifest</h3>
                        </div>
                     </div>
                     <div className="prose prose-invert max-w-none">
                        <p className="text-xl font-bold leading-relaxed text-slate-300 italic mb-8">
                          "{aiSynthesisResult}"
                        </p>
                     </div>
                     <div className="flex gap-4 pt-10 border-t border-white/10">
                        <button 
                          onClick={() => setAiSynthesisResult(null)}
                          className="px-8 py-4 bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all"
                        >
                          Recalibrate Matrix
                        </button>
                        <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl">
                          Export Clinical Report
                        </button>
                     </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {[
                     { label: 'Integrity', val: '98.4%', icon: <ShieldCheck /> },
                     { label: 'Metabolism', val: 'Optimal', icon: <Zap /> },
                     { label: 'Cognis Sync', val: 'Active', icon: <RefreshCw /> }
                   ].map((item, i) => (
                     <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex items-center gap-6 shadow-sm">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400">
                           {React.cloneElement(item.icon as any, { size: 20 })}
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{item.label}</p>
                           <p className="text-xl font-black text-slate-900 dark:text-white uppercase">{item.val}</p>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Test Modal */}
      <AnimatePresence>
        {showAddTest && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setShowAddTest(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-2xl border border-slate-100 dark:border-slate-800"
            >
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8 flex items-center gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600">
                  <Plus />
                </div>
                New Lab Entry
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Test Name</label>
                  <input 
                    type="text" 
                    value={newTest.name || ''}
                    onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-xs font-bold focus:ring-4 focus:ring-blue-500/10"
                    placeholder="e.g., Vitamin D, Total Cholesterol"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                   <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Result Value</label>
                    <input 
                      type="text" 
                      value={newTest.result || ''}
                      onChange={(e) => setNewTest({ ...newTest, result: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-xs font-bold focus:ring-4 focus:ring-blue-500/10"
                      placeholder="85.4"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Unit</label>
                    <input 
                      type="text" 
                      value={newTest.unit || ''}
                      onChange={(e) => setNewTest({ ...newTest, unit: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-xs font-bold focus:ring-4 focus:ring-blue-500/10"
                      placeholder="mg/dL"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Reference Range</label>
                  <input 
                    type="text" 
                    value={newTest.referenceRange || ''}
                    onChange={(e) => setNewTest({ ...newTest, referenceRange: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-xs font-bold focus:ring-4 focus:ring-blue-500/10"
                    placeholder="70 - 100"
                  />
                </div>

                <div className="pt-6">
                  <button 
                    onClick={handleAddTest}
                    className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl"
                  >
                    SAVE TO VAULT
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
