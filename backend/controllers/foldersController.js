import { v4 as uuidv4 } from 'uuid';
import store from '../store/dataStore.js';
import fgaEngine from '../auth/fgaEngine.js';

export function listFolders(req, res) {
  const { parentFolder } = req.query;
  const allFolders = Array.from(store.folders.values());

  const accessibleFolders = allFolders.filter(f => {
    const fgaId = f.id;
    // Check if user can view this folder
    if (!fgaEngine.check(req.userId, 'viewer', fgaId)) return false;
    // Filter by parent
    if (parentFolder === 'root' || !parentFolder) {
      return f.parentFolder === null;
    }
    return f.parentFolder === parentFolder;
  });

  const foldersWithPermissions = accessibleFolders.map(f => ({
    ...f,
    permission: fgaEngine.getPermissionLevel(req.userId, f.id),
    childCount: allFolders.filter(cf => cf.parentFolder === f.id).length +
      Array.from(store.documents.values()).filter(d => d.parentFolder === f.id).length,
  }));

  res.json({ folders: foldersWithPermissions });
}

export function getFolder(req, res) {
  const folder = store.folders.get(req.params.id);
  if (!folder) return res.status(404).json({ error: 'Folder not found' });

  const permission = fgaEngine.getPermissionLevel(req.userId, folder.id);
  const sharing = fgaEngine.getObjectSharing(folder.id);

  // Build breadcrumb
  const breadcrumb = [];
  let current = folder;
  while (current) {
    breadcrumb.unshift({ id: current.id, name: current.name });
    current = current.parentFolder ? store.folders.get(current.parentFolder) : null;
  }

  res.json({ folder: { ...folder, permission, sharing, breadcrumb } });
}

export function createFolder(req, res) {
  const { name, parentFolder, color, icon } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const id = `folder:${uuidv4().slice(0, 8)}`;
  const folder = {
    id,
    name,
    parentOrg: 'org:acme',
    parentFolder: parentFolder || null,
    color: color || '#9E7FFF',
    icon: icon || 'folder',
    createdAt: new Date().toISOString(),
    createdBy: req.userId,
  };

  store.folders.set(id, folder);

  // Set up authorization tuples
  store.addTuple(req.userId, 'owner', id);
  store.addTuple('organization:acme', 'parent_org', id);
  if (parentFolder) {
    store.addTuple(parentFolder, 'parent_folder', id);
  }

  res.status(201).json({ folder: { ...folder, permission: 'owner' } });
}

export function deleteFolder(req, res) {
  const folderId = req.params.id;
  const folder = store.folders.get(folderId);
  if (!folder) return res.status(404).json({ error: 'Folder not found' });

  // Remove child documents
  for (const [docId, doc] of store.documents) {
    if (doc.parentFolder === folderId) {
      store.documents.delete(docId);
      store.tuples = store.tuples.filter(t => t.object !== docId && t.user !== docId);
    }
  }

  // Remove child folders recursively
  const removeChildFolders = (parentId) => {
    for (const [childId, child] of store.folders) {
      if (child.parentFolder === parentId) {
        removeChildFolders(childId);
        store.folders.delete(childId);
        store.tuples = store.tuples.filter(t => t.object !== childId && t.user !== childId);
      }
    }
  };
  removeChildFolders(folderId);

  store.folders.delete(folderId);
  store.tuples = store.tuples.filter(t => t.object !== folderId && t.user !== folderId);

  res.json({ success: true });
}
