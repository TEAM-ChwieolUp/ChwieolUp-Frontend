import { CalendarDays, KanbanSquare, Sparkles } from 'lucide-react';
import styles from './AiAnalysis.module.scss';
import type { MailAiAction } from '../types';

interface AiAnalysisProps {
  actions: MailAiAction[];
}

export default function AiAnalysis({ actions }: AiAnalysisProps) {
  return (
    <section className={styles.section} aria-labelledby='mail-ai-analysis-heading'>
      <header className={styles.header}>
        <span className={styles.badge} aria-hidden='true'>
          <Sparkles />
        </span>

        <div className={styles.titleGroup}>
          <h2 id='mail-ai-analysis-heading'>AI 분석</h2>
          <span className={styles.divider}>-</span>
          <strong>서류 합격 감지</strong>
        </div>
      </header>

      <div className={styles.grid}>
        {actions.map((action) => {
          const Icon = action.icon === 'kanban' ? KanbanSquare : CalendarDays;

          return (
            <article
              key={action.id}
              className={`${styles.card} ${
                action.tone === 'green' ? styles.green : styles.blue
              }`}
            >
              <div className={styles.cardContent}>
                <span className={styles.iconWrap} aria-hidden='true'>
                  <Icon />
                </span>

                <div className={styles.copy}>
                  <p className={styles.title}>
                    {action.title}{' '}
                    {action.accentText ? (
                      <span className={styles.accent}>{action.accentText}</span>
                    ) : null}
                  </p>

                  {action.description.map((line) => (
                    <p
                      key={line}
                      className={`${styles.description} ${
                        action.icon === 'calendar' && line.includes('2026')
                          ? styles.emphasis
                          : ''
                      }`}
                    >
                      {line}
                    </p>
                  ))}
                </div>
              </div>

              <div className={styles.actions}>
                <button type='button' className={styles.primaryButton}>
                  {action.primaryAction}
                </button>
                <button type='button' className={styles.secondaryButton}>
                  {action.secondaryAction}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
