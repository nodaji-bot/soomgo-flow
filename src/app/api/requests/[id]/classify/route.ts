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
    const { grade, gradeReasoning, quoteDraft, quotePrice } = body;

    if (!grade || !['A', 'B', 'C'].includes(grade)) {
      return NextResponse.json({ error: '올바른 등급을 선택해주세요.' }, { status: 400 });
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
      grade,
      gradeReasoning: gradeReasoning || '',
      quoteDraft: quoteDraft || '',
      quotePrice: quotePrice || null,
      status: quoteDraft ? 'pending_approval' : 'classified'
    };

    // 히스토리에 분류 이벤트 추가
    const classifyEvent = {
      type: 'classified',
      timestamp: new Date().toISOString(),
      description: `${grade}등급 분류${gradeReasoning ? ': ' + gradeReasoning : ''}`
    };

    if (!statesData[id].history) {
      statesData[id].history = [];
    }
    
    statesData[id].history.push(classifyEvent);

    // 파일에 저장
    fs.writeFileSync(STATES_DATA_PATH, JSON.stringify(statesData, null, 2));

    return NextResponse.json({ success: true, state: statesData[id] });
  } catch (error) {
    console.error('Classify error:', error);
    return NextResponse.json({ error: '분류 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}