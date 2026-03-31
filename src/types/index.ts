export type Grade = 'A' | 'B' | 'C';

export type RequestStatus = 
  | 'new' 
  | 'estimate_ready' 
  | 'pending_approval' 
  | 'sent' 
  | 'in_progress' 
  | 'completed'
  | 'rejected';

export type HistoryEventType = 
  | 'received'
  | 'classified'
  | 'estimate_created'
  | 'reviewing'
  | 'sent'
  | 'memo_added'
  | 'rejected';

export interface HistoryEvent {
  id: string;
  type: HistoryEventType;
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
  amount?: number;
  memo?: string;
}

export interface Request {
  id: string;
  customerName: string;
  category: string;
  location: string;
  timeAgo: string;
  competitorCount: number;
  grade: Grade;
  status: RequestStatus;
  amount: number | null;
  description: string;
  customerInfo: {
    joinDate: string;
    usageCount: number;
  };
  history: HistoryEvent[];
  detail: any;
}

export type ViewType = 'list' | 'kanban';

export type FilterType = 'all' | 'grade-a' | 'grade-b' | 'grade-c' | 'status-new' | 'status-pending' | 'status-sent' | 'status-progress' | 'status-completed';

export interface AppState {
  requests: Request[];
  selectedRequest: Request | null;
  viewType: ViewType;
  filter: FilterType;
  showDetailPanel: boolean;
  showConfirmModal: boolean;
  showRejectModal: boolean;
  setSelectedRequest: (request: Request | null) => void;
  setViewType: (viewType: ViewType) => void;
  setFilter: (filter: FilterType) => void;
  setShowDetailPanel: (show: boolean) => void;
  setShowConfirmModal: (show: boolean) => void;
  setShowRejectModal: (show: boolean) => void;
  sendEstimate: (requestId: string, message: string) => void;
  rejectRequest: (requestId: string, reason: string) => void;
  addMemo: (requestId: string, memo: string) => void;
}