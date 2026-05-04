import { Retrospective } from './types';

export const dummyRetros: Retrospective[] = [
  {
    id: '1',
    company: '네이버',
    position: '프론트엔드 개발자',
    stage: '면접',
    date: '2024-03-20',
    question: 'React의 가상 DOM 동작 원리와 성능 최적화 방법에 대해 설명해주세요.',
    answer:
      '가상 DOM은 실제 DOM의 가벼운 복사본으로, 변경사항을 먼저 가상 DOM에 적용한 후 실제 DOM과 비교(diffing)하여 최소한의 변경만 실제 DOM에 반영합니다. useMemo, useCallback, React.memo 등을 활용한 최적화 방법을 설명했습니다.',
    reflection:
      'Reconciliation 알고리즘에 대해 더 깊이 공부해야겠다. Fiber 아키텍처에 대한 이해가 부족했다.',
    feeling: '면접관분이 친절하셔서 편하게 대답할 수 있었다. 기술 면접이지만 압박감이 적었다.',
    extraSections: [],
  },
  {
    id: '2',
    company: '카카오',
    position: '백엔드 개발자',
    stage: '코테',
    date: '2024-03-18',
    question:
      '주어진 배열에서 두 수의 합이 target이 되는 인덱스 쌍을 찾는 알고리즘을 구현하세요. 시간복잡도 O(n)으로 해결해야 합니다.',
    answer: 'HashMap을 사용하여 O(n) 시간복잡도로 해결했습니다. 각 원소를 순회하며 target - 현재값을 해시맵에서 조회하는 방식으로 구현했습니다.',
    reflection: '엣지 케이스 처리가 부족했다. 음수나 중복 원소에 대한 처리를 놓쳤다.',
    feeling: '시간이 촉박해서 긴장됐지만 핵심 로직은 빠르게 파악했다.',
    extraSections: [],
  },
  {
    id: '3',
    company: '토스',
    position: 'iOS 개발자',
    stage: '서류',
    date: '2024-03-15',
    question: '자기소개서 - 협업 경험과 갈등 해결 사례를 작성하시오.',
    answer: '팀 프로젝트에서 의견 충돌이 있었을 때 데이터를 기반으로 설득하고 합의점을 찾은 경험을 작성했습니다.',
    reflection: '구체적인 수치나 결과물을 더 명확히 제시했어야 했다.',
    feeling: '자기소개서 작성이 생각보다 어려웠다. 경험을 STAR 방식으로 정리하는 연습이 필요하다.',
    extraSections: [],
  },
  {
    id: '4',
    company: '라인',
    position: '서버 개발자',
    stage: '최종',
    date: '2024-03-10',
    question: '최종 면접 - 왜 라인에서 일하고 싶은지, 5년 후 커리어 계획은?',
    answer: '글로벌 서비스 개발 경험을 쌓고 싶다는 포부와 함께 라인의 기술 스택과 문화에 대한 관심을 표현했습니다.',
    reflection: '더 구체적인 기여 계획을 준비했어야 했다. 단순한 포부보다 실행 가능한 계획이 필요했다.',
    feeling: '최종 면접이라 많이 긴장됐지만 전반적으로 잘 마무리된 것 같다.',
    extraSections: [
      { id: 'e1', title: '회사 분위기', content: '면접관 분들이 모두 친절하고 수평적인 분위기였다.' },
    ],
  },
];
