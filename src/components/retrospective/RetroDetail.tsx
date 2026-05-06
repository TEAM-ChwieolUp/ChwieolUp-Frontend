'use client';

import { BookOpen, CalendarClock, FileText, Pencil, Trash2 } from 'lucide-react';
import { RetrospectiveDetail } from './types';
import styles from './RetroDetail.module.scss';

interface RetroDetailProps {
  retro: RetrospectiveDetail | null;
  onEdit: (retro: RetrospectiveDetail) => void;
  onDelete: (id: string) => void;
}

function formatDateTime(dateStr: string) {
  const date = new Date(dateStr);
  const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${
    days[date.getDay()]
  } ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export default function RetroDetail({ retro, onEdit, onDelete }: RetroDetailProps) {
  if (!retro) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>
          <FileText size={40} strokeWidth={1.5} />
        </div>
        <h3 className={styles.emptyTitle}>회고를 선택해주세요</h3>
        <p className={styles.emptyDesc}>
          왼쪽 목록에서 회고를 선택하거나, 상단의 &quot;회고 작성&quot; 버튼을 눌러 새로운 회고를 작성해보세요.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.detail}>
      <div className={styles.detailHeader}>
        <div className={styles.detailTopRow}>
          <span
            className={styles.stageBadge}
            style={{ background: `${retro.stageColor}22`, color: retro.stageColor }}
          >
            {retro.stageName}
          </span>
          <div className={styles.detailActions}>
            <button className={styles.editBtn} onClick={() => onEdit(retro)}>
              <Pencil size={14} />
              수정
            </button>
            <button className={styles.deleteBtn} onClick={() => onDelete(retro.id)}>
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        <h2 className={styles.detailCompany}>{retro.company}</h2>
        <p className={styles.detailPosition}>{retro.position}</p>
        <p className={styles.detailDate}>
          <CalendarClock size={14} />
          <span>작성 {formatDateTime(retro.createdAt)}</span>
          <span>수정 {formatDateTime(retro.updatedAt)}</span>
        </p>
      </div>

      <div className={styles.sections}>
        {retro.items.length === 0 ? (
          <div className={styles.sectionCard} style={{ '--section-bg': '#f8fafc', '--section-color': '#64748b' } as React.CSSProperties}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIconWrap}>
                <BookOpen size={15} />
              </span>
              <h3 className={styles.sectionTitle}>아직 작성된 항목이 없습니다</h3>
            </div>
            <p className={styles.sectionContent}>수정 버튼을 눌러 질문과 답변을 추가해보세요.</p>
          </div>
        ) : (
          retro.items.map((item, index) => (
            <div
              key={`${retro.id}-${index}-${item.question}`}
              className={styles.sectionCard}
              style={{ '--section-bg': '#f8fafc', '--section-color': retro.stageColor } as React.CSSProperties}
            >
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIconWrap}>
                  <BookOpen size={15} />
                </span>
                <h3 className={styles.sectionTitle}>문항 {index + 1}</h3>
              </div>
              <p className={styles.sectionContent}>{item.question}</p>
              <div className={styles.answerBlock}>
                <p className={styles.answerLabel}>답변</p>
                <p className={styles.sectionContent}>
                  {item.answer?.trim() ? item.answer : '아직 작성된 답변이 없습니다.'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
