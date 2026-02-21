import type { UserData, FolderData, DocumentData, SharingEntry } from '../types';

let currentUserId = 'user:alice';

export function setCurrentUser(userId: string) {
  currentUserId = userId;
}

export function getCurrentUserId() {
  return currentUserId;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': currentUserId,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || error.detail || 'Request failed');
  }

  return res.json();
}

// Users
export const fetchUsers = () => request<{ users: UserData[] }>('/users');
export const fetchCurrentUser = () => request<{ user: UserData }>('/users/me');

// Folders
export const fetchFolders = (parentFolder?: string) =>
  request<{ folders: FolderData[] }>(`/folders?parentFolder=${parentFolder || 'root'}`);

export const fetchFolder = (id: string) =>
  request<{ folder: FolderData & { sharing: SharingEntry[]; breadcrumb: { id: string; name: string }[] } }>(`/folders/${id}`);

export const createFolder = (data: { name: string; parentFolder?: string; color?: string; icon?: string }) =>
  request<{ folder: FolderData }>('/folders', { method: 'POST', body: JSON.stringify(data) });

export const deleteFolder = (id: string) =>
  request<{ success: boolean }>(`/folders/${id}`, { method: 'DELETE' });

// Documents
export const fetchDocuments = (parentFolder?: string, search?: string) => {
  const params = new URLSearchParams();
  if (parentFolder) params.set('parentFolder', parentFolder);
  if (search) params.set('search', search);
  return request<{ documents: DocumentData[] }>(`/documents?${params}`);
};

export const fetchDocument = (id: string) =>
  request<{ document: DocumentData & { sharing: SharingEntry[]; breadcrumb: { id: string; name: string }[] } }>(`/documents/${id}`);

export const createDocument = (data: { name: string; parentFolder: string; type?: string; content?: string }) =>
  request<{ document: DocumentData }>('/documents', { method: 'POST', body: JSON.stringify(data) });

export const updateDocument = (id: string, data: { name?: string; content?: string }) =>
  request<{ document: DocumentData }>(`/documents/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteDocument = (id: string) =>
  request<{ success: boolean }>(`/documents/${id}`, { method: 'DELETE' });

// Sharing
export const fetchSharing = (objectId: string) =>
  request<{ sharing: SharingEntry[] }>(`/sharing/${objectId}`);

export const addSharing = (objectId: string, userId: string, relation: string) =>
  request<{ sharing: SharingEntry[] }>(`/sharing/${objectId}`, {
    method: 'POST',
    body: JSON.stringify({ userId, relation }),
  });

export const removeSharing = (objectId: string, userId: string) =>
  request<{ sharing: SharingEntry[] }>(`/sharing/${objectId}/${userId}`, { method: 'DELETE' });
