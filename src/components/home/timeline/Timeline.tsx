'use client';

import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { Lightbulb } from 'lucide-react';

import { listCalendarEvents, listScheduleApplicationOptions, scheduleKeys } from '@/features/calendar/api/schedule';
import { CATEGORY_LABELS } from '@/components/calendar/types';
import { ApiError } from '@/lib/api';
import styles from './Timeline.module.scss';

const DAYS_SHORT = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function toRangeIso(date: Date, endOfDay = false) {
  const next = new Date(date);

  if (endOfDay) {
    next.setHours(23, 59, 59, 999);
  } else {
    next.setHours(0, 0, 0, 0);
  }

  return next.toISOString();
}

function formatRange(start: Date, end: Date) {
  return `${start.getMonth() + 1}/${start.getDate()}~${end.getMonth() + 1}/${end.getDate()}`;
}

function formatTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function formatEntryLabel(date: Date, today: Date) {
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffDays = Math.round(
    (startOfDate.getTime() - startOfToday.getTime()) / 86400000
  );

  if (diffDays === 0) {
    return 'TODAY';
  }

  if (diffDays === 1) {
    return 'TOMORROW';
  }

  return DAYS_SHORT[date.getDay()];
}

function getApiErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return '일정을 불러오지 못했습니다.';
}

export default function Timeline() {
  const today = useMemo(() => new Date(), []);
  const rangeEnd = useMemo(() => {
    const next = new Date(today);
    next.setDate(today.getDate() + 6);
    return next;
  }, [today]);
  const calendarParams = useMemo(
    () => ({
      from: toRangeIso(today),
      to: toRangeIso(rangeEnd, true),
    }),
    [rangeEnd, today]
  );

  const [eventsQuery, applicationsQuery] = useQueries({
    queries: [
      {
        queryKey: scheduleKeys.calendar(calendarParams),
        queryFn: () => listCalendarEvents(calendarParams),
      },
      {
        queryKey: scheduleKeys.applications,
        queryFn: listScheduleApplicationOptions,
      },
    ],
  });

  const applicationNameMap = useMemo(
    () =>
      new Map(
        (applicationsQuery.data ?? []).map((application) => [
          application.id,
          `${application.companyName} · ${application.position}`,
        ])
      ),
    [applicationsQuery.data]
  );

  const entries = useMemo(
    () =>
      (eventsQuery.data ?? [])
        .slice()
        .sort(
          (left, right) =>
            new Date(left.startAt).getTime() - new Date(right.startAt).getTime()
        )
        .slice(0, 4)
        .map((event) => {
          const startDate = new Date(event.startAt);
          const applicationLabel =
            event.applicationId === null
              ? null
              : applicationNameMap.get(event.applicationId) ?? null;
          const timeLabel = formatTime(event.startAt);

          return {
            id: event.id,
            date: String(startDate.getDate()).padStart(2, '0'),
            label: formatEntryLabel(startDate, today),
            title: event.title,
            description: applicationLabel
              ? `${CATEGORY_LABELS[event.category]} · ${applicationLabel}${timeLabel ? ` · ${timeLabel}` : ''}`
              : `${CATEGORY_LABELS[event.category]}${timeLabel ? ` · ${timeLabel}` : ''}`,
            active: formatEntryLabel(startDate, today) === 'TODAY',
          };
        }),
    [applicationNameMap, eventsQuery.data, today]
  );

  const isLoading = eventsQuery.isLoading || applicationsQuery.isLoading;
  const isError = eventsQuery.isError || applicationsQuery.isError;
  const error = eventsQuery.error ?? applicationsQuery.error;
  const upcomingCount = eventsQuery.data?.length ?? 0;

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Timeline</h2>
        <span className={styles.range}>{formatRange(today, rangeEnd)}</span>
      </div>

      <div className={styles.entryList}>
        {isError ? (
          <div className={styles.emptyState}>{getApiErrorMessage(error)}</div>
        ) : entries.length > 0 ? (
          entries.map((entry, index) => (
            <article
              key={`${entry.id}-${entry.date}`}
              className={styles.entry}
            >
              <div className={styles.rail}>
                <div
                  className={entry.active ? styles.dateDotActive : styles.dateDot}
                >
                  {entry.date}
                </div>
                {index < entries.length - 1 ? (
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
          ))
        ) : (
          <div className={styles.emptyState}>
            {isLoading ? '이번 주 일정을 불러오는 중입니다.' : '다가오는 7일 일정이 없습니다.'}
          </div>
        )}
      </div>

      <aside className={styles.tipCard}>
        <div className={styles.tipHeader}>
          <Lightbulb size={16} />
          <span>This Week</span>
        </div>
        <p className={styles.tipText}>
          {isError
            ? '일정 데이터가 불안정하면 캘린더 화면에서 직접 상태를 확인하세요.'
            : upcomingCount > 0
              ? `앞으로 7일 안에 ${upcomingCount}개의 일정이 있습니다. 일정 충돌과 지원 마감 시간을 먼저 확인하세요.`
              : '이번 주는 등록된 일정이 없습니다. 필요한 면접, 마감, 개인 일정을 먼저 추가해 두는 편이 안전합니다.'}
        </p>
      </aside>
    </section>
  );
}
