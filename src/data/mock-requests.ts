import { Request, HistoryEvent, RequestStatus, Grade } from '@/types';

const generateHistoryEvents = (request: any, grade: Grade): HistoryEvent[] => {
  const now = new Date();
  const events: HistoryEvent[] = [];
  
  // 모든 요청: 요청 수신
  events.push({
    id: `${request.id}-received`,
    type: 'received',
    title: '요청 수신',
    description: `${request.category || '기타'}, ${request.location || '전국'}`,
    timestamp: new Date(now.getTime() - (parseInt(request.timeAgo) + 1) * 60 * 60 * 1000),
    icon: '🔵'
  });

  // 모든 요청: AI 분류 완료
  const gradeTexts = {
    A: '정기 이용자, 기술적으로 도전적이나 충분히 가능한 범위',
    B: `${request.customer.usageCount}회 이용 고객, 기술적으로 간단하나 세부 확인 필요`,
    C: '신규 고객, 기술적으로 복잡하거나 제약사항 다수'
  };
  
  events.push({
    id: `${request.id}-classified`,
    type: 'classified',
    title: 'AI 분류 완료',
    description: `${grade}등급\n"${gradeTexts[grade]}"`,
    timestamp: new Date(now.getTime() - parseInt(request.timeAgo) * 60 * 60 * 1000 + 1 * 60 * 1000),
    icon: '🤖'
  });

  // A/B 등급: 견적 초안 생성
  if (grade === 'A' || grade === 'B') {
    const estimates = {
      '매크로/VBA 개발': 200000,
      '인공지능(AI) 개발': 500000,
      '웹 개발': 300000,
      '앱 개발': 800000,
      '기타': 150000
    };
    
    const amount = estimates[request.category as keyof typeof estimates] || 250000;
    
    // 톤 가이드 기반 견적 초안 생성
    let message = '';
    if (request.category === '매크로/VBA 개발') {
      if (request.name === '이종석') {
        message = '새로고침 → 클릭 → 신청 자동화요? 자주 들어오는 유형이라 충분히 가능합니다. 근데 어떤 사이트인지에 따라 난이도가 좀 달라져요. 어디서 쓰실 건지 알려주시면 바로 견적 드릴게요.';
      } else if (request.detail?.serviceType?.includes('소상공인')) {
        message = '소상공인 정책자금 매크로 문의주셨군요. 정부 사이트 자동화는 보안이 까다로워서 실제 사이트 구조를 봐야 정확한 답변 드릴 수 있어요. 어떤 단계까지 자동화하고 싶으신지 알려주세요.';
      } else {
        message = '매크로 작업 충분히 가능합니다. 다만 대상 사이트나 프로그램에 따라 접근 방식이 달라져서, 구체적으로 어디에 쓰실 건지만 알려주시면 정확한 견적 드릴게요.';
      }
    } else if (request.category === '인공지능(AI) 개발') {
      if (request.detail?.serviceType === '음성') {
        message = '음성 AI 개발 문의주셨네요. 음성을 직접 분석하는 건지, 음성→텍스트 변환 후 처리하는 건지에 따라 복잡도가 달라져요. 어떤 쪽인지 알려주시면 바로 견적 드릴게요.';
      } else {
        message = 'AI 개발 가능합니다. 어떤 데이터로 무엇을 예측하고 싶으신지, 그리고 기존에 데이터가 얼마나 있는지 알려주시면 구체적인 방향 제시해드릴게요.';
      }
    } else {
      message = '요청하신 개발 충분히 가능해 보입니다. 정확한 견적을 위해서는 조금 더 구체적인 요구사항이 필요해요. 어떤 기능들이 핵심인지 알려주시면 바로 견적 드릴게요.';
    }
    
    events.push({
      id: `${request.id}-estimate`,
      type: 'estimate_created',
      title: '견적 초안 생성',
      description: `금액: ${amount.toLocaleString()}원\n"${message}"`,
      timestamp: new Date(now.getTime() - parseInt(request.timeAgo) * 60 * 60 * 1000 + 2 * 60 * 1000),
      icon: '📝',
      amount
    });
  }

  // 일부: 오퍼레이터 검토 중
  if (Math.random() > 0.4) {
    events.push({
      id: `${request.id}-reviewing`,
      type: 'reviewing',
      title: '승인 대기 중',
      description: '오퍼레이터 검토 중',
      timestamp: new Date(now.getTime() - parseInt(request.timeAgo) * 60 * 60 * 1000 + 15 * 60 * 1000),
      icon: '⏳'
    });
  }

  // 1~2건: 견적 발송됨
  if (Math.random() > 0.8) {
    events.push({
      id: `${request.id}-sent`,
      type: 'sent',
      title: '견적 발송됨',
      description: '고객에게 견적서가 전송되었습니다',
      timestamp: new Date(now.getTime() - parseInt(request.timeAgo) * 60 * 60 * 1000 + 30 * 60 * 1000),
      icon: '✅'
    });
  }

  return events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
};

const getGrade = (customer: any): Grade => {
  if (customer.usageCount >= 10) return 'A';
  if (customer.usageCount >= 5 || customer.joinDate.includes('2024') || customer.joinDate.includes('2023')) return 'B';
  return 'C';
};

const getStatus = (events: HistoryEvent[]): RequestStatus => {
  const hasEstimate = events.some(e => e.type === 'estimate_created');
  const hasSent = events.some(e => e.type === 'sent');
  const hasReviewing = events.some(e => e.type === 'reviewing');
  
  if (hasSent) return 'sent';
  if (hasReviewing) return 'pending_approval';
  if (hasEstimate) return 'estimate_ready';
  return 'new';
};

// 크롤링 데이터를 Request 형태로 변환
const rawData = [
  {
    "id": "69cb71ea71cefdee33b5fe84",
    "name": "김현",
    "category": null,
    "location": null,
    "timeAgo": "36분 전",
    "competitorCount": 4,
    "status": "날짜 협의 필요",
    "detail": {
      "serviceType": "기타: Coze 워크플로와 카카오 쳇봇 api 연동",
      "labelingData": null,
      "desiredService": null,
      "description": null,
      "deadline": "가능한 빨리 진행하고 싶어요.",
      "referenceUrl": null,
      "progressMethod": null
    },
    "customer": {
      "joinDate": "2023년 3월 27일",
      "usageCount": 8
    },
    "crawledAt": "2026-03-31T07:40:32.551Z"
  },
  {
    "id": "69cb52ecccf4fad0f83a04a4",
    "name": "김홍수",
    "category": "매크로/VBA 개발",
    "location": null,
    "timeAgo": "2시간 전",
    "competitorCount": 7,
    "status": "날짜 협의 필요",
    "detail": {
      "serviceType": "xlsm 파일을 xlsx 파일로 변경하여 저장하기가 가능한데요. 암호화가 되어 있어서 xlsx파일로 저장하기를 못하게 하거나 또는 이게 힘들다면 숨겨진 시트를 열어볼 수 없도록 하는 방법을 찾고 있습니다.",
      "labelingData": null,
      "desiredService": null,
      "description": null,
      "deadline": "가능한 빨리 진행하고 싶어요.",
      "referenceUrl": null,
      "progressMethod": null
    },
    "customer": {
      "joinDate": "2022년 10월 21일",
      "usageCount": 3
    },
    "crawledAt": "2026-03-31T07:40:35.792Z"
  },
  {
    "id": "69cb51d3ba062a2c4015205f",
    "name": "김한식",
    "category": "인공지능(AI) 개발",
    "location": null,
    "timeAgo": "2시간 전",
    "competitorCount": 7,
    "status": "날짜 협의 필요",
    "detail": {
      "serviceType": "텍스트",
      "labelingData": "네.",
      "desiredService": "예측",
      "description": "어지러운 정세속에 여유자금 어디에 넣어야할까",
      "deadline": "가능한 빨리 진행하고 싶어요.",
      "referenceUrl": null,
      "progressMethod": null
    },
    "customer": {
      "joinDate": "2026년 3월 31일",
      "usageCount": 1
    },
    "crawledAt": "2026-03-31T07:40:38.972Z"
  },
  {
    "id": "69cb517fe54c52ef1c3a048b",
    "name": "황준석",
    "category": null,
    "location": null,
    "timeAgo": "2시간 전",
    "competitorCount": 0,
    "status": "날짜 협의 필요",
    "detail": {
      "serviceType": "기타: C++",
      "labelingData": null,
      "desiredService": null,
      "description": null,
      "deadline": "협의 가능해요.",
      "referenceUrl": "C++로 한달이내 프로젝트 임의로 개발해서 회사에 구조제대로 알고 설계했는지 코드설명해야합니다. 지금은 개념부족하다 판단되어 한달프로젝트가 괜찮다면 유지보수나 개발 회사업무 시킬것같습니다. 한달프로젝트 배우면서 같이 도와주실분 필요합니다.",
      "progressMethod": "어떤 방식이든 상관없어요."
    },
    "customer": {
      "joinDate": "2026년 3월 25일",
      "usageCount": 10
    },
    "crawledAt": "2026-03-31T07:40:42.190Z"
  },
  {
    "id": "69cb4d3157af3349d6f2470c",
    "name": "정현태",
    "category": "매크로/VBA 개발",
    "location": null,
    "timeAgo": "3시간 전",
    "competitorCount": 1,
    "status": "날짜 협의 필요",
    "detail": {
      "serviceType": "소상공인 정책자금 관련 매크로 개발 문의드립니다. 010-5555-5511 로 전화 가능하시면 부탁드립니다.",
      "labelingData": null,
      "desiredService": null,
      "description": null,
      "deadline": "가능한 빨리 진행하고 싶어요.",
      "referenceUrl": null,
      "progressMethod": null
    },
    "customer": {
      "joinDate": "2023년 1월 26일",
      "usageCount": 8
    },
    "crawledAt": "2026-03-31T07:40:45.391Z"
  },
  {
    "id": "69cb4bf400354c2dfcb5fd92",
    "name": "이정희",
    "category": "매크로/VBA 개발",
    "location": null,
    "timeAgo": "3시간 전",
    "competitorCount": 2,
    "status": "날짜 협의 필요",
    "detail": {
      "serviceType": "신재생에너지센타 한국에너지공단 그린홈(https://nr.energy.or.kr/A0/GN_00/GN_00_00_010.do) 사업신청(티켓팅과 유사함) 메크로 작성건입니다.",
      "labelingData": null,
      "desiredService": null,
      "description": null,
      "deadline": "협의 가능해요.",
      "referenceUrl": null,
      "progressMethod": null
    },
    "customer": {
      "joinDate": "2026년 3월 26일",
      "usageCount": 2
    },
    "crawledAt": "2026-03-31T07:40:48.603Z"
  },
  {
    "id": "69cb3dfa0aa4515c34540c5f",
    "name": "변준휘",
    "category": "매크로/VBA 개발",
    "location": null,
    "timeAgo": "4시간 전",
    "competitorCount": 2,
    "status": "날짜 협의 필요",
    "detail": {
      "serviceType": "FC온라인 감독모드에 사용하는 매크로가 필요합니다. 어떠한 기능인지 알고계실까요??",
      "labelingData": null,
      "desiredService": null,
      "description": null,
      "deadline": "가능한 빨리 진행하고 싶어요.",
      "referenceUrl": null,
      "progressMethod": null
    },
    "customer": {
      "joinDate": "2024년 4월 17일",
      "usageCount": 4
    },
    "crawledAt": "2026-03-31T07:40:51.876Z"
  },
  {
    "id": "69cb3788f9f73cd8ee540c95",
    "name": "6qrx6f9",
    "category": "매크로/VBA 개발",
    "location": null,
    "timeAgo": "4시간 전",
    "competitorCount": 2,
    "status": "날짜 협의 필요",
    "detail": {
      "serviceType": "리니지클래식 자동사냥",
      "labelingData": null,
      "desiredService": null,
      "description": null,
      "deadline": "협의 가능해요.",
      "referenceUrl": null,
      "progressMethod": null
    },
    "customer": {
      "joinDate": "2026년 3월 31일",
      "usageCount": 2
    },
    "crawledAt": "2026-03-31T07:40:55.136Z"
  },
  {
    "id": "69cb2e57831157197531f12c",
    "name": "최수형",
    "category": "인공지능(AI) 개발",
    "location": null,
    "timeAgo": "5시간 전",
    "competitorCount": 9,
    "status": "날짜 협의 필요",
    "detail": {
      "serviceType": "음성",
      "labelingData": "아니요.",
      "desiredService": "고수와 상담 후 결정할게요.",
      "description": "이미지 생성",
      "deadline": "가능한 빨리 진행하고 싶어요.",
      "referenceUrl": null,
      "progressMethod": null
    },
    "customer": {
      "joinDate": "2026년 3월 31일",
      "usageCount": 1
    },
    "crawledAt": "2026-03-31T07:40:58.388Z"
  },
  {
    "id": "69caffc1e20e840d1f540cb7",
    "name": "이종석",
    "category": "매크로/VBA 개발",
    "location": null,
    "timeAgo": "8시간 전",
    "competitorCount": 8,
    "status": "날짜 협의 필요",
    "detail": {
      "serviceType": "시간에 맞춰서 새로고침 -> 위치에 마우스 클릭 -> 신청하기 클릭",
      "labelingData": null,
      "desiredService": null,
      "description": null,
      "deadline": "가능한 빨리 진행하고 싶어요.",
      "referenceUrl": null,
      "progressMethod": null
    },
    "customer": {
      "joinDate": "2023년 2월 15일",
      "usageCount": 13
    },
    "crawledAt": "2026-03-31T07:41:01.572Z"
  }
];

export const mockRequests: Request[] = rawData.map(request => {
  const grade = getGrade(request.customer);
  const history = generateHistoryEvents(request, grade);
  const status = getStatus(history);
  
  return {
    id: request.id,
    customerName: request.name,
    category: request.category || '기타',
    location: request.location || '전국',
    timeAgo: request.timeAgo,
    competitorCount: request.competitorCount,
    grade,
    status,
    amount: history.find(e => e.amount)?.amount || null,
    description: request.detail?.serviceType || '',
    customerInfo: {
      joinDate: request.customer.joinDate,
      usageCount: request.customer.usageCount
    },
    history,
    detail: request.detail
  };
});