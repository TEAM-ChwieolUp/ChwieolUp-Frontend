'use client';

import { useState } from 'react';
import { Plus, ChevronDown } from 'lucide-react';
import {
  KanbanCard as KanbanCardType,
  KanbanStage,
  Tag,
  ALL_STAGES,
  ALL_TAGS,
  STAGE_COLORS,
} from './types';
import { dummyCards } from './dummyData';
import KanbanCard from './KanbanCard';
import AddApplicationModal from './AddApplicationModal';
import styles from './KanbanBoard.module.scss';

export default function KanbanBoard() {
  const [cards, setCards] = useState<KanbanCardType[]>(dummyCards);
  const [activeTagFilters, setActiveTagFilters] = useState<Tag[]>([]);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [defaultStage, setDefaultStage] = useState<KanbanStage>('지원완료');

  function toggleTagFilter(tag: Tag) {
    setActiveTagFilters((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function handleMoveCard(cardId: string, newStage: KanbanStage) {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, stage: newStage } : c))
    );
  }

  function handleAddCard(card: Omit<KanbanCardType, 'id'>) {
    setCards((prev) => [...prev, { ...card, id: String(Date.now()) }]);
  }

  function openAddModal(stage: KanbanStage) {
    setDefaultStage(stage);
    setShowAddModal(true);
  }

  function getFilteredCards(stage: KanbanStage) {
    return cards.filter(
      (c) =>
        c.stage === stage &&
        (activeTagFilters.length === 0 ||
          activeTagFilters.some((t) => c.tags.includes(t)))
    );
  }

  return (
    <div className={styles.wrapper}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>지원 현황</h1>
        <div className={styles.headerRight}>
          {/* 태그 필터 드롭다운 */}
          <div className={styles.filterWrap}>
            <button
              className={`${styles.filterBtn} ${activeTagFilters.length > 0 ? styles.filterBtnActive : ''}`}
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
                  {ALL_TAGS.map((tag) => (
                    <button
                      key={tag}
                      className={`${styles.dropdownItem} ${activeTagFilters.includes(tag) ? styles.dropdownItemActive : ''}`}
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

          <button className={styles.addBtn} onClick={() => openAddModal('지원완료')}>
            <Plus size={15} />
            지원 추가
          </button>
        </div>
      </div>

      {/* ── Kanban Board ── */}
      <div className={styles.board}>
        {ALL_STAGES.map((stage) => {
          const stageCards = getFilteredCards(stage);
          const dotColor = STAGE_COLORS[stage];

          return (
            <div key={stage} className={styles.column}>
              <div className={styles.columnHeader}>
                <div className={styles.columnTitle}>
                  <span
                    className={styles.stageDot}
                    style={{ background: dotColor }}
                  />
                  <span className={styles.stageName}>{stage}</span>
                  <span className={styles.stageCount}>{stageCards.length}</span>
                </div>
              </div>

              <div className={styles.cardList}>
                {stageCards.map((card) => (
                  <KanbanCard
                    key={card.id}
                    card={card}
                    onMove={handleMoveCard}
                  />
                ))}
              </div>

              <button
                className={styles.addCardBtn}
                onClick={() => openAddModal(stage)}
              >
                + 추가
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Add Modal ── */}
      {showAddModal && (
        <AddApplicationModal
          defaultStage={defaultStage}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddCard}
        />
      )}
    </div>
  );
}
