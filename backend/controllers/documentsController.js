import { v4 as uuidv4 } from 'uuid';
import store from '../store/dataStore.js';
import fgaEngine from '../auth/fgaEngine.js';

export function listDocuments(req, res) {
  const { parentFolder, search } = req.query;
  let docs = Array.from(store.documents.values());

  // Filter by access
  docs = docs.filter(d => fgaEngine.check(req.userId, 'viewer', d.id));

  // Filter by parent folder
  if (parentFolder) {
    docs = docs.filter(d => d.parentFolder === parentFolder);
  }

  // Search
  if (search) {
    const q = search.toLowerCase();
    docs = docs.filter(d => d.name.toLowerCase().includes(q) || (d.content && d.content.toLowerCase().includes(q)));
  }

  const docsWithPermissions = docs.map(d => ({
    ...d,
    content: undefined, // Don't send content in list
    permission: fgaEngine.getPermissionLevel(req.userId, d.id),
  }));

  res.json({ documents: docsWithPermissions });
}

export function getDocument(req, res) {
  const doc = store.documents.get(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Document not found' });

  const permission = fgaEngine.getPermissionLevel(req.userId, doc.id);
  const sharing = fgaEngine.getObjectSharing(doc.id);

  // Build breadcrumb
  const breadcrumb = [];
  let currentFolder = doc.parentFolder ? store.folders.get(doc.parentFolder) : null;
  while (currentFolder) {
    breadcrumb.unshift({ id: currentFolder.id, name: currentFolder.name });
    currentFolder = currentFolder.parentFolder ? store.folders.get(currentFolder.parentFolder) : null;
  }
  breadcrumb.push({ id: doc.id, name: doc.name });

  res.json({ document: { ...doc, permission, sharing, breadcrumb } });
}

export function createDocument(req, res) {
  const { name, parentFolder, type, content } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  if (!parentFolder) return res.status(400).json({ error: 'Parent folder is required' });

  const id = `doc:${uuidv4().slice(0, 8)}`;
  const doc = {
    id,
    name,
    parentFolder,
    size: content ? content.length : 0,
    type: type || 'document',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: req.userId,
    content: content || '',
  };

  store.documents.set(id, doc);

  // Authorization tuples
  store.addTuple(req.userId, 'owner', id);
  store.addTuple(parentFolder, 'parent_folder', id);

  res.status(201).json({ document: { ...doc, permission: 'owner' } });
}

export function updateDocument(req, res) {
  const doc = store.documents.get(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Document not found' });

  const { name, content } = req.body;
  if (name) doc.name = name;
  if (content !== undefined) {
    doc.content = content;
    doc.size = content.length;
  }
  doc.updatedAt = new Date().toISOString();

  store.documents.set(doc.id, doc);
  res.json({ document: { ...doc, permission: req.permissionLevel } });
}

export function deleteDocument(req, res) {
  const docId = req.params.id;
  if (!store.documents.has(docId)) return res.status(404).json({ error: 'Document not found' });

  store.documents.delete(docId);
  store.tuples = store.tuples.filter(t => t.object !== docId && t.user !== docId);

  res.json({ success: true });
}
