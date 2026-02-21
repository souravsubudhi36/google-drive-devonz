/**
 * FGA Debug/Tester Controller
 * 
 * Exposes endpoints for the frontend Authorization Tester panel
 * to perform direct OpenFGA checks via the SDK.
 */

import fgaEngine from '../auth/fgaEngine.js';
import { getStoreId, getModelId } from '../auth/openfgaClient.js';

export async function checkPermission(req, res) {
  const { user, relation, object } = req.body;

  if (!user || !relation || !object) {
    return res.status(400).json({ error: 'user, relation, and object are required' });
  }

  try {
    const allowed = await fgaEngine.check(user, relation, object);
    res.json({
      allowed,
      user,
      relation,
      object,
      checkedVia: 'OpenFGA SDK → OpenFGA Server',
      storeId: getStoreId(),
      modelId: getModelId(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function listObjectsForUser(req, res) {
  const { user, relation, type } = req.query;

  if (!user || !relation || !type) {
    return res.status(400).json({ error: 'user, relation, and type query params are required' });
  }

  try {
    const objects = await fgaEngine.listObjects(user, relation, type);
    res.json({ objects, user, relation, type });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export function getConnectionInfo(req, res) {
  res.json({
    storeId: getStoreId(),
    modelId: getModelId(),
    apiUrl: process.env.OPENFGA_API_URL || 'http://localhost:8080',
    status: 'connected',
  });
}
