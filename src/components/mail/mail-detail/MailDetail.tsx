import { Reply, Star } from 'lucide-react';
import styles from './MailDetail.module.scss';
import type { MailDetailData } from '../types';

interface MailDetailProps {
  mail: MailDetailData;
}

export default function MailDetail({ mail }: MailDetailProps) {
  return (
    <section className={styles.detail} aria-labelledby='mail-detail-subject'>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <span className={styles.statusBadge}>{mail.statusLabel}</span>
          <span className={styles.receivedLabel}>{mail.receivedLabel}</span>
        </div>

        <h2 className={styles.subject} id='mail-detail-subject'>
          {mail.subject}
        </h2>

        <div className={styles.senderCard}>
          <div className={styles.senderBlock}>
            <div className={styles.avatar} aria-hidden='true'>
              {mail.avatarLabel}
            </div>

            <div className={styles.senderMeta}>
              <p className={styles.senderLine}>
                <strong>{mail.senderName}</strong>
                <span>{` <${mail.senderEmail}>`}</span>
              </p>
              <p
                className={styles.recipientLine}
              >{`${mail.recipientLabel}: ${mail.recipient}`}</p>
            </div>
          </div>

          <div className={styles.actions}>
            <button type='button' aria-label='답장'>
              <Reply aria-hidden='true' />
            </button>
            <button type='button' aria-label='중요 메일 저장'>
              <Star aria-hidden='true' />
            </button>
          </div>
        </div>
      </header>

      <article className={styles.bodyCard}>
        <div className={styles.bodyContent}>
          {mail.bodyBlocks.map((block) => (
            <div
              key={block.id}
              className={`${styles.bodyBlock} ${
                block.tone === 'strong' ? styles.strong : ''
              }`}
            >
              {block.lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          ))}

          <div className={styles.interviewNote}>
            <strong className={styles.noteTitle}>{mail.interviewNote.title}</strong>

            <div className={styles.noteList}>
              {mail.interviewNote.items.map((item) => (
                <p key={item.label} className={styles.noteItem}>
                  <span>{`${item.label}:`}</span>
                  <strong>{item.value}</strong>
                </p>
              ))}
            </div>
          </div>

          <div className={styles.closing}>
            {mail.closingLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
      </article>
    </section>
  );
}
