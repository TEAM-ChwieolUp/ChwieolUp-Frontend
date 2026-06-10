'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { CATEGORY_LABELS } from '@/components/calendar/types';
import buttonStyles from '@/components/common/button/button.module.scss';
import { listCalendarEvents, scheduleKeys } from '@/features/calendar/api/schedule';
import styles from './TodayBriefing.module.scss';

function getClassName(...classNames: Array<string | false | null | undefined>) {
  return classNames.filter(Boolean).join(' ');
}

function toRangeIso(date: Date, endOfDay = false) {
  const next = new Date(date);

  if (endOfDay) {
    next.setHours(23, 59, 59, 999);
  } else {
    next.setHours(0, 0, 0, 0);
  }

  return next.toISOString();
}

function formatTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export default function TodayBriefing() {
  const today = useMemo(() => new Date(), []);
  const calendarParams = useMemo(
    () => ({
      from: toRangeIso(today),
      to: toRangeIso(today, true),
    }),
    [today]
  );
  const eventsQuery = useQuery({
    queryKey: scheduleKeys.calendar(calendarParams),
    queryFn: () => listCalendarEvents(calendarParams),
  });
  const events = useMemo(
    () =>
      (eventsQuery.data ?? [])
        .slice()
        .sort(
          (left, right) =>
            new Date(left.startAt).getTime() - new Date(right.startAt).getTime()
        ),
    [eventsQuery.data]
  );
  const nextEvent = events[0];
  const formattedDate = today.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
  const title = eventsQuery.isLoading
    ? '오늘 일정을 확인하고 있어요'
    : eventsQuery.isError
      ? '일정 정보를 불러오지 못했어요'
      : events.length > 0
        ? `오늘 일정 ${events.length}개가 있어요`
        : '오늘 등록된 일정이 없어요';
  const description = eventsQuery.isLoading
    ? '캘린더에 등록된 오늘 일정을 정리하는 중입니다.'
    : eventsQuery.isError
      ? '캘린더 화면에서 직접 일정을 확인하거나 잠시 후 다시 시도해 주세요.'
      : nextEvent
        ? `가장 가까운 일정은 ${formatTime(nextEvent.startAt)} · ${nextEvent.title}입니다.`
        : '면접, 마감, 개인 일정을 추가하면 홈에서 바로 확인할 수 있습니다.';
  const visibleEvents = events.slice(0, 3);
  const hiddenEventCount = Math.max(0, events.length - visibleEvents.length);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.date}>{formattedDate}</div>
      </div>

      <div className={styles.content}>
        <div className={styles.title}>{title}</div>
        <div className={styles.description}>{description}</div>
      </div>

      {visibleEvents.length > 0 ? (
        <div className={styles.eventList}>
          {visibleEvents.map((event) => (
            <div key={event.id} className={styles.eventItem}>
              <span className={styles.eventTime}>{formatTime(event.startAt)}</span>
              <span className={styles.eventTitle}>{event.title}</span>
              <span className={styles.eventCategory}>
                {CATEGORY_LABELS[event.category]}
              </span>
            </div>
          ))}
          {hiddenEventCount > 0 ? (
            <div className={styles.moreEvents}>
              {hiddenEventCount}개 일정이 더 있어요.
            </div>
          ) : null}
        </div>
      ) : null}

      <div className={styles.footer}>
        <div className={styles.summary}>
          {eventsQuery.isError
            ? '일정 동기화 상태를 확인해 주세요.'
            : events.length > 0
              ? '오늘 확인할 일정을 시간순으로 정리했어요.'
              : '오늘은 비어 있습니다.'}
        </div>
        <Link
          href='/calendar'
          className={getClassName(
            buttonStyles.button,
            buttonStyles.primary,
            buttonStyles.md,
            styles.ctaLink,
          )}
        >
          <span className={buttonStyles.label}>일정 자세히 보기</span>
          <span className={buttonStyles.icon} aria-hidden='true'>
            <ArrowRight size={18} />
          </span>
        </Link>
      </div>
    </div>
  );
}
