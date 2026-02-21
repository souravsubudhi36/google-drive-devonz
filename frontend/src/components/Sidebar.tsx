import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HardDrive,
  FolderOpen,
  Clock,
  Star,
  Trash2,
  Users,
  ChevronDown,
  Plus,
  Settings,
  Shield,
} from 'lucide-react';
import type { UserData } from '../types';

interface SidebarProps {
  currentUser: UserData | null;
  users: UserData[];
  onSwitchUser: (userId: string) => void;
  onNavigateHome: () => void;
  activeSection: string;
  storageUsed: number;
}

export default function Sidebar({
  currentUser,
  users,
  onSwitchUser,
  onNavigateHome,
  activeSection,
  storageUsed,
}: SidebarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { id: 'drive', label: 'My Drive', icon: HardDrive, onClick: onNavigateHome },
    { id: 'recent', label: 'Recent', icon: Clock },
    { id: 'starred', label: 'Starred', icon: Star },
    { id: 'shared', label: 'Shared with me', icon: Users },
    { id: 'trash', label: 'Trash', icon: Trash2 },
  ];

  const storagePercent = Math.min((storageUsed / 15) * 100, 100);

  return (
    <aside className="w-64 h-screen flex flex-col border-r border-white/[0.06] bg-surface-600">
      {/* Logo */}
      <div className="p-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent-pink flex items-center justify-center">
          <HardDrive className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight">Mini Drive</span>
      </div>

      {/* New Button */}
      <div className="px-4 mb-2">
        <button className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all duration-200 font-medium text-sm">
          <Plus className="w-4 h-4" />
          New
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-primary/15 text-primary font-medium'
                  : 'text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200'
              }`}
            >
              <item.icon className={`w-[18px] h-[18px] ${isActive ? 'text-primary' : ''}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Storage */}
      <div className="px-4 py-3 border-t border-white/[0.06]">
        <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
          <span>Storage</span>
          <span>{storageUsed.toFixed(1)} GB of 15 GB</span>
        </div>
        <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent-pink"
            initial={{ width: 0 }}
            animate={{ width: `${storagePercent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* User Switcher */}
      <div className="relative px-3 py-3 border-t border-white/[0.06]">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/[0.04] transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent-blue flex items-center justify-center text-xs font-bold text-white">
            {currentUser?.avatar || '??'}
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-medium truncate">{currentUser?.name || 'Loading...'}</p>
            <p className="text-[11px] text-neutral-500 truncate">{currentUser?.email}</p>
          </div>
          <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {showUserMenu && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-3 right-3 mb-2 glass rounded-xl overflow-hidden shadow-2xl shadow-black/40 z-50"
            >
              <div className="p-2">
                <p className="px-2 py-1.5 text-[11px] font-medium text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3 h-3" />
                  Switch User (Auth Testing)
                </p>
                {users.map(user => (
                  <button
                    key={user.id}
                    onClick={() => {
                      onSwitchUser(user.id);
                      setShowUserMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors ${
                      currentUser?.id === user.id
                        ? 'bg-primary/15 text-primary'
                        : 'text-neutral-300 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/60 to-accent-blue/60 flex items-center justify-center text-[10px] font-bold">
                      {user.avatar}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-xs">{user.name}</p>
                      <p className="text-[10px] text-neutral-500">{user.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}
