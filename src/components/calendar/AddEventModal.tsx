'use client';

import { X } from 'lucide-react';
import { useMemo, useState } from 'react';
import type {
  CalendarApplicationOption,
  CalendarEvent,
  EventFormValues,
} from './types';
import {
  CATEGORY_DESCRIPTIONS,
  CATEGORY_LABELS,
  CATEGORY_OPTIONS,
} from './types';
import styles from './AddEventModal.module.scss';

interface AddEventModalProps {
  defaultDate?: string;
  initialEvent?: CalendarEvent | null;
  applications: CalendarApplicationOption[];
  mode?: 'create' | 'edit';
  isSaving?: boolean;
  onClose: () => void;
  onSave: (event: EventFormValues, eventId?: string) => Promise<void>;
  onDelete?: (eventId: string) => Promise<void>;
}

function todayStr() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;
}

function toInputDate(isoDate: string) {
  const date = new Date(isoDate);

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;
}

function toInputTime(isoDate?: string | null) {
  if (!isoDate) {
    return '';
  }

  const date = new Date(isoDate);

  return `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes()
  ).padStart(2, '0')}`;
}

function createInitialForm(
  defaultDate?: string,
  initialEvent?: CalendarEvent | null
): EventFormValues {
  if (initialEvent) {
    const hasEndTime = Boolean(initialEvent.endAt);

    return {
      title: initialEvent.title,
      date: toInputDate(initialEvent.startAt),
      startTime: toInputTime(initialEvent.startAt),
      endTime: toInputTime(initialEvent.endAt),
      allDay: !hasEndTime,
      category: initialEvent.category,
      applicationId: initialEvent.applicationId ?? '',
    };
  }

  return {
    title: '',
    date: defaultDate ?? todayStr(),
    startTime: '09:00',
    endTime: '10:00',
    allDay: false,
    category: 'PERSONAL',
    applicationId: '',
  };
}

export default function AddEventModal({
  defaultDate,
  initialEvent = null,
  applications,
  mode = 'create',
  isSaving = false,
  onClose,
  onSave,
  onDelete,
}: AddEventModalProps) {
  const [form, setForm] = useState<EventFormValues>(() =>
    createInitialForm(defaultDate, initialEvent)
  );
  const isEditMode = mode === 'edit';
  const categoryRequiresApplication = form.category !== 'PERSONAL';
  const applicationOptions = useMemo(() => applications, [applications]);

  function handleChange<K extends keyof EventFormValues>(
    key: K,
    value: EventFormValues[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
      ...(key === 'category' && value === 'PERSONAL' ? { applicationId: '' } : {}),
    }));
  }

  function handleAllDayToggle() {
    setForm((prev) => ({
      ...prev,
      allDay: !prev.allDay,
      endTime: prev.allDay ? prev.endTime || '18:00' : '',
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!form.title.trim() || !form.date) {
      return;
    }

    if (categoryRequiresApplication && !form.applicationId) {
      window.alert('이 카테고리는 연결할 지원 카드를 선택해야 합니다.');
      return;
    }

    await onSave(form, initialEvent?.id);
    onClose();
  }

  return (
    <div
      className={styles.overlay}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={styles.modal} role="dialog" aria-modal aria-labelledby="modal-title">
        <div className={styles.modalHeader}>
          <div className={styles.headerCopy}>
            <span className={styles.modalEyebrow}>{isEditMode ? '일정 수정' : '일정 추가'}</span>
            <h2 id="modal-title" className={styles.modalTitle}>
              {isEditMode ? '등록된 일정을 편집해보세요' : '새 일정을 등록해보세요'}
            </h2>
            <p className={styles.modalSubtitle}>
              {isEditMode
                ? '제목과 시간을 수정할 수 있습니다. 카테고리와 연결 카드는 재생성으로 바꿔주세요.'
                : CATEGORY_DESCRIPTIONS[form.category]}
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="닫기" disabled={isSaving}>
            <X size={18} />
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="event-title">제목</label>
            <input
              id="event-title"
              className={styles.input}
              type="text"
              placeholder="일정 제목을 입력하세요"
              value={form.title}
              onChange={(event) => handleChange('title', event.target.value)}
              required
              disabled={isSaving}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="event-date">날짜</label>
              <input
                id="event-date"
                className={styles.input}
                type="date"
                value={form.date}
                onChange={(event) => handleChange('date', event.target.value)}
                required
                disabled={isSaving}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="event-start-time">시작 시간</label>
              <input
                id="event-start-time"
                className={styles.input}
                type="time"
                value={form.startTime}
                onChange={(event) => handleChange('startTime', event.target.value)}
                disabled={form.allDay || isSaving}
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <div className={styles.toggleRow}>
                <label className={styles.label} htmlFor="event-allday">종일</label>
                <button
                  id="event-allday"
                  type="button"
                  role="switch"
                  aria-checked={form.allDay}
                  className={`${styles.toggle} ${form.allDay ? styles.toggleOn : ''}`}
                  onClick={handleAllDayToggle}
                  disabled={isSaving}
                >
                  <span className={styles.toggleThumb} />
                </button>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="event-end-time">종료 시간</label>
              <input
                id="event-end-time"
                className={styles.input}
                type="time"
                value={form.endTime}
                onChange={(event) => handleChange('endTime', event.target.value)}
                disabled={form.allDay || isSaving}
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="event-category">카테고리</label>
              <select
                id="event-category"
                className={styles.select}
                value={form.category}
                onChange={(event) =>
                  handleChange('category', event.target.value as EventFormValues['category'])
                }
                disabled={isEditMode || isSaving}
              >
                {CATEGORY_OPTIONS.map((category) => (
                  <option key={category} value={category}>
                    {CATEGORY_LABELS[category]}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="event-application">
                연결할 지원 카드
              </label>
              <select
                id="event-application"
                className={styles.select}
                value={form.applicationId}
                onChange={(event) => handleChange('applicationId', event.target.value)}
                disabled={!categoryRequiresApplication || isEditMode || isSaving}
              >
                <option value="">
                  {categoryRequiresApplication ? '지원 카드 선택' : '개인 일정은 연결 없음'}
                </option>
                {applicationOptions.map((application) => (
                  <option key={application.id} value={application.id}>
                    {application.companyName} · {application.position}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.actions}>
            {isEditMode && onDelete && initialEvent ? (
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={async () => {
                  await onDelete(initialEvent.id);
                  onClose();
                }}
                disabled={isSaving}
              >
                일정 삭제
              </button>
            ) : (
              <span />
            )}
            <div className={styles.actionGroup}>
              <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={isSaving}>
                취소
              </button>
              <button type="submit" className={styles.saveBtn} disabled={isSaving}>
                {isEditMode ? '수정 완료' : '저장'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
