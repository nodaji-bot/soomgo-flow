import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { verifyAuth } from '../../../auth/verify/route';

const STATES_DATA_PATH = '/Users/picl/.openclaw/workspace/soomgo-research/data/request-states.json';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  // 토큰 검증
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

    // 기존 상태 데이터 읽기
    let statesData = {};
    if (fs.existsSync(STATES_DATA_PATH)) {
      const content = fs.readFileSync(STATES_DATA_PATH, 'utf-8');
      statesData = JSON.parse(content);
    }

    // 해당 요청의 상태 업데이트
    if (!statesData[id]) {
      statesData[id] = {
        status: 'new',
        history: []
      };
    }

    statesData[id] = {
      ...statesData[id],
      status: 'rejected',
      rejectedReason: reason,
      rejectedAt: new Date().toISOString()
    };

    // 히스토리에 거절 이벤트 추가
    const rejectEvent = {
      type: 'rejected',
      timestamp: new Date().toISOString(),
      description: `요청 거절됨: ${reason}`
    };

    if (!statesData[id].history) {
      statesData[id].history = [];
    }
    
    statesData[id].history.push(rejectEvent);

    // 파일에 저장
    fs.writeFileSync(STATES_DATA_PATH, JSON.stringify(statesData, null, 2));

    return NextResponse.json({ success: true, state: statesData[id] });
  } catch (error) {
    console.error('Reject error:', error);
    return NextResponse.json({ error: '거절 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}