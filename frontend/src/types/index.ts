export interface UserData {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface FolderData {
  id: string;
  name: string;
  parentOrg: string;
  parentFolder: string | null;
  color: string;
  icon: string;
  createdAt: string;
  createdBy: string;
  permission: PermissionLevel;
  childCount?: number;
}

export interface DocumentData {
  id: string;
  name: string;
  parentFolder: string;
  size: number;
  type: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  content?: string;
  permission: PermissionLevel;
}

export interface BreadcrumbItem {
  id: string;
  name: string;
}

export interface SharingEntry {
  id: string;
  name: string;
  email: string;
  avatar: string;
  permission: PermissionLevel;
}

export type PermissionLevel = 'owner' | 'editor' | 'viewer' | 'none';

export type ViewMode = 'grid' | 'list';
