import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, FileText, Folder } from 'lucide-react';
import { fetchDocuments } from '../api/client';
import { getFileIcon, getFileColor } from './icons/FileIcons';
import type { DocumentData } from '../types';

interface SearchBarProps {
  onSelectDocument: (docId: string) => void;
}

export default function SearchBar({ onSelectDocument }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DocumentData[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetchDocuments(undefined, query);
        setResults(res.documents);
        setShowResults(true);
      } catch (err) {
        console.error(err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutRef.current);
  }, [query]);

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => query && setShowResults(true)}
          placeholder="Search files and folders..."
          className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl pl-10 pr-10 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-primary/30 focus:bg-white/[0.06] transition-all"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setShowResults(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute top-full left-0 right-0 mt-2 glass rounded-xl overflow-hidden shadow-2xl shadow-black/40 z-50 max-h-80 overflow-y-auto"
          >
            {searching ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : results.length === 0 ? (
              <div className="py-8 text-center text-sm text-neutral-500">No results found</div>
            ) : (
              <div className="py-1">
                {results.map(doc => {
                  const FileIcon = getFileIcon(doc.type);
                  const fileColor = getFileColor(doc.type);
                  return (
                    <button
                      key={doc.id}
                      onClick={() => {
                        onSelectDocument(doc.id);
                        setShowResults(false);
                        setQuery('');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.04] transition-colors text-left"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${fileColor}12` }}
                      >
                        <FileIcon className="w-4 h-4" style={{ color: fileColor }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-white truncate">{doc.name}</p>
                        <p className="text-[10px] text-neutral-500 capitalize">{doc.permission}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
