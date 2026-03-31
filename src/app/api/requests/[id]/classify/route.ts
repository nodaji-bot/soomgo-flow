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
    const { grade, gradeReasoning, quoteDraft, quotePrice } = body;

    if (!grade || !['A', 'B', 'C'].includes(grade)) {
      return NextResponse.json({ error: '올바른 등급을 선택해주세요.' }, { status: 400 });
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ error: 'DB 연결 실패' }, { status: 500 });
    }

    const now = new Date().toISOString();

    // 트랜잭션으로 requests 업데이트 + history 추가
    const transaction = db.transaction(() => {
      // 1. requests 테이블 업데이트
      const newStatus = quoteDraft ? 'pending_approval' : 'classified';
      
      const updateRequest = db.prepare(`
        UPDATE requests SET
          grade = ?, grade_reasoning = ?, quote_message = ?, quote_price = ?,
          status = ?, updated_at = ?
        WHERE id = ?
      `);

      const result = updateRequest.run(
        grade, 
        gradeReasoning || '', 
        quoteDraft || '', 
        quotePrice || null,
        newStatus,
        now,
        id
      );

      if (result.changes === 0) {
        throw new Error('요청을 찾을 수 없습니다.');
      }

      // 2. history 테이블에 분류 이벤트 추가
      const insertHistory = db.prepare(`
        INSERT INTO history (request_id, type, description, metadata, created_at)
        VALUES (?, ?, ?, ?, ?)
      `);

      insertHistory.run(
        id,
        'classified',
        `${grade}등급 분류${gradeReasoning ? ': ' + gradeReasoning : ''}`,
        JSON.stringify({
          grade,
          gradeReasoning,
          quoteDraft,
          quotePrice
        }),
        now
      );

      // 3. 견적 초안이 있으면 quote_drafted 이벤트도 추가
      if (quoteDraft) {
        insertHistory.run(
          id,
          'quote_drafted',
          '견적 초안 작성 완료',
          JSON.stringify({
            quoteDraft,
            quotePrice
          }),
          now
        );
      }
    });

    // 트랜잭션 실행
    transaction();

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Classify error:', error);
    return NextResponse.json({ 
      error: error.message || '분류 처리 중 오류가 발생했습니다.' 
    }, { status: 500 });
  }
}