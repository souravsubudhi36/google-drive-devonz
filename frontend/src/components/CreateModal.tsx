import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Folder, FileText, Code, FileJson, Database } from 'lucide-react';

interface CreateModalProps {
  type: 'folder' | 'document';
  parentFolder: string | null;
  onClose: () => void;
  onCreate: (data: { name: string; type?: string; color?: string; icon?: string; content?: string }) => void;
}

const folderColors = [
  { color: '#9E7FFF', name: 'Purple' },
  { color: '#38bdf8', name: 'Blue' },
  { color: '#f472b6', name: 'Pink' },
  { color: '#10b981', name: 'Green' },
  { color: '#f59e0b', name: 'Amber' },
  { color: '#ef4444', name: 'Red' },
];

const docTypes = [
  { type: 'markdown', label: 'Markdown', icon: FileText, ext: '.md' },
  { type: 'document', label: 'Document', icon: FileText, ext: '.docx' },
  { type: 'json', label: 'JSON', icon: FileJson, ext: '.json' },
  { type: 'sql', label: 'SQL', icon: Database, ext: '.sql' },
  { type: 'code', label: 'Code', icon: Code, ext: '.ts' },
];

export default function CreateModal({ type, parentFolder, onClose, onCreate }: CreateModalProps) {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#9E7FFF');
  const [selectedDocType, setSelectedDocType] = useState('markdown');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    if (type === 'folder') {
      onCreate({ name: name.trim(), color: selectedColor, icon: 'folder' });
    } else {
      const docType = docTypes.find(d => d.type === selectedDocType);
      const fullName = name.includes('.') ? name.trim() : `${name.trim()}${docType?.ext || '.md'}`;
      onCreate({ name: fullName, type: selectedDocType, content: '' });
    }
  }

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
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm glass rounded-2xl z-[70] shadow-2xl shadow-black/50"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h3 className="font-semibold">
            New {type === 'folder' ? 'Folder' : 'Document'}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/[0.06] text-neutral-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs text-neutral-500 mb-1.5">Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={type === 'folder' ? 'Folder name' : 'Document name'}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-primary/50 transition-colors"
              autoFocus
            />
          </div>

          {type === 'folder' ? (
            <div>
              <label className="block text-xs text-neutral-500 mb-2">Color</label>
              <div className="flex gap-2">
                {folderColors.map(c => (
                  <button
                    key={c.color}
                    type="button"
                    onClick={() => setSelectedColor(c.color)}
                    className={`w-8 h-8 rounded-full transition-all ${
                      selectedColor === c.color ? 'ring-2 ring-white ring-offset-2 ring-offset-surface-600 scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.color }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs text-neutral-500 mb-2">Type</label>
              <div className="grid grid-cols-3 gap-2">
                {docTypes.map(dt => (
                  <button
                    key={dt.type}
                    type="button"
                    onClick={() => setSelectedDocType(dt.type)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                      selectedDocType === dt.type
                        ? 'border-primary/40 bg-primary/10 text-primary'
                        : 'border-white/[0.06] text-neutral-500 hover:border-white/[0.12] hover:text-neutral-300'
                    }`}
                  >
                    <dt.icon className="w-4 h-4" />
                    <span className="text-[10px] font-medium">{dt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-primary text-white font-medium hover:bg-primary-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Create
            </button>
          </div>
        </form>
      </motion.div>
    </>
  );
}
