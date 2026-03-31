import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Request } from '@/types'
import { RequestCard } from './RequestCard'

interface SortableRequestCardProps {
  request: Request
}

export function SortableRequestCard({ request }: SortableRequestCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: request.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? 'opacity-50' : ''}
      {...attributes}
      {...listeners}
    >
      <RequestCard request={request} />
    </div>
  )
}