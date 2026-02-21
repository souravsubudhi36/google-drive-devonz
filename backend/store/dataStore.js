/**
 * In-memory data store for application data (users, folders, documents).
 * 
 * NOTE: Authorization tuples are NO LONGER stored here.
 * All tuples are written to and read from the real OpenFGA server via the SDK.
 * This store only holds application/business data.
 */

class DataStore {
  constructor() {
    this.users = new Map();
    this.organizations = new Map();
    this.folders = new Map();
    this.documents = new Map();

    this._seedAppData();
  }

  _seedAppData() {
    // Seed users
    const users = [
      { id: 'user:alice', name: 'Alice Johnson', email: 'alice@acme.com', avatar: 'AJ' },
      { id: 'user:bob', name: 'Bob Smith', email: 'bob@acme.com', avatar: 'BS' },
      { id: 'user:charlie', name: 'Charlie Davis', email: 'charlie@acme.com', avatar: 'CD' },
      { id: 'user:diana', name: 'Diana Prince', email: 'diana@external.com', avatar: 'DP' },
    ];
    users.forEach(u => this.users.set(u.id, u));

    // Seed organization
    const org = { id: 'org:acme', name: 'Acme Corporation', createdAt: new Date().toISOString() };
    this.organizations.set(org.id, org);

    // Seed folders
    const folders = [
      { id: 'folder:root-engineering', name: 'Engineering', parentOrg: 'org:acme', parentFolder: null, color: '#9E7FFF', icon: 'code', createdAt: '2025-01-15T10:00:00Z', createdBy: 'user:alice' },
      { id: 'folder:root-design', name: 'Design', parentOrg: 'org:acme', parentFolder: null, color: '#f472b6', icon: 'palette', createdAt: '2025-01-16T10:00:00Z', createdBy: 'user:alice' },
      { id: 'folder:root-marketing', name: 'Marketing', parentOrg: 'org:acme', parentFolder: null, color: '#38bdf8', icon: 'megaphone', createdAt: '2025-01-17T10:00:00Z', createdBy: 'user:bob' },
      { id: 'folder:frontend', name: 'Frontend', parentOrg: 'org:acme', parentFolder: 'folder:root-engineering', color: '#10b981', icon: 'layout', createdAt: '2025-02-01T10:00:00Z', createdBy: 'user:alice' },
      { id: 'folder:backend', name: 'Backend', parentOrg: 'org:acme', parentFolder: 'folder:root-engineering', color: '#f59e0b', icon: 'server', createdAt: '2025-02-02T10:00:00Z', createdBy: 'user:alice' },
      { id: 'folder:brand-assets', name: 'Brand Assets', parentOrg: 'org:acme', parentFolder: 'folder:root-design', color: '#ef4444', icon: 'image', createdAt: '2025-02-03T10:00:00Z', createdBy: 'user:bob' },
    ];
    folders.forEach(f => this.folders.set(f.id, f));

    // Seed documents
    const documents = [
      { id: 'document:arch-overview', name: 'Architecture Overview.md', parentFolder: 'folder:root-engineering', size: 24500, type: 'markdown', createdAt: '2025-02-10T09:00:00Z', updatedAt: '2025-03-15T14:30:00Z', createdBy: 'user:alice', content: '# Architecture Overview\n\nThis document outlines the system architecture for Acme Corp\'s main product platform.\n\n## Microservices\n- Auth Service\n- User Service\n- Payment Service\n- Notification Service\n\n## Infrastructure\n- Kubernetes on AWS EKS\n- PostgreSQL via RDS\n- Redis for caching\n- S3 for file storage' },
      { id: 'document:api-spec', name: 'API Specification.json', parentFolder: 'folder:backend', size: 18200, type: 'json', createdAt: '2025-02-12T11:00:00Z', updatedAt: '2025-03-20T16:00:00Z', createdBy: 'user:alice', content: '{\n  "openapi": "3.0.0",\n  "info": {\n    "title": "Acme API",\n    "version": "2.1.0"\n  },\n  "paths": {\n    "/users": { "get": { "summary": "List users" } },\n    "/documents": { "get": { "summary": "List documents" } }\n  }\n}' },
      { id: 'document:react-guide', name: 'React Best Practices.md', parentFolder: 'folder:frontend', size: 31000, type: 'markdown', createdAt: '2025-02-15T08:00:00Z', updatedAt: '2025-04-01T10:00:00Z', createdBy: 'user:alice', content: '# React Best Practices\n\n## Component Design\n- Use functional components with hooks\n- Keep components small and focused\n- Use TypeScript for type safety\n\n## State Management\n- Local state with useState\n- Server state with React Query\n- Global state with Zustand\n\n## Performance\n- Memoize expensive computations\n- Use React.lazy for code splitting\n- Virtualize long lists' },
      { id: 'document:design-system', name: 'Design System.pdf', parentFolder: 'folder:root-design', size: 5200000, type: 'pdf', createdAt: '2025-01-20T13:00:00Z', updatedAt: '2025-03-28T09:00:00Z', createdBy: 'user:bob', content: 'Design System v3.0 - Acme Corporation\n\nColor Palette:\n- Primary: #9E7FFF\n- Secondary: #38bdf8\n- Accent: #f472b6\n\nTypography:\n- Headings: Inter Bold\n- Body: Inter Regular\n\nSpacing: 8px grid system\nBorder Radius: 12px default' },
      { id: 'document:logo-guidelines', name: 'Logo Guidelines.pdf', parentFolder: 'folder:brand-assets', size: 3400000, type: 'pdf', createdAt: '2025-01-22T15:00:00Z', updatedAt: '2025-02-14T11:00:00Z', createdBy: 'user:bob', content: 'Logo Usage Guidelines\n\nMinimum Size: 32px height\nClear Space: 1x logo height on all sides\nApproved Colors: Primary purple, white, black\nForbidden: Stretching, rotating, adding effects' },
      { id: 'document:campaign-q2', name: 'Q2 Campaign Plan.docx', parentFolder: 'folder:root-marketing', size: 45000, type: 'document', createdAt: '2025-03-01T10:00:00Z', updatedAt: '2025-04-05T17:00:00Z', createdBy: 'user:bob', content: '# Q2 2025 Marketing Campaign\n\n## Goals\n- Increase brand awareness by 25%\n- Generate 500 qualified leads\n- Launch product v3.0\n\n## Channels\n- Social media (LinkedIn, Twitter)\n- Email marketing\n- Content marketing\n- Paid advertising\n\n## Budget: $50,000' },
      { id: 'document:meeting-notes', name: 'Sprint Planning Notes.md', parentFolder: 'folder:root-engineering', size: 8900, type: 'markdown', createdAt: '2025-04-01T09:00:00Z', updatedAt: '2025-04-01T11:00:00Z', createdBy: 'user:charlie', content: '# Sprint 24 Planning\n\nDate: April 1, 2025\n\n## Priorities\n1. Fix authentication bug\n2. Implement file upload\n3. Dashboard redesign\n\n## Action Items\n- Alice: Auth service fix\n- Bob: UI components\n- Charlie: API endpoints' },
      { id: 'document:db-schema', name: 'Database Schema.sql', parentFolder: 'folder:backend', size: 12300, type: 'sql', createdAt: '2025-02-20T14:00:00Z', updatedAt: '2025-03-25T16:00:00Z', createdBy: 'user:charlie', content: 'CREATE TABLE users (\n  id UUID PRIMARY KEY,\n  email TEXT UNIQUE NOT NULL,\n  name TEXT NOT NULL,\n  created_at TIMESTAMPTZ DEFAULT now()\n);\n\nCREATE TABLE documents (\n  id UUID PRIMARY KEY,\n  name TEXT NOT NULL,\n  folder_id UUID REFERENCES folders(id),\n  created_by UUID REFERENCES users(id)\n);' },
    ];
    documents.forEach(d => this.documents.set(d.id, d));
  }
}

const store = new DataStore();
export default store;
