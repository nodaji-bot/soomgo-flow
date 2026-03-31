'use client'

import { useStore } from '@/lib/store';
import { Button } from './ui/button';
import { X, Send, Ban, MessageSquarePlus } from 'lucide-react';
import { useState } from 'react';
import { HistoryEvent } from '@/types';

const gradeStyles = {
  A: 'font-bold',
  B: 'font-medium',
  C: 'font-normal'
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

export function DetailPanel() {
  const { 
    selectedRequest, 
    showDetailPanel, 
    setShowDetailPanel, 
    setShowConfirmModal, 
    setShowRejectModal,
    addMemo
  } = useStore();
  
  const [memoText, setMemoText] = useState('');
  const [showMemoInput, setShowMemoInput] = useState(false);

  if (!showDetailPanel || !selectedRequest) {
    return null;
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const diffHours = Math.floor(diff / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays}일 전`;
    } else if (diffHours > 0) {
      return `${diffHours}시간 전`;
    } else {
      return '방금 전';
    }
  };

  const handleAddMemo = () => {
    if (memoText.trim()) {
      addMemo(selectedRequest.id, memoText.trim());
      setMemoText('');
      setShowMemoInput(false);
    }
  };

  const canSendEstimate = selectedRequest.status === 'estimate_ready' || selectedRequest.status === 'pending_approval';
  const canReject = selectedRequest.status !== 'sent' && selectedRequest.status !== 'rejected' && selectedRequest.status !== 'completed';

  return (
    <div className="fixed right-0 top-0 h-full w-[600px] bg-card border-l border-border shadow-lg z-50 flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
          <div>
            <h2 className="text-lg font-medium text-foreground">
              {selectedRequest.customerName}
            </h2>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{selectedRequest.category}</span>
              <span>•</span>
              <span className={`${gradeStyles[selectedRequest.grade]} text-foreground`}>
                {selectedRequest.grade}등급
              </span>
              <span>•</span>
              <span>{statusLabels[selectedRequest.status]}</span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDetailPanel(false)}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* 스레드형 히스토리 */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        <h3 className="text-sm font-medium text-foreground mb-4">진행 히스토리</h3>
        
        <div className="space-y-4">
          {selectedRequest.history.map((event: HistoryEvent) => (
            <div key={event.id} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm">
                  {event.icon}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-foreground">
                    {event.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatTimestamp(event.timestamp)}
                  </span>
                </div>
                
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {event.description}
                </div>
                
                {event.amount && (
                  <div className="mt-2 text-sm font-medium text-foreground">
                    견적 금액: {event.amount.toLocaleString()}원
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 메모 추가 */}
        {showMemoInput ? (
          <div className="border border-border rounded p-4 space-y-3">
            <textarea
              value={memoText}
              onChange={(e) => setMemoText(e.target.value)}
              placeholder="메모를 입력하세요..."
              className="w-full h-20 bg-background border border-border rounded p-3 text-sm resize-none focus:outline-none focus:border-brand"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddMemo}>
                메모 추가
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setShowMemoInput(false);
                  setMemoText('');
                }}
              >
                취소
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowMemoInput(true)}
            className="w-full p-4 border border-dashed border-border rounded hover-subtle transition-colors flex items-center justify-center gap-2 text-muted-foreground"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span className="text-sm">메모 추가</span>
          </button>
        )}
      </div>

      {/* 액션 버튼 */}
      <div className="p-6 border-t border-border space-y-3">
        {canSendEstimate && (
          <Button
            className="w-full brand-bg text-white hover:opacity-90"
            onClick={() => setShowConfirmModal(true)}
          >
            <Send className="w-4 h-4 mr-2" />
            견적 발송
          </Button>
        )}
        
        {canReject && (
          <Button
            variant="outline"
            className="w-full border-destructive text-destructive hover:bg-destructive hover:text-white"
            onClick={() => setShowRejectModal(true)}
          >
            <Ban className="w-4 h-4 mr-2" />
            거절
          </Button>
        )}
        
        {!canSendEstimate && !canReject && (
          <div className="text-sm text-muted-foreground text-center py-4">
            추가 액션이 없습니다
          </div>
        )}
      </div>
    </div>
  );
}