'use client';

import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

const highlights = [
  {
    title: 'AI 기반 취업 분석',
    description: '지원 현황과 피드백을 빠르게 정리하고 다음 액션을 더 선명하게 잡습니다.',
  },
  {
    title: '칸반 중심 지원 관리',
    description: '공고 탐색부터 면접, 합격, 회고까지 지원 단계를 한 흐름으로 관리합니다.',
  },
  {
    title: '일정과 마감 추적',
    description: '면접 일정, 리마인더, 제출 마감을 놓치지 않도록 한 화면에서 확인합니다.',
  },
];

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = () => {
    document.cookie = 'chwieolup_auth=1; path=/; max-age=604800; samesite=lax';
    router.replace('/');
  };

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <div className={styles.introPanel}>
          <span className={styles.badge}>ChwieolUp</span>
          <h1 className={styles.introTitle}>
            취업 준비의 흐름을
            <br />
            더 명확하게 관리하세요
          </h1>
          <p className={styles.introDescription}>
            취얼업은 지원 현황, 일정, 회고를 하나의 흐름으로 연결해서
            구직 과정의 복잡함을 줄이는 대시보드입니다.
          </p>

          <div className={styles.highlightList}>
            {highlights.map((item) => {
              return (
                <article key={item.title} className={styles.highlightCard}>
                  <div className={styles.highlightText}>
                    <strong className={styles.highlightTitle}>{item.title}</strong>
                    <p className={styles.highlightDescription}>{item.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className={styles.formPanel}>
          <div className={styles.formHeader}>
            <span className={styles.formEyebrow}>로그인</span>
            <h2 className={styles.formTitle}>계속하려면 로그인하세요</h2>
            <p className={styles.formDescription}>
              현재는 임시 로그인 단계입니다. 입력창은 UI만 제공하고 버튼을 누르면
              바로 홈으로 이동합니다.
            </p>
          </div>

          <form className={styles.form} onSubmit={(event) => event.preventDefault()}>
            <label className={styles.field}>
              <span className={styles.label}>이메일</span>
              <input
                className={styles.input}
                type='email'
                placeholder='name@example.com'
                autoComplete='email'
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>비밀번호</span>
              <input
                className={styles.input}
                type='password'
                placeholder='비밀번호를 입력하세요'
                autoComplete='current-password'
              />
            </label>

            <button className={styles.button} type='button' onClick={handleLogin}>
              로그인하고 시작하기
              <ArrowRight className={styles.buttonIcon} aria-hidden='true' />
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
