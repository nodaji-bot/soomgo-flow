'use client'

import { useStore } from '@/lib/store';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { X, Send, Ban, MessageSquarePlus, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
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
    addMemo,
    classifyRequest
  } = useStore();
  
  const [memoText, setMemoText] = useState('');
  const [showMemoInput, setShowMemoInput] = useState(false);
  
  // 분류 및 견적 관련 상태
  const [selectedGrade, setSelectedGrade] = useState<'A' | 'B' | 'C'>('C');
  const [gradeReasoning, setGradeReasoning] = useState('');
  const [quoteDraft, setQuoteDraft] = useState('');
  const [quotePrice, setQuotePrice] = useState('');
  const [isClassifying, setIsClassifying] = useState(false);

  useEffect(() => {
    if (selectedRequest) {
      setSelectedGrade(selectedRequest.grade);
      setQuotePrice(selectedRequest.amount?.toString() || '');
      // quoteDraft는 실제 API 응답에서 받아와야 함
    }
  }, [selectedRequest]);

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

  const handleClassifyRequest = async () => {
    if (!selectedGrade) return;
    
    setIsClassifying(true);
    try {
      await classifyRequest(
        selectedRequest.id,
        selectedGrade,
        gradeReasoning,
        quoteDraft,
        quotePrice ? parseInt(quotePrice) : undefined
      );
      alert('분류가 완료되었습니다.');
    } catch (error) {
      alert('분류 실패: ' + error.message);
    } finally {
      setIsClassifying(false);
    }
  };

  const canSendEstimate = selectedRequest.status === 'estimate_ready' || selectedRequest.status === 'pending_approval';
  const canReject = selectedRequest.status !== 'sent' && selectedRequest.status !== 'rejected' && selectedRequest.status !== 'completed';
  const canClassify = selectedRequest.status === 'new' || selectedRequest.status === 'classified';

  return (
    <div className="fixed right-0 top-0 h-full w-[800px] bg-card border-l border-border shadow-lg z-50 flex flex-col">
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

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto">
        {/* 요청 상세 정보 */}
        <div className="p-6 border-b border-border">
          <h3 className="text-sm font-medium text-foreground mb-3">요청 상세</h3>
          <div className="space-y-2 text-sm">
            <div><strong>서비스:</strong> {selectedRequest.description}</div>
            <div><strong>지역:</strong> {selectedRequest.location}</div>
            <div><strong>경쟁자:</strong> {selectedRequest.competitorCount}명</div>
            <div><strong>고객 정보:</strong> {selectedRequest.customerInfo.joinDate} 가입, {selectedRequest.customerInfo.usageCount}회 이용</div>
            {selectedRequest.detail?.deadline && (
              <div><strong>마감일:</strong> {selectedRequest.detail.deadline}</div>
            )}
          </div>
        </div>

        {/* 분류 및 견적 작성 */}
        {canClassify && (
          <div className="p-6 border-b border-border space-y-4">
            <h3 className="text-sm font-medium text-foreground">분류 및 견적 작성</h3>
            
            {/* 등급 선택 */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">등급</label>
              <div className="flex gap-2">
                {(['A', 'B', 'C'] as const).map((grade) => (
                  <Button
                    key={grade}
                    variant={selectedGrade === grade ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedGrade(grade)}
                  >
                    {grade}등급
                  </Button>
                ))}
              </div>
            </div>

            {/* 분류 사유 */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">분류 사유</label>
              <Textarea
                value={gradeReasoning}
                onChange={(e) => setGradeReasoning(e.target.value)}
                placeholder="등급 분류 사유를 입력하세요..."
                rows={2}
              />
            </div>

            {/* 견적 금액 */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">견적 금액 (원)</label>
              <Input
                type="number"
                value={quotePrice}
                onChange={(e) => setQuotePrice(e.target.value)}
                placeholder="견적 금액을 입력하세요"
              />
            </div>

            {/* 견적 메시지 */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">견적 메시지</label>
              <Textarea
                value={quoteDraft}
                onChange={(e) => setQuoteDraft(e.target.value)}
                placeholder="고객에게 보낼 견적 메시지를 입력하세요..."
                rows={4}
              />
            </div>

            <Button 
              onClick={handleClassifyRequest}
              disabled={isClassifying || !selectedGrade}
              className="w-full"
            >
              <Save className="w-4 h-4 mr-2" />
              {isClassifying ? '저장 중...' : '분류 저장'}
            </Button>
          </div>
        )}

        {/* 진행 히스토리 */}
        <div className="p-6 space-y-4">
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
              <Textarea
                value={memoText}
                onChange={(e) => setMemoText(e.target.value)}
                placeholder="메모를 입력하세요..."
                rows={3}
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
        
        {!canSendEstimate && !canReject && !canClassify && (
          <div className="text-sm text-muted-foreground text-center py-4">
            추가 액션이 없습니다
          </div>
        )}
      </div>
    </div>
  );
}