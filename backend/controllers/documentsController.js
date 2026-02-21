import { v4 as uuidv4 } from 'uuid';
import store from '../store/dataStore.js';
import fgaEngine from '../auth/fgaEngine.js';

export async function listDocuments(req, res) {
  const { parentFolder, search } = req.query;
  let docs = Array.from(store.documents.values());

  // Filter by access via OpenFGA server
  const accessChecks = await Promise.all(
    docs.map(async d => ({
      doc: d,
      canView: await fgaEngine.check(req.userId, 'viewer', d.id),
    }))
  );

  docs = accessChecks.filter(({ canView }) => canView).map(({ doc }) => doc);

  // Filter by parent folder
  if (parentFolder) {
    docs = docs.filter(d => d.parentFolder === parentFolder);
  }

  // Search
  if (search) {
    const q = search.toLowerCase();
    docs = docs.filter(d => d.name.toLowerCase().includes(q) || (d.content && d.content.toLowerCase().includes(q)));
  }

  const docsWithPermissions = await Promise.all(
    docs.map(async d => ({
      ...d,
      content: undefined,
      permission: await fgaEngine.getPermissionLevel(req.userId, d.id),
    }))
  );

  res.json({ documents: docsWithPermissions });
}

export async function getDocument(req, res) {
  const doc = store.documents.get(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Document not found' });

  const permission = await fgaEngine.getPermissionLevel(req.userId, doc.id);
  const sharing = await fgaEngine.getObjectSharing(doc.id);

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

export async function createDocument(req, res) {
  const { name, parentFolder, type, content } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  if (!parentFolder) return res.status(400).json({ error: 'Parent folder is required' });

  const id = `document:${uuidv4().slice(0, 8)}`;
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

  // Write authorization tuples to OpenFGA server via SDK
  try {
    await fgaEngine.writeTuples([
      { user: req.userId, relation: 'owner', object: id },
      { user: parentFolder, relation: 'parent_folder', object: id },
    ]);
  } catch (err) {
    console.error('[Create Document] Failed to write tuples:', err.message);
  }

  res.status(201).json({ document: { ...doc, permission: 'owner' } });
}

export async function updateDocument(req, res) {
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

export async function deleteDocument(req, res) {
  const docId = req.params.id;
  if (!store.documents.has(docId)) return res.status(404).json({ error: 'Document not found' });

  store.documents.delete(docId);

  res.json({ success: true });
}
