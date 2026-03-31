import { create } from 'zustand';
import { AppState, Request, ViewType, FilterType, HistoryEvent } from '@/types';
import { mockRequests } from '@/data/mock-requests';

export const useStore = create<AppState>((set, get) => ({
  requests: mockRequests,
  selectedRequest: null,
  viewType: 'list',
  filter: 'all',
  showDetailPanel: false,
  showConfirmModal: false,
  showRejectModal: false,

  setSelectedRequest: (request) => {
    set({ 
      selectedRequest: request,
      showDetailPanel: !!request 
    });
  },

  setViewType: (viewType) => set({ viewType }),

  setFilter: (filter) => set({ filter }),

  setShowDetailPanel: (show) => {
    if (!show) {
      set({ selectedRequest: null });
    }
    set({ showDetailPanel: show });
  },

  setShowConfirmModal: (show) => set({ showConfirmModal: show }),

  setShowRejectModal: (show) => set({ showRejectModal: show }),

  sendEstimate: (requestId, message) => {
    const { requests } = get();
    const updatedRequests = requests.map(request => {
      if (request.id === requestId) {
        const newEvent: HistoryEvent = {
          id: `${requestId}-sent-${Date.now()}`,
          type: 'sent',
          title: '견적 발송됨',
          description: `고객에게 견적서가 전송되었습니다\n"${message}"`,
          timestamp: new Date(),
          icon: 'S'
        };
        
        return {
          ...request,
          status: 'sent' as const,
          history: [...request.history, newEvent]
        };
      }
      return request;
    });

    set({ 
      requests: updatedRequests,
      selectedRequest: updatedRequests.find(r => r.id === requestId) || null,
      showConfirmModal: false 
    });
  },

  rejectRequest: (requestId, reason) => {
    const { requests } = get();
    const updatedRequests = requests.map(request => {
      if (request.id === requestId) {
        const newEvent: HistoryEvent = {
          id: `${requestId}-rejected-${Date.now()}`,
          type: 'rejected',
          title: '요청 거절됨',
          description: `거절 사유: ${reason}`,
          timestamp: new Date(),
          icon: 'R'
        };
        
        return {
          ...request,
          status: 'rejected' as const,
          history: [...request.history, newEvent]
        };
      }
      return request;
    });

    set({ 
      requests: updatedRequests,
      selectedRequest: updatedRequests.find(r => r.id === requestId) || null,
      showRejectModal: false 
    });
  },

  addMemo: (requestId, memo) => {
    const { requests } = get();
    const updatedRequests = requests.map(request => {
      if (request.id === requestId) {
        const newEvent: HistoryEvent = {
          id: `${requestId}-memo-${Date.now()}`,
          type: 'memo_added',
          title: '메모 추가됨',
          description: memo,
          timestamp: new Date(),
          icon: 'M',
          memo
        };
        
        return {
          ...request,
          history: [...request.history, newEvent]
        };
      }
      return request;
    });

    set({ 
      requests: updatedRequests,
      selectedRequest: updatedRequests.find(r => r.id === requestId) || null
    });
  },
}));