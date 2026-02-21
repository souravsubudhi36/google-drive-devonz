import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Shield, Pencil, Eye, UserPlus, Trash2, ChevronDown } from 'lucide-react';
import { fetchSharing, fetchUsers, addSharing, removeSharing, getCurrentUserId } from '../api/client';
import type { SharingEntry, UserData } from '../types';

interface SharingModalProps {
  objectId: string;
  objectName: string;
  onClose: () => void;
  onUpdated: () => void;
}

const permissionOptions = [
  { value: 'owner', label: 'Owner', icon: Shield, color: '#9E7FFF' },
  { value: 'editor', label: 'Editor', icon: Pencil, color: '#38bdf8' },
  { value: 'viewer', label: 'Viewer', icon: Eye, color: '#10b981' },
];

export default function SharingModal({ objectId, objectName, onClose, onUpdated }: SharingModalProps) {
  const [sharing, setSharing] = useState<SharingEntry[]>([]);
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('viewer');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [sharingRes, usersRes] = await Promise.all([
        fetchSharing(objectId),
        fetchUsers(),
      ]);
      setSharing(sharingRes.sharing);
      setAllUsers(usersRes.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (!selectedUser) return;
    try {
      const res = await addSharing(objectId, selectedUser, selectedRole);
      setSharing(res.sharing);
      setSelectedUser('');
      onUpdated();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleRemove(userId: string) {
    try {
      const res = await removeSharing(objectId, userId);
      setSharing(res.sharing);
      onUpdated();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleChangeRole(userId: string, newRole: string) {
    try {
      const res = await addSharing(objectId, userId, newRole);
      setSharing(res.sharing);
      onUpdated();
    } catch (err) {
      console.error(err);
    }
  }

  const currentUserId = getCurrentUserId();
  const usersNotShared = allUsers.filter(u => !sharing.find(s => s.id === u.id));

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md glass rounded-2xl z-[70] shadow-2xl shadow-black/50"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div>
            <h3 className="font-semibold text-base">Share</h3>
            <p className="text-xs text-neutral-500 mt-0.5 truncate max-w-[280px]">{objectName}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/[0.06] text-neutral-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Add user */}
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <div className="flex gap-2">
            <select
              value={selectedUser}
              onChange={e => setSelectedUser(e.target.value)}
              className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50 appearance-none"
            >
              <option value="" className="bg-surface-300">Select a user...</option>
              {usersNotShared.map(u => (
                <option key={u.id} value={u.id} className="bg-surface-300">{u.name}</option>
              ))}
            </select>
            <select
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
              className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50 appearance-none"
            >
              {permissionOptions.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-surface-300">{opt.label}</option>
              ))}
            </select>
            <button
              onClick={handleAdd}
              disabled={!selectedUser}
              className="px-3 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Shared users list */}
        <div className="px-6 py-3 max-h-64 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : sharing.length === 0 ? (
            <p className="text-sm text-neutral-500 text-center py-6">No one has access yet</p>
          ) : (
            <div className="space-y-1">
              {sharing.map(entry => {
                const PermIcon = permissionOptions.find(p => p.value === entry.permission)?.icon || Eye;
                const isCurrentUser = entry.id === currentUserId;
                return (
                  <div key={entry.id} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-white/[0.03] transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/60 to-accent-blue/60 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                      {entry.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {entry.name}
                        {isCurrentUser && <span className="text-neutral-500 font-normal"> (you)</span>}
                      </p>
                      <p className="text-[11px] text-neutral-500 truncate">{entry.email}</p>
                    </div>
                    <select
                      value={entry.permission}
                      onChange={e => handleChangeRole(entry.id, e.target.value)}
                      disabled={isCurrentUser}
                      className="bg-white/[0.04] border border-white/[0.06] rounded-md px-2 py-1 text-[11px] text-neutral-400 focus:outline-none appearance-none disabled:opacity-50"
                    >
                      {permissionOptions.map(opt => (
                        <option key={opt.value} value={opt.value} className="bg-surface-300">{opt.label}</option>
                      ))}
                    </select>
                    {!isCurrentUser && (
                      <button
                        onClick={() => handleRemove(entry.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-neutral-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/[0.06] flex items-center justify-between">
          <p className="text-[11px] text-neutral-500 flex items-center gap-1">
            <Shield className="w-3 h-3" />
            OpenFGA Authorization
          </p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-sm text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            Done
          </button>
        </div>
      </motion.div>
    </>
  );
}
