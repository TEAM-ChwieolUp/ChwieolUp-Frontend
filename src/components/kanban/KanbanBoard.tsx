'use client';

import { startTransition, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, LayoutPanelLeft, Plus, Settings2 } from 'lucide-react';
import {
  INITIAL_STAGES,
  KanbanStage,
  KanbanCard as KanbanCardType,
  TAG_SUGGESTIONS,
  Tag,
} from './types';
import { dummyCards } from './dummyData';
import { ApiError } from '@/lib/api';
import {
  createStage,
  deleteStage,
  listStages,
  stageKeys,
  updateStage,
} from '@/features/kanban/api/stages';
import { createTag, listTags, tagKeys } from '@/features/kanban/api/tags';
import KanbanCard from './KanbanCard';
import AddApplicationModal from './AddApplicationModal';
import StageSettingsModal from './StageSettingsModal';
import styles from './KanbanBoard.module.scss';

const LEGACY_STAGE_ORDER = ['applied', 'screening', 'process', 'interview'] as const;
const DEFAULT_TAG_COLOR = '#64748b';

function mapCardToStageResult(stage: KanbanStage | undefined) {
  if (!stage) {
    return null;
  }

  if (stage.kind === 'passed') {
    return '합격';
  }

  if (stage.kind === 'rejected') {
    return '불합격';
  }

  return null;
}

export default function KanbanBoard() {
  const queryClient = useQueryClient();
  const [cards, setCards] = useState<KanbanCardType[]>(dummyCards);
  const [stages, setStages] = useState<KanbanStage[]>(INITIAL_STAGES);
  const [activeTagFilters, setActiveTagFilters] = useState<Tag[]>([]);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStageSettings, setShowStageSettings] = useState(false);
  const [defaultStageId, setDefaultStageId] = useState(
    INITIAL_STAGES.find((stage) => stage.kind === 'custom')?.id ?? INITIAL_STAGES[0]?.id ?? ''
  );
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const [dragCardId, setDragCardId] = useState<string | null>(null);
  const [dragOverStageId, setDragOverStageId] = useState<string | null>(null);

  const { data: stageData, isLoading: isStagesLoading } = useQuery({
    queryKey: stageKeys.all,
    queryFn: listStages,
  });
  const { data: tagData = [] } = useQuery({
    queryKey: tagKeys.all,
    queryFn: listTags,
  });

  useEffect(() => {
    if (!stageData || stageData.length === 0) {
      return;
    }

    startTransition(() => {
      setStages(stageData);
      setDefaultStageId(
        stageData.find((stage) => stage.kind === 'custom')?.id ?? stageData[0]?.id ?? ''
      );

      setCards((prev) => {
        const customStages = stageData.filter((stage) => stage.kind === 'custom');
        const passedStageId = stageData.find((stage) => stage.kind === 'passed')?.id;
        const rejectedStageId = stageData.find((stage) => stage.kind === 'rejected')?.id;

        return prev.map((card) => {
          if (card.finalResult === '합격' && passedStageId) {
            return { ...card, stageId: passedStageId };
          }

          if (card.finalResult === '불합격' && rejectedStageId) {
            return { ...card, stageId: rejectedStageId };
          }

          const legacyIndex = LEGACY_STAGE_ORDER.findIndex((stageId) => stageId === card.stageId);

          if (legacyIndex >= 0) {
            const mappedStage = customStages[legacyIndex] ?? customStages[0];

            if (mappedStage) {
              return { ...card, stageId: mappedStage.id };
            }
          }

          return card;
        });
      });
    });
  }, [stageData]);

  const saveStagesMutation = useMutation({
    mutationFn: async (nextStages: KanbanStage[]) => {
      const currentStages = stages;
      const currentStageMap = new Map(currentStages.map((stage) => [stage.id, stage]));
      const nextStageMap = new Map(nextStages.map((stage) => [stage.id, stage]));

      const removedStages = currentStages.filter((stage) => !nextStageMap.has(stage.id));

      removedStages.forEach((stage) => {
        if (stage.kind !== 'custom') {
          throw new Error('고정 단계는 삭제할 수 없습니다.');
        }

        if (cards.some((card) => card.stageId === stage.id)) {
          throw new Error(`"${stage.name}" 단계에 카드가 남아 있어 삭제할 수 없습니다.`);
        }
      });

      for (const stage of removedStages) {
        await deleteStage(stage.id);
      }

      const createdStageIdMap = new Map<string, string>();

      for (const [index, stage] of nextStages.entries()) {
        if (currentStageMap.has(stage.id)) {
          continue;
        }

        const createdStage = await createStage({
          name: stage.name.trim(),
          color: stage.color,
          displayOrder: index,
        });

        createdStageIdMap.set(stage.id, createdStage.id);
      }

      for (const [index, stage] of nextStages.entries()) {
        const currentStage = currentStageMap.get(stage.id);

        if (!currentStage) {
          continue;
        }

        const patch: {
          name?: string;
          color?: string;
          displayOrder?: number;
        } = {};

        if (currentStage.name !== stage.name.trim()) {
          patch.name = stage.name.trim();
        }

        if (currentStage.color !== stage.color) {
          patch.color = stage.color;
        }

        if (currentStage.displayOrder !== index) {
          patch.displayOrder = index;
        }

        if (Object.keys(patch).length > 0) {
          await updateStage(stage.id, patch);
        }
      }

      await queryClient.invalidateQueries({ queryKey: stageKeys.all });

      const refreshedStages = await queryClient.fetchQuery({
        queryKey: stageKeys.all,
        queryFn: listStages,
      });

      return {
        stages: refreshedStages,
        createdStageIdMap,
      };
    },
    onSuccess: ({ stages: nextStages, createdStageIdMap }) => {
      setCards((prev) =>
        prev.map((card) => ({
          ...card,
          stageId: createdStageIdMap.get(card.stageId) ?? card.stageId,
        }))
      );
      setStages(nextStages);
      setDefaultStageId(
        nextStages.find((stage) => stage.kind === 'custom')?.id ?? nextStages[0]?.id ?? ''
      );
      setShowStageSettings(false);
    },
    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : '단계 저장 중 오류가 발생했습니다.';
      window.alert(message);
    },
  });

  const selectedCard = cards.find((card) => card.id === selectedCardId) ?? null;

  const suggestedTags = useMemo(() => {
    const ordered = new Map<string, string>();
    TAG_SUGGESTIONS.forEach((tag) => ordered.set(tag, tag));
    tagData.forEach((tag) => ordered.set(tag.name, tag.name));
    cards.flatMap((card) => card.tags).forEach((tag) => ordered.set(tag, tag));
    return Array.from(ordered.values());
  }, [cards, tagData]);

  const createTagMutation = useMutation({
    mutationFn: async (tagName: string) =>
      createTag({
        name: tagName,
        color: DEFAULT_TAG_COLOR,
      }),
    onSuccess: (createdTag) => {
      queryClient.setQueryData(tagKeys.all, (current: typeof tagData | undefined) => {
        if (!current) {
          return [createdTag];
        }

        if (current.some((tag) => tag.id === createdTag.id)) {
          return current;
        }

        return [...current, createdTag].sort((a, b) => a.id - b.id);
      });
    },
  });

  const stageCardCounts = useMemo(
    () =>
      stages.reduce<Record<string, number>>((acc, stage) => {
        acc[stage.id] = cards.filter((card) => card.stageId === stage.id).length;
        return acc;
      }, {}),
    [cards, stages]
  );

  function toggleTagFilter(tag: Tag) {
    setActiveTagFilters((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function handleUpsertCard(card: Omit<KanbanCardType, 'id'>, existingId?: string) {
    if (existingId) {
      setCards((prev) =>
        prev.map((currentCard) =>
          currentCard.id === existingId ? { ...card, id: existingId } : currentCard
        )
      );
      setSelectedCardId(existingId);
      return;
    }

    const nextId = String(Date.now());
    setCards((prev) => [...prev, { ...card, id: nextId }]);
    setSelectedCardId(nextId);
  }

  function handleDeleteCard(cardId: string) {
    setCards((prev) => prev.filter((card) => card.id !== cardId));
    setSelectedCardId((prev) => (prev === cardId ? null : prev));
  }

  function openAddModal(stageId: string) {
    setSelectedCardId(null);
    setDefaultStageId(stageId);
    setShowAddModal(true);
  }

  function openCardDetail(card: KanbanCardType) {
    setSelectedCardId(card.id);
    setShowAddModal(true);
  }

  async function handleCreateTag(tagName: string) {
    const normalizedTagName = tagName.trim();
    if (!normalizedTagName) {
      throw new Error('태그명을 입력해 주세요.');
    }

    const existingTag = suggestedTags.find(
      (tag) => tag.toLowerCase() === normalizedTagName.toLowerCase()
    );

    if (existingTag) {
      return existingTag;
    }

    try {
      const createdTag = await createTagMutation.mutateAsync(normalizedTagName);
      return createdTag.name;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }

      throw error instanceof Error
        ? error
        : new Error('태그 생성 중 오류가 발생했습니다.');
    }
  }

  async function handleSaveStages(nextStages: KanbanStage[]) {
    const nextStageIds = new Set(nextStages.map((stage) => stage.id));
    const fallbackId =
      nextStages.find((stage) => stage.kind === 'custom')?.id ?? nextStages[0]?.id ?? '';

    setCards((prev) =>
      prev.map((card) =>
        nextStageIds.has(card.stageId)
          ? card
          : {
              ...card,
              stageId: fallbackId,
              finalResult: null,
            }
      )
    );

    await saveStagesMutation.mutateAsync(nextStages);
  }

  function getFilteredCards(stageId: string) {
    return cards.filter(
      (card) =>
        card.stageId === stageId &&
        (activeTagFilters.length === 0 ||
          activeTagFilters.some((tag) => card.tags.includes(tag)))
    );
  }

  function handleDragStart(cardId: string) {
    setDragCardId(cardId);
  }

  function handleDragEnd() {
    setDragCardId(null);
    setDragOverStageId(null);
  }

  function handleColumnDragOver(event: React.DragEvent, stageId: string) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    if (dragOverStageId !== stageId) setDragOverStageId(stageId);
  }

  function handleColumnDragLeave(event: React.DragEvent) {
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setDragOverStageId(null);
    }
  }

  function handleColumnDrop(stageId: string) {
    if (!dragCardId) return;

    const targetStage = stages.find((stage) => stage.id === stageId);

    setCards((prev) =>
      prev.map((card) =>
        card.id === dragCardId
          ? {
              ...card,
              stageId,
              finalResult: mapCardToStageResult(targetStage),
            }
          : card
      )
    );
    setDragCardId(null);
    setDragOverStageId(null);
  }

  if (isStagesLoading && stages.length === 0) {
    return <div className={styles.wrapper}>단계를 불러오는 중입니다...</div>;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <h1 className={styles.pageTitle}>지원 현황</h1>

        <div className={styles.toolbarRight}>
          <div className={styles.filterWrap}>
            <button
              className={`${styles.filterBtn} ${
                activeTagFilters.length > 0 ? styles.filterBtnActive : ''
              }`}
              onClick={() => setShowFilterDropdown((value) => !value)}
            >
              태그 필터
              {activeTagFilters.length > 0 && (
                <span className={styles.filterCount}>{activeTagFilters.length}</span>
              )}
              <ChevronDown size={14} />
            </button>

            {showFilterDropdown && (
              <>
                <div
                  className={styles.dropdownBackdrop}
                  onClick={() => setShowFilterDropdown(false)}
                />
                <div className={styles.dropdown}>
                  {suggestedTags.map((tag) => (
                    <button
                      key={tag}
                      className={`${styles.dropdownItem} ${
                        activeTagFilters.includes(tag) ? styles.dropdownItemActive : ''
                      }`}
                      onClick={() => toggleTagFilter(tag)}
                    >
                      {activeTagFilters.includes(tag) && (
                        <span className={styles.checkmark}>✓</span>
                      )}
                      {tag}
                    </button>
                  ))}
                  {activeTagFilters.length > 0 && (
                    <button
                      className={styles.clearFilter}
                      onClick={() => setActiveTagFilters([])}
                    >
                      필터 초기화
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          <button className={styles.secondaryBtn} onClick={() => setShowStageSettings(true)}>
            <Settings2 size={15} />
            단계 관리
          </button>

          <button
            className={styles.addBtn}
            onClick={() =>
              openAddModal(
                stages.find((stage) => stage.kind === 'custom')?.id ??
                  stages[0]?.id ??
                  ''
              )
            }
          >
            <Plus size={15} />
            지원 추가
          </button>
        </div>
      </div>

      {activeTagFilters.length > 0 && (
        <div className={styles.activeFiltersBar}>
          <LayoutPanelLeft size={14} />
          <span>필터 적용 중</span>
          <div className={styles.activeFilterChips}>
            {activeTagFilters.map((tag) => (
              <button
                key={tag}
                className={styles.activeFilterChip}
                onClick={() => toggleTagFilter(tag)}
              >
                {tag} ✕
              </button>
            ))}
          </div>
          <button className={styles.clearInlineBtn} onClick={() => setActiveTagFilters([])}>
            전체 해제
          </button>
        </div>
      )}

      <div className={`${styles.board} ${dragCardId ? styles.boardDragging : ''}`}>
        {stages.map((stage) => {
          const stageCards = getFilteredCards(stage.id);
          const isOver = dragOverStageId === stage.id && dragCardId !== null;

          return (
            <section
              key={stage.id}
              className={`${styles.column} ${isOver ? styles.columnDragOver : ''}`}
              onDragOver={(event) => handleColumnDragOver(event, stage.id)}
              onDragLeave={handleColumnDragLeave}
              onDrop={() => handleColumnDrop(stage.id)}
            >
              <div className={styles.columnHeader}>
                <span
                  className={styles.stageDot}
                  style={{ background: stage.color }}
                />
                <span className={styles.stageName}>{stage.name}</span>
                {stage.locked && <span className={styles.lockedTag}>고정</span>}
                <span className={styles.stageCount}>{stageCards.length}</span>
              </div>

              <div className={styles.cardList}>
                {stageCards.length > 0 ? (
                  stageCards.map((card) => (
                    <KanbanCard
                      key={card.id}
                      card={card}
                      stage={stage}
                      isActive={selectedCardId === card.id}
                      isDragging={dragCardId === card.id}
                      onOpen={openCardDetail}
                      onDragStart={() => handleDragStart(card.id)}
                      onDragEnd={handleDragEnd}
                    />
                  ))
                ) : (
                  <div
                    className={`${styles.emptyState} ${isOver ? styles.emptyStateDragOver : ''}`}
                  >
                    {dragCardId ? '여기에 드롭하세요' : '카드가 없습니다'}
                  </div>
                )}
              </div>

              <button className={styles.addCardBtn} onClick={() => openAddModal(stage.id)}>
                <Plus size={13} />
                카드 추가
              </button>
            </section>
          );
        })}
      </div>

      {showAddModal && (
        <AddApplicationModal
          key={selectedCard?.id ?? `create-${defaultStageId}`}
          card={selectedCard}
          defaultStageId={defaultStageId}
          stages={stages}
          tagOptions={suggestedTags}
          onClose={() => setShowAddModal(false)}
          onCreateTag={handleCreateTag}
          onSave={handleUpsertCard}
          onDelete={handleDeleteCard}
        />
      )}

      {showStageSettings && (
        <StageSettingsModal
          stages={stages}
          stageCardCounts={stageCardCounts}
          onClose={() => setShowStageSettings(false)}
          onSave={handleSaveStages}
          isSaving={saveStagesMutation.isPending}
        />
      )}
    </div>
  );
}
