'use client';

import { useMemo, useState } from 'react';
import { CalendarDays, Tag as TagIcon, Trash2, X } from 'lucide-react';
import {
  KanbanCard,
  KanbanFormValues,
  KanbanStage,
  Tag,
} from './types';
import styles from './AddApplicationModal.module.scss';

interface AddApplicationModalProps {
  card?: KanbanCard | null;
  defaultStageId?: string;
  stages: KanbanStage[];
  tagOptions: Tag[];
  onClose: () => void;
  onCreateTag: (name: string) => Promise<Tag>;
  onSave: (card: Omit<KanbanCard, 'id'>, existingId?: string) => Promise<void>;
  onDelete?: (cardId: string) => Promise<void>;
  isSaving?: boolean;
}

const EMPTY_FORM: KanbanFormValues = {
  company: '',
  position: '',
  appliedDate: '',
  stageId: '',
  tags: [],
  nextAction: '',
  noResponseDays: '',
  finalResult: null,
  memo: '',
};

function toInputDate(value?: string): string {
  if (!value) return '';
  if (value.includes('T')) return value.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);

  const [month, day] = value.split('/').map(Number);
  if (!month || !day) return '';

  const year = new Date().getFullYear();
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatDate(raw: string): string {
  if (!raw) return '';
  const date = new Date(raw);

  if (Number.isNaN(date.getTime())) {
    return raw;
  }

  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export default function AddApplicationModal({
  card,
  defaultStageId,
  stages,
  tagOptions,
  onClose,
  onCreateTag,
  onSave,
  onDelete,
  isSaving = false,
}: AddApplicationModalProps) {
  const isEditMode = Boolean(card);

  const stageOptions = useMemo(() => stages, [stages]);
  const initialForm = useMemo<KanbanFormValues>(() => {
    if (card) {
      return {
        company: card.company,
        position: card.position,
        appliedDate: toInputDate(card.appliedAt ?? card.appliedDate),
        stageId: card.stageId,
        tags: card.tags,
        nextAction: card.nextAction ?? '',
        noResponseDays:
          card.noResponseDays !== undefined ? String(card.noResponseDays) : '',
        finalResult: card.finalResult ?? null,
        memo: card.memo ?? '',
      };
    }

    return {
      ...EMPTY_FORM,
      stageId: defaultStageId ?? stageOptions[0]?.id ?? '',
    };
  }, [card, defaultStageId, stageOptions]);
  const [form, setForm] = useState<KanbanFormValues>(initialForm);
  const [tagInput, setTagInput] = useState('');
  const selectedStage = stageOptions.find((stage) => stage.id === form.stageId);
  const fixedStageResult =
    selectedStage?.kind === 'passed'
      ? '합격'
      : selectedStage?.kind === 'rejected'
        ? '불합격'
        : null;

  function handleChange<K extends keyof KanbanFormValues>(
    key: K,
    value: KanbanFormValues[K]
  ) {
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

  async function handleCreateTag() {
    const nextTag = tagInput.trim();
    if (!nextTag) return;

    try {
      const createdTag = await onCreateTag(nextTag);
      setForm((prev) => ({
        ...prev,
        tags: prev.tags.includes(createdTag) ? prev.tags : [...prev.tags, createdTag],
      }));
      setTagInput('');
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : '태그 생성 중 오류가 발생했습니다.',
      );
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.company.trim() || !form.position.trim() || !form.appliedDate) return;

    await onSave(
      {
        company: form.company.trim(),
        position: form.position.trim(),
        appliedDate: formatDate(form.appliedDate),
        appliedAt: form.appliedDate,
        stageId: form.stageId,
        tags: form.tags,
        nextAction: form.nextAction.trim() || undefined,
        noResponseDays: form.noResponseDays
          ? Number(form.noResponseDays)
          : undefined,
        finalResult: fixedStageResult ?? null,
        memo: form.memo.trim() || undefined,
      },
      card?.id
    );
    onClose();
  }

  return (
    <div
      className={styles.overlay}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={styles.drawer} role="dialog" aria-modal aria-labelledby="modal-title">
        <div className={styles.drawerHeader}>
          <div className={styles.drawerHeading}>
            <span className={styles.modalEyebrow}>
              {isEditMode ? '지원 상세' : '지원 추가'}
            </span>
            <h2 id="modal-title" className={styles.modalTitle}>
              {isEditMode ? card?.company : '새 지원 카드'}
            </h2>
            <p className={styles.modalDescription}>
              {isEditMode
                ? '지원 정보를 확인하고 바로 수정할 수 있습니다.'
                : '지원 정보를 입력해 보드에 새로운 카드를 추가하세요.'}
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="닫기" disabled={isSaving}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.metaRow}>
          <span className={styles.metaChip}>{selectedStage?.name ?? '단계 선택'}</span>
          <span className={styles.metaItem}>
            <CalendarDays size={14} />
            지원일 {form.appliedDate ? formatDate(form.appliedDate) : '미입력'}
          </span>
          <span className={styles.metaItem}>
            <TagIcon size={14} />
            태그 {form.tags.length}개
          </span>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>기본 정보</h3>
            </div>

          <div className={styles.grid}>
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
                placeholder="지원한 직무 또는 역할"
                value={form.position}
                onChange={(e) => handleChange('position', e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.grid}>
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
                  value={form.stageId}
                  onChange={(e) => handleChange('stageId', e.target.value)}
                >
                  {stageOptions.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>진행 상태</h3>
            </div>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="nextAction">다음 액션</label>
              <input
                id="nextAction"
                className={styles.input}
                type="text"
                placeholder="예: 1차 면접 준비, 포트폴리오 보완"
                value={form.nextAction}
                onChange={(e) => handleChange('nextAction', e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="noResponseDays">무응답 일수</label>
              <input
                id="noResponseDays"
                className={styles.input}
                type="number"
                min="0"
                placeholder="예: 14"
                value={form.noResponseDays}
                onChange={(e) => handleChange('noResponseDays', e.target.value)}
              />
            </div>
          </div>
          </section>

          {fixedStageResult && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>최종 결과</h3>
              </div>
              <div className={styles.field}>
                <div className={styles.resultButtons}>
                  <button
                    type="button"
                    className={`${styles.resultBtn} ${styles.resultBtnActive}`}
                    disabled
                  >
                    {fixedStageResult}
                  </button>
                </div>
              </div>
            </section>
          )}

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>태그 및 메모</h3>
            </div>
            <div className={styles.field}>
            <div className={styles.tagGrid}>
              {tagOptions.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`${styles.tagBtn} ${
                    form.tags.includes(tag) ? styles.tagBtnActive : ''
                  }`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className={styles.tagComposer}>
              <input
                className={styles.input}
                type="text"
                placeholder="커스텀 태그 추가"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    void handleCreateTag();
                  }
                }}
              />
              <button
                type="button"
                className={styles.addTagBtn}
                onClick={() => void handleCreateTag()}
                disabled={isSaving}
              >
                태그 추가
              </button>
            </div>
            {form.tags.length > 0 && (
              <div className={styles.selectedTags}>
                {form.tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={styles.selectedTag}
                    onClick={() => toggleTag(tag)}
                  >
                    #{tag}
                    <span>삭제</span>
                  </button>
                ))}
              </div>
            )}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="memo">메모</label>
            <textarea
              id="memo"
              className={styles.textarea}
              placeholder="면접 준비 포인트나 기록해둘 메모를 남겨보세요"
              value={form.memo}
              onChange={(e) => handleChange('memo', e.target.value)}
              rows={5}
            />
            </div>
          </section>

          <div className={styles.footer}>
            {card && onDelete && (
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={async () => {
                  await onDelete(card.id);
                  onClose();
                }}
                disabled={isSaving}
              >
                <Trash2 size={16} />
                카드 삭제
              </button>
            )}

            <div className={styles.actionGroup}>
              <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={isSaving}>
                닫기
              </button>
              <button type="submit" className={styles.saveBtn} disabled={isSaving}>
                {isEditMode ? '변경 저장' : '카드 추가'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
