import store from '../store/dataStore.js';
import fgaEngine from '../auth/fgaEngine.js';

export function getSharing(req, res) {
  const { objectId } = req.params;
  const sharing = fgaEngine.getObjectSharing(objectId);
  res.json({ sharing });
}

export function addSharing(req, res) {
  const { objectId } = req.params;
  const { userId, relation } = req.body;

  if (!userId || !relation) {
    return res.status(400).json({ error: 'userId and relation are required' });
  }

  if (!['owner', 'editor', 'viewer'].includes(relation)) {
    return res.status(400).json({ error: 'Invalid relation. Must be owner, editor, or viewer' });
  }

  if (!store.users.has(userId)) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Remove existing direct tuples for this user on this object
  store.removeTuple(userId, 'owner', objectId);
  store.removeTuple(userId, 'editor', objectId);
  store.removeTuple(userId, 'viewer', objectId);

  // Add new tuple
  store.addTuple(userId, relation, objectId);

  const sharing = fgaEngine.getObjectSharing(objectId);
  res.json({ sharing });
}

export function removeSharing(req, res) {
  const { objectId, userId } = req.params;

  store.removeTuple(userId, 'owner', objectId);
  store.removeTuple(userId, 'editor', objectId);
  store.removeTuple(userId, 'viewer', objectId);

  const sharing = fgaEngine.getObjectSharing(objectId);
  res.json({ sharing });
}
