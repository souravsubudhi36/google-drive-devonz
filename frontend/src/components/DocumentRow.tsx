import { motion } from 'framer-motion';
import { MoreVertical, Shield, Pencil, Eye } from 'lucide-react';
import { getFileIcon, getFileColor } from './icons/FileIcons';
import type { DocumentData } from '../types';

const permissionIcons: Record<string, React.ElementType> = {
  owner: Shield,
  editor: Pencil,
  viewer: Eye,
};

interface DocumentRowProps {
  doc: DocumentData;
  onClick: () => void;
  index: number;
  viewMode: 'grid' | 'list';
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function DocumentRow({ doc, onClick, index, viewMode }: DocumentRowProps) {
  const FileIcon = getFileIcon(doc.type);
  const fileColor = getFileColor(doc.type);
  const PermIcon = permissionIcons[doc.permission] || Eye;

  if (viewMode === 'grid') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.04 }}
        onClick={onClick}
        className="group glass glass-hover rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20"
      >
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${fileColor}15` }}
          >
            <FileIcon className="w-5 h-5" style={{ color: fileColor }} />
          </div>
          <button
            onClick={e => e.stopPropagation()}
            className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-white/[0.08] transition-all"
          >
            <MoreVertical className="w-4 h-4 text-neutral-500" />
          </button>
        </div>
        <h3 className="font-medium text-sm text-white truncate mb-1">{doc.name}</h3>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-neutral-500">{formatSize(doc.size)}</span>
          <div className="flex items-center gap-1">
            <PermIcon className="w-3 h-3 text-neutral-500" />
            <span className="text-[10px] text-neutral-500 capitalize">{doc.permission}</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      onClick={onClick}
      className="group flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/[0.03] cursor-pointer transition-colors"
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${fileColor}12` }}
      >
        <FileIcon className="w-4.5 h-4.5" style={{ color: fileColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{doc.name}</p>
        <p className="text-[11px] text-neutral-500">{formatDate(doc.updatedAt)}</p>
      </div>
      <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.03]">
        <PermIcon className="w-3 h-3 text-neutral-500" />
        <span className="text-[10px] text-neutral-500 capitalize">{doc.permission}</span>
      </div>
      <span className="text-xs text-neutral-500 w-16 text-right">{formatSize(doc.size)}</span>
      <button
        onClick={e => e.stopPropagation()}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-white/[0.08] transition-all"
      >
        <MoreVertical className="w-4 h-4 text-neutral-500" />
      </button>
    </motion.div>
  );
}
