import styles from './MailList.module.scss';
import type { MailThread } from '../types';

interface MailListProps {
  threads: MailThread[];
  activeId: string;
  onSelect: (id: string) => void;
}

export default function MailList({
  threads,
  activeId,
  onSelect,
}: MailListProps) {
  return (
    <section className={styles.panel} aria-labelledby='mail-list-heading'>
      <div className={styles.panelInner}>
        <header className={styles.header}>
          <h2 id='mail-list-heading'>최근 메일</h2>
        </header>

        <div className={styles.list}>
          {threads.map((thread) => {
            const isActive = thread.id === activeId;

            return (
              <button
                key={thread.id}
                type='button'
                className={`${styles.item} ${isActive ? styles.active : ''}`}
                onClick={() => onSelect(thread.id)}
                aria-pressed={isActive}
              >
                <div className={styles.metaRow}>
                  <span className={styles.sender}>{thread.sender}</span>
                  <time className={styles.receivedAt}>{thread.receivedAt}</time>
                </div>

                <strong className={styles.subject}>{thread.subject}</strong>
                <p className={styles.preview}>{thread.preview}</p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
