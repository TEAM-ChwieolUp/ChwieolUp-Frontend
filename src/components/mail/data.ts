import type { MailRecord } from './types';

export const mailRecords: MailRecord[] = [
  {
    thread: {
      id: 'toss-payments',
      sender: '토스페이먼츠',
      subject: '[토스페이먼츠] 서류 전형 합격',
      preview: '안녕하세요, 토스페이먼츠 채용팀입니다. ...',
      receivedAt: '오전 10:24',
      accent: 'blue',
    },
    detail: {
      statusLabel: '지원 완료',
      statusTone: 'green',
      receivedLabel: '수신 시간 오전 10:24',
      subject: '[토스페이먼츠] 서류 전형 합격 안내',
      senderName: '토스페이먼츠 채용팀',
      senderEmail: 'recruit@tosspayments.com',
      recipient: 'career_architect@chwieolup.ai',
      recipientLabel: '받는 사람',
      avatarLabel: 'TP',
      bodyBlocks: [
        {
          id: 'greeting',
          lines: ['안녕하세요, 000님. 토스페이먼츠 채용팀입니다.'],
        },
        {
          id: 'thanks',
          lines: [
            '먼저 저희 토스페이먼츠의 [Product Designer] 포지션에 관심을 갖고 지원해 주셔서 진심으로 감사드립니다.',
          ],
        },
        {
          id: 'result',
          tone: 'strong',
          lines: [
            '귀하의 서류 전형 결과를 안내드립니다. 축하합니다, 서류 전형에 합격하셨습니다.',
          ],
        },
        {
          id: 'next-step',
          lines: [
            '다음 단계인 직무 인터뷰를 통해 000님을 직접 뵙고 더 깊은 이야기를 나누고 싶습니다. 아래의 인터뷰 일정을 확인해 주시기 바랍니다.',
          ],
        },
      ],
      interviewNote: {
        title: '면접 일정 안내',
        items: [
          {
            label: '일시',
            value: '2026년 4월 8일 (수) 오전 10시',
          },
          {
            label: '장소',
            value: '화상 면접 (Google Meet 링크는 별도 안내)',
          },
        ],
      },
      closingLines: [
        '인터뷰와 관련하여 궁금하신 점이 있다면 언제든 이 메일로 회신 주시기 바랍니다.',
        '토스페이먼츠 채용팀 드림',
      ],
    },
    aiActions: [
      {
        id: 'kanban',
        tone: 'blue',
        icon: 'kanban',
        title: '칸반 보드에서',
        accentText: '[서류통과]',
        description: ['단계로 이동할까요?'],
        primaryAction: '수락',
        secondaryAction: '거절',
      },
      {
        id: 'calendar',
        tone: 'green',
        icon: 'calendar',
        title: '면접 일정이 감지되었습니다.',
        description: ['2026년 4월 8일 오전 10시, 달력에 추가할까요?'],
        primaryAction: '수락',
        secondaryAction: '거절',
      },
    ],
  },
  {
    thread: {
      id: 'linkedin',
      sender: '링크드인',
      subject: '지원한 공고가 조회되었습니다',
      preview: '쿠팡 채용 담당자 3명이 회원님의 지원서를 확인했습니다.',
      receivedAt: '어제',
    },
    detail: {
      statusLabel: '열람 감지',
      statusTone: 'green',
      receivedLabel: '수신 시간 어제 오후 5:12',
      subject: '[링크드인] 지원한 포지션이 조회되었습니다',
      senderName: '링크드인 알림',
      senderEmail: 'jobs-noreply@linkedin.com',
      recipient: 'career_architect@chwieolup.ai',
      recipientLabel: '받는 사람',
      avatarLabel: 'IN',
      bodyBlocks: [
        {
          id: 'linkedin-greeting',
          lines: ['안녕하세요, 000님. 링크드인 채용 알림입니다.'],
        },
        {
          id: 'linkedin-main',
          tone: 'strong',
          lines: [
            '회원님이 지원한 쿠팡 Product Designer 포지션을 채용 담당자 3명이 확인했습니다.',
          ],
        },
        {
          id: 'linkedin-next',
          lines: [
            '프로필 최신화와 포트폴리오 링크 점검을 통해 다음 연락에 대비해 보세요.',
          ],
        },
      ],
      interviewNote: {
        title: '추천 액션',
        items: [
          {
            label: '포트폴리오',
            value: '최근 프로젝트 1건을 상단에 고정해 두기',
          },
          {
            label: '자기소개',
            value: '직무 키워드에 맞춰 한 줄 요약 업데이트하기',
          },
        ],
      },
      closingLines: ['좋은 결과가 이어질 수 있도록 계속 지원 현황을 관리해 보세요.'],
    },
    aiActions: [
      {
        id: 'kanban-linkedin',
        tone: 'blue',
        icon: 'kanban',
        title: '칸반 보드의',
        accentText: '[서류검토중]',
        description: ['단계로 옮겨 둘까요?'],
        primaryAction: '이동',
        secondaryAction: '유지',
      },
    ],
  },
  {
    thread: {
      id: 'woowa',
      sender: '우아한형제들',
      subject: '과제 전형 안내 드립니다',
      preview: '안녕하세요. 우아한형제들 기술 블로그 팀입니다. ...',
      receivedAt: '4월 2일',
    },
    detail: {
      statusLabel: '과제 전형',
      statusTone: 'green',
      receivedLabel: '수신 시간 4월 2일 오후 2:05',
      subject: '[우아한형제들] 과제 전형 안내',
      senderName: '우아한형제들 채용팀',
      senderEmail: 'recruit@woowahan.com',
      recipient: 'career_architect@chwieolup.ai',
      recipientLabel: '받는 사람',
      avatarLabel: 'WB',
      bodyBlocks: [
        {
          id: 'woowa-greeting',
          lines: ['안녕하세요. 우아한형제들 채용팀입니다.'],
        },
        {
          id: 'woowa-main',
          tone: 'strong',
          lines: [
            '서류 전형 결과, 다음 단계인 과제 전형 대상자로 선정되셨음을 안내드립니다.',
          ],
        },
        {
          id: 'woowa-next',
          lines: [
            '과제 제출 가이드와 평가 기준을 아래 일정에 맞춰 확인해 주세요.',
          ],
        },
      ],
      interviewNote: {
        title: '과제 제출 안내',
        items: [
          {
            label: '제출 기한',
            value: '2026년 4월 10일 (금) 오후 6시',
          },
          {
            label: '제출 방식',
            value: '이메일 회신 및 피그마 링크 첨부',
          },
        ],
      },
      closingLines: ['질문이 있으시면 본 메일에 답장 주시면 빠르게 안내드리겠습니다.'],
    },
    aiActions: [
      {
        id: 'calendar-woowa',
        tone: 'green',
        icon: 'calendar',
        title: '과제 제출 마감이 감지되었습니다.',
        description: ['2026년 4월 10일 오후 6시, 캘린더에 등록할까요?'],
        primaryAction: '등록',
        secondaryAction: '닫기',
      },
    ],
  },
  {
    thread: {
      id: 'google',
      sender: '구글 커리어',
      subject: '지원 현황 업데이트 안내',
      preview: '지원해 주셔서 감사합니다. 현재 채용팀이 검토 중입니다.',
      receivedAt: '3월 31일',
    },
    detail: {
      statusLabel: '검토 중',
      statusTone: 'green',
      receivedLabel: '수신 시간 3월 31일 오전 9:40',
      subject: '[구글 커리어] 지원 현황 업데이트',
      senderName: 'Google Careers',
      senderEmail: 'careers-no-reply@google.com',
      recipient: 'career_architect@chwieolup.ai',
      recipientLabel: '받는 사람',
      avatarLabel: 'GC',
      bodyBlocks: [
        {
          id: 'google-greeting',
          lines: ['안녕하세요. Google Careers 팀입니다.'],
        },
        {
          id: 'google-main',
          lines: [
            '지원해 주셔서 감사합니다. 현재 제출하신 지원서는 채용팀에서 검토 중이며, 다음 단계가 확정되면 다시 안내드리겠습니다.',
          ],
        },
        {
          id: 'google-tip',
          lines: ['추가 포트폴리오 업데이트가 있다면 채용 페이지에서 수정할 수 있습니다.'],
        },
      ],
      interviewNote: {
        title: '현재 상태',
        items: [
          {
            label: '단계',
            value: '지원서 검토 진행 중',
          },
          {
            label: '추천',
            value: '이력서 최신 버전 여부 다시 점검하기',
          },
        ],
      },
      closingLines: ['관심 가져 주셔서 감사드리며, 좋은 소식으로 다시 연락드리겠습니다.'],
    },
    aiActions: [
      {
        id: 'kanban-google',
        tone: 'blue',
        icon: 'kanban',
        title: '칸반 보드에서',
        accentText: '[지원완료]',
        description: ['상태를 유지할까요?'],
        primaryAction: '유지',
        secondaryAction: '닫기',
      },
    ],
  },
];

export const defaultMailId = 'toss-payments';
