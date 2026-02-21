import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Download,
  Share2,
  Pencil,
  Trash2,
  Shield,
  Eye,
  Clock,
  FileText,
  Save,
  ChevronRight,
  Home,
} from 'lucide-react';
import { getFileIcon, getFileColor } from './icons/FileIcons';
import { fetchDocument, updateDocument, deleteDocument } from '../api/client';
import SharingModal from './SharingModal';
import type { DocumentData, SharingEntry, BreadcrumbItem } from '../types';

interface DocumentViewerProps {
  documentId: string;
  onClose: () => void;
  onNavigateFolder: (folderId: string | null) => void;
  onDeleted: () => void;
}

export default function DocumentViewer({ documentId, onClose, onNavigateFolder, onDeleted }: DocumentViewerProps) {
  const [doc, setDoc] = useState<(DocumentData & { sharing: SharingEntry[]; breadcrumb: BreadcrumbItem[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [showSharing, setShowSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDocument();
  }, [documentId]);

  async function loadDocument() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchDocument(documentId);
      setDoc(res.document);
      setEditContent(res.document.content || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load document');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!doc) return;
    setSaving(true);
    try {
      const res = await updateDocument(doc.id, { content: editContent });
      setDoc(prev => prev ? { ...prev, ...res.document } : null);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!doc) return;
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await deleteDocument(doc.id);
      onDeleted();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  }

  const canEdit = doc?.permission === 'owner' || doc?.permission === 'editor';
  const canDelete = doc?.permission === 'owner';
  const FileIcon = doc ? getFileIcon(doc.type) : FileText;
  const fileColor = doc ? getFileColor(doc.type) : '#A3A3A3';

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 40 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-surface-600 border-l border-white/[0.06] z-50 flex flex-col shadow-2xl shadow-black/50"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${fileColor}15` }}
            >
              <FileIcon className="w-5 h-5" style={{ color: fileColor }} />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold truncate">{doc?.name || 'Loading...'}</h2>
              {doc && (
                <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                  <div className="flex items-center gap-1">
                    {doc.permission === 'owner' ? <Shield className="w-3 h-3" /> : doc.permission === 'editor' ? <Pencil className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span className="capitalize">{doc.permission}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {canEdit && !editing && (
              <button
                onClick={() => setEditing(true)}
                className="p-2 rounded-lg hover:bg-white/[0.06] text-neutral-400 hover:text-white transition-colors"
                title="Edit"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
            {doc?.permission === 'owner' && (
              <button
                onClick={() => setShowSharing(true)}
                className="p-2 rounded-lg hover:bg-white/[0.06] text-neutral-400 hover:text-white transition-colors"
                title="Share"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                className="p-2 rounded-lg hover:bg-red-500/10 text-neutral-400 hover:text-red-400 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/[0.06] text-neutral-400 hover:text-white transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Breadcrumb */}
        {doc?.breadcrumb && (
          <div className="px-6 py-2 flex items-center gap-1 text-xs border-b border-white/[0.04]">
            <button
              onClick={() => { onNavigateFolder(null); onClose(); }}
              className="text-neutral-500 hover:text-white transition-colors flex items-center gap-1"
            >
              <Home className="w-3 h-3" />
              Drive
            </button>
            {doc.breadcrumb.map((item, i) => (
              <div key={item.id} className="flex items-center gap-1">
                <ChevronRight className="w-3 h-3 text-neutral-600" />
                <button
                  onClick={() => {
                    if (i < doc.breadcrumb.length - 1 && item.id.startsWith('folder:')) {
                      onNavigateFolder(item.id);
                      onClose();
                    }
                  }}
                  className={`transition-colors ${
                    i === doc.breadcrumb.length - 1
                      ? 'text-neutral-300 font-medium'
                      : 'text-neutral-500 hover:text-white'
                  }`}
                >
                  {item.name}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 px-6">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
                <Shield className="w-8 h-8 text-red-400" />
              </div>
              <p className="text-red-400 font-medium">Access Denied</p>
              <p className="text-sm text-neutral-500 text-center">{error}</p>
            </div>
          ) : editing ? (
            <div className="flex flex-col h-full">
              <textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                className="flex-1 bg-transparent text-sm text-neutral-300 font-mono p-6 resize-none focus:outline-none leading-relaxed"
                spellCheck={false}
              />
              <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-white/[0.06]">
                <button
                  onClick={() => { setEditing(false); setEditContent(doc?.content || ''); }}
                  className="px-4 py-2 rounded-lg text-sm text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-primary text-white hover:bg-primary-500 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <pre className="text-sm text-neutral-300 font-mono whitespace-pre-wrap leading-relaxed">
                {doc?.content || 'No content'}
              </pre>
            </div>
          )}
        </div>

        {/* Sharing info footer */}
        {doc?.sharing && doc.sharing.length > 0 && (
          <div className="px-6 py-3 border-t border-white/[0.06] flex items-center gap-2">
            <div className="flex -space-x-2">
              {doc.sharing.slice(0, 4).map(s => (
                <div
                  key={s.id}
                  className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/60 to-accent-blue/60 flex items-center justify-center text-[9px] font-bold border-2 border-surface-600"
                  title={`${s.name} (${s.permission})`}
                >
                  {s.avatar}
                </div>
              ))}
            </div>
            <span className="text-[11px] text-neutral-500">
              {doc.sharing.length} {doc.sharing.length === 1 ? 'person' : 'people'} have access
            </span>
          </div>
        )}
      </motion.div>

      {/* Sharing Modal */}
      <AnimatePresence>
        {showSharing && doc && (
          <SharingModal
            objectId={doc.id}
            objectName={doc.name}
            onClose={() => setShowSharing(false)}
            onUpdated={loadDocument}
          />
        )}
      </AnimatePresence>
    </>
  );
}
