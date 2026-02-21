/**
 * Seeds the OpenFGA server with initial relationship tuples.
 * 
 * This runs once on server startup after the OpenFGA client is initialized.
 * It writes all the authorization relationships to the real OpenFGA server
 * via the SDK — NOT to any local in-memory store.
 */

import fgaEngine from './fgaEngine.js';

const SEED_TUPLES = [
  // ── Organization membership ──
  { user: 'user:alice', relation: 'admin', object: 'organization:acme' },
  { user: 'user:bob', relation: 'member', object: 'organization:acme' },
  { user: 'user:charlie', relation: 'member', object: 'organization:acme' },

  // ── Folder: parent org relationships ──
  { user: 'organization:acme', relation: 'parent_org', object: 'folder:root-engineering' },
  { user: 'organization:acme', relation: 'parent_org', object: 'folder:root-design' },
  { user: 'organization:acme', relation: 'parent_org', object: 'folder:root-marketing' },

  // ── Folder: parent folder relationships (hierarchy) ──
  { user: 'folder:root-engineering', relation: 'parent_folder', object: 'folder:frontend' },
  { user: 'folder:root-engineering', relation: 'parent_folder', object: 'folder:backend' },
  { user: 'folder:root-design', relation: 'parent_folder', object: 'folder:brand-assets' },

  // ── Folder: direct ownership/access ──
  { user: 'user:alice', relation: 'owner', object: 'folder:root-engineering' },
  { user: 'organization:acme#member', relation: 'viewer', object: 'folder:root-engineering' },
  { user: 'user:alice', relation: 'owner', object: 'folder:root-design' },
  { user: 'user:bob', relation: 'editor', object: 'folder:root-design' },
  { user: 'user:bob', relation: 'owner', object: 'folder:root-marketing' },
  { user: 'organization:acme#member', relation: 'editor', object: 'folder:root-marketing' },
  { user: 'user:alice', relation: 'owner', object: 'folder:frontend' },
  { user: 'user:alice', relation: 'owner', object: 'folder:backend' },
  { user: 'user:charlie', relation: 'editor', object: 'folder:backend' },
  { user: 'user:bob', relation: 'owner', object: 'folder:brand-assets' },

  // ── Document: parent folder relationships ──
  { user: 'folder:root-engineering', relation: 'parent_folder', object: 'document:arch-overview' },
  { user: 'folder:backend', relation: 'parent_folder', object: 'document:api-spec' },
  { user: 'folder:frontend', relation: 'parent_folder', object: 'document:react-guide' },
  { user: 'folder:root-design', relation: 'parent_folder', object: 'document:design-system' },
  { user: 'folder:brand-assets', relation: 'parent_folder', object: 'document:logo-guidelines' },
  { user: 'folder:root-marketing', relation: 'parent_folder', object: 'document:campaign-q2' },
  { user: 'folder:root-engineering', relation: 'parent_folder', object: 'document:meeting-notes' },
  { user: 'folder:backend', relation: 'parent_folder', object: 'document:db-schema' },

  // ── Document: direct ownership/access ──
  { user: 'user:alice', relation: 'owner', object: 'document:arch-overview' },
  { user: 'user:alice', relation: 'owner', object: 'document:api-spec' },
  { user: 'user:alice', relation: 'owner', object: 'document:react-guide' },
  { user: 'user:bob', relation: 'owner', object: 'document:design-system' },
  { user: 'user:bob', relation: 'owner', object: 'document:logo-guidelines' },
  { user: 'user:bob', relation: 'owner', object: 'document:campaign-q2' },
  { user: 'user:charlie', relation: 'owner', object: 'document:meeting-notes' },
  { user: 'user:charlie', relation: 'owner', object: 'document:db-schema' },
  { user: 'user:diana', relation: 'viewer', object: 'document:design-system' },
  { user: 'user:charlie', relation: 'editor', object: 'document:api-spec' },
];

/**
 * Write all seed tuples to the OpenFGA server.
 * Uses batching (max 10 tuples per write call as per OpenFGA limits).
 */
export async function seedTuples() {
  console.log(`[OpenFGA Seed] Writing ${SEED_TUPLES.length} relationship tuples...`);

  const BATCH_SIZE = 10;
  for (let i = 0; i < SEED_TUPLES.length; i += BATCH_SIZE) {
    const batch = SEED_TUPLES.slice(i, i + BATCH_SIZE);
    try {
      await fgaEngine.writeTuples(batch);
      console.log(`[OpenFGA Seed] Wrote batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(SEED_TUPLES.length / BATCH_SIZE)} (${batch.length} tuples)`);
    } catch (err) {
      // If tuples already exist, OpenFGA may return an error — log and continue
      console.warn(`[OpenFGA Seed] Batch ${Math.floor(i / BATCH_SIZE) + 1} warning:`, err.message);
    }
  }

  console.log('[OpenFGA Seed] Seeding complete.');
}

export { SEED_TUPLES };
