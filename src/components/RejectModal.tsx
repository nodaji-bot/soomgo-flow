'use client'

import { useStore } from '@/lib/store';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useState } from 'react';

const commonReasons = [
  '기술적으로 구현 불가능',
  '예산이 맞지 않음',
  '일정이 촉박함',
  '요구사항이 불분명함',
  '리스크가 높음',
  '전문 분야가 아님'
];

export function RejectModal() {
  const { 
    selectedRequest, 
    showRejectModal, 
    setShowRejectModal, 
    rejectRequest 
  } = useStore();
  
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  if (!selectedRequest || !showRejectModal) {
    return null;
  }

  const handleReject = () => {
    const finalReason = reason === 'custom' ? customReason : reason;
    if (finalReason.trim()) {
      rejectRequest(selectedRequest.id, finalReason.trim());
      setReason('');
      setCustomReason('');
    }
  };

  const handleClose = () => {
    setShowRejectModal(false);
    setReason('');
    setCustomReason('');
  };

  const isValid = reason && (reason !== 'custom' || customReason.trim());

  return (
    <Dialog open={showRejectModal} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">요청 거절</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* 요청 정보 */}
          <div className="p-3 bg-muted rounded text-sm">
            <div className="font-medium text-foreground mb-1">
              {selectedRequest.customerName} - {selectedRequest.category}
            </div>
            <div className="text-muted-foreground">
              {selectedRequest.description}
            </div>
          </div>

          {/* 거절 사유 선택 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">거절 사유를 선택하세요:</label>
            
            <div className="space-y-2">
              {commonReasons.map((commonReason) => (
                <label key={commonReason} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="reason"
                    value={commonReason}
                    checked={reason === commonReason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-foreground">{commonReason}</span>
                </label>
              ))}
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="reason"
                  value="custom"
                  checked={reason === 'custom'}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-foreground">기타 (직접 입력)</span>
              </label>
            </div>
          </div>

          {/* 커스텀 사유 입력 */}
          {reason === 'custom' && (
            <div className="space-y-2">
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="거절 사유를 입력하세요..."
                className="w-full h-24 p-3 bg-background border border-border rounded text-sm resize-none focus:outline-none focus:border-brand"
              />
            </div>
          )}

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
              variant="destructive"
              className="flex-1"
              onClick={handleReject}
              disabled={!isValid}
            >
              거절 확인
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}