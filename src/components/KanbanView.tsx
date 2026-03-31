'use client'

import { useStore } from '@/lib/store';
import { RequestCard } from './RequestCard';
import { Request, RequestStatus } from '@/types';

const columns: { id: RequestStatus; title: string; color: string }[] = [
  { id: 'new', title: '신규', color: 'bg-blue-500' },
  { id: 'estimate_ready', title: '견적초안', color: 'bg-yellow-500' },
  { id: 'pending_approval', title: '승인대기', color: 'bg-orange-500' },
  { id: 'sent', title: '발송완료', color: 'bg-green-500' },
  { id: 'in_progress', title: '진행중', color: 'bg-purple-500' },
  { id: 'completed', title: '완료', color: 'bg-gray-500' },
];

export function KanbanView() {
  const { requests, filter, selectedRequest } = useStore();

  const getColumnRequests = (status: RequestStatus) => {
    return requests.filter((request: Request) => {
      // 상태 필터링
      const statusMatch = request.status === status;
      
      // 추가 필터 적용
      switch (filter) {
        case 'all':
          return statusMatch;
        case 'grade-a':
          return statusMatch && request.grade === 'A';
        case 'grade-b':
          return statusMatch && request.grade === 'B';
        case 'grade-c':
          return statusMatch && request.grade === 'C';
        case 'status-new':
          return statusMatch && request.status === 'new';
        case 'status-pending':
          return statusMatch && request.status === 'pending_approval';
        case 'status-sent':
          return statusMatch && request.status === 'sent';
        case 'status-progress':
          return statusMatch && request.status === 'in_progress';
        case 'status-completed':
          return statusMatch && request.status === 'completed';
        default:
          return statusMatch;
      }
    });
  };

  return (
    <div className="flex gap-6 h-full overflow-x-auto">
      {columns.map((column) => {
        const columnRequests = getColumnRequests(column.id);
        
        return (
          <div key={column.id} className="flex-shrink-0 w-80">
            {/* 컬럼 헤더 */}
            <div className="flex items-center gap-3 p-4 border-b border-border">
              <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
              <h3 className="font-medium text-foreground">{column.title}</h3>
              <span className="text-xs bg-muted px-2 py-1 rounded">
                {columnRequests.length}
              </span>
            </div>
            
            {/* 컬럼 내용 */}
            <div className="p-4 space-y-3 h-full overflow-y-auto">
              {columnRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-card border border-border rounded p-4 cursor-pointer hover-subtle transition-colors"
                  onClick={() => useStore.getState().setSelectedRequest(request)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full bg-grade-${request.grade.toLowerCase()}`}></div>
                      <span className={`text-xs font-medium grade-${request.grade.toLowerCase()}`}>
                        {request.grade}등급
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {request.timeAgo}
                    </span>
                  </div>
                  
                  <h4 className="font-medium text-foreground mb-1">
                    {request.customerName}
                  </h4>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {request.category}
                  </p>
                  
                  {request.description && (
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {request.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {request.amount ? `${request.amount.toLocaleString()}원` : '견적 대기'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      경쟁자 {request.competitorCount}명
                    </span>
                  </div>
                </div>
              ))}
              
              {columnRequests.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  요청이 없습니다
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}