# AGENTS.md

이 문서는 Codex를 포함한 작업 에이전트가 본 코드베이스에서 작업할 때 참고하는 현재 구현 기준 가이드다.

---

## 프로젝트 개요

**ChwieolUp(취얼업)** 은 취업 준비 과정에서 흩어진 정보를 한 곳에서 관리하기 위한 서비스다.

현재 프론트엔드에서 핵심으로 다루는 도메인은 다음과 같다.

- 인증: OAuth 로그인, 토큰 재발급, 인증 상태 복구
- 칸반: 지원 카드, 단계(Stage), 태그(Tag) 관리
- 캘린더: 일정 조회, 생성, 수정, 삭제, `.ics` 내보내기
- 홈/메일/회고: 아직 더미 데이터 또는 부분 구현 상태가 섞여 있음

문서를 읽을 때는 “목표 구조”가 아니라 **현재 코드 구조와 이미 합의된 구현 방식**을 기준으로 본다.

---

## 기술 스택

- Framework: Next.js App Router
- Language: TypeScript
- UI: React
- Styling: SCSS Module
- Server State: TanStack Query
- Client State: Zustand
- HTTP: fetch 기반 공통 API client
- Package Manager: pnpm 기준

주의:

- 새 라이브러리 추가 전에는 기존 구현으로 해결 가능한지 먼저 확인한다.
- 의존성을 추가하면 `package.json` 뿐 아니라 `pnpm-lock.yaml`도 반드시 함께 갱신한다.

---

## 현재 폴더 구조

실제 기준 구조는 다음과 같다.

```text
src/
├── app/
│   ├── layout.tsx
│   ├── providers.tsx
│   ├── login/
│   ├── auth/callback/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── calendar/
│   │   ├── kanban/
│   │   ├── mail/
│   │   ├── more/
│   │   └── retrospective/
│   └── api/
│       ├── dummy/
│       └── types/
│
├── components/
│   ├── auth/
│   ├── calendar/
│   ├── common/
│   ├── home/
│   ├── kanban/
│   ├── layout/
│   ├── mail/
│   └── retrospective/
│
├── features/
│   ├── calendar/
│   │   └── api/
│   └── kanban/
│       └── api/
│
├── lib/
│   ├── api/
│   └── query/
│
├── providers/
│   └── query-provider.tsx
│
├── store/
│   └── auth-store.ts
│
└── types/
```

원칙:

- `app/` 는 라우트와 상위 조립만 담당한다.
- 실제 화면 로직은 `components/*` 에 있다.
- API 호출 함수는 `features/*/api` 또는 `lib/api` 에 둔다.
- 전역 인증/세션 관련 로직은 `lib/api`, `store`, `providers` 에 둔다.
- `src/app/api/*` 는 현재 Next route handler 용도가 아니라 더미/타입 보관 성격이 섞여 있다. 공통 API client 계층을 여기에 확장하지 않는다.

---

## 인증 구조

현재 인증은 다음 구조를 따른다.

### 로그인 방식

- 소셜 로그인 시작:
  - `GET /oauth2/authorization/google`
  - `GET /oauth2/authorization/kakao`
- 프론트는 fetch 호출이 아니라 브라우저 이동으로 시작한다.
- 구현 위치:
  - `src/lib/api/oauth.ts`
  - `src/app/login/LoginPage.tsx`

### 로그인 성공 후 처리

- 백엔드는 로그인 성공 후 프론트의 `/auth/callback` 으로 리다이렉트한다.
- 프론트는 callback 페이지에서 바로 `POST /api/auth/refresh` 를 호출한다.
- `refresh_token` 은 `HttpOnly` 쿠키로만 관리된다.
- 프론트는 `accessToken` 과 사용자 정보만 상태에 저장한다.

### 토큰 저장/복구

- `accessToken`: 메모리 저장
- 사용자 정보: Zustand store
- 세션 복구:
  - `bootstrapSession()` 이 refresh API를 호출
  - 성공 시 `accessToken` + 사용자 정보 저장
  - 실패 시 anonymous 상태

관련 파일:

- `src/lib/api/session.ts`
- `src/lib/api/token-store.ts`
- `src/store/auth-store.ts`
- `src/components/auth/AuthGate.tsx`
- `src/providers/query-provider.tsx`

### 인증 가드

- 대시보드 영역은 `AuthGate` 로 보호한다.
- 비로그인 상태면 `/login` 으로 이동한다.
- 서버 middleware 기반 보호가 아니라 **클라이언트 세션 복구 후 판단** 방식이다.

---

## API 연동 원칙

### 공통 API client

공통 API 계층은 `src/lib/api/*` 에 있다.

핵심 파일:

- `config.ts`: env 기반 base URL 설정
- `fetcher.ts`: 공통 fetch wrapper
- `client.ts`: `api.get/post/patch/delete`
- `session.ts`: refresh, bootstrap, auth failure 처리
- `errors.ts`: `ApiError`
- `http.ts`: URL 조립, 응답 파싱

### base URL / env

현재 서버 origin 은 다음 env를 사용한다.

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

추가로 refresh path 는 아래 env로 덮을 수 있다.

```env
NEXT_PUBLIC_API_REFRESH_PATH=/api/auth/refresh
```

중요:

- 서버 주소 전환은 env 기준으로 한다.
- 하드코딩된 `http://localhost:8080` 문자열을 새 코드에 직접 넣지 않는다.

### 토큰 처리

모든 인증 요청은 다음 규칙을 따른다.

- `Authorization: Bearer {accessToken}` 자동 첨부
- `credentials: 'include'` 유지
- `401` 발생 시 `POST /api/auth/refresh` 호출
- refresh 성공 시 원래 요청 1회 재시도
- refresh 실패 시 세션 초기화 후 로그인 상태 해제

### 응답 형식

성공 응답은 대체로 아래 구조를 따른다.

```ts
type ApiSuccessResponse<T> = {
  data: T;
  meta?: {
    timestamp: string;
    requestId: string | null;
  };
};
```

오류 응답은 아래 구조를 따른다.

```ts
type ErrorResponse = {
  code: string;
  message: string;
  detail?: string;
  timestamp: string;
  path: string;
};
```

### 구현 원칙

- 컴포넌트에서 `fetch` 를 직접 호출하지 않는다.
- API 함수는 `features/*/api` 또는 `lib/api` 를 통해 호출한다.
- API 에러는 `ApiError` 기준으로 처리한다.
- 사용자 액션이 있는 mutation 실패는 무시하지 말고 안내한다.

---

## TanStack Query 사용 방식

현재 Query Provider 는 이미 전역에 붙어 있다.

관련 파일:

- `src/lib/query/query-client.ts`
- `src/providers/query-provider.tsx`
- `src/app/providers.tsx`

원칙:

- 서버 상태는 TanStack Query로 관리한다.
- 목록/보드/달력 조회는 `useQuery`
- 생성/수정/삭제는 `useMutation`
- mutation 후에는 필요한 query key를 invalidate 한다.

현재 주요 query key:

- `applicationKeys`
- `stageKeys`
- `tagKeys`
- `scheduleKeys`

---

## 칸반 구현 규칙

### 관련 파일

- UI:
  - `src/components/kanban/KanbanBoard.tsx`
  - `src/components/kanban/AddApplicationModal.tsx`
  - `src/components/kanban/StageSettingsModal.tsx`
  - `src/components/kanban/KanbanCard.tsx`
  - `src/components/kanban/types.ts`
- API:
  - `src/features/kanban/api/applications.ts`
  - `src/features/kanban/api/stages.ts`
  - `src/features/kanban/api/tags.ts`

### 연결된 API

- Stages
  - `GET /api/stages`
  - `POST /api/stages`
  - `PATCH /api/stages/{id}`
  - `DELETE /api/stages/{id}`
- Tags
  - `GET /api/tags`
  - `POST /api/tags`
  - `PATCH /api/tags/{id}`
  - `DELETE /api/tags/{id}`
- Applications
  - `GET /api/applications`
  - `POST /api/applications`
  - `PATCH /api/applications/{id}`
  - `DELETE /api/applications/{id}`

### 중요한 구현 메모

- 보드는 `GET /api/applications` 응답을 기준으로 렌더링한다.
- 별도 `GET /api/stages` 는 보조 동기화 및 단계 관리 모달용이다.
- 카드 드래그 이동 시 `stageId` 만 보내지 않는다.
  - 현재 백엔드 validation 기준으로 카드 스냅샷 필드를 함께 보내는 PATCH 방식으로 구현돼 있다.
- 단계 삭제는 고정 단계가 아니고 카드가 0개일 때만 실제 삭제 가능하다.
- 태그는 카드 모달에서 생성 가능하며, 생성 후 즉시 선택 상태로 반영된다.

### UI 모델

칸반 단계는 UI에서 다음 kind를 쓴다.

- `custom`
- `passed`
- `rejected`

백엔드 category 와 매핑한다.

- `IN_PROGRESS -> custom`
- `PASSED -> passed`
- `REJECTED -> rejected`

---

## 캘린더 구현 규칙

### 관련 파일

- UI:
  - `src/components/calendar/CalendarView.tsx`
  - `src/components/calendar/AddEventModal.tsx`
  - `src/components/calendar/EventDetailPopover.tsx`
  - `src/components/calendar/types.ts`
- API:
  - `src/features/calendar/api/schedule.ts`

### 연결된 API

- `GET /api/schedule/calendar`
- `POST /api/schedule/events`
- `PATCH /api/schedule/events/{id}`
- `DELETE /api/schedule/events/{id}`
- `GET /api/schedule/events/{id}/export`

### 중요한 구현 메모

- 캘린더 UI는 원래 더미 모델이 서버 응답과 달랐다.
- 현재는 서버 응답 기준으로 이벤트 모델을 맞췄다:
  - `startAt`
  - `endAt`
  - `category`
  - `applicationId`
- 따라서 예전처럼 `location`, `description`, `type` 중심으로 확장하지 않는다.
- 카테고리는 서버 enum 기준을 그대로 쓴다:
  - `JOB_POSTING`
  - `APPLICATION_PROCESS`
  - `PERSONAL`

### 카테고리 규칙

- `PERSONAL`
  - `applicationId` 는 비워야 한다.
- `APPLICATION_PROCESS`
  - `applicationId` 필수
- `JOB_POSTING`
  - `applicationId` 필수
  - 중복 생성 가능 여부는 서버 제약을 따른다.

### 시간대 처리

중요:

- 서버 시간은 UTC ISO 문자열이다.
- UI 입력/표시는 로컬 시간 기준으로 맞춘다.
- `toISOString().slice(...)` 같은 UTC 기반 문자열 절단으로 화면 시간을 표시하지 않는다.
- 캘린더 셀 매칭, 주간 시간 표시, 수정 모달 초기값 모두 로컬 시간 기준으로 처리한다.

### 내보내기

- `.ics` 다운로드는 `window.open()` 이 아니라 `fetch -> Blob -> download` 로 구현돼 있다.
- 이유:
  - 현재 인증은 `Authorization` 헤더를 사용하므로 새 탭 단순 오픈보다 fetch 기반이 안전하다.

---

## Next.js 규칙

- App Router 기준으로 작업한다.
- 상호작용이 없는 상위 레이아웃까지 무조건 Client Component로 만들지 않는다.
- `"use client"` 는 다음 경우에만 붙인다.
  - state/effect 사용
  - 브라우저 API 사용
  - 이벤트 핸들러 사용
  - TanStack Query hook 사용
  - Zustand hook 사용

현재 실제 client entry 성격이 강한 파일 예시:

- `src/components/kanban/*`
- `src/components/calendar/*`
- `src/components/auth/AuthGate.tsx`
- `src/providers/query-provider.tsx`
- `src/app/login/LoginPage.tsx`
- `src/app/auth/callback/page.tsx`

---

## 작업 시 주의사항

### 1. Next.js 문서 확인

이 프로젝트는 Next.js 최신 버전을 사용한다. Next.js 관련 구현을 바꾸기 전에는 필요 시 `node_modules/next/dist/docs/` 의 관련 문서를 먼저 확인한다.

### 2. lockfile 동기화

의존성 추가/삭제 후에는 반드시 아래 파일들을 함께 맞춘다.

- `package.json`
- `pnpm-lock.yaml`

Netlify CI 는 `frozen-lockfile` 로 설치하므로 lockfile 불일치가 있으면 바로 배포 실패한다.

### 3. 더미 데이터 취급

- 홈, 메일, 회고 일부에는 아직 더미 데이터가 남아 있다.
- 이미 API 연결된 칸반/캘린더 영역에는 더미 데이터를 다시 주입하지 않는다.
- 새 작업 전에는 해당 화면이 실제 API 연결 상태인지 먼저 확인한다.

### 4. API 스펙 우선

- Swagger 또는 최신 백엔드 계약을 기준으로 타입을 맞춘다.
- 프론트 기존 UI가 서버 모델과 다르면, 임시 어댑터를 두더라도 서버 모델 중심으로 재정의한다.

### 5. 에러 처리

- mutation 실패를 삼키지 않는다.
- 사용자 액션 실패 시 최소한 alert/toast 등으로 이유를 보여준다.
- 삭제/이동/저장처럼 상태가 바뀌는 작업은 낙관적으로 처리하더라도 서버 실패 복구 경로를 고려한다.

---

## 빠른 참조

- 로그인 시작: `src/lib/api/oauth.ts`
- 세션 복구: `src/lib/api/session.ts`
- 인증 상태: `src/store/auth-store.ts`
- 공통 API client: `src/lib/api/*`
- Query Provider: `src/providers/query-provider.tsx`
- 칸반 API: `src/features/kanban/api/*`
- 캘린더 API: `src/features/calendar/api/schedule.ts`

문서가 현재 코드와 다시 어긋나면, 목표 구조를 적는 대신 **실제 구현 기준으로 즉시 업데이트**한다.
