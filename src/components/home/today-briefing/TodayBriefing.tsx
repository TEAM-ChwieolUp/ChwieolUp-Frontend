import Button from '@/components/common/button/Button';
import { TodayBreifingType } from '@/app/api/types/TodayBriefingType';
import styles from './TodayBriefing.module.scss';

export default function TodayBriefing({
  datetime,
  briefTitle,
  briefDescription,
}: TodayBreifingType) {
  return (
    <div className={styles.container}>
      <div className={styles.date}>{datetime.toDateString()}</div>
      <div className={styles.title}>{briefTitle}</div>
      <div className={styles.description}>{briefDescription}</div>
      <Button>일정 자세히 보기</Button>
    </div>
  );
}
