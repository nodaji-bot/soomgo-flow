import { create } from 'zustand';
import { AppState, Request, ViewType, FilterType, HistoryEvent } from '@/types';

// API 호출 헬퍼
async function apiCall(endpoint: string, options?: RequestInit) {
  const token = localStorage.getItem('auth_token');
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  const response = await fetch(endpoint, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API 요청 실패');
  }

  return response.json();
}

export const useStore = create<AppState>((set, get) => ({
  requests: [],
  selectedRequest: null,
  viewType: 'list',
  filter: 'all',
  showDetailPanel: false,
  showConfirmModal: false,
  showRejectModal: false,
  isLoading: false,

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

  // 실제 API에서 데이터 로드
  loadRequests: async () => {
    try {
      set({ isLoading: true });
      const requests = await apiCall('/api/requests');
      set({ requests });
    } catch (error) {
      console.error('Failed to load requests:', error);
      alert('데이터 로드에 실패했습니다: ' + error.message);
    } finally {
      set({ isLoading: false });
    }
  },

  // 등급 분류
  classifyRequest: async (requestId: string, grade: string, gradeReasoning?: string, quoteDraft?: string, quotePrice?: number) => {
    try {
      const result = await apiCall(`/api/requests/${requestId}/classify`, {
        method: 'POST',
        body: JSON.stringify({
          grade,
          gradeReasoning,
          quoteDraft,
          quotePrice
        })
      });

      // 로컬 상태 업데이트
      const { requests } = get();
      const updatedRequests = requests.map(request => {
        if (request.id === requestId) {
          return {
            ...request,
            grade: grade as any,
            status: quoteDraft ? 'pending_approval' : 'classified',
            amount: quotePrice || null
          };
        }
        return request;
      });

      set({
        requests: updatedRequests,
        selectedRequest: updatedRequests.find(r => r.id === requestId) || null
      });

      return result;
    } catch (error) {
      console.error('Failed to classify request:', error);
      throw error;
    }
  },

  // 견적 발송
  sendEstimate: async (requestId: string, price: number, message: string) => {
    try {
      const result = await apiCall(`/api/requests/${requestId}/send-quote`, {
        method: 'POST',
        body: JSON.stringify({ price, message })
      });

      // 로컬 상태 업데이트
      const { requests } = get();
      const updatedRequests = requests.map(request => {
        if (request.id === requestId) {
          const newEvent: HistoryEvent = {
            id: `${requestId}-sent-${Date.now()}`,
            type: 'sent',
            title: '견적 발송됨',
            description: `고객에게 견적서가 전송되었습니다 (${price.toLocaleString()}원)`,
            timestamp: new Date(),
            icon: 'S',
            amount: price
          };
          
          return {
            ...request,
            status: 'sent' as const,
            amount: price,
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

      return result;
    } catch (error) {
      console.error('Failed to send estimate:', error);
      throw error;
    }
  },

  // 요청 거절
  rejectRequest: async (requestId: string, reason: string) => {
    try {
      const result = await apiCall(`/api/requests/${requestId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });

      // 로컬 상태 업데이트
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

      return result;
    } catch (error) {
      console.error('Failed to reject request:', error);
      throw error;
    }
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