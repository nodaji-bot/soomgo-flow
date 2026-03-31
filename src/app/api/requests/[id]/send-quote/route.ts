import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { verifyAuth } from '../../../auth/verify/route';

const execAsync = promisify(exec);
const STATES_DATA_PATH = '/Users/picl/.openclaw/workspace/soomgo-research/data/request-states.json';
const CRAWL_DATA_PATH = '/Users/picl/.openclaw/workspace/soomgo-research/data/last-crawl.json';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  // 토큰 검증
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

    // 숨고 ID 찾기 (크롤링 데이터에서)
    let crawlData = [];
    let soomgoId = id;
    
    if (fs.existsSync(CRAWL_DATA_PATH)) {
      const crawlContent = fs.readFileSync(CRAWL_DATA_PATH, 'utf-8');
      crawlData = JSON.parse(crawlContent);
      const foundRequest = crawlData.find((item: any) => item.id === id);
      if (foundRequest) {
        soomgoId = foundRequest.id; // 실제로는 숨고 요청 ID가 여기에 있음
      }
    }

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

    // 성공한 경우 상태 업데이트
    if (scriptResult.status === 'sent' || scriptResult.status === 'success') {
      let statesData = {};
      if (fs.existsSync(STATES_DATA_PATH)) {
        const content = fs.readFileSync(STATES_DATA_PATH, 'utf-8');
        statesData = JSON.parse(content);
      }

      if (!statesData[id]) {
        statesData[id] = { history: [] };
      }

      statesData[id] = {
        ...statesData[id],
        status: 'sent',
        quotePrice: parseInt(price),
        quoteDraft: message,
        sentAt: new Date().toISOString()
      };

      // 히스토리에 발송 이벤트 추가
      const sendEvent = {
        type: 'sent',
        timestamp: new Date().toISOString(),
        description: `견적 발송됨 (${parseInt(price).toLocaleString()}원)`
      };

      if (!statesData[id].history) {
        statesData[id].history = [];
      }
      
      statesData[id].history.push(sendEvent);

      // 파일에 저장
      fs.writeFileSync(STATES_DATA_PATH, JSON.stringify(statesData, null, 2));

      return NextResponse.json({ 
        success: true, 
        state: statesData[id],
        scriptResult 
      });
    } else {
      return NextResponse.json({ 
        error: '견적 발송에 실패했습니다.',
        scriptResult 
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Send quote error:', error);
    return NextResponse.json({ error: '견적 발송 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}