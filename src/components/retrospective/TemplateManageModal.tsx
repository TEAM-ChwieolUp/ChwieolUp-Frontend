'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { RetrospectiveTemplate } from './types';
import styles from './TemplateManageModal.module.scss';

interface DraftTemplate {
  id: string;
  name: string;
  questions: string[];
  isNew: boolean;
}

interface TemplateManageModalProps {
  templates: RetrospectiveTemplate[];
  isSaving?: boolean;
  onClose: () => void;
  onCreate: (payload: { name: string; questions: string[] }) => Promise<void>;
  onUpdate: (
    templateId: string,
    payload: { name: string; questions: string[] }
  ) => Promise<void>;
  onDelete: (templateId: string) => Promise<void>;
}

function createDraftId() {
  return `new-${Date.now()}`;
}

function toDraft(template: RetrospectiveTemplate): DraftTemplate {
  return {
    id: template.id,
    name: template.name,
    questions: template.questions.length > 0 ? [...template.questions] : [''],
    isNew: false,
  };
}

export default function TemplateManageModal({
  templates,
  isSaving = false,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}: TemplateManageModalProps) {
  const [drafts, setDrafts] = useState<DraftTemplate[]>(() =>
    templates.map(toDraft)
  );
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    setDrafts(templates.map(toDraft));
  }, [templates]);

  function updateDraft(id: string, patch: Partial<DraftTemplate>) {
    setDrafts((prev) =>
      prev.map((draft) => (draft.id === id ? { ...draft, ...patch } : draft))
    );
  }

  function updateQuestion(draftId: string, index: number, value: string) {
    setDrafts((prev) =>
      prev.map((draft) => {
        if (draft.id !== draftId) return draft;
        const next = [...draft.questions];
        next[index] = value;
        return { ...draft, questions: next };
      })
    );
  }

  function addQuestion(draftId: string) {
    setDrafts((prev) =>
      prev.map((draft) => {
        if (draft.id !== draftId) return draft;
        return { ...draft, questions: [...draft.questions, ''] };
      })
    );
  }

  function removeQuestion(draftId: string, index: number) {
    setDrafts((prev) =>
      prev.map((draft) => {
        if (draft.id !== draftId) return draft;
        const next =
          draft.questions.length === 1
            ? ['']
            : draft.questions.filter((_, i) => i !== index);
        return { ...draft, questions: next };
      })
    );
  }

  function addTemplate() {
    const newDraft: DraftTemplate = {
      id: createDraftId(),
      name: '',
      questions: [''],
      isNew: true,
    };
    setDrafts((prev) => [...prev, newDraft]);
  }

  async function handleSave(draft: DraftTemplate) {
    const name = draft.name.trim();
    if (!name) {
      window.alert('템플릿 이름을 입력해주세요.');
      return;
    }

    const questions = draft.questions
      .map((q) => q.trim())
      .filter((q) => q.length > 0);

    setPendingId(draft.id);
    try {
      if (draft.isNew) {
        await onCreate({ name, questions });
      } else {
        await onUpdate(draft.id, { name, questions });
      }
    } finally {
      setPendingId(null);
    }
  }

  async function handleDelete(draft: DraftTemplate) {
    if (draft.isNew) {
      setDrafts((prev) => prev.filter((d) => d.id !== draft.id));
      return;
    }

    const confirmed = window.confirm(`"${draft.name}" 템플릿을 삭제할까요?`);
    if (!confirmed) return;

    setPendingId(draft.id);
    try {
      await onDelete(draft.id);
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div
      className={styles.overlay}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal
        aria-labelledby="template-modal-title"
      >
        <div className={styles.header}>
          <div>
            <span className={styles.eyebrow}>템플릿 관리</span>
            <h2 id="template-modal-title" className={styles.title}>
              회고 템플릿 구성
            </h2>
            <p className={styles.description}>
              자주 쓰는 질문 모음을 템플릿으로 저장해두고 회고 작성 시 불러올 수 있어요.
            </p>
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="닫기"
            disabled={isSaving}
          >
            <X size={18} />
          </button>
        </div>

        <div className={styles.body}>
          {drafts.length === 0 ? (
            <p className={styles.empty}>아직 템플릿이 없어요. 아래 버튼으로 추가해보세요.</p>
          ) : (
            drafts.map((draft) => {
              const isPending = pendingId === draft.id;
              const isDisabled = isSaving || isPending;

              return (
                <div key={draft.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div className={styles.nameWrap}>
                      <label
                        className={styles.label}
                        htmlFor={`template-name-${draft.id}`}
                      >
                        템플릿 이름
                      </label>
                      <input
                        id={`template-name-${draft.id}`}
                        className={styles.input}
                        value={draft.name}
                        placeholder="예) 면접 후 회고"
                        maxLength={50}
                        onChange={(e) =>
                          updateDraft(draft.id, { name: e.target.value })
                        }
                        disabled={isDisabled}
                      />
                    </div>
                    <div className={styles.cardActions}>
                      <button
                        type="button"
                        className={styles.saveBtn}
                        onClick={() => void handleSave(draft)}
                        disabled={isDisabled}
                      >
                        {isPending ? '저장 중...' : draft.isNew ? '추가' : '저장'}
                      </button>
                      <button
                        type="button"
                        className={styles.deleteBtn}
                        onClick={() => void handleDelete(draft)}
                        disabled={isDisabled}
                        aria-label="템플릿 삭제"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <div className={styles.questionsSection}>
                    <span className={styles.label}>질문 목록</span>
                    <div className={styles.questionList}>
                      {draft.questions.map((question, qIndex) => (
                        <div key={qIndex} className={styles.questionRow}>
                          <span className={styles.questionNumber}>{qIndex + 1}</span>
                          <input
                            className={styles.input}
                            value={question}
                            placeholder="질문을 입력하세요"
                            onChange={(e) =>
                              updateQuestion(draft.id, qIndex, e.target.value)
                            }
                            disabled={isDisabled}
                          />
                          <button
                            type="button"
                            className={styles.removeQuestionBtn}
                            onClick={() => removeQuestion(draft.id, qIndex)}
                            disabled={isDisabled}
                            aria-label="질문 삭제"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className={styles.addQuestionBtn}
                      onClick={() => addQuestion(draft.id)}
                      disabled={isDisabled || draft.questions.length >= 50}
                    >
                      <Plus size={13} />
                      질문 추가
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.addTemplateBtn}
            onClick={addTemplate}
            disabled={isSaving}
          >
            <Plus size={16} />
            템플릿 추가
          </button>
          <button
            type="button"
            className={styles.closeFooterBtn}
            onClick={onClose}
            disabled={isSaving}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
