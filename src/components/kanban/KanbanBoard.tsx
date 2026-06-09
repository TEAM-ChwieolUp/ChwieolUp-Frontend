'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, LayoutPanelLeft, Plus, Settings2 } from 'lucide-react';
import {
  INITIAL_STAGES,
  KanbanStage,
  KanbanCard as KanbanCardType,
  TAG_SUGGESTIONS,
  Tag,
} from './types';
import { ApiError } from '@/lib/api';
import {
  applicationKeys,
  createApplication,
  deleteApplication,
  listApplications,
  updateApplication,
} from '@/features/kanban/api/applications';
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

function toApiDate(value: string) {
  if (!value) {
    return value;
  }

  if (value.includes('T')) {
    return value;
  }

  return new Date(`${value}T00:00:00`).toISOString();
}

export default function KanbanBoard() {
  const queryClient = useQueryClient();
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

  const {
    data: boardData,
    isLoading: isBoardLoading,
  } = useQuery({
    queryKey: applicationKeys.board(),
    queryFn: () => listApplications(),
  });
  const { data: stageData = INITIAL_STAGES } = useQuery({
    queryKey: stageKeys.all,
    queryFn: listStages,
  });
  const { data: tagData = [] } = useQuery({
    queryKey: tagKeys.all,
    queryFn: listTags,
  });

  const stages = useMemo(
    () => boardData?.stages ?? stageData,
    [boardData?.stages, stageData]
  );
  const cards = useMemo(
    () => boardData?.cards ?? [],
    [boardData?.cards]
  );
  const selectedCard = cards.find((card) => card.id === selectedCardId) ?? null;

  const stageCardCounts = useMemo(
    () =>
      stages.reduce<Record<string, number>>((acc, stage) => {
        acc[stage.id] = cards.filter((card) => card.stageId === stage.id).length;
        return acc;
      }, {}),
    [cards, stages]
  );

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

  const createApplicationMutation = useMutation({
    mutationFn: createApplication,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: applicationKeys.all });
      setShowAddModal(false);
    },
  });

  const updateApplicationMutation = useMutation({
    mutationFn: ({
      applicationId,
      payload,
    }: {
      applicationId: string;
      payload: Parameters<typeof updateApplication>[1];
    }) => updateApplication(applicationId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: applicationKeys.all });
      setShowAddModal(false);
    },
  });

  const deleteApplicationMutation = useMutation({
    mutationFn: deleteApplication,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: applicationKeys.all });
      setSelectedCardId(null);
      setShowAddModal(false);
    },
  });

  const moveApplicationMutation = useMutation({
    mutationFn: ({
      applicationId,
      payload,
    }: {
      applicationId: string;
      payload: Parameters<typeof updateApplication>[1];
    }) =>
      updateApplication(applicationId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: applicationKeys.all });
    },
    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : '카드 이동 중 오류가 발생했습니다.';
      window.alert(message);
    },
  });

  const saveStagesMutation = useMutation({
    mutationFn: async (nextStages: KanbanStage[]) => {
      const currentStages = stages;
      const currentStageMap = new Map(currentStages.map((stage) => [stage.id, stage]));
      const nextStageMap = new Map(nextStages.map((stage) => [stage.id, stage]));
      const nextCustomStages = nextStages.filter((stage) => stage.kind === 'custom');

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

      for (const [index, stage] of nextCustomStages.entries()) {
        const currentStage = currentStageMap.get(stage.id);

        if (!currentStage) {
          await createStage({
            name: stage.name.trim(),
            color: stage.color,
            displayOrder: index,
          });
          continue;
        }

        if (currentStage.kind !== 'custom') {
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

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: stageKeys.all }),
        queryClient.invalidateQueries({ queryKey: applicationKeys.all }),
      ]);
    },
    onSuccess: () => {
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

  function toggleTagFilter(tag: Tag) {
    setActiveTagFilters((prev) =>
      prev.includes(tag) ? prev.filter((currentTag) => currentTag !== tag) : [...prev, tag]
    );
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

  async function handleUpsertCard(card: Omit<KanbanCardType, 'id'>, existingId?: string) {
    const tagIds =
      card.tags.length > 0
        ? card.tags
            .map((tagName) => tagData.find((tag) => tag.name === tagName)?.id)
            .filter((tagId): tagId is number => typeof tagId === 'number')
        : [];

    const payload = {
      stageId: card.stageId,
      companyName: card.company,
      position: card.position,
      appliedAt: toApiDate(card.appliedAt ?? card.appliedDate),
      deadlineAt: card.deadlineAt ? toApiDate(card.deadlineAt) : null,
      noResponseDays: card.noResponseDays,
      priority: card.priority ?? 'NORMAL',
      memo: card.memo ?? '',
      jobPostingUrl: card.jobPostingUrl ?? '',
      tagIds,
    };

    try {
      if (existingId) {
        await updateApplicationMutation.mutateAsync({
          applicationId: existingId,
          payload,
        });
        setSelectedCardId(existingId);
        return;
      }

      const created = await createApplicationMutation.mutateAsync(payload);
      setSelectedCardId(String(created.id));
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : '카드 저장 중 오류가 발생했습니다.';
      window.alert(message);
      throw error;
    }
  }

  async function handleDeleteCard(cardId: string) {
    try {
      await deleteApplicationMutation.mutateAsync(cardId);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : '카드 삭제 중 오류가 발생했습니다.';
      window.alert(message);
      throw error;
    }
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

  async function handleSaveStages(nextStages: KanbanStage[]) {
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

  async function handleColumnDrop(stageId: string) {
    if (!dragCardId) return;

    const draggedCard = cards.find((card) => card.id === dragCardId);
    if (!draggedCard || draggedCard.stageId === stageId) {
      setDragCardId(null);
      setDragOverStageId(null);
      return;
    }

    try {
      await moveApplicationMutation.mutateAsync({
        applicationId: dragCardId,
        payload: {
          stageId,
          companyName: draggedCard.company,
          position: draggedCard.position,
          appliedAt: toApiDate(draggedCard.appliedAt ?? draggedCard.appliedDate),
          deadlineAt: draggedCard.deadlineAt
            ? toApiDate(draggedCard.deadlineAt)
            : null,
          noResponseDays: draggedCard.noResponseDays,
          priority: draggedCard.priority ?? 'NORMAL',
          memo: draggedCard.memo ?? '',
          jobPostingUrl: draggedCard.jobPostingUrl ?? '',
          tagIds: draggedCard.tagIds ?? null,
        },
      });
    } finally {
      setDragCardId(null);
      setDragOverStageId(null);
    }
  }

  if (isBoardLoading && cards.length === 0) {
    return <div className={styles.wrapper}>칸반 보드를 불러오는 중입니다...</div>;
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
              onDrop={() => void handleColumnDrop(stage.id)}
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
                      card={{
                        ...card,
                        finalResult: mapCardToStageResult(stage),
                      }}
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
          isSaving={
            createApplicationMutation.isPending ||
            updateApplicationMutation.isPending ||
            deleteApplicationMutation.isPending
          }
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
