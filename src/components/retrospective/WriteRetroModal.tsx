'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Sparkles, Trash2, X } from 'lucide-react';
import { KanbanStage } from '@/components/kanban/types';
import {
  RetrospectiveDetail,
  RetrospectiveEditorForm,
  RetrospectiveItem,
  RetrospectiveTemplate,
} from './types';
import styles from './WriteRetroModal.module.scss';

interface ApplicationOption {
  id: string;
  company: string;
  position: string;
}

interface WriteRetroModalProps {
  initial?: RetrospectiveDetail;
  applications: ApplicationOption[];
  stages: KanbanStage[];
  templates: RetrospectiveTemplate[];
  isSaving?: boolean;
  onClose: () => void;
  onSave: (form: RetrospectiveEditorForm, retrospectiveId?: string) => Promise<void>;
  onApplyTemplate?: (retrospectiveId: string, templateId: string) => Promise<RetrospectiveItem[]>;
  onGenerateAiQuestions: (applicationId: string, stageId?: string) => Promise<string[]>;
}

function createEmptyItem(): RetrospectiveItem {
  return {
    question: '',
    answer: '',
  };
}

function createFormState(
  initial: RetrospectiveDetail | undefined,
  applications: ApplicationOption[]
): RetrospectiveEditorForm {
  return {
    applicationId: initial?.applicationId ?? applications[0]?.id ?? '',
    stageId: initial?.stageId ?? '',
    items: initial?.items.length ? initial.items : [createEmptyItem()],
  };
}

export default function WriteRetroModal({
  initial,
  applications,
  stages,
  templates,
  isSaving = false,
  onClose,
  onSave,
  onApplyTemplate,
  onGenerateAiQuestions,
}: WriteRetroModalProps) {
  const [form, setForm] = useState<RetrospectiveEditorForm>(() =>
    createFormState(initial, applications)
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const isEditMode = Boolean(initial);
  const availableStages = useMemo(
    () => stages.filter((stage) => stage.kind === 'custom'),
    [stages]
  );

  useEffect(() => {
    setForm(createFormState(initial, applications));
    setSelectedTemplateId('');
  }, [applications, initial]);

  function handleChange<K extends keyof RetrospectiveEditorForm>(
    key: K,
    value: RetrospectiveEditorForm[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateItem(index: number, patch: Partial<RetrospectiveItem>) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              ...patch,
            }
          : item
      ),
    }));
  }

  function addItem(question = '', answer = '') {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { question, answer }],
    }));
  }

  function removeItem(index: number) {
    setForm((prev) => ({
      ...prev,
      items:
        prev.items.length === 1
          ? [createEmptyItem()]
          : prev.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  async function applyTemplateLocally() {
    if (!selectedTemplateId) {
      return;
    }

    const template = templates.find((entry) => entry.id === selectedTemplateId);

    if (!template) {
      return;
    }

    if (initial && onApplyTemplate) {
      const items = await onApplyTemplate(initial.id, selectedTemplateId);
      setForm((prev) => ({
        ...prev,
        items,
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items.filter((item) => item.question.trim() || item.answer.trim()),
        ...template.questions.map((question) => ({
          question,
          answer: '',
        })),
      ],
    }));
  }

  async function handleGenerateAiQuestions() {
    if (!form.applicationId) {
      window.alert('먼저 지원 카드를 선택해주세요.');
      return;
    }

    try {
      setIsGeneratingQuestions(true);
      const questions = await onGenerateAiQuestions(
        form.applicationId,
        form.stageId || undefined
      );

      setForm((prev) => ({
        ...prev,
        items: [
          ...prev.items.filter((item) => item.question.trim() || item.answer.trim()),
          ...questions.map((question) => ({
            question,
            answer: '',
          })),
        ],
      }));
    } finally {
      setIsGeneratingQuestions(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!form.applicationId) {
      return;
    }

    const normalizedItems = form.items
      .map((item) => ({
        question: item.question.trim(),
        answer: item.answer.trim(),
      }))
      .filter((item) => item.question);

    await onSave(
      {
        applicationId: form.applicationId,
        stageId: form.stageId,
        items: normalizedItems,
      },
      initial?.id
    );
    onClose();
  }

  return (
    <div
      className={styles.overlay}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={styles.modal} role="dialog" aria-modal aria-labelledby="retro-modal-title">
        <div className={styles.modalHeader}>
          <h2 id="retro-modal-title" className={styles.modalTitle}>
            {isEditMode ? '회고 수정' : '새 회고 작성'}
          </h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="닫기" disabled={isSaving}>
            <X size={18} />
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="retro-application">지원 카드</label>
              <select
                id="retro-application"
                className={styles.select}
                value={form.applicationId}
                onChange={(event) => handleChange('applicationId', event.target.value)}
                disabled={isEditMode || isSaving}
              >
                <option value="">지원 카드 선택</option>
                {applications.map((application) => (
                  <option key={application.id} value={application.id}>
                    {application.company} · {application.position}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="retro-stage">단계</label>
              <select
                id="retro-stage"
                className={styles.select}
                value={form.stageId}
                onChange={(event) => handleChange('stageId', event.target.value)}
                disabled={isEditMode || isSaving}
              >
                <option value="">종합 회고</option>
                {availableStages.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="retro-template">템플릿</label>
              <div className={styles.addSectionRow}>
                <select
                  id="retro-template"
                  className={styles.select}
                  value={selectedTemplateId}
                  onChange={(event) => setSelectedTemplateId(event.target.value)}
                  disabled={isSaving}
                >
                  <option value="">템플릿 선택</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className={styles.addSectionBtn}
                  onClick={() => void applyTemplateLocally()}
                  disabled={!selectedTemplateId || isSaving}
                >
                  적용
                </button>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>AI 질문</label>
              <button
                type="button"
                className={styles.addSectionBtn}
                onClick={() => void handleGenerateAiQuestions()}
                disabled={isSaving || isGeneratingQuestions}
              >
                <Sparkles size={14} />
                {isGeneratingQuestions ? '생성 중...' : 'AI 질문 받기'}
              </button>
            </div>
          </div>

          {form.items.map((item, index) => (
            <div key={`retro-item-${index}`} className={styles.field}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor={`retro-question-${index}`}>
                    질문 {index + 1}
                  </label>
                  <textarea
                    id={`retro-question-${index}`}
                    className={styles.textarea}
                    placeholder="회고할 질문을 입력하세요"
                    value={item.question}
                    onChange={(event) =>
                      updateItem(index, { question: event.target.value })
                    }
                    rows={2}
                    disabled={isSaving}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor={`retro-answer-${index}`}>
                    답변
                  </label>
                  <textarea
                    id={`retro-answer-${index}`}
                    className={styles.textarea}
                    placeholder="답변을 입력하세요"
                    value={item.answer}
                    onChange={(event) =>
                      updateItem(index, { answer: event.target.value })
                    }
                    rows={2}
                    disabled={isSaving}
                  />
                </div>
              </div>
              <div className={styles.actions}>
                <span />
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => removeItem(index)}
                  disabled={isSaving}
                >
                  <Trash2 size={14} />
                  항목 삭제
                </button>
              </div>
            </div>
          ))}

          <button type="button" className={styles.addSectionBtn} onClick={() => addItem()} disabled={isSaving}>
            <Plus size={14} />
            항목 추가
          </button>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={isSaving}>
              취소
            </button>
            <button type="submit" className={styles.saveBtn} disabled={isSaving}>
              {isEditMode ? '수정 완료' : '작성 완료'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
