'use client'

import { Suspense } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ViewToggle } from '@/components/ViewToggle';
import { ListView } from '@/components/ListView';
import { KanbanView } from '@/components/KanbanView';
import { DetailPanel } from '@/components/DetailPanel';
import { ConfirmModal } from '@/components/ConfirmModal';
import { RejectModal } from '@/components/RejectModal';
import { AuthGuard } from '@/components/AuthGuard';
import { useStore } from '@/lib/store';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

function DeepLinkHandler() {
  const searchParams = useSearchParams();
  const { requests, setSelectedRequest } = useStore();

  useEffect(() => {
    const requestId = searchParams.get('id');
    if (requestId && requests.length > 0) {
      const target = requests.find(r => r.id === requestId);
      if (target) {
        setSelectedRequest(target);
      }
    }
  }, [searchParams, requests, setSelectedRequest]);

  return null;
}

export default function Home() {
  const { viewType, showDetailPanel, loadRequests } = useStore();

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  return (
    <AuthGuard>
      <Suspense fallback={null}>
        <DeepLinkHandler />
      </Suspense>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        
        <div className={`flex-1 flex flex-col ${showDetailPanel ? 'mr-[800px]' : ''} transition-all duration-200`}>
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div>
              <h1 className="text-xl font-medium text-foreground">요청 관리</h1>
              <p className="text-sm text-muted-foreground mt-1">
                고객 요청을 검토하고 견적을 발송하세요
              </p>
            </div>
            <ViewToggle />
          </div>
          
          <div className="flex-1 overflow-hidden">
            {viewType === 'list' ? (
              <div className="h-full overflow-y-auto">
                <ListView />
              </div>
            ) : (
              <div className="h-full overflow-x-auto">
                <KanbanView />
              </div>
            )}
          </div>
        </div>
        
        {showDetailPanel && <DetailPanel />}
        <ConfirmModal />
        <RejectModal />
      </div>
    </AuthGuard>
  );
}
