'use client'

import { useStore } from '@/lib/store';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export function ConfirmModal() {
  const { 
    selectedRequest, 
    showConfirmModal, 
    setShowConfirmModal, 
    sendEstimate 
  } = useStore();
  
  const [editableMessage, setEditableMessage] = useState('');

  if (!selectedRequest || !showConfirmModal) {
    return null;
  }

  // 기본 메시지를 찾기
  const estimateEvent = selectedRequest.history.find(e => e.type === 'estimate_created');
  const defaultMessage = estimateEvent?.description?.split('\n')[1]?.replace(/"/g, '') || '';

  // 모달이 처음 열릴 때 기본 메시지 설정
  if (editableMessage === '' && defaultMessage) {
    setEditableMessage(defaultMessage);
  }

  const handleSend = () => {
    if (editableMessage.trim()) {
      sendEstimate(selectedRequest.id, editableMessage.trim());
      setEditableMessage('');
    }
  };

  const handleClose = () => {
    setShowConfirmModal(false);
    setEditableMessage('');
  };

  const estimatedCash = selectedRequest.amount ? Math.floor(selectedRequest.amount * 0.075) : 0; // 7.5% 수수료 추정

  return (
    <Dialog open={showConfirmModal} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">견적 발송 확인</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* 요청 정보 */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">고객:</span>
              <span className="text-foreground">{selectedRequest.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">카테고리:</span>
              <span className="text-foreground">{selectedRequest.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">금액:</span>
              <span className="text-foreground font-medium">
                {selectedRequest.amount?.toLocaleString()}원
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">캐시 차감:</span>
              <span className="text-foreground">~{estimatedCash}캐시</span>
            </div>
          </div>

          {/* 첫 메시지 편집 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">첫 메시지:</label>
            <textarea
              value={editableMessage}
              onChange={(e) => setEditableMessage(e.target.value)}
              className="w-full h-32 p-3 bg-background border border-border rounded text-sm resize-none focus:outline-none focus:border-brand"
              placeholder="고객에게 보낼 첫 메시지를 입력하세요..."
            />
            <p className="text-xs text-muted-foreground">
              (편집 가능)
            </p>
          </div>

          {/* 경고 */}
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-sm text-destructive">발송 후 취소할 수 없습니다</span>
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleClose}
            >
              취소
            </Button>
            <Button
              className="flex-1 brand-bg text-white hover:opacity-90"
              onClick={handleSend}
              disabled={!editableMessage.trim()}
            >
              발송 확인
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}