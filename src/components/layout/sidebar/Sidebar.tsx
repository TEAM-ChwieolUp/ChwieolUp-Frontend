'use client';

import {
  CalendarDays,
  Ellipsis,
  House,
  KanbanSquare,
  NotebookPen,
} from 'lucide-react';

import Image from 'next/image';
import Link from 'next/link';
import styles from './Sidebar.module.scss';
import { usePathname } from 'next/navigation';

const menuItems = [
  {
    label: '홈',
    href: '/',
    icon: House,
  },
  {
    label: '칸반',
    href: '/kanban',
    icon: KanbanSquare,
  },
  {
    label: '캘린더',
    href: '/calendar',
    icon: CalendarDays,
  },
  {
    label: '회고',
    href: '/retrospective',
    icon: NotebookPen,
  },
  {
    label: '더보기',
    href: '/more',
    icon: Ellipsis,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoCard}>
        <Image
          src='/logo/logo_temp.png'
          alt='취얼업 메인 로고'
          width={190}
          height={50}
          className={styles.logoImage}
          priority
        />
      </div>

      <nav className={styles.nav}>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.link} ${isActive ? styles.active : ''}`}
            >
              <Icon className={styles.icon} aria-hidden='true' />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
