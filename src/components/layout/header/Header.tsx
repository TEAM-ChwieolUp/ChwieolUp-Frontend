'use client';

import { Bell, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Manrope } from 'next/font/google';
import styles from './Header.module.scss';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
});

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
  const actionsRef = useRef<HTMLDivElement | null>(null);
  const [openModalState, setOpenModalState] = useState<{
    kind: 'notifications';
  } | null>(null);
  const openModal = openModalState?.kind ?? null;

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
      <header className={`${styles.header} ${manrope.className}`}>
        <div className={styles.leading}>
          <label className={styles.searchField} aria-label='지원 내역 검색'>
            <Search className={styles.searchIcon} aria-hidden='true' />
            <input
              className={styles.searchInput}
              type='search'
              placeholder='Search applications...'
            />
          </label>
        </div>

        <div className={styles.actions} ref={actionsRef}>
          <button
            className={styles.iconButton}
            type='button'
            aria-label='알림 확인'
            onClick={() =>
              setOpenModalState((current) =>
                current?.kind === 'notifications' ? null : { kind: 'notifications' },
              )
            }
          >
            <Bell className={styles.actionIcon} aria-hidden='true' />
            <span className={styles.notificationDot} aria-hidden='true' />
          </button>

          <div className={styles.profile}>
            <div className={styles.profileText}>
              <strong className={styles.profileName}>김 아키텍트</strong>
              <span className={styles.profileTier}>무료 플랜</span>
            </div>

            <div className={styles.profileAvatar} aria-hidden='true'>
              KA
            </div>
          </div>

          {openModal !== null ? (
            <div
              className={styles.popover}
              role='dialog'
              aria-modal='false'
              aria-labelledby='notifications-popover-title'
            >
              <div className={styles.popoverHeader}>
                <h2 className={styles.popoverTitle} id='notifications-popover-title'>
                  Notifications
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
            </div>
          ) : null}
        </div>
      </header>
    </>
  );
}
