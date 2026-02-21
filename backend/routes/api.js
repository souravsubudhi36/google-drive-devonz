import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { listUsers, getCurrentUser } from '../controllers/usersController.js';
import { listFolders, getFolder, createFolder, deleteFolder } from '../controllers/foldersController.js';
import { listDocuments, getDocument, createDocument, updateDocument, deleteDocument } from '../controllers/documentsController.js';
import { getSharing, addSharing, removeSharing } from '../controllers/sharingController.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Users
router.get('/users', listUsers);
router.get('/users/me', getCurrentUser);

// Folders
router.get('/folders', listFolders);
router.get('/folders/:id',
  authorize('viewer', req => req.params.id),
  getFolder
);
router.post('/folders', createFolder);
router.delete('/folders/:id',
  authorize('owner', req => req.params.id),
  deleteFolder
);

// Documents
router.get('/documents', listDocuments);
router.get('/documents/:id',
  authorize('can_view', req => req.params.id),
  getDocument
);
router.post('/documents', createDocument);
router.put('/documents/:id',
  authorize('can_edit', req => req.params.id),
  updateDocument
);
router.delete('/documents/:id',
  authorize('can_delete', req => req.params.id),
  deleteDocument
);

// Sharing
router.get('/sharing/:objectId',
  authorize('viewer', req => req.params.objectId),
  getSharing
);
router.post('/sharing/:objectId',
  authorize('owner', req => req.params.objectId),
  addSharing
);
router.delete('/sharing/:objectId/:userId',
  authorize('owner', req => req.params.objectId),
  removeSharing
);

export default router;
