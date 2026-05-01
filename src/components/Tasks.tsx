import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  ListTodo,
  ChevronRight,
  Filter,
  CalendarDays,
  Bell,
  X
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string; // ISO string
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

export const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('doctorian_tasks');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Cardiology Review', description: 'Monthly checkup on cardiac data patterns.', deadline: new Date(Date.now() + 86400000).toISOString(), completed: false, priority: 'high' },
      { id: '2', title: 'Hydration Strategy', description: 'Review water intake benchmarks.', deadline: new Date(Date.now() + 172800000).toISOString(), completed: true, priority: 'low' },
    ];
  });

  const [isAdding, setIsAdding] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'incomplete'>('all');
  const [newTask, setNewTask] = useState<{ title: string; description: string; date: string; time: string; priority: 'low' | 'medium' | 'high' }>({ 
    title: '', 
    description: '', 
    date: new Date().toLocaleDateString('en-CA'), 
    time: '09:00', 
    priority: 'medium' 
  });

  useEffect(() => {
    localStorage.setItem('doctorian_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const filteredTasks = tasks.filter(task => {
    const priorityMatch = filterPriority === 'all' || task.priority === filterPriority;
    const statusMatch = filterStatus === 'all' || 
      (filterStatus === 'completed' ? task.completed : !task.completed);
    return priorityMatch && statusMatch;
  });

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title || !newTask.date || !newTask.time) return;

    const deadline = new Date(`${newTask.date}T${newTask.time}`).toISOString();
    const task: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTask.title,
      description: newTask.description,
      deadline,
      completed: false,
      priority: newTask.priority
    };

    setTasks([task, ...tasks]);
    setNewTask({ title: '', description: '', date: '', time: '', priority: 'medium' });
    setIsAdding(false);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const cyclePriority = (id: string) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const next: Task['priority'] = t.priority === 'low' ? 'medium' : t.priority === 'medium' ? 'high' : 'low';
        return { ...t, priority: next };
      }
      return t;
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const openAddForDate = (date: Date) => {
    const localDate = date.toLocaleDateString('en-CA'); // YYYY-MM-DD
    setNewTask(prev => ({ ...prev, date: localDate, time: '09:00' }));
    setIsAdding(true);
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'high': return 'text-rose-500 bg-rose-50 dark:bg-rose-900/20';
      case 'medium': return 'text-amber-500 bg-amber-50 dark:bg-amber-900/20';
      default: return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  const formatDeadline = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    if (diff < 0) return 'Overdue';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `In ${days} days`;
  };

  // Calendar Helper Functions
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    const prevMonthDays = getDaysInMonth(year, month - 1);
    
    // Previous month's padding
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, month: month - 1, year, currentMonth: false });
    }
    
    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, month, year, currentMonth: true });
    }
    
    // Next month's padding
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, month: month + 1, year, currentMonth: false });
    }

    return days;
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-8 sm:py-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-12">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-600 p-2 rounded-xl text-white">
              <ListTodo size={24} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Protocol Management</p>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
            Health <span className="text-blue-600">Tasks</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold mt-2 text-sm sm:text-base">Manage your clinical priorities and deadlines with precision.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl flex gap-1">
            <button 
              onClick={() => setViewMode('list')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              List
            </button>
            <button 
              onClick={() => setViewMode('calendar')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${viewMode === 'calendar' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Calendar
            </button>
          </div>
          <button 
            onClick={() => {
              setNewTask(prev => ({ ...prev, date: new Date().toLocaleDateString('en-CA'), time: '09:00' }));
              setIsAdding(true);
            }}
            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl w-full sm:w-auto"
          >
            <Plus size={18} />
            Append Task
          </button>
        </div>
      </header>

      {viewMode === 'list' ? (
        <>
          <div className="flex flex-col gap-6 mb-8 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-800">
            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Filter Priority</label>
              <div className="flex flex-wrap gap-2">
                {(['all', 'low', 'medium', 'high'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setFilterPriority(p)}
                    className={`flex-1 min-w-[70px] sm:flex-none px-4 py-2.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase transition-all border ${
                      filterPriority === p 
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-lg' 
                      : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Filter Status</label>
              <div className="flex flex-wrap gap-2">
                {(['all', 'completed', 'incomplete'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`flex-1 min-w-[90px] sm:flex-none px-4 py-2.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase transition-all border ${
                      filterStatus === s 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg' 
                      : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
                
                {(filterPriority !== 'all' || filterStatus !== 'all') && (
                  <button
                    onClick={() => { setFilterPriority('all'); setFilterStatus('all'); }}
                    className="px-4 py-2.5 text-[9px] sm:text-[10px] font-black uppercase text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-2"
                  >
                    <X size={14} />
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-8 space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`p-6 bg-white dark:bg-slate-900 rounded-[2rem] border transition-all group flex items-start justify-between gap-4 relative overflow-hidden ${
                      task.completed ? 'opacity-60 border-slate-100 dark:border-slate-800' : 'border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md'
                    }`}
                  >
                    {/* Priority Indicator Strip */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                      task.priority === 'high' ? 'bg-rose-500' : 
                      task.priority === 'medium' ? 'bg-amber-500' : 
                      'bg-blue-500'
                    }`} />
                    
                    <div className="flex gap-4 flex-1">
                      <button 
                        onClick={() => toggleTask(task.id)}
                        className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                          task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 dark:border-slate-700 hover:border-blue-500'
                        }`}
                      >
                        {task.completed && <CheckCircle2 size={14} />}
                      </button>
                      <div className="flex-1">
                        <h3 className={`text-lg font-black tracking-tight uppercase leading-none mb-1 ${task.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                          {task.title}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mb-4">{task.description}</p>
                        
                        <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest">
                          <button 
                            onClick={() => cyclePriority(task.id)}
                            title="Click to cycle priority"
                            className={`px-2 py-1 rounded-md flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 ${getPriorityColor(task.priority)}`}
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-current" />
                            {task.priority} Priority
                          </button>
                          <div className="px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded-md text-slate-400 flex items-center gap-1.5 border border-slate-100 dark:border-slate-700/50">
                            <Calendar size={10} />
                            {new Date(task.deadline).toLocaleDateString()}
                          </div>
                          <div className="px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded-md text-slate-400 flex items-center gap-1.5 border border-slate-100 dark:border-slate-700/50">
                            <Clock size={10} />
                            {new Date(task.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end gap-2">
                      <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest shadow-sm ${
                        formatDeadline(task.deadline) === 'Overdue' ? 'bg-rose-600 text-white' : 'bg-blue-600 text-white'
                      }`}>
                        {formatDeadline(task.deadline)}
                      </span>
                      <button 
                        onClick={() => deleteTask(task.id)}
                        className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredTasks.length === 0 && (
                <div className="py-20 text-center bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                  <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300 shadow-sm">
                    <ListTodo size={32} />
                  </div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                    {tasks.length === 0 ? 'Awaiting New Protocols' : 'No protocols match current filters'}
                  </p>
                  {tasks.length > 0 && (
                    <button 
                      onClick={() => { setFilterPriority('all'); setFilterStatus('all'); }}
                      className="mt-4 text-[10px] font-black uppercase text-blue-600 hover:underline"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="md:col-span-4 gap-8 flex flex-col">
              <section className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Bell size={80} />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight mb-4 relative z-10">Cognis Alerts</h3>
                <p className="text-sm text-slate-400 font-bold mb-8 relative z-10">System detected {tasks.filter(t => !t.completed).length} high-priority tasks pending for the next cycle.</p>
                <div className="space-y-3 relative z-10">
                   {[
                     { label: 'Next Deadline', val: tasks.find(t => !t.completed)?.title || 'None' },
                     { label: 'Efficiency', val: `${Math.round((tasks.filter(t => t.completed).length / (tasks.length || 1)) * 100)}%` }
                   ].map((item, i) => (
                     <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{item.label}</span>
                       <span className="text-xs font-black uppercase">{item.val}</span>
                     </div>
                   ))}
                </div>
              </section>

              <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                 <h3 className="text-lg font-black uppercase tracking-tight mb-6 flex items-center gap-2">
                   <Filter size={18} className="text-blue-600" />
                   Task Stats
                 </h3>
                 <div className="space-y-6">
                   <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-[10px] font-black uppercase text-slate-400">Completion</span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {Math.round((tasks.filter(t => t.completed).length / (tasks.length || 1)) * 100)}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(tasks.filter(t => t.completed).length / (tasks.length || 1)) * 100}%` }}
                          className="h-full bg-emerald-500" 
                        />
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{tasks.filter(t => !t.completed).length}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
                        <p className="text-2xl font-black text-slate-400">{tasks.length}</p>
                      </div>
                   </div>
                 </div>
              </section>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 p-6 sm:p-10 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
                className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <ChevronRight className="rotate-180" size={20} />
              </button>
              <button 
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
              >
                Today
              </button>
              <button 
                onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
                className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="bg-slate-50 dark:bg-slate-900/80 p-4 text-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{day}</span>
              </div>
            ))}
            {renderCalendar().map((item, idx) => {
              const dayDate = new Date(item.year, item.month, item.day);
              const isToday = dayDate.toDateString() === new Date().toDateString();
              const dayTasks = tasks.filter(t => new Date(t.deadline).toDateString() === dayDate.toDateString());
              
              return (
                <div 
                  key={idx} 
                  onClick={() => openAddForDate(dayDate)}
                  className={`bg-white dark:bg-slate-900 min-h-[100px] sm:min-h-[140px] p-2 sm:p-4 transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 group relative ${!item.currentMonth ? 'opacity-30' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-black p-1 rounded-md ${isToday ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
                      {item.day}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {dayTasks.slice(0, 3).map(task => (
                      <div 
                        key={task.id} 
                        className={`px-2 py-1 rounded-md text-[8px] font-black uppercase truncate border ${
                          task.completed 
                            ? 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700 line-through' 
                            : `${getPriorityColor(task.priority)} font-bold`
                        }`}
                      >
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <div className="text-[8px] font-black text-slate-400 px-2 uppercase">
                        + {dayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-lg flex items-center justify-center shadow-lg">
                      <Plus size={14} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-2xl relative"
            >
              <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">Create Protocol</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Define your cognitive priorities</p>

              <form onSubmit={handleAddTask} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Protocol Title</label>
                  <input 
                    type="text" 
                    required
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    placeholder="e.g. Daily Genomic Scan"
                    className="w-full mt-2 px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-blue-500 font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Context / Details</label>
                  <textarea 
                    rows={3}
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    placeholder="Specify physiological constraints..."
                    className="w-full mt-2 px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-blue-500 font-bold resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deadline Date</label>
                    <input 
                      type="date" 
                      required
                      value={newTask.date}
                      onChange={(e) => setNewTask({...newTask, date: e.target.value})}
                      className="w-full mt-2 px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-blue-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Precision Time</label>
                    <input 
                      type="time" 
                      required
                      value={newTask.time}
                      onChange={(e) => setNewTask({...newTask, time: e.target.value})}
                      className="w-full mt-2 px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-blue-500 font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority Matrix</label>
                  <div className="flex gap-2 mt-2">
                    {(['low', 'medium', 'high'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setNewTask({...newTask, priority: p})}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${
                          newTask.priority === p 
                          ? (p === 'high' ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-200' : 
                             p === 'medium' ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-200' : 
                             'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200')
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-transparent hover:border-slate-200'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-6">
                  <button 
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500"
                  >
                    Discard
                  </button>
                  <button 
                    type="submit"
                    className="flex-2 bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                  >
                    Commit Protocol
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
