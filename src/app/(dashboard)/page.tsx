import CountSummary from '@/components/home/count-summary/CountSummary';
import KanbanPreview from '@/components/home/kanban-preview/KanbanPreview';
import Timeline from '@/components/home/timeline/Timeline';
import TodayBriefing from '@/components/home/today-briefing/TodayBriefing';
import styles from './page.module.scss';

export default function HomePage() {
  return (
    <div className={styles.container}>
      <TodayBriefing />
      <CountSummary />
      <div className={styles.row}>
        <KanbanPreview />
        <Timeline />
      </div>
    </div>
  );
}
