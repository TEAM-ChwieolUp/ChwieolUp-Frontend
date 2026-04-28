import { MiniKanbanDataType } from '@/app/api/types/MiniKanbanType';
import styles from './MiniEvent.module.scss';

export default function MiniEvent({
  companyCategory,
  companyImgUrl,
  companyName,
  eventDate,
  position,
}: MiniKanbanDataType) {
  return (
    <div className={styles.container}>
      <div>
        <div>
          <img src={companyImgUrl} alt={companyName} />
        </div>
        <div>{companyCategory}</div>
      </div>
      <div>{companyName}</div>
      <div>{position}</div>
      <div>{eventDate.toDateString()}</div>
    </div>
  );
}
