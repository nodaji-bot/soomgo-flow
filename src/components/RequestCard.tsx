import { Request } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useKanbanStore } from '@/lib/store'
import { Clock, Users } from 'lucide-react'

interface RequestCardProps {
  request: Request
}

const gradeColors = {
  A: 'bg-green-500',
  B: 'bg-yellow-500', 
  C: 'bg-red-500'
}

const gradeTextColors = {
  A: 'text-green-500',
  B: 'text-yellow-500',
  C: 'text-red-500'
}

export function RequestCard({ request }: RequestCardProps) {
  const { setSelectedRequest } = useKanbanStore()

  const handleClick = () => {
    setSelectedRequest(request)
  }

  return (
    <Card 
      className="cursor-pointer hover:bg-accent/50 transition-colors mb-3"
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{request.clientName}</h3>
            <p className="text-sm text-muted-foreground truncate">
              {request.category || '카테고리 미지정'}
            </p>
          </div>
          <Badge 
            variant="secondary" 
            className={`${gradeColors[request.grade]} text-white ml-2 shrink-0`}
          >
            {request.grade}급
          </Badge>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{request.timeAgo}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{request.competitorCount}명 경쟁</span>
          </div>
        </div>

        {request.quotePrice && (
          <div className="mt-2 pt-2 border-t">
            <span className="text-sm font-medium text-blue-400">
              견적: {request.quotePrice.toLocaleString()}원
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}