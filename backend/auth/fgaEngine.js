/**
 * OpenFGA Authorization Engine
 * Implements the authorization model from the DSL:
 *
 * - organization: admin, member (admin is also member)
 * - folder: owner, editor (includes owner), viewer (includes editor)
 *   - inherits from parent_folder
 * - document: owner, editor, viewer + can_edit, can_view, can_delete
 *   - inherits from parent_folder
 */

import store from '../store/dataStore.js';

class FGAEngine {
  /**
   * Check if a user has a specific relation to an object.
   * Implements the full resolution logic including inheritance.
   */
  check(userId, relation, objectId, visited = new Set()) {
    const key = `${userId}|${relation}|${objectId}`;
    if (visited.has(key)) return false;
    visited.add(key);

    const objectType = objectId.split(':')[0];

    switch (objectType) {
      case 'organization':
        return this._checkOrganization(userId, relation, objectId, visited);
      case 'folder':
        return this._checkFolder(userId, relation, objectId, visited);
      case 'document':
        return this._checkDocument(userId, relation, objectId, visited);
      default:
        return false;
    }
  }

  _checkOrganization(userId, relation, orgId, visited) {
    // Direct tuple check
    if (this._hasTuple(userId, relation, orgId)) return true;

    // member includes admin
    if (relation === 'member') {
      if (this._hasTuple(userId, 'admin', orgId)) return true;
    }

    return false;
  }

  _checkFolder(userId, relation, folderId, visited) {
    // Direct tuple check
    if (this._hasTuple(userId, relation, folderId)) return true;

    // Check org#member tuples (e.g., organization:acme#member as editor/viewer)
    if (relation === 'editor' || relation === 'viewer') {
      const orgMemberTuples = store.getTuples({ relation, object: folderId });
      for (const tuple of orgMemberTuples) {
        if (tuple.user.includes('#member')) {
          const orgId = tuple.user.split('#')[0].replace('organization:', 'org:');
          if (this.check(userId, 'member', orgId.replace('org:', 'organization:'), visited)) {
            return true;
          }
        }
      }
    }

    // Relation hierarchy: viewer includes editor, editor includes owner
    if (relation === 'editor') {
      if (this._checkFolder(userId, 'owner', folderId, visited)) return true;
    }
    if (relation === 'viewer') {
      if (this._checkFolder(userId, 'editor', folderId, visited)) return true;
    }

    // Inherit from parent_folder
    const parentTuples = store.getTuples({ relation: 'parent_folder', object: folderId });
    for (const pt of parentTuples) {
      const parentFolderId = pt.user;
      if (parentFolderId.startsWith('folder:')) {
        if (this.check(userId, relation, parentFolderId, visited)) return true;

        // Also check hierarchy through parent
        if (relation === 'editor' && this.check(userId, 'owner', parentFolderId, visited)) return true;
        if (relation === 'viewer' && this.check(userId, 'editor', parentFolderId, visited)) return true;
      }
    }

    return false;
  }

  _checkDocument(userId, relation, docId, visited) {
    // Resolve action-based relations
    if (relation === 'can_edit') return this._checkDocument(userId, 'editor', docId, visited);
    if (relation === 'can_view') return this._checkDocument(userId, 'viewer', docId, visited);
    if (relation === 'can_delete') return this._checkDocument(userId, 'owner', docId, visited);

    // Direct tuple check
    if (this._hasTuple(userId, relation, docId)) return true;

    // Relation hierarchy
    if (relation === 'editor') {
      if (this._checkDocument(userId, 'owner', docId, visited)) return true;
    }
    if (relation === 'viewer') {
      if (this._checkDocument(userId, 'editor', docId, visited)) return true;
    }

    // Inherit from parent_folder
    const parentTuples = store.getTuples({ relation: 'parent_folder', object: docId });
    for (const pt of parentTuples) {
      const parentFolderId = pt.user;
      if (parentFolderId.startsWith('folder:')) {
        if (this.check(userId, relation, parentFolderId, visited)) return true;
      }
    }

    return false;
  }

  _hasTuple(user, relation, object) {
    return store.getTuples({ user, relation, object }).length > 0;
  }

  /**
   * List all objects of a given type that a user has a specific relation to.
   */
  listObjects(userId, relation, objectType) {
    const results = [];
    let objects;

    if (objectType === 'folder') {
      objects = store.folders;
    } else if (objectType === 'document') {
      objects = store.documents;
    } else if (objectType === 'organization') {
      objects = store.organizations;
    } else {
      return results;
    }

    for (const [id] of objects) {
      const fgaId = objectType === 'organization' ? id.replace('org:', 'organization:') : id;
      if (this.check(userId, relation, fgaId)) {
        results.push(id);
      }
    }

    return results;
  }

  /**
   * Get the effective permission level for a user on an object.
   */
  getPermissionLevel(userId, objectId) {
    if (this.check(userId, 'owner', objectId)) return 'owner';
    if (this.check(userId, 'editor', objectId)) return 'editor';
    if (this.check(userId, 'viewer', objectId)) return 'viewer';
    return 'none';
  }

  /**
   * Get all users who have access to an object with their roles.
   */
  getObjectSharing(objectId) {
    const sharing = [];
    for (const [userId, user] of store.users) {
      const level = this.getPermissionLevel(userId, objectId);
      if (level !== 'none') {
        sharing.push({ ...user, permission: level });
      }
    }
    return sharing;
  }
}

const fgaEngine = new FGAEngine();
export default fgaEngine;
