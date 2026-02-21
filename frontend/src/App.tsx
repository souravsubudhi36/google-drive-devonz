import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Grid3X3,
  List,
  Plus,
  FolderPlus,
  FilePlus,
  SlidersHorizontal,
  RefreshCw,
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import Breadcrumb from './components/Breadcrumb';
import FolderCard from './components/FolderCard';
import DocumentRow from './components/DocumentRow';
import DocumentViewer from './components/DocumentViewer';
import CreateModal from './components/CreateModal';
import EmptyState from './components/EmptyState';
import SearchBar from './components/SearchBar';
import AuthorizationPanel from './components/AuthorizationPanel';
import type { UserData, FolderData, DocumentData, BreadcrumbItem, ViewMode } from './types';
import {
  setCurrentUser,
  getCurrentUserId,
  fetchUsers,
  fetchCurrentUser,
  fetchFolders,
  fetchFolder,
  fetchDocuments,
  createFolder as apiCreateFolder,
  createDocument as apiCreateDocument,
} from './api/client';

export default function App() {
  const [currentUser, setCurrentUserState] = useState<UserData | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [createModal, setCreateModal] = useState<{ type: 'folder' | 'document' } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load users
  useEffect(() => {
    async function loadUsers() {
      try {
        const [usersRes, meRes] = await Promise.all([fetchUsers(), fetchCurrentUser()]);
        setUsers(usersRes.users);
        setCurrentUserState(meRes.user);
      } catch (err) {
        console.error('Failed to load users:', err);
      }
    }
    loadUsers();
  }, [refreshKey]);

  // Load folder contents
  const loadContents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [foldersRes, docsRes] = await Promise.all([
        fetchFolders(currentFolderId || undefined),
        fetchDocuments(currentFolderId || undefined),
      ]);
      setFolders(foldersRes.folders);
      setDocuments(docsRes.documents);

      // Load breadcrumb
      if (currentFolderId) {
        try {
          const folderRes = await fetchFolder(currentFolderId);
          setBreadcrumb(folderRes.folder.breadcrumb || []);
        } catch {
          setBreadcrumb([]);
        }
      } else {
        setBreadcrumb([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contents');
    } finally {
      setLoading(false);
    }
  }, [currentFolderId, refreshKey]);

  useEffect(() => {
    loadContents();
  }, [loadContents]);

  function handleSwitchUser(userId: string) {
    setCurrentUser(userId);
    setCurrentFolderId(null);
    setSelectedDocId(null);
    setRefreshKey(k => k + 1);
  }

  function handleNavigateFolder(folderId: string | null) {
    setCurrentFolderId(folderId);
    setSelectedDocId(null);
  }

  async function handleCreateFolder(data: { name: string; color?: string; icon?: string }) {
    try {
      await apiCreateFolder({
        name: data.name,
        parentFolder: currentFolderId || undefined,
        color: data.color,
        icon: data.icon,
      });
      setCreateModal(null);
      loadContents();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCreateDocument(data: { name: string; type?: string; content?: string }) {
    if (!currentFolderId) {
      alert('Please navigate into a folder first to create a document.');
      return;
    }
    try {
      await apiCreateDocument({
        name: data.name,
        parentFolder: currentFolderId,
        type: data.type,
        content: data.content,
      });
      setCreateModal(null);
      loadContents();
    } catch (err) {
      console.error(err);
    }
  }

  const storageUsed = documents.reduce((acc, d) => acc + d.size, 0) / (1024 * 1024 * 1024);
  const isEmpty = folders.length === 0 && documents.length === 0;

  return (
    <div className="flex h-screen overflow-hidden bg-[#0F0F0F]">
      {/* Sidebar */}
      <Sidebar
        currentUser={currentUser}
        users={users}
        onSwitchUser={handleSwitchUser}
        onNavigateHome={() => handleNavigateFolder(null)}
        activeSection="drive"
        storageUsed={storageUsed}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <SearchBar onSelectDocument={setSelectedDocId} />

          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white/[0.08] text-white' : 'text-neutral-500 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-white/[0.08] text-white' : 'text-neutral-500 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-white/[0.06] mx-1" />
            <button
              onClick={() => setRefreshKey(k => k + 1)}
              className="p-2 rounded-lg text-neutral-500 hover:text-white hover:bg-white/[0.04] transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Breadcrumb & Actions */}
          <div className="flex items-center justify-between mb-5">
            <Breadcrumb items={breadcrumb} onNavigate={handleNavigateFolder} />
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCreateModal({ type: 'folder' })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-colors"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                New Folder
              </button>
              {currentFolderId && (
                <button
                  onClick={() => setCreateModal({ type: 'document' })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors"
                >
                  <FilePlus className="w-3.5 h-3.5" />
                  New Document
                </button>
              )}
            </div>
          </div>

          {/* Authorization Panel */}
          <div className="mb-5">
            <AuthorizationPanel users={users} />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <p className="text-red-400 font-medium">{error}</p>
              <button
                onClick={loadContents}
                className="text-sm text-primary hover:underline"
              >
                Try again
              </button>
            </div>
          ) : isEmpty ? (
            <EmptyState
              title={currentFolderId ? 'This folder is empty' : 'Your drive is empty'}
              description={currentFolderId ? 'Create a new document or folder to get started' : 'Create folders to organize your files'}
              onAction={() => setCreateModal({ type: currentFolderId ? 'document' : 'folder' })}
              actionLabel={currentFolderId ? 'New Document' : 'New Folder'}
            />
          ) : (
            <>
              {/* Folders */}
              {folders.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">
                    Folders
                  </h2>
                  <div className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3'
                      : 'space-y-1'
                  }>
                    {folders.map((folder, i) => (
                      <FolderCard
                        key={folder.id}
                        folder={folder}
                        onClick={() => handleNavigateFolder(folder.id)}
                        index={i}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Documents */}
              {documents.length > 0 && (
                <section>
                  <h2 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">
                    Documents
                  </h2>
                  <div className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3'
                      : 'space-y-0.5'
                  }>
                    {documents.map((doc, i) => (
                      <DocumentRow
                        key={doc.id}
                        doc={doc}
                        onClick={() => setSelectedDocId(doc.id)}
                        index={i}
                        viewMode={viewMode}
                      />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>

      {/* Document Viewer Slide-over */}
      <AnimatePresence>
        {selectedDocId && (
          <DocumentViewer
            documentId={selectedDocId}
            onClose={() => setSelectedDocId(null)}
            onNavigateFolder={handleNavigateFolder}
            onDeleted={loadContents}
          />
        )}
      </AnimatePresence>

      {/* Create Modal */}
      <AnimatePresence>
        {createModal && (
          <CreateModal
            type={createModal.type}
            parentFolder={currentFolderId}
            onClose={() => setCreateModal(null)}
            onCreate={createModal.type === 'folder' ? handleCreateFolder : handleCreateDocument}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
