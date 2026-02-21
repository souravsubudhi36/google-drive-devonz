import { Shield, Pencil, Eye, Ban } from 'lucide-react';
import type { PermissionLevel } from '../types';

const config: Record<PermissionLevel, { icon: React.ElementType; label: string; color: string; bg: string }> = {
  owner: { icon: Shield, label: 'Owner', color: '#9E7FFF', bg: 'rgba(158,127,255,0.1)' },
  editor: { icon: Pencil, label: 'Editor', color: '#38bdf8', bg: 'rgba(56,189,248,0.1)' },
  viewer: { icon: Eye, label: 'Viewer', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  none: { icon: Ban, label: 'No Access', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

export default function PermissionBadge({ level }: { level: PermissionLevel }) {
  const { icon: Icon, label, color, bg } = config[level];
  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium"
      style={{ backgroundColor: bg, color }}
    >
      <Icon className="w-3 h-3" />
      {label}
    </div>
  );
}
