'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // 로컬 스토리지에도 저장 (클라이언트 사이드 검증용)
        localStorage.setItem('auth_token', token);
        
        // 메인 페이지로 이동
        router.push('/');
      } else {
        setError(data.error || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('서버 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-foreground">SoomgoFlow</h1>
          <p className="text-muted-foreground mt-2">
            접속 토큰을 입력해주세요
          </p>
        </div>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Input
              type="password"
              placeholder="접속 토큰"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={isLoading}
              className="w-full"
            />
          </div>
          
          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}
          
          <Button
            type="submit"
            disabled={isLoading || !token.trim()}
            className="w-full"
          >
            {isLoading ? '확인 중...' : '접속'}
          </Button>
        </form>
      </div>
    </div>
  );
}