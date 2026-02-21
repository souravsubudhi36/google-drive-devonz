/**
 * OpenFGA SDK Client
 * 
 * Connects to a real OpenFGA server instance using the official @openfga/sdk.
 * 
 * Required environment variables:
 *   OPENFGA_API_URL   - The URL of your OpenFGA server (e.g., http://localhost:8080)
 *   OPENFGA_STORE_ID  - (Optional) Existing store ID. If empty, a new store is created.
 *   OPENFGA_MODEL_ID  - (Optional) Existing model ID. If empty, the model is written on startup.
 */

import { OpenFgaClient } from '@openfga/sdk';

let fgaClient = null;
let storeId = null;
let modelId = null;

/**
 * The OpenFGA authorization model matching the user's DSL.
 */
const AUTHORIZATION_MODEL = {
  schema_version: '1.1',
  type_definitions: [
    {
      type: 'user',
    },
    {
      type: 'organization',
      relations: {
        admin: {
          this: {},
        },
        member: {
          union: {
            child: [
              { this: {} },
              { computedUserset: { relation: 'admin' } },
            ],
          },
        },
      },
      metadata: {
        relations: {
          admin: { directly_related_user_types: [{ type: 'user' }] },
          member: { directly_related_user_types: [{ type: 'user' }] },
        },
      },
    },
    {
      type: 'folder',
      relations: {
        parent_org: {
          this: {},
        },
        parent_folder: {
          this: {},
        },
        owner: {
          this: {},
        },
        editor: {
          union: {
            child: [
              { this: {} },
              { computedUserset: { relation: 'owner' } },
              { tupleToUserset: { tupleset: { relation: 'parent_folder' }, computedUserset: { relation: 'editor' } } },
            ],
          },
        },
        viewer: {
          union: {
            child: [
              { this: {} },
              { computedUserset: { relation: 'editor' } },
              { tupleToUserset: { tupleset: { relation: 'parent_folder' }, computedUserset: { relation: 'viewer' } } },
            ],
          },
        },
      },
      metadata: {
        relations: {
          parent_org: { directly_related_user_types: [{ type: 'organization' }] },
          parent_folder: { directly_related_user_types: [{ type: 'folder' }] },
          owner: { directly_related_user_types: [{ type: 'user' }] },
          editor: { directly_related_user_types: [{ type: 'user' }, { type: 'organization', relation: 'member' }] },
          viewer: { directly_related_user_types: [{ type: 'user' }, { type: 'organization', relation: 'member' }] },
        },
      },
    },
    {
      type: 'document',
      relations: {
        parent_folder: {
          this: {},
        },
        owner: {
          this: {},
        },
        editor: {
          union: {
            child: [
              { this: {} },
              { computedUserset: { relation: 'owner' } },
              { tupleToUserset: { tupleset: { relation: 'parent_folder' }, computedUserset: { relation: 'editor' } } },
            ],
          },
        },
        viewer: {
          union: {
            child: [
              { this: {} },
              { computedUserset: { relation: 'editor' } },
              { tupleToUserset: { tupleset: { relation: 'parent_folder' }, computedUserset: { relation: 'viewer' } } },
            ],
          },
        },
        can_edit: {
          computedUserset: { relation: 'editor' },
        },
        can_view: {
          computedUserset: { relation: 'viewer' },
        },
        can_delete: {
          computedUserset: { relation: 'owner' },
        },
      },
      metadata: {
        relations: {
          parent_folder: { directly_related_user_types: [{ type: 'folder' }] },
          owner: { directly_related_user_types: [{ type: 'user' }] },
          editor: { directly_related_user_types: [{ type: 'user' }] },
          viewer: { directly_related_user_types: [{ type: 'user' }] },
          can_edit: {},
          can_view: {},
          can_delete: {},
        },
      },
    },
  ],
};

/**
 * Initialize the OpenFGA client, create store if needed, write the model.
 */
export async function initOpenFGA() {
  const apiUrl = process.env.OPENFGA_API_URL || 'http://localhost:8080';
  storeId = process.env.OPENFGA_STORE_ID || null;
  modelId = process.env.OPENFGA_MODEL_ID || null;

  console.log(`[OpenFGA] Connecting to server at: ${apiUrl}`);

  // Step 1: Create a temporary client to create/find a store
  if (!storeId) {
    const tempClient = new OpenFgaClient({ apiUrl });

    console.log('[OpenFGA] No OPENFGA_STORE_ID provided. Creating a new store...');
    const storeResponse = await tempClient.createStore({
      name: 'mini-drive-store',
    });
    storeId = storeResponse.id;
    console.log(`[OpenFGA] Store created with ID: ${storeId}`);
  } else {
    console.log(`[OpenFGA] Using existing store: ${storeId}`);
  }

  // Step 2: Create the real client with the store ID
  fgaClient = new OpenFgaClient({
    apiUrl,
    storeId,
    authorizationModelId: modelId || undefined,
  });

  // Step 3: Write the authorization model if no model ID was provided
  if (!modelId) {
    console.log('[OpenFGA] Writing authorization model...');
    const modelResponse = await fgaClient.writeAuthorizationModel(AUTHORIZATION_MODEL);
    modelId = modelResponse.authorization_model_id;
    console.log(`[OpenFGA] Model written with ID: ${modelId}`);

    // Update client with the new model ID
    fgaClient = new OpenFgaClient({
      apiUrl,
      storeId,
      authorizationModelId: modelId,
    });
  } else {
    console.log(`[OpenFGA] Using existing model: ${modelId}`);
  }

  console.log('[OpenFGA] Client initialized successfully.');
  console.log(`[OpenFGA]   API URL:  ${apiUrl}`);
  console.log(`[OpenFGA]   Store ID: ${storeId}`);
  console.log(`[OpenFGA]   Model ID: ${modelId}`);

  return { storeId, modelId };
}

/**
 * Get the initialized OpenFGA client.
 * Throws if not initialized.
 */
export function getClient() {
  if (!fgaClient) {
    throw new Error('OpenFGA client not initialized. Call initOpenFGA() first.');
  }
  return fgaClient;
}

export function getStoreId() {
  return storeId;
}

export function getModelId() {
  return modelId;
}

export { AUTHORIZATION_MODEL };
