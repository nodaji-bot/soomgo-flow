'use client'

import { useStore } from '@/lib/store';
import { List, Kanban } from 'lucide-react';

export function ViewToggle() {
  const { viewType, setViewType } = useStore();

  return (
    <div className="flex items-center bg-muted rounded p-1">
      <button
        onClick={() => setViewType('list')}
        className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded transition-colors ${
          viewType === 'list'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <List className="w-4 h-4" />
        리스트뷰
      </button>
      <button
        onClick={() => setViewType('kanban')}
        className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded transition-colors ${
          viewType === 'kanban'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Kanban className="w-4 h-4" />
        칸반뷰
      </button>
    </div>
  );
}