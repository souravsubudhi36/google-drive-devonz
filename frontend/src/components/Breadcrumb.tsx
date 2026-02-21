import { ChevronRight, Home } from 'lucide-react';
import type { BreadcrumbItem } from '../types';

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate: (id: string | null) => void;
}

export default function Breadcrumb({ items, onNavigate }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1 text-sm">
      <button
        onClick={() => onNavigate(null)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span>My Drive</span>
      </button>
      {items.map((item, i) => (
        <div key={item.id} className="flex items-center gap-1">
          <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
          <button
            onClick={() => i < items.length - 1 ? onNavigate(item.id) : undefined}
            className={`px-2 py-1 rounded-md transition-colors ${
              i === items.length - 1
                ? 'text-white font-medium'
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            {item.name}
          </button>
        </div>
      ))}
    </nav>
  );
}
