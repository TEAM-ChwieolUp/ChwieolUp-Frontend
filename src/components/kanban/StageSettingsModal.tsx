'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Lock, Plus, Trash2, X } from 'lucide-react';
import {
  FINAL_STAGE,
  KanbanStage,
  STAGE_COLOR_PRESETS,
} from './types';
import styles from './StageSettingsModal.module.scss';

interface StageSettingsModalProps {
  stages: KanbanStage[];
  onClose: () => void;
  onSave: (stages: KanbanStage[]) => void;
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
  onClose,
  onSave,
}: StageSettingsModalProps) {
  const [draftStages, setDraftStages] = useState<KanbanStage[]>(stages);

  useEffect(() => {
    setDraftStages(stages);
  }, [stages]);

  const customStageCount = useMemo(
    () => draftStages.filter((stage) => stage.kind === 'custom').length,
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
      name: `새 단계 ${customStageCount + 1}`,
      color: STAGE_COLOR_PRESETS[customStageCount % STAGE_COLOR_PRESETS.length],
      kind: 'custom',
    };

    setDraftStages((prev) => {
      const finalIndex = prev.findIndex((stage) => stage.kind === 'final');
      if (finalIndex === -1) {
        return [...prev, nextStage, FINAL_STAGE];
      }

      return [
        ...prev.slice(0, finalIndex),
        nextStage,
        ...prev.slice(finalIndex),
      ];
    });
  }

  function moveStage(stageId: string, direction: -1 | 1) {
    setDraftStages((prev) => {
      const index = prev.findIndex((stage) => stage.id === stageId);
      const targetIndex = index + direction;

      if (
        index === -1 ||
        targetIndex < 0 ||
        targetIndex >= prev.length ||
        prev[index]?.kind !== 'custom' ||
        prev[targetIndex]?.kind !== 'custom'
      ) {
        return prev;
      }

      const next = [...prev];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  }

  function removeStage(stageId: string) {
    if (customStageCount <= 1) return;
    setDraftStages((prev) => prev.filter((stage) => stage.id !== stageId));
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
              사용자 정의 단계는 자유롭게 수정할 수 있고, `최종 결과` 단계는 고정됩니다.
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="닫기">
            <X size={18} />
          </button>
        </div>

        <div className={styles.body}>
          {draftStages.map((stage, index) => {
            const isCustom = stage.kind === 'custom';

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
                          onClick={() => moveStage(stage.id, -1)}
                          disabled={index === 0}
                          aria-label="위로 이동"
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          onClick={() => moveStage(stage.id, 1)}
                          disabled={draftStages[index + 1]?.kind !== 'custom'}
                          aria-label="아래로 이동"
                        >
                          <ArrowDown size={16} />
                        </button>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          onClick={() => removeStage(stage.id)}
                          disabled={customStageCount <= 1}
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

                <div className={styles.grid}>
                  <label className={styles.field}>
                    <span className={styles.label}>단계명</span>
                    <input
                      className={styles.input}
                      value={stage.name}
                      onChange={(event) =>
                        updateStage(stage.id, { name: event.target.value })
                      }
                      disabled={!isCustom}
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
                          disabled={!isCustom}
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
          <button type="button" className={styles.addBtn} onClick={addStage}>
            <Plus size={16} />
            단계 추가
          </button>

          <div className={styles.actionGroup}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              취소
            </button>
            <button
              type="button"
              className={styles.saveBtn}
              onClick={() => onSave(draftStages)}
            >
              적용하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
