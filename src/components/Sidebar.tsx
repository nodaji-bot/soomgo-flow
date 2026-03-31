'use client'

import { useStore } from '@/lib/store';
import { FilterType } from '@/types';
import { Settings, FileText, Circle } from 'lucide-react';

const filters: { id: FilterType; label: string; icon?: string; count?: number }[] = [
  { id: 'all', label: '전체' },
  { id: 'grade-a', label: 'A등급' },
  { id: 'grade-b', label: 'B등급' },
  { id: 'grade-c', label: 'C등급' },
];

const statusFilters: { id: FilterType; label: string }[] = [
  { id: 'status-new', label: '신규' },
  { id: 'status-pending', label: '승인대기' },
  { id: 'status-sent', label: '발송완료' },
  { id: 'status-progress', label: '진행중' },
  { id: 'status-completed', label: '완료' },
];

export function Sidebar() {
  const { filter, setFilter, requests } = useStore();

  const getFilterCount = (filterId: FilterType) => {
    switch (filterId) {
      case 'all':
        return requests.length;
      case 'grade-a':
        return requests.filter(r => r.grade === 'A').length;
      case 'grade-b':
        return requests.filter(r => r.grade === 'B').length;
      case 'grade-c':
        return requests.filter(r => r.grade === 'C').length;
      case 'status-new':
        return requests.filter(r => r.status === 'new').length;
      case 'status-pending':
        return requests.filter(r => r.status === 'pending_approval').length;
      case 'status-sent':
        return requests.filter(r => r.status === 'sent').length;
      case 'status-progress':
        return requests.filter(r => r.status === 'in_progress').length;
      case 'status-completed':
        return requests.filter(r => r.status === 'completed').length;
      default:
        return 0;
    }
  };

  return (
    <div className="w-64 h-screen bg-muted border-r border-border flex flex-col">
      {/* 로고 */}
      <div className="p-6 border-b border-border">
        <h1 className="text-lg font-medium text-foreground">SoomgoFlow</h1>
        <p className="text-sm text-muted-foreground mt-1">요청 관리 시스템</p>
      </div>

      {/* 필터 섹션 */}
      <div className="flex-1 p-4 space-y-6">
        {/* 메인 필터 */}
        <div className="space-y-1">
          {filters.map((filterItem) => {
            const count = getFilterCount(filterItem.id);
            const isActive = filter === filterItem.id;
            
            return (
              <button
                key={filterItem.id}
                onClick={() => setFilter(filterItem.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded transition-colors hover-subtle ${
                  isActive ? 'bg-secondary text-foreground' : 'text-muted-foreground'
                }`}
              >
                <div className="flex items-center gap-3">
                  {filterItem.id === 'all' ? (
                    <FileText className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-bold">{filterItem.id.split('-')[1]?.toUpperCase()}</span>
                  )}
                  <span className="font-medium">{filterItem.label}</span>
                </div>
                <span className="text-xs bg-muted px-2 py-1 rounded">{count}</span>
              </button>
            );
          })}
        </div>

        {/* 구분선 */}
        <div className="border-t border-border"></div>

        {/* 상태별 필터 */}
        <div className="space-y-1">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">
            상태별
          </h3>
          {statusFilters.map((filterItem) => {
            const count = getFilterCount(filterItem.id);
            const isActive = filter === filterItem.id;
            
            return (
              <button
                key={filterItem.id}
                onClick={() => setFilter(filterItem.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded transition-colors hover-subtle ${
                  isActive ? 'bg-secondary text-foreground' : 'text-muted-foreground'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground"></span>
                  <span>{filterItem.label}</span>
                </div>
                <span className="text-xs bg-muted px-2 py-1 rounded">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 설정 */}
      <div className="p-4 border-t border-border">
        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover-subtle rounded transition-colors">
          <Settings className="w-4 h-4" />
          <span>설정</span>
        </button>
      </div>
    </div>
  );
}