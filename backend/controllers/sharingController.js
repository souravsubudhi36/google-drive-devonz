import store from '../store/dataStore.js';
import fgaEngine from '../auth/fgaEngine.js';

export async function getSharing(req, res) {
  const { objectId } = req.params;
  const sharing = await fgaEngine.getObjectSharing(objectId);
  res.json({ sharing });
}

export async function addSharing(req, res) {
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

  // Remove existing direct tuples for this user on this object via OpenFGA SDK
  const tuplesToDelete = [];
  for (const rel of ['owner', 'editor', 'viewer']) {
    try {
      const hasRelation = await fgaEngine.check(userId, rel, objectId);
      if (hasRelation) {
        tuplesToDelete.push({ user: userId, relation: rel, object: objectId });
      }
    } catch {
      // Ignore check errors during cleanup
    }
  }

  // Try to delete old tuples (may fail if they don't exist as direct tuples)
  for (const tuple of tuplesToDelete) {
    try {
      await fgaEngine.deleteTuples([tuple]);
    } catch {
      // Tuple may not exist as a direct relationship (could be inherited)
    }
  }

  // Write new tuple to OpenFGA server
  try {
    await fgaEngine.writeTuples([{ user: userId, relation, object: objectId }]);
  } catch (err) {
    console.error('[Add Sharing] Failed to write tuple:', err.message);
    return res.status(500).json({ error: 'Failed to update sharing' });
  }

  const sharing = await fgaEngine.getObjectSharing(objectId);
  res.json({ sharing });
}

export async function removeSharing(req, res) {
  const { objectId, userId } = req.params;

  // Remove all direct tuples for this user on this object
  for (const rel of ['owner', 'editor', 'viewer']) {
    try {
      await fgaEngine.deleteTuples([{ user: userId, relation: rel, object: objectId }]);
    } catch {
      // Tuple may not exist
    }
  }

  const sharing = await fgaEngine.getObjectSharing(objectId);
  res.json({ sharing });
}
