import { TodayBreifingType } from '@/app/api/types/TodayBriefingType';
import styles from './TodayBriefing.module.scss';

export default function TodayBriefing({
  datetime,
  briefTitle,
  briefDescription,
}: TodayBreifingType) {
  return (
    <div className={styles.container}>
      <div>{datetime.toDateString()}</div>
      <div>{briefTitle}</div>
      <div>{briefDescription}</div>
    </div>
  );
}
