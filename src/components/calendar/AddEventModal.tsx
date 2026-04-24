'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import {
  CalendarEvent,
  NewEventForm,
  EVENT_TYPE_OPTIONS,
  CATEGORY_OPTIONS,
  DUMMY_COMPANIES,
} from './types';
import styles from './AddEventModal.module.scss';

interface AddEventModalProps {
  defaultDate?: string;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, 'id'>) => void;
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function AddEventModal({ defaultDate, onClose, onSave }: AddEventModalProps) {
  const [form, setForm] = useState<NewEventForm>({
    title: '',
    date: defaultDate ?? todayStr(),
    time: '',
    allDay: false,
    type: '기타',
    category: '내 프로세스',
    company: '',
    location: '',
    description: '',
  });

  function handleChange<K extends keyof NewEventForm>(key: K, value: NewEventForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.date) return;
    onSave({
      title: form.title.trim(),
      date: form.date,
      time: form.allDay ? undefined : form.time || undefined,
      allDay: form.allDay,
      category: form.category,
      type: form.type,
      company: form.company || undefined,
      location: form.location || undefined,
      description: form.description || undefined,
    });
    onClose();
  }

  return (
    <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal} role="dialog" aria-modal aria-labelledby="modal-title">
        <div className={styles.modalHeader}>
          <h2 id="modal-title" className={styles.modalTitle}>새 일정 추가</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="닫기">
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
              onChange={(e) => handleChange('title', e.target.value)}
              required
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
                onChange={(e) => handleChange('date', e.target.value)}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="event-time">시간</label>
              <input
                id="event-time"
                className={styles.input}
                type="time"
                value={form.time}
                onChange={(e) => handleChange('time', e.target.value)}
                disabled={form.allDay}
              />
            </div>
          </div>

          <div className={styles.field}>
            <div className={styles.toggleRow}>
              <label className={styles.label} htmlFor="event-allday">종일</label>
              <button
                id="event-allday"
                type="button"
                role="switch"
                aria-checked={form.allDay}
                className={`${styles.toggle} ${form.allDay ? styles.toggleOn : ''}`}
                onClick={() => handleChange('allDay', !form.allDay)}
              >
                <span className={styles.toggleThumb} />
              </button>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="event-type">일정 유형</label>
              <select
                id="event-type"
                className={styles.select}
                value={form.type}
                onChange={(e) => handleChange('type', e.target.value as NewEventForm['type'])}
              >
                {EVENT_TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="event-category">레이어</label>
              <select
                id="event-category"
                className={styles.select}
                value={form.category}
                onChange={(e) => handleChange('category', e.target.value as NewEventForm['category'])}
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="event-company">연결할 지원 회사 (선택)</label>
            <select
              id="event-company"
              className={styles.select}
              value={form.company}
              onChange={(e) => handleChange('company', e.target.value)}
            >
              <option value="">회사 선택</option>
              {DUMMY_COMPANIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="event-location">장소</label>
            <input
              id="event-location"
              className={styles.input}
              type="text"
              placeholder="장소를 입력하세요"
              value={form.location}
              onChange={(e) => handleChange('location', e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="event-desc">설명</label>
            <textarea
              id="event-desc"
              className={styles.textarea}
              placeholder="메모를 입력하세요"
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              취소
            </button>
            <button type="submit" className={styles.saveBtn}>
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
