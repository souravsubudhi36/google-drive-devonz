import { motion } from 'framer-motion';
import {
  Folder,
  Code,
  Palette,
  Megaphone,
  Layout,
  Server,
  ImageIcon,
  MoreVertical,
  Users,
  Shield,
  Pencil,
  Eye,
} from 'lucide-react';
import type { FolderData } from '../types';

const iconMap: Record<string, React.ElementType> = {
  folder: Folder,
  code: Code,
  palette: Palette,
  megaphone: Megaphone,
  layout: Layout,
  server: Server,
  image: ImageIcon,
};

const permissionIcons: Record<string, React.ElementType> = {
  owner: Shield,
  editor: Pencil,
  viewer: Eye,
};

interface FolderCardProps {
  folder: FolderData;
  onClick: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  index: number;
}

export default function FolderCard({ folder, onClick, onContextMenu, index }: FolderCardProps) {
  const Icon = iconMap[folder.icon] || Folder;
  const PermIcon = permissionIcons[folder.permission] || Eye;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      onClick={onClick}
      onContextMenu={onContextMenu}
      className="group relative glass glass-hover rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20"
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${folder.color}15` }}
        >
          <Icon className="w-5 h-5" style={{ color: folder.color }} />
        </div>
        <button
          onClick={e => { e.stopPropagation(); }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-white/[0.08] transition-all"
        >
          <MoreVertical className="w-4 h-4 text-neutral-500" />
        </button>
      </div>

      <h3 className="font-medium text-sm text-white truncate mb-1">{folder.name}</h3>

      <div className="flex items-center justify-between">
        <span className="text-[11px] text-neutral-500">
          {folder.childCount !== undefined ? `${folder.childCount} items` : 'Folder'}
        </span>
        <div className="flex items-center gap-1">
          <PermIcon className="w-3 h-3 text-neutral-500" />
          <span className="text-[10px] text-neutral-500 capitalize">{folder.permission}</span>
        </div>
      </div>

      {/* Subtle color accent line */}
      <div
        className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: folder.color }}
      />
    </motion.div>
  );
}
