// In-memory data store simulating a database
class DataStore {
  constructor() {
    // Users
    this.users = new Map();
    // Organizations
    this.organizations = new Map();
    // Folders
    this.folders = new Map();
    // Documents
    this.documents = new Map();
    // OpenFGA tuples store: array of { user, relation, object }
    this.tuples = [];

    this._seed();
  }

  _seed() {
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

    // Organization membership tuples
    this.addTuple('user:alice', 'admin', 'organization:acme');
    this.addTuple('user:bob', 'member', 'organization:acme');
    this.addTuple('user:charlie', 'member', 'organization:acme');

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

    // Folder authorization tuples
    this.addTuple('user:alice', 'owner', 'folder:root-engineering');
    this.addTuple('organization:acme#member', 'viewer', 'folder:root-engineering');
    this.addTuple('user:alice', 'owner', 'folder:root-design');
    this.addTuple('user:bob', 'editor', 'folder:root-design');
    this.addTuple('user:bob', 'owner', 'folder:root-marketing');
    this.addTuple('organization:acme#member', 'editor', 'folder:root-marketing');
    this.addTuple('user:alice', 'owner', 'folder:frontend');
    this.addTuple('user:alice', 'owner', 'folder:backend');
    this.addTuple('user:charlie', 'editor', 'folder:backend');
    this.addTuple('user:bob', 'owner', 'folder:brand-assets');

    // Parent folder relationships
    this.addTuple('folder:root-engineering', 'parent_folder', 'folder:frontend');
    this.addTuple('folder:root-engineering', 'parent_folder', 'folder:backend');
    this.addTuple('folder:root-design', 'parent_folder', 'folder:brand-assets');
    this.addTuple('organization:acme', 'parent_org', 'folder:root-engineering');
    this.addTuple('organization:acme', 'parent_org', 'folder:root-design');
    this.addTuple('organization:acme', 'parent_org', 'folder:root-marketing');

    // Seed documents
    const documents = [
      { id: 'doc:arch-overview', name: 'Architecture Overview.md', parentFolder: 'folder:root-engineering', size: 24500, type: 'markdown', createdAt: '2025-02-10T09:00:00Z', updatedAt: '2025-03-15T14:30:00Z', createdBy: 'user:alice', content: '# Architecture Overview\n\nThis document outlines the system architecture for Acme Corp\'s main product platform.\n\n## Microservices\n- Auth Service\n- User Service\n- Payment Service\n- Notification Service\n\n## Infrastructure\n- Kubernetes on AWS EKS\n- PostgreSQL via RDS\n- Redis for caching\n- S3 for file storage' },
      { id: 'doc:api-spec', name: 'API Specification.json', parentFolder: 'folder:backend', size: 18200, type: 'json', createdAt: '2025-02-12T11:00:00Z', updatedAt: '2025-03-20T16:00:00Z', createdBy: 'user:alice', content: '{\n  "openapi": "3.0.0",\n  "info": {\n    "title": "Acme API",\n    "version": "2.1.0"\n  },\n  "paths": {\n    "/users": { "get": { "summary": "List users" } },\n    "/documents": { "get": { "summary": "List documents" } }\n  }\n}' },
      { id: 'doc:react-guide', name: 'React Best Practices.md', parentFolder: 'folder:frontend', size: 31000, type: 'markdown', createdAt: '2025-02-15T08:00:00Z', updatedAt: '2025-04-01T10:00:00Z', createdBy: 'user:alice', content: '# React Best Practices\n\n## Component Design\n- Use functional components with hooks\n- Keep components small and focused\n- Use TypeScript for type safety\n\n## State Management\n- Local state with useState\n- Server state with React Query\n- Global state with Zustand\n\n## Performance\n- Memoize expensive computations\n- Use React.lazy for code splitting\n- Virtualize long lists' },
      { id: 'doc:design-system', name: 'Design System.pdf', parentFolder: 'folder:root-design', size: 5200000, type: 'pdf', createdAt: '2025-01-20T13:00:00Z', updatedAt: '2025-03-28T09:00:00Z', createdBy: 'user:bob', content: 'Design System v3.0 - Acme Corporation\n\nColor Palette:\n- Primary: #9E7FFF\n- Secondary: #38bdf8\n- Accent: #f472b6\n\nTypography:\n- Headings: Inter Bold\n- Body: Inter Regular\n\nSpacing: 8px grid system\nBorder Radius: 12px default' },
      { id: 'doc:logo-guidelines', name: 'Logo Guidelines.pdf', parentFolder: 'folder:brand-assets', size: 3400000, type: 'pdf', createdAt: '2025-01-22T15:00:00Z', updatedAt: '2025-02-14T11:00:00Z', createdBy: 'user:bob', content: 'Logo Usage Guidelines\n\nMinimum Size: 32px height\nClear Space: 1x logo height on all sides\nApproved Colors: Primary purple, white, black\nForbidden: Stretching, rotating, adding effects' },
      { id: 'doc:campaign-q2', name: 'Q2 Campaign Plan.docx', parentFolder: 'folder:root-marketing', size: 45000, type: 'document', createdAt: '2025-03-01T10:00:00Z', updatedAt: '2025-04-05T17:00:00Z', createdBy: 'user:bob', content: '# Q2 2025 Marketing Campaign\n\n## Goals\n- Increase brand awareness by 25%\n- Generate 500 qualified leads\n- Launch product v3.0\n\n## Channels\n- Social media (LinkedIn, Twitter)\n- Email marketing\n- Content marketing\n- Paid advertising\n\n## Budget: $50,000' },
      { id: 'doc:meeting-notes', name: 'Sprint Planning Notes.md', parentFolder: 'folder:root-engineering', size: 8900, type: 'markdown', createdAt: '2025-04-01T09:00:00Z', updatedAt: '2025-04-01T11:00:00Z', createdBy: 'user:charlie', content: '# Sprint 24 Planning\n\nDate: April 1, 2025\n\n## Priorities\n1. Fix authentication bug\n2. Implement file upload\n3. Dashboard redesign\n\n## Action Items\n- Alice: Auth service fix\n- Bob: UI components\n- Charlie: API endpoints' },
      { id: 'doc:db-schema', name: 'Database Schema.sql', parentFolder: 'folder:backend', size: 12300, type: 'sql', createdAt: '2025-02-20T14:00:00Z', updatedAt: '2025-03-25T16:00:00Z', createdBy: 'user:charlie', content: 'CREATE TABLE users (\n  id UUID PRIMARY KEY,\n  email TEXT UNIQUE NOT NULL,\n  name TEXT NOT NULL,\n  created_at TIMESTAMPTZ DEFAULT now()\n);\n\nCREATE TABLE documents (\n  id UUID PRIMARY KEY,\n  name TEXT NOT NULL,\n  folder_id UUID REFERENCES folders(id),\n  created_by UUID REFERENCES users(id)\n);' },
    ];
    documents.forEach(d => this.documents.set(d.id, d));

    // Document authorization tuples
    this.addTuple('user:alice', 'owner', 'document:arch-overview');
    this.addTuple('user:alice', 'owner', 'document:api-spec');
    this.addTuple('user:alice', 'owner', 'document:react-guide');
    this.addTuple('user:bob', 'owner', 'document:design-system');
    this.addTuple('user:bob', 'owner', 'document:logo-guidelines');
    this.addTuple('user:bob', 'owner', 'document:campaign-q2');
    this.addTuple('user:charlie', 'owner', 'document:meeting-notes');
    this.addTuple('user:charlie', 'owner', 'document:db-schema');
    this.addTuple('user:diana', 'viewer', 'document:design-system');
    this.addTuple('user:charlie', 'editor', 'document:api-spec');

    // Document parent folder relationships
    this.addTuple('folder:root-engineering', 'parent_folder', 'document:arch-overview');
    this.addTuple('folder:backend', 'parent_folder', 'document:api-spec');
    this.addTuple('folder:frontend', 'parent_folder', 'document:react-guide');
    this.addTuple('folder:root-design', 'parent_folder', 'document:design-system');
    this.addTuple('folder:brand-assets', 'parent_folder', 'document:logo-guidelines');
    this.addTuple('folder:root-marketing', 'parent_folder', 'document:campaign-q2');
    this.addTuple('folder:root-engineering', 'parent_folder', 'document:meeting-notes');
    this.addTuple('folder:backend', 'parent_folder', 'document:db-schema');
  }

  addTuple(user, relation, object) {
    // Avoid duplicates
    const exists = this.tuples.some(t => t.user === user && t.relation === relation && t.object === object);
    if (!exists) {
      this.tuples.push({ user, relation, object });
    }
  }

  removeTuple(user, relation, object) {
    this.tuples = this.tuples.filter(t => !(t.user === user && t.relation === relation && t.object === object));
  }

  getTuples(filter = {}) {
    return this.tuples.filter(t => {
      if (filter.user && t.user !== filter.user) return false;
      if (filter.relation && t.relation !== filter.relation) return false;
      if (filter.object && t.object !== filter.object) return false;
      return true;
    });
  }
}

const store = new DataStore();
export default store;
