import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '../auth/verify/route';
import { getDb, mapRowToFrontend, RequestRow, HistoryRow } from '@/lib/db';

export async function GET(request: NextRequest) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  try {
    const db = await getDb();
    if (!db) {
      // DB가 없으면 빈 배열 반환 (Vercel 환경 대비)
      return NextResponse.json([]);
    }

    const { searchParams } = new URL(request.url);
    
    const status = searchParams.get('status');
    const grade = searchParams.get('grade');
    const showArchived = searchParams.get('archived') === 'true';

    let where = showArchived ? '1=1' : 'is_archived = 0';
    const params: any[] = [];

    if (status) {
      where += ' AND status = ?';
      params.push(status);
    }
    if (grade) {
      where += ' AND grade = ?';
      params.push(grade);
    }

    const rows = db.prepare(
      `SELECT * FROM requests WHERE ${where} ORDER BY created_at DESC`
    ).all(...params) as RequestRow[];

    const requests = rows.map(row => {
      const history = db.prepare(
        'SELECT * FROM history WHERE request_id = ? ORDER BY created_at ASC'
      ).all(row.id) as HistoryRow[];
      return mapRowToFrontend(row, history);
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Failed to load requests:', error);
    return NextResponse.json({ error: '데이터를 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}