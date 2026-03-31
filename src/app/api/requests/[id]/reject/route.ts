import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '../../../auth/verify/route';
import { getDb } from '@/lib/db';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  try {
    const { id } = params;
    const body = await request.json();
    const { reason } = body;

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json({ error: '거절 사유를 입력해주세요.' }, { status: 400 });
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ error: 'DB 연결 실패' }, { status: 500 });
    }

    const now = new Date().toISOString();

    // 트랜잭션으로 requests 업데이트 + history 추가
    const transaction = db.transaction(() => {
      // 1. requests 테이블 업데이트
      const updateRequest = db.prepare(`
        UPDATE requests SET
          status = 'rejected', rejected_reason = ?, rejected_at = ?, updated_at = ?
        WHERE id = ?
      `);

      const result = updateRequest.run(reason.trim(), now, now, id);

      if (result.changes === 0) {
        throw new Error('요청을 찾을 수 없습니다.');
      }

      // 2. history 테이블에 거절 이벤트 추가
      const insertHistory = db.prepare(`
        INSERT INTO history (request_id, type, description, metadata, created_at)
        VALUES (?, ?, ?, ?, ?)
      `);

      insertHistory.run(
        id,
        'rejected',
        `요청 거절: ${reason}`,
        JSON.stringify({
          reason: reason.trim()
        }),
        now
      );
    });

    // 트랜잭션 실행
    transaction();

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Reject error:', error);
    return NextResponse.json({ 
      error: error.message || '거절 처리 중 오류가 발생했습니다.' 
    }, { status: 500 });
  }
}