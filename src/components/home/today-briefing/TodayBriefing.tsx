import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { TodayBreifingType } from '@/app/api/types/TodayBriefingType';
import buttonStyles from '@/components/common/button/button.module.scss';
import styles from './TodayBriefing.module.scss';

function getClassName(...classNames: Array<string | false | null | undefined>) {
  return classNames.filter(Boolean).join(' ');
}

export default function TodayBriefing({
  datetime,
  briefTitle,
  briefDescription,
}: TodayBreifingType) {
  const formattedDate = datetime.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.date}>{formattedDate}</div>
      </div>

      <div className={styles.content}>
        <div className={styles.title}>{briefTitle}</div>
        <div className={styles.description}>{briefDescription}</div>
      </div>

      <div className={styles.footer}>
        <div className={styles.summary}>
          오늘 확인해야 할 일정을 빠르게 정리했어요.
        </div>
        <Link
          href='/calendar'
          className={getClassName(
            buttonStyles.button,
            buttonStyles.primary,
            buttonStyles.md,
            styles.ctaLink,
          )}
        >
          <span className={buttonStyles.label}>일정 자세히 보기</span>
          <span className={buttonStyles.icon} aria-hidden='true'>
            <ArrowRight size={18} />
          </span>
        </Link>
      </div>
    </div>
  );
}
