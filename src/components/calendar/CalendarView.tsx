'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { CalendarEvent, EventCategory } from './types';
import { dummyEvents } from './dummyData';
import EventDetailPopover from './EventDetailPopover';
import AddEventModal from './AddEventModal';
import styles from './CalendarView.module.scss';

type ViewMode = 'monthly' | 'weekly';

const DAYS_SHORT = ['일', '월', '화', '수', '목', '금', '토'];

const CATEGORY_COLORS: Record<EventCategory, string> = {
  '채용공고': styles.eventBlue,
  '내 프로세스': styles.eventGreen,
  '개인 일정': styles.eventOrange,
};

function toDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay();

  const days: { date: Date; isCurrentMonth: boolean }[] = [];

  for (let i = startOffset - 1; i >= 0; i--) {
    days.push({ date: new Date(year, month, -i), isCurrentMonth: false });
  }
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push({ date: new Date(year, month, i), isCurrentMonth: true });
  }
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
  }

  return days;
}

function getWeekDays(year: number, month: number, baseDate: Date) {
  const dow = baseDate.getDay();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() - dow + i);
    return d;
  });
}

const ALL_CATEGORIES: EventCategory[] = ['채용공고', '내 프로세스', '개인 일정'];

export default function CalendarView() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [view, setView] = useState<ViewMode>('monthly');
  const [activeFilters, setActiveFilters] = useState<EventCategory[]>([...ALL_CATEGORIES]);
  const [events, setEvents] = useState<CalendarEvent[]>(dummyEvents);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addDefaultDate, setAddDefaultDate] = useState<string | undefined>(undefined);

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  function toggleFilter(cat: EventCategory) {
    setActiveFilters(prev =>
      prev.includes(cat)
        ? prev.filter(c => c !== cat)
        : [...prev, cat]
    );
  }

  function getEventsForDate(date: Date) {
    const str = toDateStr(date);
    return events.filter(e => e.date === str && activeFilters.includes(e.category));
  }

  function openCreateModal(defaultDate?: string) {
    setSelectedEvent(null);
    setEditingEvent(null);
    setAddDefaultDate(defaultDate);
    setShowAddModal(true);
  }

  function closeModal() {
    setShowAddModal(false);
    setEditingEvent(null);
    setAddDefaultDate(undefined);
  }

  function handleSaveEvent(event: Omit<CalendarEvent, 'id'>) {
    if (editingEvent) {
      const updatedEvent = { ...editingEvent, ...event };
      setEvents(prev => prev.map(item => (item.id === editingEvent.id ? updatedEvent : item)));
      setSelectedEvent(updatedEvent);
      closeModal();
      return;
    }

    const newEvent = { ...event, id: String(Date.now()) };
    setEvents(prev => [...prev, newEvent]);
    setSelectedEvent(newEvent);
    closeModal();
  }

  function handleDeleteEvent(eventId: string) {
    const targetEvent = events.find(event => event.id === eventId);
    if (!targetEvent) return;

    const shouldDelete = window.confirm(`"${targetEvent.title}" 일정을 삭제할까요?`);
    if (!shouldDelete) return;

    setEvents(prev => prev.filter(event => event.id !== eventId));
    setSelectedEvent(prev => (prev?.id === eventId ? null : prev));

    if (editingEvent?.id === eventId) {
      closeModal();
    }
  }

  function handleEditEvent() {
    if (!selectedEvent) return;

    setEditingEvent(selectedEvent);
    setAddDefaultDate(undefined);
    setSelectedEvent(null);
    setShowAddModal(true);
  }

  function handleCellClick(date: Date) {
    openCreateModal(toDateStr(date));
  }

  const monthDays = getMonthDays(year, month);
  const weekDays = getWeekDays(year, month, today);

  return (
    <div className={styles.wrapper}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>취업 달력</h1>
          <div className={styles.navGroup}>
            <button className={styles.navBtn} onClick={prevMonth} aria-label="이전 달">
              <ChevronLeft size={16} />
            </button>
            <span className={styles.monthLabel}>{year}년 {month + 1}월</span>
            <button className={styles.navBtn} onClick={nextMonth} aria-label="다음 달">
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
            {ALL_CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`${styles.filterBtn} ${styles[`filter_${cat.replace(/\s/g, '_')}`]} ${activeFilters.includes(cat) ? styles.filterActive : styles.filterInactive}`}
                onClick={() => toggleFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <button className={styles.addBtn} onClick={() => openCreateModal()}>
            <Plus size={16} />
            일정 추가
          </button>
        </div>
      </div>

      {/* ── Calendar Body ── */}
      <div className={styles.calendarCard}>
        {view === 'monthly' ? (
          <MonthlyView
            days={monthDays}
            today={today}
            getEventsForDate={getEventsForDate}
            onEventClick={setSelectedEvent}
            onCellClick={handleCellClick}
          />
        ) : (
          <WeeklyView
            days={weekDays}
            today={today}
            getEventsForDate={getEventsForDate}
            onEventClick={setSelectedEvent}
            onCellClick={handleCellClick}
          />
        )}
      </div>

      {/* ── Event Detail Popover ── */}
      {selectedEvent && (
        <EventDetailPopover
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onEdit={handleEditEvent}
          onDelete={() => handleDeleteEvent(selectedEvent.id)}
        />
      )}

      {/* ── Add Event Modal ── */}
      {showAddModal && (
        <AddEventModal
          defaultDate={addDefaultDate}
          initialEvent={editingEvent}
          mode={editingEvent ? 'edit' : 'create'}
          onClose={closeModal}
          onSave={handleSaveEvent}
          onDelete={editingEvent ? () => handleDeleteEvent(editingEvent.id) : undefined}
        />
      )}
    </div>
  );
}

// ── Monthly Grid ──

interface MonthlyViewProps {
  days: { date: Date; isCurrentMonth: boolean }[];
  today: Date;
  getEventsForDate: (date: Date) => CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onCellClick: (date: Date) => void;
}

function MonthlyView({ days, today, getEventsForDate, onEventClick, onCellClick }: MonthlyViewProps) {
  return (
    <div className={styles.monthGrid}>
      {/* Day headers */}
      {DAYS_SHORT.map((d, i) => (
        <div
          key={d}
          className={`${styles.dayHeader} ${i === 0 ? styles.sunday : i === 6 ? styles.saturday : ''}`}
        >
          {d}
        </div>
      ))}

      {/* Day cells */}
      {days.map(({ date, isCurrentMonth }, idx) => {
        const dayEvents = getEventsForDate(date);
        const isToday = isSameDay(date, today);
        const dow = idx % 7;

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
                ${dow === 0 && !isToday ? styles.sundayNum : ''}
                ${dow === 6 && !isToday ? styles.saturdayNum : ''}
              `}
            >
              {date.getDate()}
            </span>
            <div className={styles.eventList}>
              {dayEvents.map(ev => (
                <button
                  key={ev.id}
                  className={`${styles.eventPill} ${CATEGORY_COLORS[ev.category]}`}
                  onClick={(e) => { e.stopPropagation(); onEventClick(ev); }}
                  title={ev.title}
                >
                  {ev.title}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Weekly View ──

interface WeeklyViewProps {
  days: Date[];
  today: Date;
  getEventsForDate: (date: Date) => CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onCellClick: (date: Date) => void;
}

function WeeklyView({ days, today, getEventsForDate, onEventClick, onCellClick }: WeeklyViewProps) {
  return (
    <div className={styles.weekGrid}>
      {days.map((date, i) => {
        const dayEvents = getEventsForDate(date);
        const isToday = isSameDay(date, today);

        return (
          <div
            key={toDateStr(date)}
            className={`${styles.weekCol} ${i === 0 ? styles.weekColSun : i === 6 ? styles.weekColSat : ''}`}
          >
            <div className={styles.weekColHeader}>
              <span className={`${styles.weekDayName} ${i === 0 ? styles.sunday : i === 6 ? styles.saturday : ''}`}>
                {DAYS_SHORT[i]}
              </span>
              <span className={`${styles.weekDateNum} ${isToday ? styles.dateToday : ''}`}>
                {date.getDate()}
              </span>
            </div>
            <div
              className={styles.weekEventArea}
              onClick={() => onCellClick(date)}
            >
              {dayEvents.map(ev => (
                <button
                  key={ev.id}
                  className={`${styles.eventPill} ${CATEGORY_COLORS[ev.category]} ${styles.eventPillFull}`}
                  onClick={(e) => { e.stopPropagation(); onEventClick(ev); }}
                  title={ev.title}
                >
                  <span className={styles.eventTime}>{ev.time ?? '종일'}</span>
                  {ev.title}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
