'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, GripVertical } from 'lucide-react';

import { listApplications, applicationKeys } from '@/features/kanban/api/applications';
import { ApiError } from '@/lib/api';
import styles from './KanbanPreview.module.scss';

function getCardClassNames(...classNames: Array<string | false | undefined>) {
  return classNames.filter(Boolean).join(' ');
}

function formatMonthDay(value?: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function getDueText(deadlineAt?: string | null, appliedAt?: string) {
  if (deadlineAt) {
    const now = new Date();
    const deadline = new Date(deadlineAt);

    if (!Number.isNaN(deadline.getTime())) {
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfDeadline = new Date(
        deadline.getFullYear(),
        deadline.getMonth(),
        deadline.getDate()
      );
      const diffDays = Math.round(
        (startOfDeadline.getTime() - startOfToday.getTime()) / 86400000
      );

      if (diffDays === 0) {
        return '오늘 마감';
      }

      if (diffDays > 0) {
        return `D-${diffDays}`;
      }

      return `마감 ${Math.abs(diffDays)}일 지남`;
    }
  }

  const appliedDate = formatMonthDay(appliedAt);
  return appliedDate ? `지원일 ${appliedDate}` : '일정 정보 없음';
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
          <div key={column.title} className={styles.column}>
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
                  className={styles.card}
                  style={{ borderLeftColor: column.color }}
                >
                  <div className={styles.cardTopRow}>
                    <span className={styles.dragHandle} aria-hidden='true'>
                      <GripVertical size={14} />
                    </span>

                    <div className={styles.cardMeta}>
                      <span
                        className={styles.stagePip}
                        style={{ background: column.color }}
                      />
                      <span className={styles.stageLabel}>{column.title}</span>
                    </div>

                    {card.finalResult && (
                      <span
                        className={getCardClassNames(
                          styles.resultBadge,
                          card.finalResult === '합격' ? styles.pass : styles.fail,
                        )}
                      >
                        {card.finalResult}
                      </span>
                    )}
                  </div>

                  <div className={styles.cardBody}>
                    <h3 className={styles.company}>{card.company}</h3>
                    <p className={styles.position}>{card.position}</p>
                  </div>

                  <div className={styles.dateRow}>
                    <span className={styles.date}>
                      {getDueText(card.deadlineAt, card.appliedAt)}
                    </span>
                    {card.noResponseDays !== undefined && (
                      <span
                        className={getCardClassNames(
                          styles.noResponseChip,
                          getNoResponseLevel(card.noResponseDays) === 'danger' && styles.danger,
                          getNoResponseLevel(card.noResponseDays) === 'warning' && styles.warning,
                        )}
                      >
                        무응답 {card.noResponseDays}일
                      </span>
                    )}
                  </div>

                  {card.tags.length > 0 && (
                    <div className={styles.tags}>
                      {card.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className={styles.tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {card.memo && (
                    <p className={styles.memoPreview}>{card.memo}</p>
                  )}
                </article>
              ))
            ) : (
              <div className={styles.emptyCard}>
                <div className={styles.emptyIcon} aria-hidden='true'>
                  +
                </div>
                <span>{isLoading ? '보드 데이터를 불러오는 중' : '이 단계의 카드가 없습니다.'}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
