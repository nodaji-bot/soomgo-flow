import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { verifyAuth } from '../auth/verify/route';

const CRAWL_DATA_PATH = '/Users/picl/.openclaw/workspace/soomgo-research/data/last-crawl.json';
const STATES_DATA_PATH = '/Users/picl/.openclaw/workspace/soomgo-research/data/request-states.json';

// 크롤링 데이터를 프론트엔드 형식으로 변환
function mapCrawlDataToRequest(crawlData: any, state: any = {}) {
  const status = state.status || 'new';
  const grade = state.grade || 'C'; // 기본값 C
  
  return {
    id: crawlData.id,
    customerName: crawlData.name,
    category: crawlData.category || '기타',
    location: crawlData.location || '전국',
    timeAgo: crawlData.timeAgo,
    competitorCount: crawlData.competitorCount || 0,
    grade: grade,
    status: status,
    amount: state.quotePrice || null,
    description: crawlData.detail?.serviceType || crawlData.detail?.description || '',
    customerInfo: {
      joinDate: crawlData.customer?.joinDate || '정보 없음',
      usageCount: crawlData.customer?.usageCount || 0
    },
    detail: crawlData.detail,
    history: state.history || [
      {
        id: `${crawlData.id}-received`,
        type: 'received',
        title: '요청 수신',
        description: `${crawlData.category || '기타'}, ${crawlData.location || '전국'}`,
        timestamp: new Date(crawlData.crawledAt || Date.now()),
        icon: 'R'
      }
    ],
    // 추가 상태 정보
    gradeReasoning: state.gradeReasoning || '',
    quoteDraft: state.quoteDraft || '',
    rejectedReason: state.rejectedReason || null,
    sentAt: state.sentAt || null
  };
}

export async function GET(request: NextRequest) {
  // 토큰 검증
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  try {
    // 크롤링 데이터 읽기
    let crawlData = [];
    if (fs.existsSync(CRAWL_DATA_PATH)) {
      const crawlContent = fs.readFileSync(CRAWL_DATA_PATH, 'utf-8');
      crawlData = JSON.parse(crawlContent);
    }

    // 상태 데이터 읽기
    let statesData = {};
    if (fs.existsSync(STATES_DATA_PATH)) {
      const statesContent = fs.readFileSync(STATES_DATA_PATH, 'utf-8');
      statesData = JSON.parse(statesContent);
    }

    // 데이터 병합
    const requests = crawlData.map((item: any) => {
      const state = statesData[item.id] || {};
      return mapCrawlDataToRequest(item, state);
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Failed to load requests:', error);
    return NextResponse.json({ error: '데이터를 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}