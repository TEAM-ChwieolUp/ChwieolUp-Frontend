'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Lock, Plus, Trash2, X } from 'lucide-react';
import { KanbanStage, STAGE_COLOR_PRESETS } from './types';
import styles from './StageSettingsModal.module.scss';

interface StageSettingsModalProps {
  stages: KanbanStage[];
  stageCardCounts: Record<string, number>;
  onClose: () => void;
  onSave: (stages: KanbanStage[]) => Promise<void>;
  isSaving: boolean;
}

function createStageId(name: string) {
  return `${name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-가-힣]/g, '')}-${Date.now()}`;
}

export default function StageSettingsModal({
  stages,
  stageCardCounts,
  onClose,
  onSave,
  isSaving,
}: StageSettingsModalProps) {
  const [draftStages, setDraftStages] = useState<KanbanStage[]>(stages);

  useEffect(() => {
    setDraftStages(stages);
  }, [stages]);

  const customStageIds = useMemo(
    () => draftStages.filter((stage) => stage.kind === 'custom').map((stage) => stage.id),
    [draftStages]
  );

  function updateStage(stageId: string, patch: Partial<KanbanStage>) {
    setDraftStages((prev) =>
      prev.map((stage) =>
        stage.id === stageId
          ? {
              ...stage,
              ...patch,
            }
          : stage
      )
    );
  }

  function addStage() {
    const nextStage: KanbanStage = {
      id: createStageId('새 단계'),
      name: `새 단계 ${customStageIds.length + 1}`,
      color: STAGE_COLOR_PRESETS[customStageIds.length % STAGE_COLOR_PRESETS.length],
      displayOrder: draftStages.length - 2,
      category: 'IN_PROGRESS',
      kind: 'custom',
      locked: false,
    };

    setDraftStages((prev) => {
      const fixedStageIndex = prev.findIndex((stage) => stage.kind !== 'custom');
      if (fixedStageIndex === -1) {
        return [...prev, nextStage];
      }

      return [
        ...prev.slice(0, fixedStageIndex),
        nextStage,
        ...prev.slice(fixedStageIndex),
      ];
    });
  }

  function moveStage(stageId: string, direction: -1 | 1) {
    setDraftStages((prev) => {
      const customStages = prev.filter((stage) => stage.kind === 'custom');
      const fixedStages = prev.filter((stage) => stage.kind !== 'custom');
      const customIndex = customStages.findIndex((stage) => stage.id === stageId);
      const targetCustomIndex = customIndex + direction;

      if (
        customIndex === -1 ||
        targetCustomIndex < 0 ||
        targetCustomIndex >= customStages.length
      ) {
        return prev;
      }

      const nextCustomStages = [...customStages];
      [nextCustomStages[customIndex], nextCustomStages[targetCustomIndex]] = [
        nextCustomStages[targetCustomIndex],
        nextCustomStages[customIndex],
      ];

      return [...nextCustomStages, ...fixedStages];
    });
  }

  function removeStage(stageId: string) {
    setDraftStages((prev) => prev.filter((stage) => stage.id !== stageId));
  }

  function handleRemoveStage(stage: KanbanStage, stageCardCount: number) {
    if (stage.kind !== 'custom') {
      window.alert('고정 단계는 삭제할 수 없습니다.');
      return;
    }

    if (stageCardCount > 0) {
      window.alert(`"${stage.name}" 단계에 카드 ${stageCardCount}개가 남아 있어 삭제할 수 없습니다.`);
      return;
    }

    removeStage(stage.id);
  }

  async function handleApply() {
    await onSave(
      draftStages.map((stage, index) => ({
        ...stage,
        displayOrder: index,
      }))
    );
  }

  return (
    <div
      className={styles.overlay}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={styles.modal} role="dialog" aria-modal aria-labelledby="stage-modal-title">
        <div className={styles.header}>
          <div>
            <span className={styles.eyebrow}>단계 관리</span>
            <h2 id="stage-modal-title" className={styles.title}>
              칸반 카테고리 구성
            </h2>
            <p className={styles.description}>
              사용자 정의 단계는 자유롭게 수정할 수 있고, 고정 단계는 항상 오른쪽에 유지됩니다.
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="닫기" disabled={isSaving}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.body}>
          {draftStages.map((stage) => {
            const isCustom = stage.kind === 'custom';
            const stageCardCount = stageCardCounts[stage.id] ?? 0;
            const customStageIndex = customStageIds.findIndex((id) => id === stage.id);
            const canMoveUp = isCustom && customStageIndex > 0 && !isSaving;
            const canMoveDown =
              isCustom && customStageIndex !== -1 && customStageIndex < customStageIds.length - 1 && !isSaving;

            return (
              <div key={stage.id} className={styles.stageCard}>
                <div className={styles.stageHeader}>
                  <div className={styles.stageMeta}>
                    <span
                      className={styles.colorDot}
                      style={{ backgroundColor: stage.color }}
                    />
                    <div>
                      <p className={styles.stageKind}>
                        {isCustom ? '커스텀 단계' : '고정 단계'}
                      </p>
                      <p className={styles.stageId}>{stage.id}</p>
                    </div>
                  </div>

                  <div className={styles.stageActions}>
                    {isCustom ? (
                      <>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            moveStage(stage.id, -1);
                          }}
                          disabled={!canMoveUp}
                          aria-label="위로 이동"
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            moveStage(stage.id, 1);
                          }}
                          disabled={!canMoveDown}
                          aria-label="아래로 이동"
                        >
                          <ArrowDown size={16} />
                        </button>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          onClick={() => handleRemoveStage(stage, stageCardCount)}
                          disabled={isSaving}
                          aria-label="단계 삭제"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    ) : (
                      <span className={styles.lockedBadge}>
                        <Lock size={14} />
                        고정
                      </span>
                    )}
                  </div>
                </div>

                {isCustom && stageCardCount > 0 ? (
                  <p className={styles.stageId}>
                    카드 {stageCardCount}개가 있어 삭제할 수 없습니다.
                  </p>
                ) : null}

                <div className={styles.grid}>
                  <label className={styles.field}>
                    <span className={styles.label}>단계명</span>
                    <input
                      className={styles.input}
                      value={stage.name}
                      onChange={(event) =>
                        updateStage(stage.id, { name: event.target.value })
                      }
                      disabled={!isCustom || isSaving}
                    />
                  </label>

                  <div className={styles.field}>
                    <span className={styles.label}>컬러</span>
                    <div className={styles.colorList}>
                      {STAGE_COLOR_PRESETS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`${styles.colorBtn} ${
                            stage.color === color ? styles.colorBtnActive : ''
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => updateStage(stage.id, { color })}
                          disabled={!isCustom || isSaving}
                          aria-label={`${stage.name} 컬러 선택`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.addBtn} onClick={addStage} disabled={isSaving}>
            <Plus size={16} />
            단계 추가
          </button>

          <div className={styles.actionGroup}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={isSaving}>
              취소
            </button>
            <button
              type="button"
              className={styles.saveBtn}
              onClick={() => void handleApply()}
              disabled={isSaving}
            >
              {isSaving ? '저장 중...' : '적용하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
