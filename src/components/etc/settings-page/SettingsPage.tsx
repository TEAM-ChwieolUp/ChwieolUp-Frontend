'use client';

import {
  BellRing,
  CircleAlert,
  Mail,
  Mailbox,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useId, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  disconnectMailIntegration,
  getMailAuthorizationUrl,
  listMailIntegrations,
  mailKeys,
} from '@/features/mail/api/mail';
import { getMyProfile, userProfileKeys } from '@/features/user/api/profile';
import { ApiError } from '@/lib/api';
import styles from './SettingsPage.module.scss';

const categories = [
  {
    id: 'profile',
    label: '프로필 설정',
    icon: UserRound,
  },
  {
    id: 'mail-sync',
    label: '메일 연동',
    icon: Mail,
  },
  {
    id: 'notifications',
    label: '알림 설정',
    icon: BellRing,
  },
] as const;

type CategoryId = (typeof categories)[number]['id'];

export default function SettingsPage() {
  const sliderId = useId();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [sensitivity, setSensitivity] = useState(75);
  const [interviewAlerts, setInterviewAlerts] = useState(true);
  const [deadlineAlerts, setDeadlineAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  const {
    data: profile,
    isLoading: isProfileLoading,
    isError: isProfileError,
    error: profileError,
  } = useQuery({
    queryKey: userProfileKeys.me,
    queryFn: getMyProfile,
  });
  const {
    data: mailIntegrations = [],
    isLoading: isMailIntegrationsLoading,
    isError: isMailIntegrationsError,
    error: mailIntegrationsError,
  } = useQuery({
    queryKey: mailKeys.integrations,
    queryFn: listMailIntegrations,
  });
  const gmailIntegration = mailIntegrations.find(
    (integration) => integration.provider === 'GOOGLE'
  );
  const connectGmailMutation = useMutation({
    mutationFn: () => getMailAuthorizationUrl('google'),
    onSuccess: (authorizationUrl) => {
      window.location.assign(authorizationUrl);
    },
    onError: (error) => {
      window.alert(
        getErrorMessage(error, 'Gmail 연동 URL을 가져오지 못했습니다.')
      );
    },
  });
  const disconnectGmailMutation = useMutation({
    mutationFn: disconnectMailIntegration,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: mailKeys.integrations });
      await queryClient.invalidateQueries({ queryKey: mailKeys.all });
    },
    onError: (error) => {
      window.alert(
        getErrorMessage(error, 'Gmail 연동 해제 중 오류가 발생했습니다.')
      );
    },
  });

  const profileName = profile?.name ?? '사용자';
  const profileInitial = profileName.trim().slice(0, 1).toUpperCase() || '?';
  const profileProviderLabel =
    profile?.oauth2Provider === 'KAKAO' ? 'Kakao' : 'Google';
  const requestedTab = searchParams.get('tab');
  const activeCategory: CategoryId =
    requestedTab && categories.some((category) => category.id === requestedTab)
      ? (requestedTab as CategoryId)
      : 'profile';

  function getErrorMessage(error: unknown, fallback: string) {
    if (error instanceof ApiError) {
      return error.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return fallback;
  }

  function getProfileErrorMessage() {
    return getErrorMessage(profileError, '프로필 정보를 불러오지 못했습니다.');
  }

  function getMailIntegrationsErrorMessage() {
    return getErrorMessage(
      mailIntegrationsError,
      '메일 연동 정보를 불러오지 못했습니다.'
    );
  }

  function handleCategoryChange(categoryId: CategoryId) {
    router.replace(`${pathname}?tab=${categoryId}`, { scroll: false });
  }

  const renderProfileContent = () => (
    <>
      <section className={styles.sectionCard}>
        <header className={styles.sectionHeader}>
          <h2>프로필 설정</h2>
          <p>
            OAuth 로그인 기반 계정이라 프로필 정보는 현재 읽기 전용으로 제공됩니다.
          </p>
        </header>

        <div className={styles.profileHero}>
          <div className={styles.profileAvatar} aria-hidden='true'>
            {profile?.profileImageUrl ? (
              <div
                className={styles.profileAvatarImage}
                style={{ backgroundImage: `url(${profile.profileImageUrl})` }}
              />
            ) : (
              profileInitial
            )}
          </div>

          <div className={styles.profileHeroCopy}>
            <strong>{isProfileLoading ? '불러오는 중' : profileName}</strong>
            <span>
              {isProfileLoading
                ? '프로필 정보를 확인하고 있습니다.'
                : `${profileProviderLabel} 계정으로 연결된 프로필입니다.`}
            </span>
          </div>
        </div>

        {isProfileError ? (
          <div className={styles.profileNotice}>
            <p>{getProfileErrorMessage()}</p>
          </div>
        ) : (
          <div className={styles.fieldGrid}>
            <label className={styles.field}>
              <span>이름</span>
              <input
                type='text'
                value={isProfileLoading ? '불러오는 중...' : profile?.name ?? ''}
                readOnly
                disabled
              />
            </label>

            <label className={styles.field}>
              <span>이메일</span>
              <input
                type='email'
                value={isProfileLoading ? '불러오는 중...' : profile?.email ?? ''}
                readOnly
                disabled
              />
            </label>
          </div>
        )}

        <div className={styles.profileNotice}>
          <p>
            이름, 이메일, 프로필 사진은 {profileProviderLabel} OAuth 계정 기준으로 동기화됩니다. 변경이 필요하면 해당 소셜 계정에서 수정해야 합니다.
          </p>
        </div>
      </section>
    </>
  );

  const renderMailSyncContent = () => (
    <>
      <section className={styles.sectionCard}>
        <header className={styles.sectionHeader}>
          <h2>메일 연동 설정</h2>
          <p>지원 현황을 자동으로 추적하기 위해 Gmail 계정을 연동하세요.</p>
        </header>

        <div className={styles.integrationList}>
          <article className={styles.integrationRow}>
            <div className={styles.integrationMeta}>
              <span className={styles.integrationIcon} aria-hidden='true'>
                <Mailbox />
              </span>

              <div className={styles.integrationCopy}>
                <strong>Gmail 연동</strong>
                <p>
                  {gmailIntegration
                    ? `${gmailIntegration.accountEmail} 계정이 연결되어 있습니다.`
                    : '지원 관련 메일을 자동으로 분석합니다.'}
                </p>
              </div>
            </div>

            {gmailIntegration ? (
              <button
                type='button'
                className={styles.inlineAction}
                onClick={() => disconnectGmailMutation.mutate(gmailIntegration.id)}
                disabled={disconnectGmailMutation.isPending}
              >
                {disconnectGmailMutation.isPending ? '해제 중' : '연동 해제'}
              </button>
            ) : (
              <button
                type='button'
                className={styles.inlineActionPrimary}
                onClick={() => connectGmailMutation.mutate()}
                disabled={isMailIntegrationsLoading || connectGmailMutation.isPending}
              >
                {connectGmailMutation.isPending ? '연결 중' : 'Gmail 연동하기'}
              </button>
            )}
          </article>
        </div>

        {isMailIntegrationsError ? (
          <div className={styles.profileNotice}>
            <p>{getMailIntegrationsErrorMessage()}</p>
          </div>
        ) : null}
      </section>

      <section className={styles.sectionCard}>
        <header className={styles.sectionHeaderRow}>
          <div className={styles.sectionHeader}>
            <h2>AI 필터 민감도</h2>
            <p>메일에서 채용 정보를 식별하는 AI의 분석 강도를 설정합니다.</p>
          </div>

          <span className={styles.modeBadge}>SMART MODE</span>
        </header>

        <div className={styles.sensitivityPanel}>
          <div className={styles.sliderWrap}>
            <label className={styles.srOnly} htmlFor={sliderId}>
              AI 필터 민감도
            </label>
            <input
              id={sliderId}
              className={styles.slider}
              type='range'
              min='0'
              max='100'
              step='1'
              value={sensitivity}
              onChange={(event) => setSensitivity(Number(event.target.value))}
            />
          </div>

          <div className={styles.scaleLabels} aria-hidden='true'>
            <span>CONSERVATIVE</span>
            <span>BALANCED</span>
            <span className={styles.activeScale}>AGGRESSIVE</span>
          </div>

          <div className={styles.infoBox}>
            <CircleAlert aria-hidden='true' />
            <p>
              <strong>{`현재 설정 (${sensitivity}%):`}</strong> AI가 스팸이나
              단순 뉴스레터를 제외하고, 인터뷰 일정 및 서류 결과 통보 메일을 더
              적극적으로 찾아내 대시보드에 추가합니다.
            </p>
          </div>
        </div>
      </section>

      <div className={styles.actionBar}>
        <button type='button' className={styles.ghostButton}>
          초기화
        </button>
        <button type='button' className={styles.primaryButton}>
          설정 저장하기
        </button>
      </div>
    </>
  );

  const renderNotificationContent = () => (
    <>
      <section className={styles.sectionCard}>
        <header className={styles.sectionHeader}>
          <h2>알림 설정</h2>
          <p>
            지원 마감, 인터뷰 일정, AI 분석 결과를 어떤 방식으로 받을지
            설정합니다.
          </p>
        </header>

        <div className={styles.preferenceList}>
          <article className={styles.preferenceItem}>
            <div className={styles.preferenceCopy}>
              <strong>인터뷰 일정 감지</strong>
              <p>
                면접 일정이 메일에서 감지되면 대시보드와 알림 센터에 즉시
                표시합니다.
              </p>
            </div>
            <button
              type='button'
              aria-pressed={interviewAlerts}
              className={`${styles.toggle} ${interviewAlerts ? styles.enabled : ''}`}
              onClick={() => setInterviewAlerts((current) => !current)}
            >
              <span className={styles.toggleThumb} />
            </button>
          </article>

          <article className={styles.preferenceItem}>
            <div className={styles.preferenceCopy}>
              <strong>지원 마감 리마인더</strong>
              <p>
                마감 24시간 전과 2시간 전에 리마인더를 보내도록 설정합니다.
              </p>
            </div>
            <button
              type='button'
              aria-pressed={deadlineAlerts}
              className={`${styles.toggle} ${deadlineAlerts ? styles.enabled : ''}`}
              onClick={() => setDeadlineAlerts((current) => !current)}
            >
              <span className={styles.toggleThumb} />
            </button>
          </article>

          <article className={styles.preferenceItem}>
            <div className={styles.preferenceCopy}>
              <strong>주간 요약 브리핑</strong>
              <p>
                이번 주 지원 현황, 다음 일정, 회고 필요 항목을 매주 월요일
                오전에 요약해 줍니다.
              </p>
            </div>
            <button
              type='button'
              aria-pressed={weeklyDigest}
              className={`${styles.toggle} ${weeklyDigest ? styles.enabled : ''}`}
              onClick={() => setWeeklyDigest((current) => !current)}
            >
              <span className={styles.toggleThumb} />
            </button>
          </article>
        </div>
      </section>

      <section className={styles.sectionCard}>
        <header className={styles.sectionHeader}>
          <h2>알림 채널</h2>
          <p>
            현재는 인앱 알림 중심으로 동작하며, 이후 이메일 및 모바일 푸시
            확장을 고려할 수 있습니다.
          </p>
        </header>

        <div className={styles.infoGrid}>
          <article className={styles.infoPanel}>
            <span className={styles.infoPanelIcon} aria-hidden='true'>
              <BellRing />
            </span>
            <div>
              <strong>인앱 알림</strong>
              <p>
                헤더 알림 센터에서 확인할 수 있습니다. 현재 기본 활성화
                상태입니다.
              </p>
            </div>
          </article>

          <article className={styles.infoPanel}>
            <span className={styles.infoPanelIcon} aria-hidden='true'>
              <Sparkles />
            </span>
            <div>
              <strong>AI 우선순위 알림</strong>
              <p>
                합격, 인터뷰, 마감 임박 같은 중요한 이벤트를 먼저 위로 올려
                보여줍니다.
              </p>
            </div>
          </article>
        </div>
      </section>

      <div className={styles.actionBar}>
        <button type='button' className={styles.ghostButton}>
          기본값으로
        </button>
        <button type='button' className={styles.primaryButton}>
          알림 설정 저장
        </button>
      </div>
    </>
  );

  const renderContent = () => {
    switch (activeCategory) {
      case 'profile':
        return renderProfileContent();
      case 'notifications':
        return renderNotificationContent();
      case 'mail-sync':
      default:
        return renderMailSyncContent();
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.layout}>
        <aside className={styles.categoryPanel}>
          <p className={styles.categoryLabel}>설정 카테고리</p>

          <nav className={styles.categoryNav} aria-label='설정 카테고리'>
            {categories.map((category) => {
              const Icon = category.icon;

              return (
                <button
                  key={category.id}
                  type='button'
                  className={`${styles.categoryButton} ${
                    activeCategory === category.id ? styles.active : ''
                  }`}
                  onClick={() => handleCategoryChange(category.id)}
                >
                  <Icon aria-hidden='true' />
                  <span>{category.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <div className={styles.contentColumn}>{renderContent()}</div>
      </div>
    </section>
  );
}
