'use client'

import { Sidebar } from '@/components/Sidebar';
import { ViewToggle } from '@/components/ViewToggle';
import { ListView } from '@/components/ListView';
import { KanbanView } from '@/components/KanbanView';
import { DetailPanel } from '@/components/DetailPanel';
import { ConfirmModal } from '@/components/ConfirmModal';
import { RejectModal } from '@/components/RejectModal';
import { useStore } from '@/lib/store';

export default function Home() {
  const { viewType, showDetailPanel } = useStore();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* 사이드바 */}
      <Sidebar />
      
      {/* 메인 영역 */}
      <div className={`flex-1 flex flex-col ${showDetailPanel ? 'mr-[600px]' : ''} transition-all duration-200`}>
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h1 className="text-xl font-medium text-foreground">요청 관리</h1>
            <p className="text-sm text-muted-foreground mt-1">
              고객 요청을 검토하고 견적을 발송하세요
            </p>
          </div>
          
          <ViewToggle />
        </div>
        
        {/* 메인 컨텐츠 */}
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
      
      {/* 상세 패널 */}
      {showDetailPanel && <DetailPanel />}
      
      {/* 모달들 */}
      <ConfirmModal />
      <RejectModal />
    </div>
  );
}