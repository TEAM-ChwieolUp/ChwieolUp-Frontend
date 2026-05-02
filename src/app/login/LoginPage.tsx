'use client';

import { ArrowRight, BarChart3, CircleHelp, Map, Network } from 'lucide-react';
import { Manrope } from 'next/font/google';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
});

const heroImageUrl =
  'https://www.figma.com/api/mcp/asset/9ef6ba04-15ca-4ece-ac19-d63cecc899db';
const logoImageUrl =
  'https://www.figma.com/api/mcp/asset/891b0eaa-79e6-41a4-bd95-8d624f0d3184';
const kakaoIconUrl =
  'https://www.figma.com/api/mcp/asset/dc01819d-9fc1-4c8e-9e9f-8b6df86d0cfb';
const googleIconUrl =
  'https://www.figma.com/api/mcp/asset/6685c772-b832-4780-8141-d441768dcd38';

const highlights = [
  {
    icon: BarChart3,
    title: '실시간 지원 분석',
    description: '공고별 진행 상태와 누락된 액션을 빠르게 정리합니다.',
  },
  {
    icon: Map,
    title: '맞춤 준비 로드맵',
    description: '서류, 과제, 면접, 회고까지 취업 흐름을 한 화면에서 연결합니다.',
  },
  {
    icon: Network,
    title: '채용 네트워크 정리',
    description: '메일, 일정, 칸반 데이터를 묶어 다음 행동을 또렷하게 보여줍니다.',
  },
];

const socialButtons = [
  {
    name: 'kakao',
    label: '카카오로 둘러보기',
    iconSrc: kakaoIconUrl,
    className: styles.kakaoButton,
  },
  {
    name: 'google',
    label: 'Google로 둘러보기',
    iconSrc: googleIconUrl,
    className: styles.googleButton,
  },
] as const;

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = () => {
    document.cookie = 'chwieolup_auth=1; path=/; max-age=604800; samesite=lax';
    router.replace('/');
  };

  return (
    <main className={`${styles.page} ${manrope.className}`}>
      <section className={styles.shell}>
        <div
          className={styles.introPanel}
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(2, 6, 23, 0.64) 0%, rgba(2, 6, 23, 0.88) 100%), url(${heroImageUrl})`,
          }}
        >
          <div className={styles.introContent}>
            <div className={styles.logoWrap}>
              <Image
                className={styles.logoMark}
                src={logoImageUrl}
                alt=''
                aria-hidden='true'
                width={22}
                height={36}
              />
              <span className={styles.badge}>취업 관리 도우미</span>
            </div>
            <h1 className={styles.introTitle}>
              취업 준비의 흐름을
              <br />
              더 똑똑하게 설계하세요
            </h1>
            <p className={styles.introDescription}>
              지원 현황, 일정, 메일, 회고를 한 번에 묶어주는 대시보드로
              복잡한 취업 준비를 선명한 루틴으로 정리합니다.
            </p>
          </div>

          <div className={styles.highlightList}>
            {highlights.map((item) => {
              const Icon = item.icon;

              return (
                <article key={item.title} className={styles.highlightCard}>
                  <span className={styles.highlightIcon} aria-hidden='true'>
                    <Icon />
                  </span>
                  <div className={styles.highlightText}>
                    <strong className={styles.highlightTitle}>{item.title}</strong>
                    <p className={styles.highlightDescription}>{item.description}</p>
                  </div>
                </article>
              );
            })}
          </div>

          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <strong className={styles.statValue}>500+</strong>
              <span className={styles.statLabel}>관리 가능한 공고</span>
            </div>
            <div className={styles.statCard}>
              <strong className={styles.statValue}>15k</strong>
              <span className={styles.statLabel}>누적 지원 기록</span>
            </div>
          </div>
        </div>

        <div className={styles.formPanel}>
          <div className={styles.formHeader}>
            <div className={styles.brandLockup}>
              <Image
                className={styles.brandMark}
                src={logoImageUrl}
                alt=''
                aria-hidden='true'
                width={14}
                height={24}
              />
              <span className={styles.brandName}>취업 관리 도우미</span>
            </div>
            <h2 className={styles.formTitle}>다시 돌아오신 걸 환영해요</h2>
            <p className={styles.formDescription}>
              지원 현황, 일정, 회고를 한 번에 관리해보세요.
            </p>
            <p className={styles.formAccent}>
              소셜 로그인은 준비 중이며, 지금은 버튼을 누르면 바로 체험 화면으로
              이동합니다.
            </p>
          </div>

          <div className={styles.socialList}>
            {socialButtons.map((button) => (
              <button
                key={button.name}
                className={`${styles.socialButton} ${button.className}`}
                type='button'
                onClick={handleLogin}
              >
                <Image
                  className={styles.socialIcon}
                  src={button.iconSrc}
                  alt=''
                  aria-hidden='true'
                  width={20}
                  height={20}
                />
                <span>{button.label}</span>
                <ArrowRight className={styles.socialArrow} aria-hidden='true' />
              </button>
            ))}
          </div>

          <p className={styles.helperCopy}>
            아직 계정이 없어도 괜찮아요. 현재는 모든 버튼이 동일한 미리보기
            홈으로 연결됩니다.
          </p>

          <div className={styles.formFooter}>
            <p className={styles.footerCopy}>
              © 2026 취업 관리 도우미. 취업 준비의 흐름을 더 명확하게.
            </p>
            <div className={styles.footerLinks}>
              <span>개인정보 안내</span>
              <span>보안 정책</span>
            </div>
          </div>
        </div>
      </section>

      <button className={styles.helpButton} type='button' aria-label='도움말'>
        <CircleHelp aria-hidden='true' />
      </button>
    </main>
  );
}
