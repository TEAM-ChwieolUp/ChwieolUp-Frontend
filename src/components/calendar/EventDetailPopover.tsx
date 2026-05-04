'use client';

import { Building2, Calendar, MapPin, X, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { CalendarEvent } from './types';
import styles from './EventDetailPopover.module.scss';

interface EventDetailPopoverProps {
  event: CalendarEvent;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const CATEGORY_LABEL: Record<string, string> = {
  '채용공고': '채용공고',
  '내 프로세스': '내 프로세스',
  '개인 일정': '개인 일정',
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default function EventDetailPopover({ event, onClose, onEdit, onDelete }: EventDetailPopoverProps) {
  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.popover}>
        <div className={styles.header}>
          <span className={`${styles.categoryBadge} ${styles[event.category.replace(' ', '_')]}`}>
            {CATEGORY_LABEL[event.category]}
          </span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="닫기">
            <X size={16} />
          </button>
        </div>

        <h3 className={styles.title}>{event.title}</h3>

        <div className={styles.meta}>
          <div className={styles.metaRow}>
            <Calendar size={14} className={styles.metaIcon} />
            <span>
              {formatDate(event.date)}
              {event.time ? ` · ${event.time}` : ''}
              {event.allDay ? ' · 종일' : ''}
            </span>
          </div>

          {event.company && (
            <div className={styles.metaRow}>
              <Building2 size={14} className={styles.metaIcon} />
              <span>{event.company}</span>
            </div>
          )}

          {event.location && (
            <div className={styles.metaRow}>
              <MapPin size={14} className={styles.metaIcon} />
              <span>{event.location}</span>
            </div>
          )}
        </div>

        {event.type && (
          <span className={styles.typeTag}>{event.type}</span>
        )}

        {event.description && (
          <p className={styles.description}>{event.description}</p>
        )}

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

        <button type="button" className={styles.gcalBtn}>
          <ExternalLink size={14} />
          Google Calendar에 추가
        </button>
      </div>
    </>
  );
}
