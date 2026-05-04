'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, LayoutPanelLeft, Plus, Settings2 } from 'lucide-react';
import {
  FINAL_STAGE_ID,
  INITIAL_STAGES,
  KanbanStage,
  KanbanCard as KanbanCardType,
  TAG_SUGGESTIONS,
  Tag,
} from './types';
import { dummyCards } from './dummyData';
import KanbanCard from './KanbanCard';
import AddApplicationModal from './AddApplicationModal';
import StageSettingsModal from './StageSettingsModal';
import styles from './KanbanBoard.module.scss';

export default function KanbanBoard() {
  const [cards, setCards] = useState<KanbanCardType[]>(dummyCards);
  const [stages, setStages] = useState<KanbanStage[]>(INITIAL_STAGES);
  const [activeTagFilters, setActiveTagFilters] = useState<Tag[]>([]);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStageSettings, setShowStageSettings] = useState(false);
  const [defaultStageId, setDefaultStageId] = useState(
    INITIAL_STAGES[0]?.id ?? FINAL_STAGE_ID
  );
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // ── Drag state ──
  const [dragCardId, setDragCardId] = useState<string | null>(null);
  const [dragOverStageId, setDragOverStageId] = useState<string | null>(null);

  const selectedCard = cards.find((card) => card.id === selectedCardId) ?? null;

  const suggestedTags = useMemo(() => {
    const ordered = new Map<string, string>();
    TAG_SUGGESTIONS.forEach((tag) => ordered.set(tag, tag));
    cards.flatMap((card) => card.tags).forEach((tag) => ordered.set(tag, tag));
    return Array.from(ordered.values());
  }, [cards]);

  // ── Card handlers ──
  function toggleTagFilter(tag: Tag) {
    setActiveTagFilters((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function handleUpsertCard(card: Omit<KanbanCardType, 'id'>, existingId?: string) {
    if (existingId) {
      setCards((prev) =>
        prev.map((c) => (c.id === existingId ? { ...card, id: existingId } : c))
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

  function handleSaveStages(nextStages: KanbanStage[]) {
    const nextStageIds = new Set(nextStages.map((s) => s.id));
    const fallbackId =
      nextStages.find((s) => s.kind === 'custom')?.id ?? FINAL_STAGE_ID;

    setCards((prev) =>
      prev.map((card) =>
        nextStageIds.has(card.stageId)
          ? card
          : {
              ...card,
              stageId: fallbackId,
              finalResult: fallbackId === FINAL_STAGE_ID ? card.finalResult : null,
            }
      )
    );
    setStages(nextStages);
    setShowStageSettings(false);
  }

  function getFilteredCards(stageId: string) {
    return cards.filter(
      (c) =>
        c.stageId === stageId &&
        (activeTagFilters.length === 0 ||
          activeTagFilters.some((t) => c.tags.includes(t)))
    );
  }

  // ── Drag & drop ──
  function handleDragStart(cardId: string) {
    setDragCardId(cardId);
  }

  function handleDragEnd() {
    setDragCardId(null);
    setDragOverStageId(null);
  }

  function handleColumnDragOver(e: React.DragEvent, stageId: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStageId !== stageId) setDragOverStageId(stageId);
  }

  function handleColumnDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverStageId(null);
    }
  }

  function handleColumnDrop(stageId: string) {
    if (!dragCardId) return;
    setCards((prev) =>
      prev.map((card) =>
        card.id === dragCardId
          ? {
              ...card,
              stageId,
              finalResult: stageId !== FINAL_STAGE_ID ? null : card.finalResult,
            }
          : card
      )
    );
    setDragCardId(null);
    setDragOverStageId(null);
  }

  return (
    <div className={styles.wrapper}>
      {/* ── Toolbar ── */}
      <div className={styles.toolbar}>
        <h1 className={styles.pageTitle}>지원 현황</h1>

        <div className={styles.toolbarRight}>
          <div className={styles.filterWrap}>
            <button
              className={`${styles.filterBtn} ${
                activeTagFilters.length > 0 ? styles.filterBtnActive : ''
              }`}
              onClick={() => setShowFilterDropdown((v) => !v)}
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
                stages.find((s) => s.kind === 'custom')?.id ?? FINAL_STAGE_ID
              )
            }
          >
            <Plus size={15} />
            지원 추가
          </button>
        </div>
      </div>

      {/* ── Active filter chips ── */}
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

      {/* ── Board ── */}
      <div className={`${styles.board} ${dragCardId ? styles.boardDragging : ''}`}>
        {stages.map((stage) => {
          const stageCards = getFilteredCards(stage.id);
          const isOver = dragOverStageId === stage.id && dragCardId !== null;

          return (
            <section
              key={stage.id}
              className={`${styles.column} ${isOver ? styles.columnDragOver : ''}`}
              onDragOver={(e) => handleColumnDragOver(e, stage.id)}
              onDragLeave={handleColumnDragLeave}
              onDrop={() => handleColumnDrop(stage.id)}
            >
              <div className={styles.columnHeader}>
                <span
                  className={styles.stageDot}
                  style={{ background: stage.color }}
                />
                <span className={styles.stageName}>{stage.name}</span>
                {stage.kind === 'final' && (
                  <span className={styles.lockedTag}>고정</span>
                )}
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
          onClose={() => setShowAddModal(false)}
          onSave={handleUpsertCard}
          onDelete={handleDeleteCard}
        />
      )}

      {showStageSettings && (
        <StageSettingsModal
          stages={stages}
          onClose={() => setShowStageSettings(false)}
          onSave={handleSaveStages}
        />
      )}
    </div>
  );
}
