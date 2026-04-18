'use client';

import { KanbanCard as KanbanCardType, KanbanStage, ALL_STAGES } from './types';
import styles from './KanbanCard.module.scss';

interface KanbanCardProps {
  card: KanbanCardType;
  onMove: (cardId: string, stage: KanbanStage) => void;
}

export default function KanbanCard({ card, onMove }: KanbanCardProps) {
  const urgencyLevel =
    card.noResponseDays !== undefined
      ? card.noResponseDays >= 30
        ? 'danger'
        : card.noResponseDays >= 14
          ? 'warning'
          : null
      : null;

  return (
    <div className={styles.card}>
      {/* 최종결과 합격/불합격 배지 */}
      {card.finalResult && (
        <span
          className={`${styles.resultBadge} ${
            card.finalResult === '합격' ? styles.pass : styles.fail
          }`}
        >
          {card.finalResult}
        </span>
      )}

      <h4 className={styles.company}>{card.company}</h4>
      <p className={styles.position}>{card.position}</p>
      <p className={styles.date}>지원일: {card.appliedDate}</p>

      {card.tags.length > 0 && (
        <div className={styles.tags}>
          {card.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {urgencyLevel && (
        <div className={`${styles.urgencyBar} ${styles[urgencyLevel]}`}>
          무응답 {card.noResponseDays}일째
        </div>
      )}

      {card.nextAction && (
        <p className={styles.nextAction}>다음: {card.nextAction}</p>
      )}

      {/* 단계 이동 셀렉트 */}
      <select
        className={styles.stageSelect}
        value={card.stage}
        onChange={(e) => onMove(card.id, e.target.value as KanbanStage)}
        onClick={(e) => e.stopPropagation()}
        aria-label="단계 이동"
      >
        {ALL_STAGES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}
