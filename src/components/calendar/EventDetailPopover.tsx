'use client';

import { Building2, Calendar, Download, Pencil, Trash2, X } from 'lucide-react';
import { CalendarEvent, CATEGORY_LABELS } from './types';
import styles from './EventDetailPopover.module.scss';

interface EventDetailPopoverProps {
  event: CalendarEvent;
  isExporting?: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onExport: () => void;
}

function formatDateTime(startAt: string, endAt?: string | null) {
  const start = new Date(startAt);
  const sameDay =
    endAt &&
    new Date(endAt).toDateString() === start.toDateString();

  const base = `${start.getFullYear()}년 ${start.getMonth() + 1}월 ${start.getDate()}일`;
  const startTime = `${String(start.getHours()).padStart(2, '0')}:${String(
    start.getMinutes()
  ).padStart(2, '0')}`;

  if (!endAt) {
    return `${base} · 종일`;
  }

  const end = new Date(endAt);
  const endTime = `${String(end.getHours()).padStart(2, '0')}:${String(
    end.getMinutes()
  ).padStart(2, '0')}`;

  if (sameDay) {
    return `${base} · ${startTime} - ${endTime}`;
  }

  return `${base} · ${startTime} ~ ${end.getFullYear()}년 ${end.getMonth() + 1}월 ${end.getDate()}일 ${endTime}`;
}

export default function EventDetailPopover({
  event,
  isExporting = false,
  onClose,
  onEdit,
  onDelete,
  onExport,
}: EventDetailPopoverProps) {
  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.popover}>
        <div className={styles.header}>
          <span className={`${styles.categoryBadge} ${styles[event.category]}`}>
            {CATEGORY_LABELS[event.category]}
          </span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="닫기">
            <X size={16} />
          </button>
        </div>

        <h3 className={styles.title}>{event.title}</h3>

        <div className={styles.meta}>
          <div className={styles.metaRow}>
            <Calendar size={14} className={styles.metaIcon} />
            <span>{formatDateTime(event.startAt, event.endAt)}</span>
          </div>

          {event.applicationName && (
            <div className={styles.metaRow}>
              <Building2 size={14} className={styles.metaIcon} />
              <span>{event.applicationName}</span>
            </div>
          )}
        </div>

        <div className={styles.actionRow}>
          <button type="button" className={styles.secondaryBtn} onClick={onEdit}>
            <Pencil size={14} />
            수정
          </button>
          <button type="button" className={styles.dangerBtn} onClick={onDelete}>
            <Trash2 size={14} />
            삭제
          </button>
        </div>

        <button
          type="button"
          className={styles.gcalBtn}
          onClick={onExport}
          disabled={isExporting}
        >
          <Download size={14} />
          {isExporting ? '내보내는 중...' : 'iCalendar로 내보내기'}
        </button>
      </div>
    </>
  );
}
