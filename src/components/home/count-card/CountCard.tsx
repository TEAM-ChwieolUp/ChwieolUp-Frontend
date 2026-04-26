import type { CSSProperties } from 'react';
import { Brain, Calendars, FileCheckCorner } from 'lucide-react';

import { CountCardType } from '@/app/api/types/CountCardType';
import styles from './CountCard.module.scss';

export default function CountCard({
  color,
  icon,
  subText,
  title,
  value,
}: CountCardType) {
  const tones = {
    blue: {
      accent: '#2563eb',
      soft: 'rgba(37, 99, 235, 0.12)',
    },
    green: {
      accent: '#059669',
      soft: 'rgba(5, 150, 105, 0.12)',
    },
    red: {
      accent: '#dc2626',
      soft: 'rgba(220, 38, 38, 0.12)',
    },
  } as const;

  const getIcon = (icon: string) => {
    if (icon == 'document') return <FileCheckCorner size={20} />;
    if (icon == 'event') return <Calendars size={20} />;
    if (icon == 'write') return <Brain size={20} />;
  };

  const cardStyle = {
    '--card-accent': tones[color].accent,
    '--card-accent-soft': tones[color].soft,
  } as CSSProperties;

  return (
    <div className={styles.container} style={cardStyle}>
      <div className={styles.glow} />
      <div className={styles.row}>
        <div className={styles.icon}>
          {getIcon(icon)}
        </div>
        <div className={styles.badge}>{subText}</div>
      </div>
      <div className={styles.content}>
        <div className={styles.title}>{title}</div>
        <div className={styles.value}>{value}</div>
      </div>
      <div className={styles.accentLine} />
    </div>
  );
}
