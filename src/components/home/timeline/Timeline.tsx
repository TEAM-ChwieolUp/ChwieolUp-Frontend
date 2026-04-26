import { Lightbulb } from 'lucide-react';
import styles from './Timeline.module.scss';

const timelineEntries = [
  {
    date: '22',
    label: 'TODAY',
    title: 'Kakao 실무 면접',
    description: '오후 2시 - 온라인 (Google Meet)',
    active: true,
  },
  {
    date: '24',
    label: 'FRIDAY',
    title: '네이버 클라우드 과제 마감',
    description: '오후 6시까지 제출 필수',
    active: false,
  },
  {
    date: '25',
    label: 'SATURDAY',
    title: '주간 회고 (Retrospective)',
    description: '이번 주 지원 현황 리뷰',
    active: false,
  },
] as const;

export default function Timeline() {
  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Timeline</h2>
        <span className={styles.range}>5/20~26</span>
      </div>

      <div className={styles.entryList}>
        {timelineEntries.map((entry, index) => (
          <article
            key={`${entry.date}-${entry.title}`}
            className={styles.entry}
          >
            <div className={styles.rail}>
              <div
                className={entry.active ? styles.dateDotActive : styles.dateDot}
              >
                {entry.date}
              </div>
              {index < timelineEntries.length - 1 ? (
                <div className={styles.verticalLine} />
              ) : null}
            </div>

            <div className={styles.entryBody}>
              <span
                className={entry.active ? styles.labelActive : styles.label}
              >
                {entry.label}
              </span>
              <h3 className={styles.entryTitle}>{entry.title}</h3>
              <p className={styles.entryDescription}>{entry.description}</p>
            </div>
          </article>
        ))}
      </div>

      <aside className={styles.tipCard}>
        <div className={styles.tipHeader}>
          <Lightbulb size={16} />
          <span>Pro Tip</span>
        </div>
        <p className={styles.tipText}>
          면접 1시간 전, 포트폴리오의 &#39;프로젝트 A&#39; 부분을 다시 한 번
          복습하는 것이 좋습니다.
        </p>
      </aside>
    </section>
  );
}
