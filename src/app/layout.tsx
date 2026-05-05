import './globals.css';

import type { Metadata } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import AppProviders from './providers';

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const siteName = '취얼업 - 취업 관리 올인원 플랫폼';
const siteDescription =
  '취업 준비 과정을 한곳에서 관리하는 대시보드입니다. 칸반, 메일, 캘린더, 회고 기능으로 지원 현황과 다음 액션을 정리할 수 있습니다.';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const ogImage = '/logo/logo_temp.png';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: [
    '취얼업',
    '취업 관리',
    '취업 준비',
    '지원 현황',
    '칸반',
    '메일 관리',
    '캘린더',
    '회고',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: '/',
    siteName,
    title: siteName,
    description: siteDescription,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: `${siteName} 대표 이미지`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description: siteDescription,
    images: [ogImage],
  },
  icons: {
    icon: '/main_logo.png',
    shortcut: '/main_logo.png',
    apple: '/main_logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='ko'>
      <body className={notoSansKr.className}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
