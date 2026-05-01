import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Search, 
  Trash2, 
  Shield, 
  User as UserIcon, 
  Mail, 
  Calendar,
  AlertCircle,
  Loader2,
  CheckCircle2,
  X,
  FileText,
  Activity,
  Heart,
  Thermometer,
  Scale,
  Bell,
  Send,
  Plus
} from 'lucide-react';
import { api, User, HealthRecord } from '../api';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'notifications' | 'system'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userRecords, setUserRecords] = useState<HealthRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  // New Notification State
  const [newNotification, setNewNotification] = useState({ title: '', content: '', type: 'info' });
  const [isCreatingNotification, setIsCreatingNotification] = useState(false);

  // Twilio Status State
  const [twilioStatus, setTwilioStatus] = useState<any>(null);
  const [loadingTwilio, setLoadingTwilio] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.admin.listUsers();
      setUsers(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await api.notifications.list();
      setNotifications(data);
    } catch (err: any) {
      console.error("Failed to load notifications:", err);
    }
  };

  const fetchTwilioStatus = async () => {
    setLoadingTwilio(true);
    try {
      const res = await fetch('/api/admin/mtn-status', { credentials: 'include' });
      const data = await res.json();
      setTwilioStatus(data);
    } catch (err) {
      console.error("Failed to fetch MTN status:", err);
    } finally {
      setLoadingTwilio(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'notifications') {
      fetchNotifications();
    } else {
      fetchTwilioStatus();
    }
  }, [activeTab]);

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingNotification(true);
    try {
      await api.notifications.create(newNotification);
      setSuccessMessage("Notification sent successfully!");
      setNewNotification({ title: '', content: '', type: 'info' });
      fetchNotifications();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to send notification");
    } finally {
      setIsCreatingNotification(false);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await api.notifications.delete(id);
      setNotifications(notifications.filter(n => n.id !== id));
      setSuccessMessage("Notification deleted");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to delete notification");
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await api.admin.deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
      setDeleteConfirm(null);
      setSuccessMessage("User deleted successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to delete user");
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.admin.updateUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setSuccessMessage(`Role updated to ${newRole}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update role");
    }
  };

  const handleViewRecords = async (user: User) => {
    setSelectedUser(user);
    setLoadingRecords(true);
    try {
      const records = await api.admin.getUserRecords(user.id);
      setUserRecords(records);
    } catch (err: any) {
      setError(err.message || "Failed to load user records");
    } finally {
      setLoadingRecords(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.displayName && u.displayName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getRecordIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'blood pressure': return <Heart className="text-rose-500" size={18} />;
      case 'heart rate': return <Activity className="text-red-500" size={18} />;
      case 'temperature': return <Thermometer className="text-orange-500" size={18} />;
      case 'weight': return <Scale className="text-blue-500" size={18} />;
      default: return <FileText className="text-slate-400" size={18} />;
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading user database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Shield className="text-blue-600" size={32} />
            Admin Dashboard
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage users and platform-wide notifications.
          </p>
        </div>

        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-x-auto no-scrollbar" role="tablist" aria-label="Dashboard sections">
          <button 
            onClick={() => setActiveTab('users')}
            role="tab"
            aria-selected={activeTab === 'users'}
            aria-controls="users-panel"
            id="tab-users"
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === 'users' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Users size={16} aria-hidden="true" />
            Users
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            role="tab"
            aria-selected={activeTab === 'notifications'}
            aria-controls="notifications-panel"
            id="tab-notifications"
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === 'notifications' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Bell size={16} aria-hidden="true" />
            Notifs
          </button>
          <button 
            onClick={() => setActiveTab('system')}
            role="tab"
            aria-selected={activeTab === 'system'}
            aria-controls="system-panel"
            id="tab-system"
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === 'system' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Activity size={16} aria-hidden="true" />
            System
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'users' ? (
          <motion.div
            key="users-tab"
            id="users-panel"
            role="tabpanel"
            aria-labelledby="tab-users"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="relative max-w-md w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} aria-hidden="true" />
              <input 
                type="text"
                placeholder="Search by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search users by email or name"
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
              />
            </div>

            <div aria-live="polite" className="space-y-4">
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-2xl flex items-center gap-3 text-rose-600 dark:text-rose-400"
                    role="alert"
                  >
                    <AlertCircle size={20} aria-hidden="true" />
                    <p className="font-medium">{error}</p>
                  </motion.div>
                )}

                {successMessage && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-emerald-600 dark:text-emerald-400"
                    role="status"
                  >
                    <CheckCircle2 size={20} aria-hidden="true" />
                    <p className="font-medium">{successMessage}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                      <th scope="col" className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">User</th>
                      <th scope="col" className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Role</th>
                      <th scope="col" className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Joined</th>
                      <th scope="col" className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((u) => (
                        <motion.tr 
                          layout
                          key={u.id}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 overflow-hidden shadow-inner">
                                {u.photoURL ? (
                                  <img src={u.photoURL} alt={u.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  <UserIcon size={24} />
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white">{u.displayName}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                  <Mail size={12} />
                                  {u.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <select 
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-transparent border-0 focus:ring-0 cursor-pointer transition-colors ${
                                u.role === 'admin' || u.role === 'doctor'
                                  ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800'
                                  : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800'
                              }`}
                            >
                              <option value="user" className="dark:bg-slate-900 text-slate-900 dark:text-white">User</option>
                              <option value="doctor" className="dark:bg-slate-900 text-slate-900 dark:text-white">Doctor</option>
                              <option value="admin" className="dark:bg-slate-900 text-slate-900 dark:text-white">Admin</option>
                            </select>
                          </td>
                          <td className="px-6 py-5">
                            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Calendar size={14} />
                              {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                            </p>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => handleViewRecords(u)}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all active:scale-90"
                                aria-label={`View health records for ${u.displayName || u.email}`}
                                title="View Records"
                              >
                                <FileText size={20} aria-hidden="true" />
                              </button>
                              <button 
                                onClick={() => setDeleteConfirm(u.id)}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all active:scale-90"
                                aria-label={`Delete user ${u.displayName || u.email}`}
                                title="Delete User"
                              >
                                <Trash2 size={20} aria-hidden="true" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600">
                              <Users size={32} />
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">No users found matching your search.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        ) : activeTab === 'notifications' ? (
          <motion.div
            key="notifications-tab"
            id="notifications-panel"
            role="tabpanel"
            aria-labelledby="tab-notifications"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="grid md:grid-cols-3 gap-8">
              {/* Create Notification Form */}
              <div className="md:col-span-1">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50">
                  <h3 id="send-broadcast-title" className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <Send className="text-blue-600" size={20} aria-hidden="true" />
                    Send Broadcast
                  </h3>
                  
                  <form onSubmit={handleCreateNotification} className="space-y-4" aria-labelledby="send-broadcast-title">
                    <div className="space-y-1.5">
                      <label htmlFor="notif-title" className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Title</label>
                      <input 
                        id="notif-title"
                        type="text"
                        required
                        value={newNotification.title}
                        onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                        placeholder="e.g. New Health Guidelines"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label htmlFor="notif-content" className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Content</label>
                      <textarea 
                        id="notif-content"
                        required
                        rows={4}
                        value={newNotification.content}
                        onChange={(e) => setNewNotification({...newNotification, content: e.target.value})}
                        placeholder="Enter the broadcast message..."
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white resize-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="notif-type" className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Type</label>
                      <select 
                        id="notif-type"
                        value={newNotification.type}
                        onChange={(e) => setNewNotification({...newNotification, type: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white"
                      >
                        <option value="info">Information</option>
                        <option value="alert">Alert</option>
                        <option value="update">Update</option>
                      </select>
                    </div>

                    <button 
                      type="submit"
                      disabled={isCreatingNotification}
                      className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-4 rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 dark:shadow-blue-900/20 disabled:opacity-50 active:scale-95"
                    >
                      {isCreatingNotification ? <Loader2 className="animate-spin" size={20} /> : <><Send size={20} /><span>SEND BROADCAST</span></>}
                    </button>
                  </form>
                </div>
              </div>

              {/* Notifications List */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Bell className="text-blue-600" size={20} />
                    Sent Notifications
                  </h3>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{notifications.length} Total</span>
                </div>

                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <motion.div 
                        layout
                        key={n.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-start justify-between gap-4 group"
                      >
                        <div className="flex gap-4">
                          <div className={`mt-1 p-2 rounded-xl ${
                            n.type === 'alert' ? 'bg-rose-50 text-rose-600' : 
                            n.type === 'update' ? 'bg-blue-50 text-blue-600' : 
                            'bg-slate-50 text-slate-600'
                          }`}>
                            <Bell size={18} />
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 dark:text-white">{n.title}</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{n.content}</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-widest">
                              {new Date(n.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteNotification(n.id)}
                          className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </motion.div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800">
                      <Bell className="w-12 h-12 text-slate-200 mb-4" />
                      <p className="text-slate-400 font-medium">No broadcasts sent yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="system-tab"
            id="system-panel"
            role="tabpanel"
            aria-labelledby="tab-system"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="grid md:grid-cols-2 gap-8">
              {/* MTN Status Card */}
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                    <Activity className="text-blue-600" size={24} />
                    MTN API Configuration
                  </h3>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    twilioStatus?.configured ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                  }`}>
                    {twilioStatus?.configured ? 'Configured' : 'Incomplete'}
                  </div>
                </div>

                {loadingTwilio ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">MTN API Key</p>
                        <div className="flex items-center gap-2">
                          {twilioStatus?.details.hasApiKey ? <CheckCircle2 size={14} className="text-emerald-500" /> : <AlertCircle size={14} className="text-rose-500" />}
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{twilioStatus?.details.hasApiKey ? 'Present' : 'Missing'}</span>
                        </div>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sender ID</p>
                        <div className="flex items-center gap-2">
                          {twilioStatus?.details.hasSenderId ? <CheckCircle2 size={14} className="text-emerald-500" /> : <AlertCircle size={14} className="text-rose-500" />}
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{twilioStatus?.details.senderId || 'Missing'}</span>
                        </div>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Doctor Number</p>
                        <div className="flex items-center gap-2">
                          {twilioStatus?.details.hasDoctorNumber ? <CheckCircle2 size={14} className="text-emerald-500" /> : <AlertCircle size={14} className="text-rose-500" />}
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{twilioStatus?.details.doctorNumber || 'Missing'}</span>
                        </div>
                      </div>
                    </div>

                    {!twilioStatus?.configured && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
                        <p className="text-xs font-bold text-blue-800 dark:text-blue-300 leading-relaxed">
                          To enable real SMS and Voice alerts via MTN, you must configure the MTN environment variables in the Settings menu.
                        </p>
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white mb-4 uppercase tracking-widest">MTN Setup Guide</h4>
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 text-[10px] font-black shrink-0">1</div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Register on the <span className="font-bold text-slate-700 dark:text-slate-300">MTN Developer Portal</span> to obtain your API Key.
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 text-[10px] font-black shrink-0">2</div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Set your <span className="font-bold text-slate-700 dark:text-slate-300">Sender ID</span> (e.g., DOCTORIAN) to identify your messages to users.
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 text-[10px] font-black shrink-0">3</div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Ensure your MTN account has sufficient balance to send SMS and initiate Voice calls.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* System Info Card */}
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50">
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                  <Shield className="text-blue-600" size={24} />
                  System Information
                </h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                    <span className="text-xs font-bold text-slate-500">Database Engine</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">SQLite 3 (Better-SQLite3)</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                    <span className="text-xs font-bold text-slate-500">Authentication</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">JWT + WebAuthn (Passkeys)</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                    <span className="text-xs font-bold text-slate-500">Alert System</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">MTN SMS & Voice</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                    <span className="text-xs font-bold text-slate-500">AI Engine</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">Gemini 2.0 Flash</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Records Modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="records-modal-title"
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl max-w-2xl w-full relative border border-slate-100 dark:border-slate-800 max-h-[80vh] overflow-hidden flex flex-col"
            >
              <button 
                onClick={() => setSelectedUser(null)}
                aria-label="Close records modal"
                className="absolute top-6 right-6 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400"
              >
                <X size={24} aria-hidden="true" />
              </button>

              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-3xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 overflow-hidden shadow-inner">
                  {selectedUser.photoURL ? (
                    <img src={selectedUser.photoURL} alt={selectedUser.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <UserIcon size={32} aria-hidden="true" />
                  )}
                </div>
                <div>
                  <h3 id="records-modal-title" className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{selectedUser.displayName}'s Records</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{selectedUser.email}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                {loadingRecords ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                    <p className="text-slate-500 font-medium">Fetching health records...</p>
                  </div>
                ) : userRecords.length > 0 ? (
                  userRecords.map((record) => (
                    <div 
                      key={record.id}
                      className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-start justify-between gap-4"
                    >
                      <div className="flex gap-4">
                        <div className="mt-1">
                          {getRecordIcon(record.type)}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 dark:text-white">{record.type}</p>
                          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                            {record.value} <span className="text-sm font-bold text-slate-400">{record.unit}</span>
                          </p>
                          {record.notes && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 italic">"{record.notes}"</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                          {new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1">
                          {new Date(record.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600 mb-4">
                      <FileText size={32} />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">No health records found for this user.</p>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setSelectedUser(null)}
                className="mt-8 w-full py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-black hover:bg-slate-800 dark:hover:bg-blue-700 transition-all shadow-xl shadow-slate-200 dark:shadow-blue-900/20 active:scale-95"
              >
                Close Records
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="delete-confirm-title"
              aria-describedby="delete-confirm-desc"
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl max-w-md w-full relative border border-slate-100 dark:border-slate-800"
            >
              <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-6 mx-auto" aria-hidden="true">
                <AlertCircle size={32} />
              </div>
              <h3 id="delete-confirm-title" className="text-2xl font-black text-slate-900 dark:text-white text-center mb-2 tracking-tight">Delete User?</h3>
              <p id="delete-confirm-desc" className="text-slate-500 dark:text-slate-400 text-center mb-8">
                This action is permanent and will delete all health records and credentials associated with this user.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-6 py-4 rounded-2xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDeleteUser(deleteConfirm)}
                  className="flex-1 px-6 py-4 rounded-2xl font-bold bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200 dark:shadow-rose-900/20"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
