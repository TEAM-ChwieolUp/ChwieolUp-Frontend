'use client';

import { useState } from 'react';
import AiAnalysis from './ai-analysis/AiAnalysis';
import { defaultMailId, mailRecords } from './data';
import MailDetail from './mail-detail/MailDetail';
import MailList from './mail-list/MailList';
import styles from '@/app/(dashboard)/mail/page.module.scss';

export default function MailExperience() {
  const [activeId, setActiveId] = useState(defaultMailId);

  const activeMail =
    mailRecords.find((record) => record.thread.id === activeId) ?? mailRecords[0];

  return (
    <div className={styles.page}>
      <MailList
        threads={mailRecords.map((record) => record.thread)}
        activeId={activeId}
        onSelect={setActiveId}
      />

      <div className={styles.content}>
        <div className={styles.contentInner}>
          <MailDetail mail={activeMail.detail} />
          <AiAnalysis actions={activeMail.aiActions} />
        </div>
      </div>
    </div>
  );
}
