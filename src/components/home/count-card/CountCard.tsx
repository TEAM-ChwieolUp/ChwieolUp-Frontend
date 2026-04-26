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
  const getIcon = (icon: string) => {
    if (icon == 'document') return <FileCheckCorner />;
    if (icon == 'event') return <Calendars />;
    if (icon == 'write') return <Brain />;
  };

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <div className={styles.icon} style={{ color: color }}>
          {getIcon(icon)}
        </div>
        <div>{subText}</div>
      </div>
      <div className={styles.title}>{title}</div>
      <div className={styles.value}>{value}</div>
    </div>
  );
}
