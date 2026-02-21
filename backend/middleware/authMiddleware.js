import store from '../store/dataStore.js';
import fgaEngine from '../auth/fgaEngine.js';

/**
 * Simulated authentication middleware.
 * In production, this would validate JWT tokens.
 * Here we use a header `x-user-id` to identify the current user.
 */
export function authenticate(req, res, next) {
  const userId = req.headers['x-user-id'] || 'user:alice';
  const user = store.users.get(userId);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: Unknown user' });
  }
  req.currentUser = user;
  req.userId = userId;
  next();
}

/**
 * Authorization middleware factory.
 * Creates middleware that checks if the current user has the required
 * relation on the target object.
 * 
 * Uses the OpenFGA SDK (via fgaEngine) to perform the check against
 * the real OpenFGA server — NOT any local logic.
 *
 * @param {string} relation - The relation to check (e.g., 'can_view', 'can_edit', 'can_delete')
 * @param {Function} getObjectId - Function to extract the FGA object ID from the request
 */
export function authorize(relation, getObjectId) {
  return async (req, res, next) => {
    const objectId = getObjectId(req);
    if (!objectId) {
      return res.status(400).json({ error: 'Bad request: Missing object identifier' });
    }

    try {
      const allowed = await fgaEngine.check(req.userId, relation, objectId);
      if (!allowed) {
        return res.status(403).json({
          error: 'Forbidden',
          detail: `User ${req.userId} does not have '${relation}' on ${objectId}`,
        });
      }

      req.permissionLevel = await fgaEngine.getPermissionLevel(req.userId, objectId);
      next();
    } catch (err) {
      console.error('[Auth Middleware Error]:', err.message);
      return res.status(500).json({ error: 'Authorization check failed', detail: err.message });
    }
  };
}
