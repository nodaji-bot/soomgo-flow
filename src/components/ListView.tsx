'use client'

import { useStore } from '@/lib/store';
import { RequestCard } from './RequestCard';
import { Request } from '@/types';

export function ListView() {
  const { requests, filter, selectedRequest } = useStore();

  const filteredRequests = requests.filter((request: Request) => {
    switch (filter) {
      case 'all':
        return !request.isArchived;
      case 'grade-a':
        return request.grade === 'A' && !request.isArchived;
      case 'grade-b':
        return request.grade === 'B' && !request.isArchived;
      case 'grade-c':
        return request.grade === 'C' && !request.isArchived;
      case 'status-new':
        return request.status === 'new' && !request.isArchived;
      case 'status-pending':
        return request.status === 'pending_approval' && !request.isArchived;
      case 'status-sent':
        return request.status === 'sent' && !request.isArchived;
      case 'status-progress':
        return request.status === 'in_progress' && !request.isArchived;
      case 'status-completed':
        return request.status === 'completed' && !request.isArchived;
      case 'archived':
        return request.isArchived;
      default:
        return !request.isArchived;
    }
  });

  return (
    <div className="space-y-1">
      {/* 헤더 */}
      <div className="flex items-center gap-4 px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
        <div className="w-4"></div> {/* 체크박스 공간 */}
        <div className="w-8"></div> {/* 등급 도트 공간 */}
        <div className="w-8">등급</div>
        <div className="flex-1 min-w-0">고객명</div>
        <div className="w-32">카테고리</div>
        <div className="w-24">금액</div>
        <div className="w-20">상태</div>
        <div className="w-20">시간</div>
      </div>
      
      {/* 요청 리스트 */}
      <div className="space-y-1">
        {filteredRequests.map((request) => (
          <RequestCard
            key={request.id}
            request={request}
            isSelected={selectedRequest?.id === request.id}
          />
        ))}
      </div>
      
      {filteredRequests.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>해당하는 요청이 없습니다.</p>
        </div>
      )}
    </div>
  );
}