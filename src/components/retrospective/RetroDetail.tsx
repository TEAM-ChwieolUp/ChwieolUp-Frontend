'use client';

import { BookOpen, MessageSquare, TrendingUp, Heart, FileText, Trash2, Pencil } from 'lucide-react';
import { Retrospective, STAGE_COLORS } from './types';
import styles from './RetroDetail.module.scss';

interface RetroDetailProps {
  retro: Retrospective | null;
  onEdit: (retro: Retrospective) => void;
  onDelete: (id: string) => void;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${days[d.getDay()]}`;
}

const SECTION_ICONS = {
  question: BookOpen,
  answer: MessageSquare,
  reflection: TrendingUp,
  feeling: Heart,
};

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

  const stageColor = STAGE_COLORS[retro.stage];

  return (
    <div className={styles.detail}>
      <div className={styles.detailHeader}>
        <div className={styles.detailTopRow}>
          <span
            className={styles.stageBadge}
            style={{ background: stageColor.bg, color: stageColor.text }}
          >
            {retro.stage}
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
        <p className={styles.detailDate}>{formatDate(retro.date)}</p>
      </div>

      <div className={styles.sections}>
        {retro.question && (
          <SectionCard
            icon={SECTION_ICONS.question}
            title="질문/과제 내용"
            content={retro.question}
            color="#3b82f6"
            bg="#eff6ff"
          />
        )}
        {retro.answer && (
          <SectionCard
            icon={SECTION_ICONS.answer}
            title="내 답변/대응"
            content={retro.answer}
            color="#16a34a"
            bg="#f0fdf4"
          />
        )}
        {retro.reflection && (
          <SectionCard
            icon={SECTION_ICONS.reflection}
            title="반성 및 개선점"
            content={retro.reflection}
            color="#7c3aed"
            bg="#faf5ff"
          />
        )}
        {retro.feeling && (
          <SectionCard
            icon={SECTION_ICONS.feeling}
            title="감정/느낌"
            content={retro.feeling}
            color="#ea580c"
            bg="#fff7ed"
          />
        )}

        {retro.extraSections.length > 0 && (
          <>
            <h3 className={styles.extraTitle}>추가 항목</h3>
            {retro.extraSections.map((section) => (
              <SectionCard
                key={section.id}
                icon={FileText}
                title={section.title}
                content={section.content}
                color="#64748b"
                bg="#f8fafc"
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

interface SectionCardProps {
  icon: React.ElementType;
  title: string;
  content: string;
  color: string;
  bg: string;
}

function SectionCard({ icon: Icon, title, content, color, bg }: SectionCardProps) {
  return (
    <div className={styles.sectionCard} style={{ '--section-bg': bg, '--section-color': color } as React.CSSProperties}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionIconWrap}>
          <Icon size={15} />
        </span>
        <h3 className={styles.sectionTitle}>{title}</h3>
      </div>
      <p className={styles.sectionContent}>{content}</p>
    </div>
  );
}
