'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, GripVertical } from 'lucide-react';

import { listApplications, applicationKeys } from '@/features/kanban/api/applications';
import { ApiError } from '@/lib/api';
import cardStyles from '@/components/kanban/KanbanCard.module.scss';
import styles from './KanbanPreview.module.scss';

function getCardClassNames(...classNames: Array<string | false | undefined>) {
  return classNames.filter(Boolean).join(' ');
}

function getApiErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return '칸반 정보를 불러오지 못했습니다.';
}

function getNoResponseLevel(days?: number) {
  if (days === undefined) {
    return null;
  }

  if (days >= 30) {
    return 'danger' as const;
  }

  if (days >= 14) {
    return 'warning' as const;
  }

  return null;
}

export default function KanbanPreview() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: applicationKeys.board(),
    queryFn: () => listApplications(),
  });

  const columns =
    data?.stages.slice(0, 3).map((stage) => ({
      id: stage.id,
      title: stage.name,
      count: data.cards.filter((card) => card.stageId === stage.id).length,
      color: stage.color,
      cards: data.cards.filter((card) => card.stageId === stage.id).slice(0, 1),
    })) ?? [];

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h2 className={styles.title}>Kanban Preview</h2>
          <p className={styles.subText}>현재 단계별 지원 현황을 빠르게 확인합니다.</p>
        </div>
        <Link href='/kanban' className={styles.fullViewButton}>
          <span>Full View</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className={styles.columns}>
        {(isLoading ? Array.from({ length: 3 }, (_, index) => ({
          id: `loading-${index}`,
          title: '불러오는 중',
          count: 0,
          color: '#e5e7eb',
          cards: [],
        })) : columns).map((column) => (
          <div key={column.id} className={styles.column}>
            <div className={styles.columnHeader}>
              <span className={styles.columnTitle}>{column.title}</span>
              <span className={styles.columnCount}>{column.count}</span>
            </div>

            {isError ? (
              <div className={styles.emptyCard}>
                <span>{getApiErrorMessage(error)}</span>
              </div>
            ) : column.cards.length > 0 ? (
              column.cards.map((card) => (
                <article
                  key={card.id}
                  className={cardStyles.card}
                >
                  <div className={cardStyles.cardTopRow}>
                    <span className={cardStyles.dragHandle} aria-hidden='true'>
                      <GripVertical size={14} />
                    </span>

                    <div className={cardStyles.cardMeta}>
                      <span
                        className={cardStyles.stagePip}
                        style={{ background: column.color }}
                      />
                      <span className={cardStyles.stageLabel}>{column.title}</span>
                    </div>

                    {card.finalResult && (
                      <span
                        className={getCardClassNames(
                          cardStyles.resultBadge,
                          card.finalResult === '합격' ? cardStyles.pass : cardStyles.fail,
                        )}
                      >
                        {card.finalResult}
                      </span>
                    )}
                  </div>

                  <h4 className={cardStyles.company}>{card.company}</h4>
                  <p className={cardStyles.position}>{card.position}</p>

                  <div className={cardStyles.dateRow}>
                    <span className={cardStyles.date}>지원일 {card.appliedDate}</span>
                    {card.noResponseDays !== undefined && (
                      <span
                        className={getCardClassNames(
                          cardStyles.noResponseChip,
                          getNoResponseLevel(card.noResponseDays) === 'danger' && cardStyles.danger,
                          getNoResponseLevel(card.noResponseDays) === 'warning' && cardStyles.warning,
                        )}
                      >
                        무응답 {card.noResponseDays}일
                      </span>
                    )}
                  </div>

                  {card.tags.length > 0 && (
                    <div className={cardStyles.tags}>
                      {card.tags.map((tag) => (
                        <span key={tag} className={cardStyles.tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {card.nextAction && (
                    <p className={cardStyles.nextAction}>→ {card.nextAction}</p>
                  )}

                  {card.memo && (
                    <p className={cardStyles.memoPreview}>{card.memo}</p>
                  )}
                </article>
              ))
            ) : (
              <div className={styles.emptyCard}>
                <span>{isLoading ? '보드 데이터를 불러오는 중' : '이 단계의 카드가 없습니다.'}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
