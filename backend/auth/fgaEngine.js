/**
 * OpenFGA Authorization Engine
 * 
 * This module wraps the official @openfga/sdk client and provides
 * high-level authorization methods used by the middleware and controllers.
 * 
 * ALL authorization checks go through the real OpenFGA server via the SDK.
 * No local/in-memory authorization logic — the OpenFGA server resolves
 * the full relation graph including inheritance, parent_folder traversal,
 * and computed relations (can_view, can_edit, can_delete).
 */

import { getClient } from './openfgaClient.js';
import store from '../store/dataStore.js';

class FGAEngine {
  /**
   * Check if a user has a specific relation to an object.
   * Delegates to the OpenFGA server via the SDK's check() method.
   * 
   * @param {string} userId - e.g., "user:alice"
   * @param {string} relation - e.g., "can_view", "editor", "owner"
   * @param {string} objectId - e.g., "document:arch-overview", "folder:root-engineering"
   * @returns {Promise<boolean>}
   */
  async check(userId, relation, objectId) {
    try {
      const client = getClient();
      const response = await client.check({
        user: userId,
        relation,
        object: objectId,
      });
      return response.allowed === true;
    } catch (err) {
      console.error(`[FGA Check Error] user=${userId} relation=${relation} object=${objectId}:`, err.message);
      return false;
    }
  }

  /**
   * Write relationship tuples to the OpenFGA server.
   * 
   * @param {Array<{user: string, relation: string, object: string}>} tuples
   */
  async writeTuples(tuples) {
    const client = getClient();
    const writes = tuples.map(t => ({
      user: t.user,
      relation: t.relation,
      object: t.object,
    }));

    await client.write({
      writes,
    }, {
      authorizationModelId: undefined, // uses the one set on the client
    });
  }

  /**
   * Delete relationship tuples from the OpenFGA server.
   * 
   * @param {Array<{user: string, relation: string, object: string}>} tuples
   */
  async deleteTuples(tuples) {
    const client = getClient();
    const deletes = tuples.map(t => ({
      user: t.user,
      relation: t.relation,
      object: t.object,
    }));

    await client.write({
      deletes,
    });
  }

  /**
   * List all objects of a given type that a user has a specific relation to.
   * Uses the OpenFGA ListObjects API.
   * 
   * @param {string} userId - e.g., "user:alice"
   * @param {string} relation - e.g., "viewer"
   * @param {string} objectType - e.g., "folder", "document"
   * @returns {Promise<string[]>} - Array of object IDs
   */
  async listObjects(userId, relation, objectType) {
    try {
      const client = getClient();
      const response = await client.listObjects({
        user: userId,
        relation,
        type: objectType,
      });
      return response.objects || [];
    } catch (err) {
      console.error(`[FGA ListObjects Error] user=${userId} relation=${relation} type=${objectType}:`, err.message);
      return [];
    }
  }

  /**
   * Get the effective permission level for a user on an object.
   * Checks owner → editor → viewer in order.
   * 
   * @param {string} userId
   * @param {string} objectId
   * @returns {Promise<string>} - 'owner' | 'editor' | 'viewer' | 'none'
   */
  async getPermissionLevel(userId, objectId) {
    if (await this.check(userId, 'owner', objectId)) return 'owner';
    if (await this.check(userId, 'editor', objectId)) return 'editor';
    if (await this.check(userId, 'viewer', objectId)) return 'viewer';
    return 'none';
  }

  /**
   * Get all users who have access to an object with their roles.
   * Checks each known user against the object.
   * 
   * @param {string} objectId
   * @returns {Promise<Array>}
   */
  async getObjectSharing(objectId) {
    const sharing = [];
    for (const [userId, user] of store.users) {
      const level = await this.getPermissionLevel(userId, objectId);
      if (level !== 'none') {
        sharing.push({ ...user, permission: level });
      }
    }
    return sharing;
  }

  /**
   * Read tuples from the OpenFGA server (for debugging/display).
   * 
   * @param {Object} filter - { user?, relation?, object? }
   * @returns {Promise<Array>}
   */
  async readTuples(filter = {}) {
    try {
      const client = getClient();
      const response = await client.read({
        user: filter.user || undefined,
        relation: filter.relation || undefined,
        object: filter.object || undefined,
      });
      return response.tuples || [];
    } catch (err) {
      console.error('[FGA ReadTuples Error]:', err.message);
      return [];
    }
  }
}

const fgaEngine = new FGAEngine();
export default fgaEngine;
