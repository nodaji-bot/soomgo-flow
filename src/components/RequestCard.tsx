'use client'

import { Request } from '@/types';
import { useStore } from '@/lib/store';
import { Badge } from './ui/badge';

interface RequestCardProps {
  request: Request;
  isSelected?: boolean;
}

const gradeColors = {
  A: 'grade-a',
  B: 'grade-b',
  C: 'grade-c'
};

const statusLabels = {
  new: '신규',
  estimate_ready: '견적초안',
  pending_approval: '승인대기',
  sent: '발송완료',
  in_progress: '진행중',
  completed: '완료',
  rejected: '패스'
};

export function RequestCard({ request, isSelected }: RequestCardProps) {
  const { setSelectedRequest } = useStore();

  const handleClick = () => {
    setSelectedRequest(request);
  };

  return (
    <div
      onClick={handleClick}
      className={`p-4 bg-card border border-border rounded cursor-pointer hover-subtle transition-colors ${
        isSelected ? 'selected-indicator border-brand' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <input
            type="checkbox"
            className="flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          />
          
          <div className={`w-2 h-2 rounded-full flex-shrink-0 bg-${gradeColors[request.grade]}`}></div>
          
          <span className={`text-xs font-medium ${gradeColors[request.grade]} flex-shrink-0`}>
            {request.grade}
          </span>
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-4 text-sm">
              <span className="font-medium text-foreground truncate min-w-0">
                {request.customerName}
              </span>
              <span className="text-muted-foreground truncate">
                {request.category}
              </span>
              <span className="text-foreground font-medium flex-shrink-0">
                {request.amount ? `${request.amount.toLocaleString()}원` : '-'}
              </span>
              <Badge 
                variant="secondary" 
                className="text-xs flex-shrink-0"
              >
                {statusLabels[request.status]}
              </Badge>
              <span className="text-muted-foreground text-xs flex-shrink-0">
                {request.timeAgo}
              </span>
            </div>
            
            {request.description && (
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {request.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}