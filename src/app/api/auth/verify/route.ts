import { NextRequest, NextResponse } from 'next/server';

const AUTH_TOKEN = process.env.AUTH_TOKEN || 'e79fd2b4465692e4c52c375a875b50b45af612bc9cf7934204fe837d93485d6f';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: '토큰이 필요합니다.' }, { status: 400 });
    }

    if (token === AUTH_TOKEN) {
      // 토큰이 일치하면 쿠키 설정
      const response = NextResponse.json({ success: true });
      response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7일
      });
      
      return response;
    } else {
      return NextResponse.json({ error: '잘못된 토큰입니다.' }, { status: 401 });
    }
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 토큰 검증을 위한 헬퍼 함수
export function verifyAuth(request: NextRequest): boolean {
  const cookieToken = request.cookies.get('auth_token')?.value;
  const headerToken = request.headers.get('authorization')?.replace('Bearer ', '');
  
  const token = cookieToken || headerToken;
  return token === AUTH_TOKEN;
}