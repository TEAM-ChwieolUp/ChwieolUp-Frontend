'use client';

import {
  CalendarDays,
  House,
  LayoutDashboard,
  NotebookPen,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import styles from './Sidebar.module.scss';
import { usePathname } from 'next/navigation';
import { Manrope } from 'next/font/google';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
});

const menuItems = [
  {
    label: '홈',
    href: '/',
    icon: House,
  },
  {
    label: '칸반',
    href: '/kanban',
    icon: LayoutDashboard,
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
    label: '설정',
    href: '/more',
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={`${styles.sidebar} ${manrope.className}`}>
      <div className={styles.content}>
        <div className={styles.logoBlock}>
          <strong className={styles.brand}>ChwieolUp</strong>
          <span className={styles.brandCaption}>CAREER ARCHITECT</span>
        </div>

        <nav className={styles.nav}>
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.link} ${isActive ? styles.active : ''}`}
              >
                <span className={styles.iconWrap}>
                  <Icon className={styles.icon} aria-hidden='true' />
                </span>
                <span className={styles.label}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
