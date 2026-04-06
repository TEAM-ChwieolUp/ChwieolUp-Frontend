'use client';

import styles from './Header.module.scss';
import { usePathname } from 'next/navigation';

const headerCopy: Record<string, { title: string; description: string }> = {
  '/': {
    title: '홈',
    description: '오늘의 채용 흐름과 핵심 지표를 한눈에 정리합니다.',
  },
  '/kanban': {
    title: '칸반',
    description: '지원 현황을 단계별로 관리하고 우선순위를 정리합니다.',
  },
  '/calendar': {
    title: '캘린더',
    description: '면접, 마감일, 리마인더 일정을 깔끔하게 관리합니다.',
  },
  '/retrospective': {
    title: '회고',
    description: '지원 과정의 기록을 남기고 다음 액션을 정리합니다.',
  },
  '/more': {
    title: '더보기',
    description: '추가 기능과 설정 메뉴를 확인할 수 있습니다.',
  },
};

export default function Header() {
  const pathname = usePathname();
  const copy = headerCopy[pathname] ?? headerCopy['/'];

  return (
    <header className={styles.header}>
      <div className={styles.heading}>
        <span className={styles.eyebrow}>ChwieolUp Dashboard</span>
        <h1 className={styles.title}>{copy.title}</h1>
        <p className={styles.description}>{copy.description}</p>
      </div>

      <div className={styles.actions}>
        <div className={styles.statusBadge}>
          <span className={styles.statusDot} aria-hidden='true' />
          서비스 정상
        </div>

        <button className={styles.profileButton} type='button'>
          <span className={styles.profileAvatar}>M</span>
          <span className={styles.profileText}>Minwoo</span>
        </button>
      </div>
    </header>
  );
}
