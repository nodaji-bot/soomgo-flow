'use client'

import { Request } from '@/types';
import { useStore } from '@/lib/store';
import { Badge } from './ui/badge';

interface RequestCardProps {
  request: Request;
  isSelected?: boolean;
}

const gradeStyles = {
  A: 'font-bold text-sm',
  B: 'font-medium text-sm', 
  C: 'font-normal text-xs'
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
      className={`flex items-center gap-4 px-4 py-3 bg-card border border-border rounded cursor-pointer hover-subtle transition-colors min-h-[60px] ${
        isSelected ? 'selected-indicator border-brand' : ''
      }`}
    >
      <div className="w-4 flex-shrink-0">
        <input
          type="checkbox"
          className="w-4 h-4"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      
      <div className="w-8 flex-shrink-0 flex justify-center">
        <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
      </div>
      
      <div className="w-8 flex-shrink-0 text-center">
        <span className={`${gradeStyles[request.grade]} text-foreground`}>
          {request.grade}
        </span>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="font-medium text-foreground truncate">
          {request.customerName}
        </div>
        {request.description && (
          <div className="text-xs text-muted-foreground truncate">
            {request.description}
          </div>
        )}
      </div>
      
      <div className="w-32 flex-shrink-0">
        <span className="text-muted-foreground truncate text-sm">
          {request.category}
        </span>
      </div>
      
      <div className="w-24 flex-shrink-0 text-right">
        <span className="text-foreground font-medium text-sm">
          {request.amount ? `${request.amount.toLocaleString()}원` : '-'}
        </span>
      </div>
      
      <div className="w-20 flex-shrink-0">
        <Badge 
          variant="secondary" 
          className="text-xs w-full justify-center bg-neutral-700 text-neutral-200 border-neutral-600"
        >
          {statusLabels[request.status]}
        </Badge>
      </div>
      
      <div className="w-20 flex-shrink-0 text-right">
        <span className="text-muted-foreground text-xs">
          {request.timeAgo}
        </span>
      </div>
    </div>
  );
}