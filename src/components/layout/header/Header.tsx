'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Manrope } from 'next/font/google';
import { useRouter } from 'next/navigation';
import {
  listNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  NotificationItem,
  notificationKeys,
} from '@/features/notifications/api/notifications';
import { LOGIN_ROUTE, logoutSession } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import styles from './Header.module.scss';
    
const manrope = Manrope({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
});

function formatNotificationTime(value: string | null) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60_000));

  if (diffMinutes < 1) {
    return '방금 전';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}시간 전`;
  }

  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export default function Header() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const actionsRef = useRef<HTMLDivElement | null>(null);
  const [openModalState, setOpenModalState] = useState<{
    kind: 'notifications' | 'profile';
  } | null>(null);
  const openModal = openModalState?.kind ?? null;
  const user = useAuthStore((state) => state.user);
  const authStatus = useAuthStore((state) => state.status);
  const isAuthenticated = authStatus === 'authenticated';
  const notificationsQuery = useQuery({
    queryKey: notificationKeys.list,
    queryFn: listNotifications,
    enabled: isAuthenticated,
  });
  const notifications = notificationsQuery.data ?? [];
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const markReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.list });
      const previousNotifications =
        queryClient.getQueryData<NotificationItem[]>(notificationKeys.list);

      queryClient.setQueryData<NotificationItem[]>(
        notificationKeys.list,
        (current = []) =>
          current.map((notification) =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification
          )
      );

      return { previousNotifications };
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: notificationKeys.list, type: 'active' });
    },
    onError: (error, _notificationId, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          notificationKeys.list,
          context.previousNotifications
        );
      }

      alert(error instanceof Error ? error.message : '알림 읽음 처리에 실패했습니다.');
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.list });
      const previousNotifications =
        queryClient.getQueryData<NotificationItem[]>(notificationKeys.list);

      queryClient.setQueryData<NotificationItem[]>(
        notificationKeys.list,
        (current = []) =>
          current.map((notification) => ({
            ...notification,
            read: true,
          }))
      );

      return { previousNotifications };
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: notificationKeys.list, type: 'active' });
    },
    onError: (error, _variables, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          notificationKeys.list,
          context.previousNotifications
        );
      }

      alert(error instanceof Error ? error.message : '알림 전체 읽음 처리에 실패했습니다.');
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });

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
            {unreadCount > 0 ? (
              <span className={styles.notificationDot} aria-hidden='true' />
            ) : null}
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

                <div className={styles.popoverActions}>
                  {unreadCount > 0 ? (
                    <button
                      className={styles.textButton}
                      type='button'
                      disabled={markAllReadMutation.isPending}
                      onClick={() => markAllReadMutation.mutate()}
                    >
                      모두 읽음
                    </button>
                  ) : null}

                  <button
                    className={styles.closeButton}
                    type='button'
                    aria-label='팝오버 닫기'
                    onClick={() => setOpenModalState(null)}
                  >
                    <X className={styles.closeIcon} aria-hidden='true' />
                  </button>
                </div>
              </div>

              <div className={styles.notificationList}>
                {notificationsQuery.isPending ? (
                  <p className={styles.notificationState}>알림을 불러오는 중입니다.</p>
                ) : null}

                {notificationsQuery.isError ? (
                  <p className={styles.notificationState}>
                    알림을 불러오지 못했습니다.
                  </p>
                ) : null}

                {!notificationsQuery.isPending &&
                !notificationsQuery.isError &&
                notifications.length === 0 ? (
                  <p className={styles.notificationState}>새 알림이 없습니다.</p>
                ) : null}

                {notifications.map((notification) => (
                  <article
                    key={notification.id}
                    className={`${styles.notificationItem} ${
                      notification.read ? styles.notificationItemRead : ''
                    }`}
                  >
                    <div className={styles.notificationItemHeader}>
                      <strong className={styles.notificationTitle}>
                        {notification.title}
                      </strong>
                      <span
                        className={`${styles.notificationReadBadge} ${
                          notification.read ? styles.notificationReadBadgeDone : ''
                        }`}
                      >
                        {notification.read ? '읽음' : '안 읽음'}
                      </span>
                    </div>

                    {notification.message && notification.message !== notification.title ? (
                      <span className={styles.notificationMessage}>
                        {notification.message}
                      </span>
                    ) : null}

                    <div className={styles.notificationFooter}>
                      <span className={styles.notificationTime}>
                        {formatNotificationTime(notification.createdAt)}
                      </span>

                      {!notification.read ? (
                        <button
                          className={styles.notificationReadButton}
                          type='button'
                          disabled={
                            markReadMutation.isPending &&
                            markReadMutation.variables === notification.id
                          }
                          onClick={() => markReadMutation.mutate(notification.id)}
                        >
                          <Check className={styles.notificationReadIcon} aria-hidden='true' />
                          읽음 처리
                        </button>
                      ) : null}
                    </div>
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
