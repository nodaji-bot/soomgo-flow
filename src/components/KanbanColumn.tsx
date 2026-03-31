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
  new: 'border-blue-500/20 bg-blue-500/5',
  classified: 'border-purple-500/20 bg-purple-500/5',
  pending_approval: 'border-yellow-500/20 bg-yellow-500/5',
  sent: 'border-green-500/20 bg-green-500/5',
  in_progress: 'border-orange-500/20 bg-orange-500/5',
  completed: 'border-gray-500/20 bg-gray-500/5'
}

export function KanbanColumn({ type, title, requests }: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: type,
  })

  return (
    <Card className={`min-h-[600px] w-80 ${columnStyles[type]} ${isOver ? 'ring-2 ring-blue-500' : ''}`}>
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