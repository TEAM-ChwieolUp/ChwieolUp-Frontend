'use client';

import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';

import { listApplications, applicationKeys } from '@/features/kanban/api/applications';
import { listCalendarEvents, scheduleKeys } from '@/features/calendar/api/schedule';
import CountCard from '../count-card/CountCard';
import styles from './CountSummary.module.scss';

function toRangeIso(date: Date, endOfDay = false) {
  const next = new Date(date);

  if (endOfDay) {
    next.setHours(23, 59, 59, 999);
  } else {
    next.setHours(0, 0, 0, 0);
  }

  return next.toISOString();
}

export default function CountSummary() {
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
    [today, rangeEnd]
  );

  const [boardQuery, eventsQuery] = useQueries({
    queries: [
      {
        queryKey: applicationKeys.board(),
        queryFn: () => listApplications(),
      },
      {
        queryKey: scheduleKeys.calendar(calendarParams),
        queryFn: () => listCalendarEvents(calendarParams),
      },
    ],
  });

  const { totalCount, inProgressCount, completedCount, retroRate } = useMemo(() => {
    const board = boardQuery.data;

    if (!board) {
      return { totalCount: '-', inProgressCount: 0, completedCount: 0, retroRate: 0 };
    }

    const total = board.cards.length;
    const inProgress = board.cards.filter((card) => {
      const stage = board.stages.find((s) => s.id === card.stageId);
      return stage?.category === 'IN_PROGRESS';
    }).length;
    const completed = total - inProgress;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      totalCount: String(total),
      inProgressCount: inProgress,
      completedCount: completed,
      retroRate: rate,
    };
  }, [boardQuery.data]);

  const weeklyEventCount = eventsQuery.data?.length;
  const isLoadingBoard = boardQuery.isLoading;
  const isLoadingEvents = eventsQuery.isLoading;

  return (
    <div className={styles.container}>
      <CountCard
        color='blue'
        icon='document'
        subText={isLoadingBoard ? '불러오는 중' : `진행중 ${inProgressCount}건`}
        title='총 지원 수'
        value={isLoadingBoard ? '-' : totalCount}
      />
      <CountCard
        color='green'
        icon='event'
        subText='This Week'
        title='이번 주 일정'
        value={isLoadingEvents ? '-' : String(weeklyEventCount ?? 0)}
      />
      <CountCard
        color='red'
        icon='write'
        subText={isLoadingBoard ? '불러오는 중' : `${retroRate}% Rate`}
        title='회고'
        value={isLoadingBoard ? '-' : String(completedCount)}
      />
    </div>
  );
}
