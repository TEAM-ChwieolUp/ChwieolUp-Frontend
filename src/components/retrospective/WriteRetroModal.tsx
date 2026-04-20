'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import {
  Retrospective,
  NewRetroForm,
  STAGE_OPTIONS,
  STAGE_COLORS,
  RetroStage,
  RetroSection,
} from './types';
import styles from './WriteRetroModal.module.scss';

interface WriteRetroModalProps {
  initial?: Retrospective;
  onClose: () => void;
  onSave: (retro: Omit<Retrospective, 'id'>) => void;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function WriteRetroModal({ initial, onClose, onSave }: WriteRetroModalProps) {
  const [form, setForm] = useState<NewRetroForm>({
    company: initial?.company ?? '',
    position: initial?.position ?? '',
    stage: initial?.stage ?? '서류',
    date: initial?.date ?? todayStr(),
    question: initial?.question ?? '',
    answer: initial?.answer ?? '',
    reflection: initial?.reflection ?? '',
    feeling: initial?.feeling ?? '',
    extraSections: initial?.extraSections ?? [],
  });
  const [newSectionTitle, setNewSectionTitle] = useState('');

  function handleChange<K extends keyof NewRetroForm>(key: K, value: NewRetroForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addExtraSection() {
    if (!newSectionTitle.trim()) return;
    const section: RetroSection = {
      id: String(Date.now()),
      title: newSectionTitle.trim(),
      content: '',
    };
    setForm((prev) => ({ ...prev, extraSections: [...prev.extraSections, section] }));
    setNewSectionTitle('');
  }

  function updateExtraSection(id: string, content: string) {
    setForm((prev) => ({
      ...prev,
      extraSections: prev.extraSections.map((s) => (s.id === id ? { ...s, content } : s)),
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.company.trim() || !form.position.trim()) return;
    onSave({ ...form });
    onClose();
  }

  const stageColor = STAGE_COLORS[form.stage];

  return (
    <div
      className={styles.overlay}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={styles.modal} role="dialog" aria-modal aria-labelledby="retro-modal-title">
        <div className={styles.modalHeader}>
          <h2 id="retro-modal-title" className={styles.modalTitle}>
            {initial ? '회고 수정' : '새 회고 작성'}
          </h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="닫기">
            <X size={18} />
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="retro-company">회사명 *</label>
              <input
                id="retro-company"
                className={styles.input}
                type="text"
                placeholder="네이버"
                value={form.company}
                onChange={(e) => handleChange('company', e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="retro-position">포지션 *</label>
              <input
                id="retro-position"
                className={styles.input}
                type="text"
                placeholder="프론트엔드 개발자"
                value={form.position}
                onChange={(e) => handleChange('position', e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="retro-stage">단계</label>
              <div className={styles.stageSelectWrap}>
                <span
                  className={styles.stageDot}
                  style={{ background: stageColor.text }}
                />
                <select
                  id="retro-stage"
                  className={styles.select}
                  value={form.stage}
                  onChange={(e) => handleChange('stage', e.target.value as RetroStage)}
                >
                  {STAGE_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="retro-date">날짜</label>
              <input
                id="retro-date"
                className={styles.input}
                type="date"
                value={form.date}
                onChange={(e) => handleChange('date', e.target.value)}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="retro-question">질문/과제 내용</label>
            <textarea
              id="retro-question"
              className={styles.textarea}
              placeholder="어떤 질문을 받았거나 어떤 과제를 수행했나요?"
              value={form.question}
              onChange={(e) => handleChange('question', e.target.value)}
              rows={3}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="retro-answer">내 답변/대응</label>
            <textarea
              id="retro-answer"
              className={styles.textarea}
              placeholder="어떻게 답변하거나 대응했나요?"
              value={form.answer}
              onChange={(e) => handleChange('answer', e.target.value)}
              rows={3}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="retro-reflection">반성 및 개선점</label>
            <textarea
              id="retro-reflection"
              className={styles.textarea}
              placeholder="무엇을 개선할 수 있을까요?"
              value={form.reflection}
              onChange={(e) => handleChange('reflection', e.target.value)}
              rows={3}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="retro-feeling">감정/느낌</label>
            <textarea
              id="retro-feeling"
              className={styles.textarea}
              placeholder="어떤 기분이 들었나요?"
              value={form.feeling}
              onChange={(e) => handleChange('feeling', e.target.value)}
              rows={2}
            />
          </div>

          {/* 추가 항목 */}
          {form.extraSections.map((section) => (
            <div key={section.id} className={styles.field}>
              <label className={styles.label}>{section.title}</label>
              <textarea
                className={styles.textarea}
                value={section.content}
                onChange={(e) => updateExtraSection(section.id, e.target.value)}
                rows={2}
              />
            </div>
          ))}

          <div className={styles.addSectionRow}>
            <input
              className={styles.sectionInput}
              type="text"
              placeholder="항목 이름 (예: 회사 분위기)"
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addExtraSection(); } }}
            />
            <button type="button" className={styles.addSectionBtn} onClick={addExtraSection}>
              <Plus size={14} />
              추가
            </button>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>취소</button>
            <button type="submit" className={styles.saveBtn}>작성 완료</button>
          </div>
        </form>
      </div>
    </div>
  );
}
