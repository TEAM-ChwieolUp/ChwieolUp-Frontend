import MiniEvent from '../mini-event/MiniEvent';
import { MiniKanbanType } from '@/app/api/types/MiniKanbanType';
import styles from './Minikanban.module.scss';

export default function MiniKanban({
  data,
  name,
  numOfKanban,
}: MiniKanbanType) {
  return (
    <div className={styles.container}>
      <div>
        <div>{name}</div>
        <div>{numOfKanban}</div>
      </div>
      {data.map((d, index) => (
        <MiniEvent key={index} {...d} />
      ))}
    </div>
  );
}
