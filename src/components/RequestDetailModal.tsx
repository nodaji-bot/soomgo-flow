import React, { useState } from 'react'
import { Request, KanbanColumn } from '@/types'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { useKanbanStore } from '@/lib/store'
import { X, CheckCircle, XCircle } from 'lucide-react'

interface RequestDetailModalProps {
  request: Request | null
  open: boolean
  onClose: () => void
}

const gradeColors = {
  A: 'bg-neutral-700',
  B: 'bg-neutral-600',
  C: 'bg-neutral-500'
}

const statusLabels: Record<KanbanColumn, string> = {
  new: '신규',
  classified: '분류완료',
  pending_approval: '승인대기',
  sent: '발송완료',
  in_progress: '진행중',
  completed: '완료'
}

export function RequestDetailModal({ request, open, onClose }: RequestDetailModalProps) {
  const { updateRequest, moveRequest } = useKanbanStore()
  const [editedQuoteDraft, setEditedQuoteDraft] = useState('')
  const [editedQuotePrice, setEditedQuotePrice] = useState<number | ''>('')

  if (!request) return null

  // 모달이 열릴 때 현재 값으로 초기화
  React.useEffect(() => {
    if (request && open) {
      setEditedQuoteDraft(request.quoteDraft || '')
      setEditedQuotePrice(request.quotePrice || '')
    }
  }, [request, open])

  const handleApprove = () => {
    if (request) {
      const updates: Partial<Request> = {
        quoteDraft: editedQuoteDraft,
        quotePrice: typeof editedQuotePrice === 'number' ? editedQuotePrice : null
      }
      updateRequest(request.id, updates)
      moveRequest(request.id, 'sent')
      onClose()
    }
  }

  const handleReject = () => {
    if (request) {
      moveRequest(request.id, 'rejected')
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">
                {request.clientName} - {request.category || '카테고리 미지정'}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={`${gradeColors[request.grade]} text-white`}>
                  {request.grade}급
                </Badge>
                <Badge variant="outline">
                  {statusLabels[request.status as KanbanColumn]}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 왼쪽: 요청 정보 */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">고객 정보</h3>
              <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                <p><span className="font-medium">가입일:</span> {request.customer.joinDate}</p>
                <p><span className="font-medium">이용 횟수:</span> {request.customer.usageCount}회</p>
                <p><span className="font-medium">경쟁자 수:</span> {request.competitorCount}명</p>
                <p><span className="font-medium">등록:</span> {request.timeAgo}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">요청 상세</h3>
              <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                <p><span className="font-medium">서비스 유형:</span></p>
                <p className="whitespace-pre-wrap">{request.detail.serviceType || '정보 없음'}</p>
                {request.detail.description && (
                  <>
                    <p><span className="font-medium">상세 설명:</span></p>
                    <p className="whitespace-pre-wrap">{request.detail.description}</p>
                  </>
                )}
                <p><span className="font-medium">마감일:</span> {request.detail.deadline}</p>
                {request.detail.referenceUrl && (
                  <p><span className="font-medium">참고 URL:</span> 
                    <a href={request.detail.referenceUrl} target="_blank" rel="noopener noreferrer" 
                       className="text-neutral-400 hover:underline ml-1">
                      링크 보기
                    </a>
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">AI 분석 결과</h3>
              <div className="bg-muted/50 p-4 rounded-lg text-sm">
                <p className="whitespace-pre-wrap">{request.gradeReasoning}</p>
              </div>
            </div>
          </div>

          {/* 오른쪽: 견적 관리 */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">견적 초안</h3>
              <Textarea
                value={editedQuoteDraft}
                onChange={(e) => setEditedQuoteDraft(e.target.value)}
                placeholder="견적 내용을 입력하세요..."
                className="min-h-[200px]"
              />
            </div>

            <div>
              <h3 className="font-semibold mb-2">견적 금액</h3>
              <Input
                type="number"
                value={editedQuotePrice}
                onChange={(e) => setEditedQuotePrice(e.target.value ? parseInt(e.target.value) : '')}
                placeholder="견적 금액을 입력하세요 (원)"
              />
              {editedQuotePrice && (
                <p className="text-sm text-muted-foreground mt-1">
                  {typeof editedQuotePrice === 'number' ? editedQuotePrice.toLocaleString() : '0'}원
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            닫기
          </Button>
          {request.status === 'pending_approval' && (
            <>
              <Button 
                variant="destructive" 
                onClick={handleReject}
                className="flex items-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                거절
              </Button>
              <Button 
                onClick={handleApprove}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                승인 & 발송
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}