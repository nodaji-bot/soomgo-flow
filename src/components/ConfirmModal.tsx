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
  const [editablePrice, setEditablePrice] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!selectedRequest || !showConfirmModal) {
    return null;
  }

  // 모달이 처음 열릴 때 기본값 설정
  if (editableMessage === '' && editablePrice === '') {
    // DetailPanel에서 설정한 견적 정보를 가져옴
    // 실제로는 selectedRequest에 quoteDraft와 quotePrice가 있어야 함
    setEditablePrice(selectedRequest.amount?.toString() || '');
    
    // 기본 메시지 (톤 가이드 기반)
    const defaultMessage = `안녕하세요! ${selectedRequest.category} 관련 요청 확인했습니다.

${selectedRequest.description ? selectedRequest.description + ' 작업이군요.' : ''}

경험상 이런 작업은 보통 ${selectedRequest.amount ? selectedRequest.amount.toLocaleString() + '원' : 'XX만원'} 정도 예상됩니다.

구체적인 요구사항이나 추가로 확인할 점이 있으면 알려주세요.`;

    setEditableMessage(defaultMessage);
  }

  const handleSend = async () => {
    if (!editableMessage.trim() || !editablePrice.trim()) {
      alert('메시지와 금액을 모두 입력해주세요.');
      return;
    }

    const price = parseInt(editablePrice);
    if (isNaN(price) || price <= 0) {
      alert('올바른 금액을 입력해주세요.');
      return;
    }

    setIsSending(true);
    try {
      await sendEstimate(selectedRequest.id, price, editableMessage.trim());
      alert('견적이 성공적으로 발송되었습니다!');
      handleClose();
    } catch (error) {
      alert('견적 발송 실패: ' + error.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setShowConfirmModal(false);
    setEditableMessage('');
    setEditablePrice('');
  };

  const price = parseInt(editablePrice) || 0;
  const estimatedCash = price ? Math.floor(price * 0.075) : 0; // 7.5% 수수료 추정

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
          </div>

          {/* 견적 금액 편집 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">견적 금액 (원):</label>
            <input
              type="number"
              value={editablePrice}
              onChange={(e) => setEditablePrice(e.target.value)}
              className="w-full p-3 bg-background border border-border rounded text-sm focus:outline-none focus:border-brand"
              placeholder="견적 금액을 입력하세요..."
            />
            {price > 0 && (
              <p className="text-xs text-muted-foreground">
                예상 캐시 차감: ~{estimatedCash}캐시
              </p>
            )}
          </div>

          {/* 첫 메시지 편집 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">견적 메시지:</label>
            <textarea
              value={editableMessage}
              onChange={(e) => setEditableMessage(e.target.value)}
              className="w-full h-40 p-3 bg-background border border-border rounded text-sm resize-none focus:outline-none focus:border-brand"
              placeholder="고객에게 보낼 견적 메시지를 입력하세요..."
            />
            <p className="text-xs text-muted-foreground">
              최종 검토 후 발송됩니다
            </p>
          </div>

          {/* 경고 */}
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-sm text-destructive">실제로 견적이 발송됩니다. 발송 후 취소할 수 없습니다.</span>
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleClose}
              disabled={isSending}
            >
              취소
            </Button>
            <Button
              className="flex-1 brand-bg text-white hover:opacity-90"
              onClick={handleSend}
              disabled={!editableMessage.trim() || !editablePrice.trim() || isSending}
            >
              {isSending ? '발송 중...' : '견적 발송'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}