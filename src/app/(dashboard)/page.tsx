import TodayBriefing from '@/components/home/today-briefing/TodayBriefing';
import { dummyTodayBriefingType } from '../api/dummy/dummyTodayBriefingType';
import styles from './page.module.scss';

export default function HomePage() {
  return (
    <div className={styles.container}>
      <TodayBriefing {...dummyTodayBriefingType} />
    </div>
  );
}
