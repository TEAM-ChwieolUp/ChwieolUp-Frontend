'use client';

import { Bell, CircleHelp, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import styles from './Header.module.scss';

const headerCopy: Record<
  string,
  {
    title: string;
    helpTitle: string;
    helpDescription: string;
  }
> = {
  '/': {
    title: '홈',
    helpTitle: '홈 안내',
    helpDescription:
      '오늘의 브리핑과 핵심 지표를 빠르게 확인하는 메인 화면입니다.',
  },
  '/kanban': {
    title: '칸반',
    helpTitle: '칸반 안내',
    helpDescription:
      '지원 단계를 이동시키면서 진행 상태와 우선순위를 관리하는 화면입니다.',
  },
  '/calendar': {
    title: '캘린더',
    helpTitle: '캘린더 안내',
    helpDescription:
      '면접 일정, 마감일, 리마인더를 날짜 기준으로 확인하는 화면입니다.',
  },
  '/retrospective': {
    title: '회고',
    helpTitle: '회고 안내',
    helpDescription:
      '지원 기록을 돌아보고 다음 액션을 정리하는 회고 화면입니다.',
  },
  '/more': {
    title: '더보기',
    helpTitle: '더보기 안내',
    helpDescription: '부가 기능과 설정 관련 메뉴를 모아둔 화면입니다.',
  },
};

const notifications = [
  {
    title: 'AI 분석이 업데이트되었습니다.',
    time: '방금 전',
  },
  {
    title: '이번 주 지원 마감 일정이 2건 남아 있습니다.',
    time: '10분 전',
  },
  {
    title: '회고 작성이 필요한 항목이 1건 있습니다.',
    time: '1시간 전',
  },
];

export default function Header() {
  const pathname = usePathname();
  const copy = headerCopy[pathname] ?? headerCopy['/'];
  const actionsRef = useRef<HTMLDivElement | null>(null);
  const [openModalState, setOpenModalState] = useState<{
    kind: 'notifications' | 'help';
    pathname: string;
  } | null>(null);
  const openModal =
    openModalState?.pathname === pathname ? openModalState.kind : null;

  useEffect(() => {
    if (openModal === null) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!actionsRef.current?.contains(event.target as Node)) {
        setOpenModalState(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenModalState(null);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [openModal]);

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>{copy.title}</h1>

        <div className={styles.actions} ref={actionsRef}>
          <button
            className={styles.iconButton}
            type='button'
            aria-label='알림 확인'
            onClick={() =>
              setOpenModalState((current) =>
                current?.kind === 'notifications' && current.pathname === pathname
                  ? null
                  : { kind: 'notifications', pathname },
              )
            }
          >
            <Bell className={styles.actionIcon} aria-hidden='true' />
          </button>

          <button
            className={styles.iconButton}
            type='button'
            aria-label='페이지 설명 보기'
            onClick={() =>
              setOpenModalState((current) =>
                current?.kind === 'help' && current.pathname === pathname
                  ? null
                  : { kind: 'help', pathname },
              )
            }
          >
            <CircleHelp className={styles.actionIcon} aria-hidden='true' />
          </button>

          {openModal !== null ? (
            <div
              className={styles.popover}
              role='dialog'
              aria-modal='false'
              aria-labelledby={
                openModal === 'notifications'
                  ? 'notifications-popover-title'
                  : 'help-popover-title'
              }
            >
              <div className={styles.popoverHeader}>
                <h2
                  className={styles.popoverTitle}
                  id={
                    openModal === 'notifications'
                      ? 'notifications-popover-title'
                      : 'help-popover-title'
                  }
                >
                  {openModal === 'notifications' ? '알림' : copy.helpTitle}
                </h2>

                <button
                  className={styles.closeButton}
                  type='button'
                  aria-label='팝오버 닫기'
                  onClick={() => setOpenModalState(null)}
                >
                  <X className={styles.closeIcon} aria-hidden='true' />
                </button>
              </div>

              {openModal === 'notifications' ? (
                <div className={styles.notificationList}>
                  {notifications.map((notification) => (
                    <article
                      key={`${notification.title}-${notification.time}`}
                      className={styles.notificationItem}
                    >
                      <strong className={styles.notificationTitle}>
                        {notification.title}
                      </strong>
                      <span className={styles.notificationTime}>
                        {notification.time}
                      </span>
                    </article>
                  ))}
                </div>
              ) : (
                <p className={styles.helpText}>{copy.helpDescription}</p>
              )}
            </div>
          ) : null}
        </div>
      </header>
    </>
  );
}
