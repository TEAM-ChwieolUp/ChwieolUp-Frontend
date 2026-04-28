import CountCard from '../count-card/CountCard';
import styles from './CountSummary.module.scss';

export default function CountSummary() {
  return (
    <div className={styles.container}>
      <CountCard
        color='blue'
        icon='document'
        subText='+2 New'
        title='총 지원 수'
        value='29'
      />
      <CountCard
        color='green'
        icon='event'
        subText='This Week'
        title='이번 주 일정'
        value='12'
      />
      <CountCard
        color='red'
        icon='write'
        subText='78% Rate'
        title='회고'
        value='16'
      />
    </div>
  );
}
