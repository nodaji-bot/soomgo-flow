'use client'

import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from '@dnd-kit/core'
import { KanbanColumn } from './KanbanColumn'
import { RequestDetailModal } from './RequestDetailModal'
import { useKanbanStore } from '@/lib/store'
import { KanbanColumn as ColumnType, Request } from '@/types'
import { useState } from 'react'
import { RequestCard } from './RequestCard'

const columns: Array<{ type: ColumnType; title: string }> = [
  { type: 'new', title: '신규' },
  { type: 'classified', title: '분류완료' },
  { type: 'pending_approval', title: '승인대기' },
  { type: 'sent', title: '발송완료' },
  { type: 'in_progress', title: '진행중' },
  { type: 'completed', title: '완료' },
]

export function KanbanBoard() {
  const { 
    kanbanData, 
    moveRequest, 
    selectedRequest, 
    setSelectedRequest 
  } = useKanbanStore()
  
  const [activeRequest, setActiveRequest] = useState<Request | null>(null)

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const request = Object.values(kanbanData)
      .flat()
      .find(r => r.id === active.id)
    
    if (request) {
      setActiveRequest(request)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over) {
      setActiveRequest(null)
      return
    }

    const requestId = active.id as string
    const newStatus = over.id as ColumnType

    // 유효한 상태인지 확인
    if (columns.some(col => col.type === newStatus)) {
      moveRequest(requestId, newStatus)
    }
    
    setActiveRequest(null)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">SoomgoFlow</h1>
        <p className="text-muted-foreground">AI 기반 숨고 영업 자동화 플랫폼</p>
      </div>

      <DndContext
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-4">
          {columns.map((column) => (
            <KanbanColumn
              key={column.type}
              type={column.type}
              title={column.title}
              requests={kanbanData[column.type]}
            />
          ))}
        </div>

        <DragOverlay>
          {activeRequest ? <RequestCard request={activeRequest} /> : null}
        </DragOverlay>
      </DndContext>

      <RequestDetailModal
        request={selectedRequest}
        open={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />
    </div>
  )
}