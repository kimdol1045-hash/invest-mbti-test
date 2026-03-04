export interface Question {
  id: number;
  axis: 'EI' | 'SN' | 'TF' | 'JP';
  text: string;
  options: { label: string; value: string }[];
}

export const questions: Question[] = [
  // E/I 축 (3문항)
  {
    id: 1,
    axis: 'EI',
    text: '관심 있는 종목을 발견했어요. 가장 먼저 하는 행동은?',
    options: [
      { label: '주변 사람들에게 이야기하고 의견을 나눠요', value: 'E' },
      { label: '혼자 자료를 찾아보며 조용히 분석해요', value: 'I' },
    ],
  },
  {
    id: 2,
    axis: 'EI',
    text: '투자 관련 정보는 주로 어디서 얻나요?',
    options: [
      { label: '커뮤니티, 단톡방, 유튜브 라이브 등 사람들과 함께', value: 'E' },
      { label: '리포트, 공시, 책 등 혼자 읽을 수 있는 자료', value: 'I' },
    ],
  },
  {
    id: 3,
    axis: 'EI',
    text: '투자 스터디 모임에 초대받았어요. 나의 반응은?',
    options: [
      { label: '다양한 의견을 들을 수 있어서 기대돼요', value: 'E' },
      { label: '혼자 공부하는 게 더 효율적이라고 생각해요', value: 'I' },
    ],
  },

  // S/N 축 (3문항)
  {
    id: 4,
    axis: 'SN',
    text: '종목을 분석할 때 더 중요하게 보는 건?',
    options: [
      { label: '재무제표, PER, 거래량 같은 구체적인 숫자', value: 'S' },
      { label: '산업 전망, 미래 가능성 같은 큰 그림', value: 'N' },
    ],
  },
  {
    id: 5,
    axis: 'SN',
    text: '차트를 볼 때 나는?',
    options: [
      { label: '구체적인 가격대와 수치를 꼼꼼히 확인해요', value: 'S' },
      { label: '전체적인 흐름과 방향이 먼저 눈에 들어와요', value: 'N' },
    ],
  },
  {
    id: 6,
    axis: 'SN',
    text: '투자 아이디어가 떠오르는 순간은?',
    options: [
      { label: '데이터를 분석하다가 패턴을 발견했을 때', value: 'S' },
      { label: '일상에서 트렌드나 변화를 감지했을 때', value: 'N' },
    ],
  },

  // T/F 축 (3문항)
  {
    id: 7,
    axis: 'TF',
    text: '보유 종목이 급락했어요. 나의 첫 반응은?',
    options: [
      { label: '하락 원인을 분석하고 데이터를 확인해요', value: 'T' },
      { label: '불안하고 걱정이 먼저 들어요', value: 'F' },
    ],
  },
  {
    id: 8,
    axis: 'TF',
    text: '투자 원칙과 현재 감이 충돌할 때?',
    options: [
      { label: '원칙대로 움직여요. 감정은 판단을 흐려요', value: 'T' },
      { label: '그때 상황과 분위기도 중요하다고 생각해요', value: 'F' },
    ],
  },
  {
    id: 9,
    axis: 'TF',
    text: '주변 사람이 손실을 보고 있다고 했을 때?',
    options: [
      { label: '객관적인 상황 분석과 정보를 공유해요', value: 'T' },
      { label: '먼저 공감하고 위로의 말을 건네요', value: 'F' },
    ],
  },

  // J/P 축 (3문항)
  {
    id: 10,
    axis: 'JP',
    text: '나의 투자 스타일에 가까운 건?',
    options: [
      { label: '미리 기준을 정해두고 그대로 실행해요', value: 'J' },
      { label: '시장 상황을 보면서 유연하게 대응해요', value: 'P' },
    ],
  },
  {
    id: 11,
    axis: 'JP',
    text: '수익이 나고 있을 때, 나는?',
    options: [
      { label: '목표 수익률에 도달하면 계획대로 정리해요', value: 'J' },
      { label: '더 갈 수 있을 것 같으면 좀 더 지켜봐요', value: 'P' },
    ],
  },
  {
    id: 12,
    axis: 'JP',
    text: '예상하지 못한 호재가 터졌어요. 나는?',
    options: [
      { label: '기존 계획에 영향이 있는지 먼저 확인해요', value: 'J' },
      { label: '새로운 기회일 수 있으니 빠르게 살펴봐요', value: 'P' },
    ],
  },
];
