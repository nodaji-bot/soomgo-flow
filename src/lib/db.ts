const DB_PATH = '/Users/picl/.openclaw/workspace/soomgo-research/data/soomgo.db';

let _db: any = null;

export async function getDb() {
  if (!_db) {
    try {
      const Database = (await import('better-sqlite3')).default;
      _db = new Database(DB_PATH);
      _db.pragma('journal_mode = WAL');
      _db.pragma('foreign_keys = ON');
    } catch (error) {
      console.error('DB 연결 실패:', error);
      return null;
    }
  }
  return _db;
}

export interface RequestRow {
  id: string;
  name: string;
  category: string | null;
  location: string | null;
  competitor_count: number | null;
  status: string;
  grade: string | null;
  grade_reasoning: string | null;
  service_type: string | null;
  description: string | null;
  deadline: string | null;
  reference_url: string | null;
  progress_method: string | null;
  desired_service: string | null;
  labeling_data: string | null;
  customer_join_date: string | null;
  customer_usage_count: number | null;
  quote_price: number | null;
  quote_message: string | null;
  quote_sent_at: string | null;
  rejected_reason: string | null;
  rejected_at: string | null;
  soomgo_status: string | null;
  time_ago: string | null;
  is_archived: number;
  first_seen_at: string;
  last_seen_at: string;
  updated_at: string;
  created_at: string;
}

export interface HistoryRow {
  id: number;
  request_id: string;
  type: string;
  description: string | null;
  metadata: string | null;
  created_at: string;
}

export function mapRowToFrontend(row: RequestRow, history: HistoryRow[]) {
  return {
    id: row.id,
    customerName: row.name,
    category: row.category || '기타',
    location: row.location || '전국',
    timeAgo: row.time_ago || '',
    competitorCount: row.competitor_count || 0,
    grade: row.grade || 'C',
    status: row.status,
    amount: row.quote_price || null,
    description: row.description || row.service_type || '',
    customerInfo: {
      joinDate: row.customer_join_date || '정보 없음',
      usageCount: row.customer_usage_count || 0
    },
    detail: {
      serviceType: row.service_type,
      description: row.description,
      deadline: row.deadline,
      referenceUrl: row.reference_url,
      progressMethod: row.progress_method,
      desiredService: row.desired_service,
      labelingData: row.labeling_data
    },
    history: history.map(h => ({
      id: `${h.request_id}-${h.id}`,
      type: h.type,
      title: typeToTitle(h.type),
      description: h.description || '',
      timestamp: h.created_at,
      icon: h.type[0].toUpperCase()
    })),
    gradeReasoning: row.grade_reasoning || '',
    quoteDraft: row.quote_message || '',
    rejectedReason: row.rejected_reason || null,
    sentAt: row.quote_sent_at || null,
    isArchived: row.is_archived === 1,
    firstSeenAt: row.first_seen_at,
    lastSeenAt: row.last_seen_at,
    soomgoStatus: row.soomgo_status
  };
}

function typeToTitle(type: string): string {
  const map: Record<string, string> = {
    received: '요청 수신',
    classified: '등급 분류',
    quote_drafted: '견적 초안',
    approved: '견적 승인',
    sent: '견적 발송',
    rejected: '요청 거절',
    archived: '아카이브',
    note: '메모'
  };
  return map[type] || type;
}