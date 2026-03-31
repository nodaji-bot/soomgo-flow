import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { verifyAuth } from '../../../auth/verify/route';
import { getDb } from '@/lib/db';

const execAsync = promisify(exec);

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  try {
    const { id } = params;
    const body = await request.json();
    const { price, message } = body;

    if (!price || !message) {
      return NextResponse.json({ error: '가격과 메시지를 모두 입력해주세요.' }, { status: 400 });
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ error: 'DB 연결 실패' }, { status: 500 });
    }

    // 요청 정보 조회
    const existingRequest = db.prepare('SELECT * FROM requests WHERE id = ?').get(id);
    if (!existingRequest) {
      return NextResponse.json({ error: '요청을 찾을 수 없습니다.' }, { status: 404 });
    }

    const soomgoId = id; // 숨고 요청 ID는 id와 동일

    // 견적 발송 스크립트 실행
    const scriptPath = '/Users/picl/.openclaw/workspace/soomgo-research/soomgo-send-quote.js';
    const command = `node "${scriptPath}" -r "${soomgoId}" -p "${price}" -m "${message.replace(/"/g, '\\"')}" --send`;

    console.log('Executing quote script:', command);
    
    let scriptResult;
    try {
      const { stdout, stderr } = await execAsync(command, { 
        timeout: 120000, // 2분 타임아웃
        env: { ...process.env }
      });
      
      console.log('Script stdout:', stdout);
      if (stderr) {
        console.log('Script stderr:', stderr);
      }
      
      // 스크립트 결과 파싱
      try {
        // stdout에서 JSON 결과 추출
        const lines = stdout.split('\n');
        const resultLine = lines.find(line => line.trim().startsWith('{') && line.includes('"status"'));
        
        if (resultLine) {
          scriptResult = JSON.parse(resultLine.trim());
        } else {
          // JSON을 찾을 수 없으면 기본 성공 처리
          scriptResult = {
            status: 'sent',
            requestId: soomgoId,
            price: parseInt(price),
            message: message
          };
        }
      } catch (parseError) {
        console.error('Failed to parse script result:', parseError);
        // 파싱 실패시에도 성공으로 처리 (스크립트가 실행되었으므로)
        scriptResult = {
          status: 'sent',
          requestId: soomgoId,
          price: parseInt(price),
          message: message
        };
      }
    } catch (execError) {
      console.error('Script execution failed:', execError);
      return NextResponse.json({ 
        error: '견적 발송 중 오류가 발생했습니다.',
        details: execError.message
      }, { status: 500 });
    }

    const now = new Date().toISOString();

    // 성공한 경우 DB 상태 업데이트
    if (scriptResult.status === 'sent' || scriptResult.status === 'success') {
      const transaction = db.transaction(() => {
        // 1. requests 테이블 업데이트
        const updateRequest = db.prepare(`
          UPDATE requests SET
            status = 'sent', quote_price = ?, quote_message = ?,
            quote_sent_at = ?, updated_at = ?
          WHERE id = ?
        `);

        updateRequest.run(
          parseInt(price),
          message,
          now,
          now,
          id
        );

        // 2. history 테이블에 발송 이벤트 추가
        const insertHistory = db.prepare(`
          INSERT INTO history (request_id, type, description, metadata, created_at)
          VALUES (?, ?, ?, ?, ?)
        `);

        insertHistory.run(
          id,
          'sent',
          `견적 발송 완료 (${parseInt(price).toLocaleString()}원)`,
          JSON.stringify({
            price: parseInt(price),
            message,
            scriptResult
          }),
          now
        );
      });

      // 트랜잭션 실행
      transaction();

      return NextResponse.json({ success: true, scriptResult });

    } else {
      return NextResponse.json({ 
        error: '견적 발송에 실패했습니다.',
        scriptResult 
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Send quote error:', error);
    return NextResponse.json({ 
      error: '견적 발송 처리 중 오류가 발생했습니다.' 
    }, { status: 500 });
  }
}