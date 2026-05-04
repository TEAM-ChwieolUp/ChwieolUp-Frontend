'use client';

import { GripVertical } from 'lucide-react';
import { KanbanCard as KanbanCardType, KanbanStage } from './types';
import styles from './KanbanCard.module.scss';

interface KanbanCardProps {
  card: KanbanCardType;
  stage?: KanbanStage;
  isActive: boolean;
  isDragging: boolean;
  onOpen: (card: KanbanCardType) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

export default function KanbanCard({
  card,
  stage,
  isActive,
  isDragging,
  onOpen,
  onDragStart,
  onDragEnd,
}: KanbanCardProps) {
  const urgencyLevel =
    card.noResponseDays !== undefined
      ? card.noResponseDays >= 30
        ? 'danger'
        : card.noResponseDays >= 14
          ? 'warning'
          : null
      : null;

  return (
    <div
      role="button"
      tabIndex={0}
      className={`${styles.card} ${isActive ? styles.cardActive : ''} ${isDragging ? styles.cardDragging : ''}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      onClick={() => onOpen(card)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onOpen(card);
      }}
    >
      <div className={styles.cardTopRow}>
        <span className={styles.dragHandle} aria-hidden="true">
          <GripVertical size={14} />
        </span>

        <div className={styles.cardMeta}>
          <span
            className={styles.stagePip}
            style={{ background: stage?.color ?? '#94a3b8' }}
          />
          <span className={styles.stageLabel}>{stage?.name ?? '단계 미설정'}</span>
        </div>

        {card.finalResult && (
          <span
            className={`${styles.resultBadge} ${
              card.finalResult === '합격' ? styles.pass : styles.fail
            }`}
          >
            {card.finalResult}
          </span>
        )}
      </div>

      <h4 className={styles.company}>{card.company}</h4>
      <p className={styles.position}>{card.position}</p>

      <div className={styles.dateRow}>
        <span className={styles.date}>지원일 {card.appliedDate}</span>
        {card.noResponseDays !== undefined && (
          <span className={`${styles.noResponseChip} ${urgencyLevel ? styles[urgencyLevel] : ''}`}>
            무응답 {card.noResponseDays}일
          </span>
        )}
      </div>

      {card.tags.length > 0 && (
        <div className={styles.tags}>
          {card.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {card.nextAction && (
        <p className={styles.nextAction}>→ {card.nextAction}</p>
      )}

      {card.memo && <p className={styles.memoPreview}>{card.memo}</p>}
    </div>
  );
}
