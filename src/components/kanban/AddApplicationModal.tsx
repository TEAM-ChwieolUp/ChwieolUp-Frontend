'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { KanbanCard, NewCardForm, ALL_STAGES, ALL_TAGS, Tag, KanbanStage } from './types';
import styles from './AddApplicationModal.module.scss';

interface AddApplicationModalProps {
  defaultStage?: KanbanStage;
  onClose: () => void;
  onSave: (card: Omit<KanbanCard, 'id'>) => void;
}

export default function AddApplicationModal({
  defaultStage = '지원완료',
  onClose,
  onSave,
}: AddApplicationModalProps) {
  const [form, setForm] = useState<NewCardForm>({
    company: '',
    position: '',
    appliedDate: '',
    stage: defaultStage,
    tags: [],
    nextAction: '',
  });

  function handleChange<K extends keyof NewCardForm>(key: K, value: NewCardForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleTag(tag: Tag) {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  }

  function formatDate(raw: string): string {
    if (!raw) return '';
    const d = new Date(raw);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.company.trim() || !form.position.trim() || !form.appliedDate) return;
    onSave({
      company: form.company.trim(),
      position: form.position.trim(),
      appliedDate: formatDate(form.appliedDate),
      stage: form.stage,
      tags: form.tags,
      nextAction: form.nextAction.trim() || undefined,
      finalResult: null,
    });
    onClose();
  }

  return (
    <div
      className={styles.overlay}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={styles.modal} role="dialog" aria-modal aria-labelledby="modal-title">
        <div className={styles.modalHeader}>
          <h2 id="modal-title" className={styles.modalTitle}>새 지원 추가</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="닫기">
            <X size={18} />
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="company">회사명</label>
            <input
              id="company"
              className={styles.input}
              type="text"
              placeholder="회사명을 입력하세요"
              value={form.company}
              onChange={(e) => handleChange('company', e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="position">포지션</label>
            <input
              id="position"
              className={styles.input}
              type="text"
              placeholder="포지션을 입력하세요"
              value={form.position}
              onChange={(e) => handleChange('position', e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="appliedDate">지원일</label>
            <input
              id="appliedDate"
              className={styles.input}
              type="date"
              value={form.appliedDate}
              onChange={(e) => handleChange('appliedDate', e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="stage">진행 단계</label>
            <div className={styles.stageSelect}>
              <select
                id="stage"
                className={styles.select}
                value={form.stage}
                onChange={(e) => handleChange('stage', e.target.value as KanbanStage)}
              >
                {ALL_STAGES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>태그</label>
            <div className={styles.tagGrid}>
              {ALL_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`${styles.tagBtn} ${form.tags.includes(tag) ? styles.tagBtnActive : ''}`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="nextAction">다음 액션 (선택)</label>
            <input
              id="nextAction"
              className={styles.input}
              type="text"
              placeholder="예: 서류 결과 대기"
              value={form.nextAction}
              onChange={(e) => handleChange('nextAction', e.target.value)}
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
