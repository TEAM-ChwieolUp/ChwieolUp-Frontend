import { ArrowRight } from 'lucide-react';
import Button from '@/components/common/button/Button';
import { TodayBreifingType } from '@/app/api/types/TodayBriefingType';
import styles from './TodayBriefing.module.scss';

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
        <Button rightIcon={<ArrowRight size={18} />}>일정 자세히 보기</Button>
      </div>
    </div>
  );
}
