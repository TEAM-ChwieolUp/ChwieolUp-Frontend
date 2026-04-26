'use client';

import { ArrowRight, Clock3 } from 'lucide-react';

import styles from './KanbanPreview.module.scss';
import { useRouter } from 'next/navigation';

const kanbanColumns = [
  {
    title: 'IN REVIEW',
    count: 2,
    cards: [
      {
        company: 'Naver Cloud',
        role: 'Product Designer',
        badge: 'TECH',
        badgeTone: 'green',
        dueText: 'D-2 Remaining',
        companyMark: 'N',
        companyTone: 'naver',
      },
    ],
  },
  {
    title: 'INTERVIEW',
    count: 1,
    cards: [
      {
        company: 'Kakao Corp',
        role: 'Senior Designer',
        badge: 'FINAL',
        badgeTone: 'blue',
        dueText: 'Today 14:00',
        companyMark: 'K',
        companyTone: 'kakao',
      },
    ],
  },
  {
    title: 'OFFERS',
    count: 0,
    cards: [],
  },
] as const;

function getCardClassNames(...classNames: Array<string | false | undefined>) {
  return classNames.filter(Boolean).join(' ');
}

export default function KanbanPreview() {
  const navigate = useRouter();

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h2 className={styles.title}>Kanban Preview</h2>
          <p className={styles.subText}>진행 중인 핵심 채용 파이프라인</p>
        </div>
        <button type='button' className={styles.fullViewButton}>
          <span onClick={() => navigate.push('/kanban')}>Full View</span>
          <ArrowRight size={16} />
        </button>
      </div>

      <div className={styles.columns}>
        {kanbanColumns.map((column) => (
          <div key={column.title} className={styles.column}>
            <div className={styles.columnHeader}>
              <span className={styles.columnTitle}>{column.title}</span>
              <span className={styles.columnCount}>{column.count}</span>
            </div>

            {column.cards.length > 0 ? (
              column.cards.map((card) => (
                <article key={card.company} className={styles.card}>
                  <div className={styles.cardTop}>
                    <div
                      className={getCardClassNames(
                        styles.companyMark,
                        card.companyTone === 'naver' && styles.naver,
                        card.companyTone === 'kakao' && styles.kakao,
                      )}
                    >
                      {card.companyMark}
                    </div>
                    <span
                      className={getCardClassNames(
                        styles.badge,
                        card.badgeTone === 'green' && styles.badgeGreen,
                        card.badgeTone === 'blue' && styles.badgeBlue,
                      )}
                    >
                      {card.badge}
                    </span>
                  </div>

                  <div className={styles.cardBody}>
                    <h3 className={styles.company}>{card.company}</h3>
                    <p className={styles.role}>{card.role}</p>
                  </div>

                  <div
                    className={getCardClassNames(
                      styles.meta,
                      card.badgeTone === 'blue' && styles.metaHighlight,
                    )}
                  >
                    <Clock3 size={12} />
                    <span>{card.dueText}</span>
                  </div>
                </article>
              ))
            ) : (
              <div className={styles.emptyCard}>
                <div className={styles.emptyIcon} aria-hidden='true'>
                  +
                </div>
                <span>Empty Stage</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
