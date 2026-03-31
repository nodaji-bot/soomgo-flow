import { create } from 'zustand'
import { Request, KanbanColumn, KanbanData } from '@/types'
import { seedRequests } from '@/data/seedData'

interface KanbanStore {
  requests: Request[]
  kanbanData: KanbanData
  selectedRequest: Request | null
  moveRequest: (requestId: string, newStatus: KanbanColumn) => void
  updateRequest: (requestId: string, updates: Partial<Request>) => void
  setSelectedRequest: (request: Request | null) => void
  getRequestsByStatus: (status: KanbanColumn) => Request[]
}

// 시드 데이터를 칸반 데이터로 변환
const groupRequestsByStatus = (requests: Request[]): KanbanData => {
  const kanban: KanbanData = {
    new: [],
    classified: [],
    pending_approval: [],
    sent: [],
    in_progress: [],
    completed: []
  }
  
  requests.forEach(request => {
    if (request.status in kanban) {
      kanban[request.status as KanbanColumn].push(request)
    }
  })
  
  return kanban
}

export const useKanbanStore = create<KanbanStore>((set, get) => ({
  requests: seedRequests,
  kanbanData: groupRequestsByStatus(seedRequests),
  selectedRequest: null,

  moveRequest: (requestId: string, newStatus: KanbanColumn) => {
    set(state => {
      const updatedRequests = state.requests.map(request =>
        request.id === requestId ? { ...request, status: newStatus } : request
      )
      
      return {
        requests: updatedRequests,
        kanbanData: groupRequestsByStatus(updatedRequests)
      }
    })
  },

  updateRequest: (requestId: string, updates: Partial<Request>) => {
    set(state => {
      const updatedRequests = state.requests.map(request =>
        request.id === requestId ? { ...request, ...updates } : request
      )
      
      return {
        requests: updatedRequests,
        kanbanData: groupRequestsByStatus(updatedRequests)
      }
    })
  },

  setSelectedRequest: (request: Request | null) => {
    set({ selectedRequest: request })
  },

  getRequestsByStatus: (status: KanbanColumn) => {
    return get().kanbanData[status] || []
  }
}))