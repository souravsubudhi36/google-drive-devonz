import { motion } from 'framer-motion';
import { FolderOpen, Plus } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  onAction?: () => void;
  actionLabel?: string;
}

export default function EmptyState({ title, description, onAction, actionLabel }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20"
    >
      <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-5">
        <FolderOpen className="w-10 h-10 text-neutral-600" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-300 mb-1">{title}</h3>
      <p className="text-sm text-neutral-500 mb-6 text-center max-w-xs">{description}</p>
      {onAction && actionLabel && (
        <button
          onClick={onAction}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}
