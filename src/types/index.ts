export interface Request {
  id: string;
  soomgoId: string;
  clientName: string;
  category: string;
  location: string | null;
  timeAgo: string;
  competitorCount: number;
  status: 'new' | 'classified' | 'pending_approval' | 'sent' | 'in_progress' | 'completed' | 'rejected';
  grade: 'A' | 'B' | 'C';
  gradeReasoning: string;
  detail: {
    serviceType: string | null;
    description: string | null;
    deadline: string | null;
    referenceUrl: string | null;
  };
  customer: {
    joinDate: string | null;
    usageCount: number | null;
  };
  quoteDraft: string | null;
  quotePrice: number | null;
  crawledAt: string;
}

export type KanbanColumn = 'new' | 'classified' | 'pending_approval' | 'sent' | 'in_progress' | 'completed';

export interface KanbanData {
  new: Request[];
  classified: Request[];
  pending_approval: Request[];
  sent: Request[];
  in_progress: Request[];
  completed: Request[];
}