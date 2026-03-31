import { KanbanColumn as ColumnType, Request } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RequestCard } from './RequestCard'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { SortableRequestCard } from './SortableRequestCard'

interface KanbanColumnProps {
  type: ColumnType
  title: string
  requests: Request[]
}

const columnStyles = {
  new: 'border-neutral-500/20 bg-neutral-500/5',
  classified: 'border-neutral-400/20 bg-neutral-400/5',
  pending_approval: 'border-neutral-600/20 bg-neutral-600/5',
  sent: 'border-neutral-700/20 bg-neutral-700/5',
  in_progress: 'border-neutral-300/20 bg-neutral-300/5',
  completed: 'border-neutral-200/20 bg-neutral-200/5'
}

export function KanbanColumn({ type, title, requests }: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: type,
  })

  return (
    <Card className={`min-h-[600px] w-80 ${columnStyles[type]} ${isOver ? 'ring-2 ring-neutral-400' : ''}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm font-medium">
          <span>{title}</span>
          <span className="bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs">
            {requests.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0" ref={setNodeRef}>
        <SortableContext items={requests.map(r => r.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {requests.map((request) => (
              <SortableRequestCard key={request.id} request={request} />
            ))}
          </div>
        </SortableContext>
      </CardContent>
    </Card>
  )
}