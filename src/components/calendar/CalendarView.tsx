'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import AddEventModal from './AddEventModal';
import EventDetailPopover from './EventDetailPopover';
import {
  CalendarEvent,
  CATEGORY_LABELS,
  CATEGORY_OPTIONS,
  EventFormValues,
  ScheduleCategory,
} from './types';
import { ApiError } from '@/lib/api';
import {
  createScheduleEvent,
  deleteScheduleEvent,
  downloadScheduleEventIcs,
  listCalendarEvents,
  listScheduleApplicationOptions,
  scheduleKeys,
  updateScheduleEvent,
} from '@/features/calendar/api/schedule';
import styles from './CalendarView.module.scss';

type ViewMode = 'monthly' | 'weekly';

const DAYS_SHORT = ['일', '월', '화', '수', '목', '금', '토'];

const CATEGORY_COLORS: Record<ScheduleCategory, string> = {
  JOB_POSTING: styles.eventBlue,
  APPLICATION_PROCESS: styles.eventGreen,
  PERSONAL: styles.eventOrange,
};

function toDateStr(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;
}

function toLocalDateStr(isoDate: string) {
  return toDateStr(new Date(isoDate));
}

function toLocalTimeStr(isoDate: string) {
  const date = new Date(isoDate);

  return `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes()
  ).padStart(2, '0')}`;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getMonthDays(baseDate: Date) {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay();
  const days: { date: Date; isCurrentMonth: boolean }[] = [];

  for (let index = startOffset - 1; index >= 0; index -= 1) {
    days.push({ date: new Date(year, month, -index), isCurrentMonth: false });
  }

  for (let date = 1; date <= lastDay.getDate(); date += 1) {
    days.push({ date: new Date(year, month, date), isCurrentMonth: true });
  }

  const remaining = 42 - days.length;

  for (let date = 1; date <= remaining; date += 1) {
    days.push({ date: new Date(year, month + 1, date), isCurrentMonth: false });
  }

  return days;
}

function getWeekDays(baseDate: Date) {
  const dayOfWeek = baseDate.getDay();

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() - dayOfWeek + index);
    return date;
  });
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

function combineToIso(date: string, time?: string) {
  if (!time) {
    return new Date(`${date}T00:00:00`).toISOString();
  }

  return new Date(`${date}T${time}:00`).toISOString();
}

function formatHeaderLabel(view: ViewMode, currentDate: Date) {
  if (view === 'monthly') {
    return `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월`;
  }

  const weekDays = getWeekDays(currentDate);
  const first = weekDays[0];
  const last = weekDays[6];

  if (first.getMonth() === last.getMonth()) {
    return `${first.getFullYear()}년 ${first.getMonth() + 1}월 ${first.getDate()}일 - ${last.getDate()}일`;
  }

  return `${first.getFullYear()}년 ${first.getMonth() + 1}월 ${first.getDate()}일 - ${last.getMonth() + 1}월 ${last.getDate()}일`;
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

function mapEventFormToCreatePayload(form: EventFormValues) {
  const isAllDay = form.allDay;
  const startAt = combineToIso(form.date, isAllDay ? undefined : form.startTime);
  const endAt =
    isAllDay || !form.endTime
      ? null
      : combineToIso(form.date, form.endTime);

  return {
    category: form.category,
    applicationId: form.category === 'PERSONAL' ? null : form.applicationId,
    title: form.title.trim(),
    startAt,
    endAt,
  };
}

function mapEventFormToUpdatePayload(form: EventFormValues) {
  const isAllDay = form.allDay;
  const startAt = combineToIso(form.date, isAllDay ? undefined : form.startTime);
  const endAt =
    isAllDay || !form.endTime
      ? null
      : combineToIso(form.date, form.endTime);

  return {
    title: form.title.trim(),
    startAt,
    endAt,
  };
}

export default function CalendarView() {
  const queryClient = useQueryClient();
  const today = useMemo(() => new Date(), []);
  const [currentDate, setCurrentDate] = useState(today);
  const [view, setView] = useState<ViewMode>('monthly');
  const [activeFilters, setActiveFilters] = useState<ScheduleCategory[]>([
    ...CATEGORY_OPTIONS,
  ]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addDefaultDate, setAddDefaultDate] = useState<string | undefined>(undefined);

  const monthDays = useMemo(() => getMonthDays(currentDate), [currentDate]);
  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);
  const visibleStartDate = view === 'monthly' ? monthDays[0]?.date : weekDays[0];
  const visibleEndDate =
    view === 'monthly' ? monthDays[monthDays.length - 1]?.date : weekDays[weekDays.length - 1];

  const categoryParam =
    activeFilters.length === CATEGORY_OPTIONS.length
      ? undefined
      : activeFilters.join(',');

  const calendarParams = useMemo(
    () => ({
      from: toRangeIso(visibleStartDate ?? today),
      to: toRangeIso(visibleEndDate ?? today, true),
      category: categoryParam,
    }),
    [categoryParam, today, visibleEndDate, visibleStartDate]
  );

  const { data: applicationOptions = [] } = useQuery({
    queryKey: scheduleKeys.applications,
    queryFn: listScheduleApplicationOptions,
  });

  const applicationNameMap = useMemo(
    () =>
      new Map(
        applicationOptions.map((application) => [application.id, application.companyName])
      ),
    [applicationOptions]
  );

  const { data: rawEvents = [], isLoading } = useQuery({
    queryKey: scheduleKeys.calendar(calendarParams),
    queryFn: () => listCalendarEvents(calendarParams),
  });

  const events = useMemo(
    () =>
      rawEvents.map((event) => ({
        ...event,
        applicationName:
          event.applicationId === null
            ? undefined
            : applicationNameMap.get(event.applicationId),
      })),
    [applicationNameMap, rawEvents]
  );

  const selectedEvent =
    events.find((event) => event.id === selectedEventId) ?? null;
  const editingEvent =
    events.find((event) => event.id === editingEventId) ?? null;

  const createEventMutation = useMutation({
    mutationFn: createScheduleEvent,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: ({
      eventId,
      payload,
    }: {
      eventId: string;
      payload: Parameters<typeof updateScheduleEvent>[1];
    }) => updateScheduleEvent(eventId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: deleteScheduleEvent,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
    },
  });

  const exportEventMutation = useMutation({
    mutationFn: (eventId: string) => downloadScheduleEventIcs(eventId),
  });

  function prevPeriod() {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (view === 'monthly') {
        next.setMonth(prev.getMonth() - 1);
      } else {
        next.setDate(prev.getDate() - 7);
      }
      return next;
    });
  }

  function nextPeriod() {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (view === 'monthly') {
        next.setMonth(prev.getMonth() + 1);
      } else {
        next.setDate(prev.getDate() + 7);
      }
      return next;
    });
  }

  function toggleFilter(category: ScheduleCategory) {
    setActiveFilters((prev) =>
      prev.includes(category)
        ? prev.filter((currentCategory) => currentCategory !== category)
        : [...prev, category]
    );
  }

  function getEventsForDate(date: Date) {
    const targetDate = toDateStr(date);
    return events.filter((event) => toLocalDateStr(event.startAt) === targetDate);
  }

  function openCreateModal(defaultDate?: string) {
    setSelectedEventId(null);
    setEditingEventId(null);
    setAddDefaultDate(defaultDate);
    setShowAddModal(true);
  }

  function closeModal() {
    setShowAddModal(false);
    setEditingEventId(null);
    setAddDefaultDate(undefined);
  }

  async function handleSaveEvent(form: EventFormValues, eventId?: string) {
    const startAt = combineToIso(form.date, form.allDay ? undefined : form.startTime);
    const endAt =
      form.allDay || !form.endTime ? null : combineToIso(form.date, form.endTime);

    if (endAt && new Date(endAt).getTime() < new Date(startAt).getTime()) {
      window.alert('종료 시간은 시작 시간보다 빠를 수 없습니다.');
      return;
    }

    try {
      if (eventId) {
        await updateEventMutation.mutateAsync({
          eventId,
          payload: mapEventFormToUpdatePayload(form),
        });
        setSelectedEventId(eventId);
        return;
      }

      await createEventMutation.mutateAsync(mapEventFormToCreatePayload(form));
    } catch (error) {
      window.alert(
        getApiErrorMessage(error, '일정 저장 중 오류가 발생했습니다.')
      );
      throw error;
    }
  }

  async function handleDeleteEvent(eventId: string) {
    const targetEvent = events.find((event) => event.id === eventId);

    if (!targetEvent) {
      return;
    }

    const shouldDelete = window.confirm(`"${targetEvent.title}" 일정을 삭제할까요?`);

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteEventMutation.mutateAsync(eventId);
      setSelectedEventId(null);
      setEditingEventId(null);
      setShowAddModal(false);
    } catch (error) {
      window.alert(
        getApiErrorMessage(error, '일정 삭제 중 오류가 발생했습니다.')
      );
      throw error;
    }
  }

  function handleEditEvent() {
    if (!selectedEvent) {
      return;
    }

    setEditingEventId(selectedEvent.id);
    setAddDefaultDate(undefined);
    setSelectedEventId(null);
    setShowAddModal(true);
  }

  function handleCellClick(date: Date) {
    openCreateModal(toDateStr(date));
  }

  async function handleExportEvent(eventId: string) {
    try {
      await exportEventMutation.mutateAsync(eventId);
    } catch (error) {
      window.alert(
        getApiErrorMessage(error, '일정 내보내기 중 오류가 발생했습니다.')
      );
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>취업 달력</h1>
          <div className={styles.navGroup}>
            <button className={styles.navBtn} onClick={prevPeriod} aria-label="이전">
              <ChevronLeft size={16} />
            </button>
            <span className={styles.monthLabel}>{formatHeaderLabel(view, currentDate)}</span>
            <button className={styles.navBtn} onClick={nextPeriod} aria-label="다음">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewBtn} ${view === 'monthly' ? styles.viewBtnActive : ''}`}
              onClick={() => setView('monthly')}
            >
              월간
            </button>
            <button
              className={`${styles.viewBtn} ${view === 'weekly' ? styles.viewBtnActive : ''}`}
              onClick={() => setView('weekly')}
            >
              주간
            </button>
          </div>

          <div className={styles.filters}>
            {CATEGORY_OPTIONS.map((category) => (
              <button
                key={category}
                className={`${styles.filterBtn} ${styles[`filter_${category}`]} ${
                  activeFilters.includes(category)
                    ? styles.filterActive
                    : styles.filterInactive
                }`}
                onClick={() => toggleFilter(category)}
              >
                {CATEGORY_LABELS[category]}
              </button>
            ))}
          </div>

          <button className={styles.addBtn} onClick={() => openCreateModal()}>
            <Plus size={16} />
            일정 추가
          </button>
        </div>
      </div>

      <div className={styles.calendarCard}>
        {isLoading ? (
          <div className={styles.emptyState}>일정을 불러오는 중입니다...</div>
        ) : view === 'monthly' ? (
          <MonthlyView
            days={monthDays}
            today={today}
            getEventsForDate={getEventsForDate}
            onEventClick={(event) => setSelectedEventId(event.id)}
            onCellClick={handleCellClick}
          />
        ) : (
          <WeeklyView
            days={weekDays}
            today={today}
            getEventsForDate={getEventsForDate}
            onEventClick={(event) => setSelectedEventId(event.id)}
            onCellClick={handleCellClick}
          />
        )}
      </div>

      {selectedEvent && (
        <EventDetailPopover
          event={selectedEvent}
          isExporting={exportEventMutation.isPending}
          onClose={() => setSelectedEventId(null)}
          onEdit={handleEditEvent}
          onDelete={() => void handleDeleteEvent(selectedEvent.id)}
          onExport={() => void handleExportEvent(selectedEvent.id)}
        />
      )}

      {showAddModal && (
        <AddEventModal
          defaultDate={addDefaultDate}
          initialEvent={editingEvent}
          applications={applicationOptions}
          mode={editingEvent ? 'edit' : 'create'}
          isSaving={
            createEventMutation.isPending ||
            updateEventMutation.isPending ||
            deleteEventMutation.isPending
          }
          onClose={closeModal}
          onSave={handleSaveEvent}
          onDelete={editingEvent ? handleDeleteEvent : undefined}
        />
      )}
    </div>
  );
}

interface MonthlyViewProps {
  days: { date: Date; isCurrentMonth: boolean }[];
  today: Date;
  getEventsForDate: (date: Date) => CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onCellClick: (date: Date) => void;
}

function MonthlyView({
  days,
  today,
  getEventsForDate,
  onEventClick,
  onCellClick,
}: MonthlyViewProps) {
  return (
    <div className={styles.monthGrid}>
      {DAYS_SHORT.map((day, index) => (
        <div
          key={day}
          className={`${styles.dayHeader} ${
            index === 0 ? styles.sunday : index === 6 ? styles.saturday : ''
          }`}
        >
          {day}
        </div>
      ))}

      {days.map(({ date, isCurrentMonth }, index) => {
        const dayEvents = getEventsForDate(date);
        const isToday = isSameDay(date, today);
        const dayOfWeek = index % 7;

        return (
          <div
            key={toDateStr(date)}
            className={`${styles.dayCell} ${!isCurrentMonth ? styles.dayCellOther : ''}`}
            onClick={() => onCellClick(date)}
          >
            <span
              className={`
                ${styles.dateNum}
                ${isToday ? styles.dateToday : ''}
                ${dayOfWeek === 0 && !isToday ? styles.sundayNum : ''}
                ${dayOfWeek === 6 && !isToday ? styles.saturdayNum : ''}
              `}
            >
              {date.getDate()}
            </span>
            <div className={styles.eventList}>
              {dayEvents.map((event) => (
                <button
                  key={event.id}
                  className={`${styles.eventPill} ${CATEGORY_COLORS[event.category]}`}
                  onClick={(clickEvent) => {
                    clickEvent.stopPropagation();
                    onEventClick(event);
                  }}
                  title={event.title}
                >
                  {event.title}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface WeeklyViewProps {
  days: Date[];
  today: Date;
  getEventsForDate: (date: Date) => CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onCellClick: (date: Date) => void;
}

function WeeklyView({
  days,
  today,
  getEventsForDate,
  onEventClick,
  onCellClick,
}: WeeklyViewProps) {
  return (
    <div className={styles.weekGrid}>
      {days.map((date, index) => {
        const dayEvents = getEventsForDate(date);
        const isToday = isSameDay(date, today);

        return (
          <div
            key={toDateStr(date)}
            className={`${styles.weekCol} ${
              index === 0 ? styles.weekColSun : index === 6 ? styles.weekColSat : ''
            }`}
          >
            <div className={styles.weekColHeader}>
              <span
                className={`${styles.weekDayName} ${
                  index === 0 ? styles.sunday : index === 6 ? styles.saturday : ''
                }`}
              >
                {DAYS_SHORT[index]}
              </span>
              <span className={`${styles.weekDateNum} ${isToday ? styles.dateToday : ''}`}>
                {date.getDate()}
              </span>
            </div>
            <div className={styles.weekEventArea} onClick={() => onCellClick(date)}>
              {dayEvents.map((event) => (
                <button
                  key={event.id}
                  className={`${styles.eventPill} ${CATEGORY_COLORS[event.category]} ${styles.eventPillFull}`}
                  onClick={(clickEvent) => {
                    clickEvent.stopPropagation();
                    onEventClick(event);
                  }}
                  title={event.title}
                >
                  <span className={styles.eventTime}>
                    {event.endAt ? toLocalTimeStr(event.startAt) : '종일'}
                  </span>
                  {event.title}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
