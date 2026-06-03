import { CalendarDays, KanbanSquare, Sparkles } from 'lucide-react';
import styles from './AiAnalysis.module.scss';
import type { MailAiAction } from '../types';

interface AiAnalysisProps {
  actions: MailAiAction[];
  summary: string;
}

export default function AiAnalysis({ actions, summary }: AiAnalysisProps) {
  return (
    <section className={styles.section} aria-labelledby='mail-ai-analysis-heading'>
      <header className={styles.header}>
        <span className={styles.badge} aria-hidden='true'>
          <Sparkles />
        </span>

        <div className={styles.titleGroup}>
          <h2 id='mail-ai-analysis-heading'>AI 분석</h2>
          <span className={styles.divider}>-</span>
          <strong>{summary}</strong>
        </div>
      </header>

      <div className={styles.grid}>
        {actions.length === 0 ? (
          <article className={styles.emptyCard}>
            채용 관련 추천 액션이 아직 없습니다.
          </article>
        ) : actions.map((action) => {
          const Icon = action.icon === 'kanban' ? KanbanSquare : CalendarDays;
          const toneLabel =
            action.icon === 'kanban' ? '진행 단계 추천' : '일정 자동 감지';

          return (
            <article
              key={action.id}
              className={`${styles.card} ${
                action.tone === 'green' ? styles.green : styles.blue
              }`}
            >
              <div className={styles.cardContent}>
                <div className={styles.cardTop}>
                  <span className={styles.iconWrap} aria-hidden='true'>
                    <Icon />
                  </span>
                  <span className={styles.toneLabel}>{toneLabel}</span>
                </div>

                <div className={styles.copy}>
                  <h3 className={styles.title}>
                    {action.title}{' '}
                    {action.accentText ? (
                      <span className={styles.accent}>{action.accentText}</span>
                    ) : null}
                  </h3>

                  <div className={styles.descriptionGroup}>
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
