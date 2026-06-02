import styles from './MailList.module.scss';
import type { MailThread } from '../types';
import type { MailIntegration } from '@/features/mail/api/mail';

interface MailListProps {
  threads: MailThread[];
  activeId: string | null;
  integrations: MailIntegration[];
  isLoading: boolean;
  errorMessage: string | null;
  onSelect: (id: string) => void;
  onOpenMailSettings: () => void;
  onDisconnect: (integrationId: number) => void;
}

export default function MailList({
  threads,
  activeId,
  integrations,
  isLoading,
  errorMessage,
  onSelect,
  onOpenMailSettings,
  onDisconnect,
}: MailListProps) {
  return (
    <section className={styles.panel} aria-labelledby='mail-list-heading'>
      <div className={styles.panelInner}>
        <header className={styles.header}>
          <h2 id='mail-list-heading'>최근 메일</h2>
        </header>

        <div className={styles.integrationBox}>
          <div className={styles.integrationHeader}>
            <strong>메일 계정</strong>
            <span>{integrations.length > 0 ? `${integrations.length}개 연결됨` : '미연결'}</span>
          </div>

          {integrations.length > 0 ? (
            <div className={styles.integrationList}>
              {integrations.map((integration) => (
                <div key={integration.id} className={styles.integrationItem}>
                  <span>{integration.provider}</span>
                  <strong>{integration.accountEmail}</strong>
                  <button
                    type='button'
                    onClick={() => onDisconnect(integration.id)}
                  >
                    해제
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          {integrations.length === 0 ? (
            <button
              type='button'
              className={styles.connectMailButton}
              onClick={onOpenMailSettings}
            >
              메일 연결하기
            </button>
          ) : null}
        </div>

        <div className={styles.list}>
          {isLoading ? (
            <p className={styles.stateText}>메일을 불러오는 중입니다.</p>
          ) : errorMessage ? (
            <p className={styles.stateText}>{errorMessage}</p>
          ) : threads.length === 0 ? (
            <p className={styles.stateText}>분류된 채용 메일이 없습니다.</p>
          ) : threads.map((thread) => {
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
