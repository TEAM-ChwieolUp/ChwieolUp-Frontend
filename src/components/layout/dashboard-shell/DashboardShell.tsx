import Header from '../header/Header';
import Sidebar from '../sidebar/Sidebar';
import styles from './DashboardShell.module.scss';

interface DashboardShellProps {
  children: React.ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className={styles.container}>
      <Sidebar />

      <div className={styles.contentArea}>
        <Header />
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
