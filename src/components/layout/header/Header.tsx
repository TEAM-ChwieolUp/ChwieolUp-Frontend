'use client';

import { Bell, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Manrope } from 'next/font/google';
import { useRouter } from 'next/navigation';
import { LOGIN_ROUTE, logoutSession } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
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
  const router = useRouter();
  const actionsRef = useRef<HTMLDivElement | null>(null);
  const [openModalState, setOpenModalState] = useState<{
    kind: 'notifications' | 'profile';
  } | null>(null);
  const openModal = openModalState?.kind ?? null;
  const user = useAuthStore((state) => state.user);

  const profileName = user?.name ?? '게스트 사용자';
  const profileSubtext = user?.email ?? '세션을 확인 중입니다.';
  const profileInitial = profileName.trim().slice(0, 1).toUpperCase();

  function handleLogout() {
    setOpenModalState(null);
    logoutSession();
    router.replace(LOGIN_ROUTE);
  }

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

          <button
            type='button'
            className={styles.profile}
            aria-label='프로필 정보 열기'
            onClick={() =>
              setOpenModalState((current) =>
                current?.kind === 'profile' ? null : { kind: 'profile' },
              )
            }
          >
            <div className={styles.profileText}>
              <strong className={styles.profileName}>{profileName}</strong>
              <span className={styles.profileTier}>{profileSubtext}</span>
            </div>

            <div className={styles.profileAvatar} aria-hidden='true'>
              {user?.profileImageUrl ? (
                <span
                  className={styles.profileAvatarImage}
                  style={{ backgroundImage: `url(${user.profileImageUrl})` }}
                />
              ) : (
                profileInitial
              )}
            </div>
          </button>

          {openModal === 'notifications' ? (
            <div
              className={styles.popover}
              role='dialog'
              aria-modal='false'
              aria-labelledby='notifications-popover-title'
            >
              <div className={styles.popoverHeader}>
                <h2 className={styles.popoverTitle} id='notifications-popover-title'>
                  알림
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

          {openModal === 'profile' ? (
            <div
              className={styles.popover}
              role='dialog'
              aria-modal='false'
              aria-labelledby='profile-popover-title'
            >
              <div className={styles.popoverHeader}>
                <h2 className={styles.popoverTitle} id='profile-popover-title'>
                  프로필 정보
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

              <div className={styles.profilePanel}>
                <div className={styles.profilePanelHero}>
                  <div className={styles.profilePanelAvatar} aria-hidden='true'>
                    {user?.profileImageUrl ? (
                      <span
                        className={styles.profileAvatarImage}
                        style={{ backgroundImage: `url(${user.profileImageUrl})` }}
                      />
                    ) : (
                      profileInitial
                    )}
                  </div>

                  <div className={styles.profilePanelCopy}>
                    <strong>{profileName}</strong>
                    <span>{profileSubtext}</span>
                  </div>
                </div>

                <div className={styles.profileInfoList}>
                  <div className={styles.profileInfoItem}>
                    <span className={styles.profileInfoLabel}>이름</span>
                    <strong className={styles.profileInfoValue}>{profileName}</strong>
                  </div>

                  <div className={styles.profileInfoItem}>
                    <span className={styles.profileInfoLabel}>이메일</span>
                    <strong className={styles.profileInfoValue}>{profileSubtext}</strong>
                  </div>
                </div>

                <button
                  type='button'
                  className={styles.logoutButton}
                  onClick={handleLogout}
                >
                  로그아웃
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </header>
    </>
  );
}
