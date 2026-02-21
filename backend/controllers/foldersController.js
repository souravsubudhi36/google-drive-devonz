import { v4 as uuidv4 } from 'uuid';
import store from '../store/dataStore.js';
import fgaEngine from '../auth/fgaEngine.js';

export async function listFolders(req, res) {
  const { parentFolder } = req.query;
  const allFolders = Array.from(store.folders.values());

  // Filter folders the user can view (checked via OpenFGA server)
  const accessChecks = await Promise.all(
    allFolders.map(async f => ({
      folder: f,
      canView: await fgaEngine.check(req.userId, 'viewer', f.id),
    }))
  );

  const accessibleFolders = accessChecks
    .filter(({ canView }) => canView)
    .map(({ folder }) => folder)
    .filter(f => {
      if (parentFolder === 'root' || !parentFolder) {
        return f.parentFolder === null;
      }
      return f.parentFolder === parentFolder;
    });

  const foldersWithPermissions = await Promise.all(
    accessibleFolders.map(async f => ({
      ...f,
      permission: await fgaEngine.getPermissionLevel(req.userId, f.id),
      childCount: allFolders.filter(cf => cf.parentFolder === f.id).length +
        Array.from(store.documents.values()).filter(d => d.parentFolder === f.id).length,
    }))
  );

  res.json({ folders: foldersWithPermissions });
}

export async function getFolder(req, res) {
  const folder = store.folders.get(req.params.id);
  if (!folder) return res.status(404).json({ error: 'Folder not found' });

  const permission = await fgaEngine.getPermissionLevel(req.userId, folder.id);
  const sharing = await fgaEngine.getObjectSharing(folder.id);

  // Build breadcrumb
  const breadcrumb = [];
  let current = folder;
  while (current) {
    breadcrumb.unshift({ id: current.id, name: current.name });
    current = current.parentFolder ? store.folders.get(current.parentFolder) : null;
  }

  res.json({ folder: { ...folder, permission, sharing, breadcrumb } });
}

export async function createFolder(req, res) {
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

  // Write authorization tuples to OpenFGA server via SDK
  const tuples = [
    { user: req.userId, relation: 'owner', object: id },
    { user: 'organization:acme', relation: 'parent_org', object: id },
  ];
  if (parentFolder) {
    tuples.push({ user: parentFolder, relation: 'parent_folder', object: id });
  }

  try {
    await fgaEngine.writeTuples(tuples);
  } catch (err) {
    console.error('[Create Folder] Failed to write tuples:', err.message);
  }

  res.status(201).json({ folder: { ...folder, permission: 'owner' } });
}

export async function deleteFolder(req, res) {
  const folderId = req.params.id;
  const folder = store.folders.get(folderId);
  if (!folder) return res.status(404).json({ error: 'Folder not found' });

  // Collect all tuples to delete for this folder and its children
  const tuplesToDelete = [];

  // Remove child documents
  for (const [docId, doc] of store.documents) {
    if (doc.parentFolder === folderId) {
      store.documents.delete(docId);
      // We'd also need to clean up tuples for these docs on the OpenFGA server
    }
  }

  // Remove child folders recursively
  const removeChildFolders = (parentId) => {
    for (const [childId, child] of store.folders) {
      if (child.parentFolder === parentId) {
        removeChildFolders(childId);
        store.folders.delete(childId);
      }
    }
  };
  removeChildFolders(folderId);
  store.folders.delete(folderId);

  res.json({ success: true });
}
