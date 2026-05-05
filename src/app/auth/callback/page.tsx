'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AUTH_CALLBACK_ROUTE, LOGIN_ROUTE } from '@/lib/api';
import { refreshAccessToken } from '@/lib/api/session';

export default function AuthCallbackPage() {
  const router = useRouter();
  const hasHandled = useRef(false);

  useEffect(() => {
    if (hasHandled.current) {
      return;
    }

    hasHandled.current = true;

    void refreshAccessToken()
      .then(() => {
        router.replace('/');
      })
      .catch(() => {
        router.replace(`${LOGIN_ROUTE}?error=oauth_callback`);
      });
  }, [router]);

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '24px',
        background:
          'radial-gradient(circle at top, rgba(59, 130, 246, 0.12), transparent 35%), #f8fafc',
      }}
    >
      <section
        style={{
          width: '100%',
          maxWidth: '420px',
          borderRadius: '24px',
          border: '1px solid #e2e8f0',
          background: 'rgba(255, 255, 255, 0.92)',
          padding: '32px',
          textAlign: 'center',
          boxShadow: '0 24px 48px rgba(15, 23, 42, 0.08)',
        }}
      >
        <p
          style={{
            margin: 0,
            color: '#2563eb',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {AUTH_CALLBACK_ROUTE}
        </p>
        <h1
          style={{
            margin: '12px 0 8px',
            color: '#0f172a',
            fontSize: '24px',
            fontWeight: 800,
          }}
        >
          로그인 처리 중
        </h1>
        <p
          style={{
            margin: 0,
            color: '#475569',
            fontSize: '14px',
            lineHeight: 1.6,
          }}
        >
          소셜 로그인 정보를 확인하고 있습니다. 잠시만 기다려 주세요.
        </p>
      </section>
    </main>
  );
}
