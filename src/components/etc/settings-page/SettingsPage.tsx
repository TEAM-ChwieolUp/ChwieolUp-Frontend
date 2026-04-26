'use client';

import {
  BellRing,
  CircleAlert,
  KeyRound,
  LockKeyhole,
  Mail,
  Mailbox,
  MonitorSmartphone,
  Shield,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { useId, useState } from 'react';
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
    id: 'security',
    label: '계정 보안',
    icon: Shield,
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
  const [activeCategory, setActiveCategory] = useState<CategoryId>('mail-sync');
  const [gmailEnabled, setGmailEnabled] = useState(true);
  const [outlookEnabled, setOutlookEnabled] = useState(false);
  const [sensitivity, setSensitivity] = useState(75);
  const [interviewAlerts, setInterviewAlerts] = useState(true);
  const [deadlineAlerts, setDeadlineAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  const renderProfileContent = () => (
    <>
      <section className={styles.sectionCard}>
        <header className={styles.sectionHeader}>
          <h2>프로필 설정</h2>
          <p>
            지원 현황 분석과 추천 품질을 높이기 위해 기본 프로필 정보를 관리하세요.
          </p>
        </header>

        <div className={styles.profileHero}>
          <div className={styles.profileAvatar} aria-hidden='true'>
            김
          </div>

          <div className={styles.profileHeroCopy}>
            <strong>김철수</strong>
            <span>Product Designer를 목표로 취업 준비 중</span>
          </div>
        </div>

        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            <span>이름</span>
            <input type='text' defaultValue='김철수' />
          </label>

          <label className={styles.field}>
            <span>이메일</span>
            <input
              type='email'
              defaultValue='career_architect@chwieolup.ai'
            />
          </label>

          <label className={styles.field}>
            <span>희망 직무</span>
            <input type='text' defaultValue='Product Designer' />
          </label>

          <label className={styles.field}>
            <span>경력 단계</span>
            <select defaultValue='junior'>
              <option value='intern'>인턴 / 신입</option>
              <option value='junior'>주니어</option>
              <option value='mid'>미들</option>
              <option value='senior'>시니어</option>
            </select>
          </label>

          <label className={`${styles.field} ${styles.fieldFull}`}>
            <span>포트폴리오 링크</span>
            <input
              type='url'
              defaultValue='https://portfolio.chwieolup.ai/minwoo'
            />
            <small>
              대표 포트폴리오 주소를 입력하면 지원 기록과 함께 참고할 수 있습니다.
            </small>
          </label>

          <label className={`${styles.field} ${styles.fieldFull}`}>
            <span>검색 키워드</span>
            <input
              type='text'
              defaultValue='Product Designer, UX, BX, 브랜딩'
            />
            <small>
              선호 직무나 관심 키워드를 쉼표로 구분해서 입력하세요.
            </small>
          </label>
        </div>
      </section>

      <div className={styles.actionBar}>
        <button type='button' className={styles.ghostButton}>
          초기화
        </button>
        <button type='button' className={styles.primaryButton}>
          프로필 저장하기
        </button>
      </div>
    </>
  );

  const renderMailSyncContent = () => (
    <>
      <section className={styles.sectionCard}>
        <header className={styles.sectionHeader}>
          <h2>메일 연동 설정</h2>
          <p>지원 현황을 자동으로 추적하기 위해 메일함을 연동하세요.</p>
        </header>

        <div className={styles.integrationList}>
          <article className={styles.integrationRow}>
            <div className={styles.integrationMeta}>
              <span className={styles.integrationIcon} aria-hidden='true'>
                <Mailbox />
              </span>

              <div className={styles.integrationCopy}>
                <strong>Gmail 연동</strong>
                <p>지원 관련 메일을 자동으로 분석합니다.</p>
              </div>
            </div>

            <button
              type='button'
              aria-pressed={gmailEnabled}
              aria-label='Gmail 연동 토글'
              className={`${styles.toggle} ${gmailEnabled ? styles.enabled : ''}`}
              onClick={() => setGmailEnabled((current) => !current)}
            >
              <span className={styles.toggleThumb} />
            </button>
          </article>

          <article className={styles.integrationRow}>
            <div className={styles.integrationMeta}>
              <span className={styles.integrationIcon} aria-hidden='true'>
                <Mail />
              </span>

              <div className={styles.integrationCopy}>
                <strong>Outlook 연동</strong>
                <p>Microsoft 계정의 채용 안내 메일을 수집합니다.</p>
              </div>
            </div>

            <button
              type='button'
              aria-pressed={outlookEnabled}
              aria-label='Outlook 연동 토글'
              className={`${styles.toggle} ${outlookEnabled ? styles.enabled : ''}`}
              onClick={() => setOutlookEnabled((current) => !current)}
            >
              <span className={styles.toggleThumb} />
            </button>
          </article>
        </div>
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

  const renderSecurityContent = () => (
    <>
      <section className={styles.sectionCard}>
        <header className={styles.sectionHeader}>
          <h2>계정 보안</h2>
          <p>
            취업 준비 기록과 연동된 메일 데이터를 안전하게 보호하기 위한 보안
            설정입니다.
          </p>
        </header>

        <div className={styles.securityList}>
          <article className={styles.securityItem}>
            <span className={styles.infoPanelIcon} aria-hidden='true'>
              <KeyRound />
            </span>
            <div className={styles.securityCopy}>
              <strong>비밀번호 관리</strong>
              <p>
                최근 90일 동안 비밀번호를 변경하지 않았습니다. 주기적으로 새
                비밀번호로 갱신하는 것을 권장합니다.
              </p>
            </div>
            <button type='button' className={styles.inlineAction}>
              비밀번호 변경
            </button>
          </article>

          <article className={styles.securityItem}>
            <span className={styles.infoPanelIcon} aria-hidden='true'>
              <LockKeyhole />
            </span>
            <div className={styles.securityCopy}>
              <strong>2단계 인증</strong>
              <p>
                새 기기 로그인 시 이메일 인증 또는 OTP 인증을 추가로 요구합니다.
              </p>
            </div>
            <button type='button' className={styles.inlineActionPrimary}>
              활성화하기
            </button>
          </article>

          <article className={styles.securityItem}>
            <span className={styles.infoPanelIcon} aria-hidden='true'>
              <MonitorSmartphone />
            </span>
            <div className={styles.securityCopy}>
              <strong>로그인 세션</strong>
              <p>
                현재 MacBook Safari와 iPhone Chrome에서 로그인되어 있습니다.
                의심스러운 세션은 즉시 종료하세요.
              </p>
            </div>
            <button type='button' className={styles.inlineAction}>
              세션 관리
            </button>
          </article>
        </div>
      </section>

      <section className={styles.sectionCard}>
        <header className={styles.sectionHeader}>
          <h2>보안 권장 상태</h2>
          <p>
            현재 계정은 기본 보호 수준입니다. 아래 권장 항목을 완료하면 더
            안전해집니다.
          </p>
        </header>

        <div className={styles.checkList}>
          <div className={styles.checkItem}>
            <span className={styles.checkDot} aria-hidden='true' />
            <p>2단계 인증 활성화</p>
          </div>
          <div className={styles.checkItem}>
            <span className={styles.checkDot} aria-hidden='true' />
            <p>메일 연동 권한 재검토</p>
          </div>
          <div className={styles.checkItem}>
            <span className={styles.checkDot} aria-hidden='true' />
            <p>지난 로그인 기기 점검</p>
          </div>
        </div>
      </section>

      <div className={styles.actionBar}>
        <button type='button' className={styles.ghostButton}>
          나중에
        </button>
        <button type='button' className={styles.primaryButton}>
          보안 설정 저장
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
      case 'security':
        return renderSecurityContent();
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
                  onClick={() => setActiveCategory(category.id)}
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

      <aside className={styles.statusCard}>
        <div className={styles.statusHeader}>
          <span className={styles.statusDot} aria-hidden='true' />
          <span>시스템 상태</span>
        </div>

        <p className={styles.statusText}>
          마지막 동기화: <strong>12분 전</strong>
          <br />
          AI가 최근 24시간 동안 <strong>4개</strong>의 새 채용 일정을
          발견했습니다.
        </p>

        <div className={styles.statusBar} aria-hidden='true'>
          <span />
        </div>
      </aside>
    </section>
  );
}
