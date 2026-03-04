export interface IndicatorItem {
  id: string;
  name: string;
  english: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  whatIsIt: string;
  howToRead: string[];
  keyPoints: string[];
}

export const indicators: IndicatorItem[] = [
  // 추세 지표
  {
    id: '이동평균선',
    name: '이동평균선',
    english: 'MA (Moving Average)',
    category: '추세',
    difficulty: 'beginner',
    whatIsIt: '이동평균선은 일정 기간 동안의 가격 평균을 계산해서 선으로 이어 놓은 지표예요. 가격의 전체적인 방향을 부드럽게 보여줘요.',
    howToRead: [
      '가격이 이동평균선 위에 있으면 상승 추세라고 봐요',
      '가격이 이동평균선 아래에 있으면 하락 추세라고 봐요',
      '5일, 20일, 60일, 120일선 등 다양한 기간을 사용한대요',
      '단기선이 장기선을 위로 교차하면 골든크로스라고 불러요',
    ],
    keyPoints: [
      '가장 기본적이고 널리 사용되는 지표예요',
      '추세의 방향을 한눈에 파악할 수 있어요',
      '다른 지표와 함께 사용하는 경우가 많대요',
    ],
  },
  {
    id: 'MACD',
    name: 'MACD',
    english: 'Moving Average Convergence Divergence',
    category: '추세',
    difficulty: 'intermediate',
    whatIsIt: 'MACD는 두 개의 이동평균선 사이의 차이를 이용해서 추세의 변화를 감지하는 지표예요. 추세의 방향과 강도를 동시에 보여줘요.',
    howToRead: [
      'MACD선이 시그널선을 위로 교차하면 골든크로스라고 해요',
      'MACD선이 시그널선을 아래로 교차하면 데드크로스라고 해요',
      '히스토그램이 0 위에 있으면 상승 에너지가 있다고 봐요',
      '기본 설정은 12일, 26일, 9일을 사용한대요',
    ],
    keyPoints: [
      '추세의 방향과 강도를 동시에 파악할 수 있어요',
      '시그널선과의 교차가 중요한 신호로 여겨진대요',
      '다이버전스(괴리)도 함께 살펴보면 좋대요',
    ],
  },
  {
    id: '일목균형표',
    name: '일목균형표',
    english: 'Ichimoku Cloud',
    category: '추세',
    difficulty: 'advanced',
    whatIsIt: '일목균형표는 일본에서 개발된 종합 지표로, 시간·가격·추세를 한눈에 보여줘요. 구름대(Cloud)가 특징적이에요.',
    howToRead: [
      '가격이 구름대 위에 있으면 상승 추세로 봐요',
      '가격이 구름대 아래에 있으면 하락 추세로 봐요',
      '전환선, 기준선, 후행스팬, 선행스팬 등 5개 요소로 구성돼요',
      '구름대가 두꺼울수록 지지/저항이 강하다고 봐요',
    ],
    keyPoints: [
      '하나의 지표로 다양한 정보를 동시에 파악할 수 있어요',
      '구성 요소가 많아서 처음에는 복잡하게 느껴질 수 있어요',
      '일봉, 주봉 등 긴 시간 단위에서 많이 사용한대요',
    ],
  },
  {
    id: 'ADX',
    name: 'ADX',
    english: 'Average Directional Index',
    category: '추세',
    difficulty: 'advanced',
    whatIsIt: 'ADX는 추세의 강도를 0~100 사이 숫자로 보여주는 지표예요. 추세가 얼마나 강한지를 측정해요.',
    howToRead: [
      '25 이상이면 추세가 강하다고 봐요',
      '20 이하면 추세가 약하거나 횡보 구간이라고 봐요',
      '+DI와 -DI로 방향을 함께 확인해요',
      'ADX 자체는 방향이 아니라 강도만 보여줘요',
    ],
    keyPoints: [
      '추세가 있는지 없는지를 먼저 판단하는 데 사용해요',
      '방향은 +DI/-DI로 따로 확인해야 해요',
      '횡보 구간에서는 다른 지표를 함께 보면 좋대요',
    ],
  },
  {
    id: '파라볼릭SAR',
    name: '파라볼릭 SAR',
    english: 'Parabolic SAR',
    category: '추세',
    difficulty: 'intermediate',
    whatIsIt: '파라볼릭 SAR은 가격 위아래에 점을 찍어서 추세의 방향을 시각적으로 보여주는 지표예요.',
    howToRead: [
      '점이 가격 아래에 있으면 상승 추세로 봐요',
      '점이 가격 위에 있으면 하락 추세로 봐요',
      '점의 위치가 바뀌는 순간이 추세 전환 신호예요',
      '추세가 강할수록 점과 가격 사이 간격이 벌어져요',
    ],
    keyPoints: [
      '시각적으로 추세를 파악하기 쉬운 지표예요',
      '횡보 구간에서는 신호가 자주 바뀔 수 있어요',
      '다른 추세 지표와 함께 확인하면 좋대요',
    ],
  },
  // 모멘텀 지표
  {
    id: 'RSI',
    name: 'RSI',
    english: 'Relative Strength Index',
    category: '모멘텀',
    difficulty: 'beginner',
    whatIsIt: 'RSI는 일정 기간 동안 가격이 올랐던 힘과 내렸던 힘을 비교해서 0~100 사이 숫자로 보여주는 지표예요.',
    howToRead: [
      '70 이상이면 과매수 구간이라고 불러요',
      '30 이하면 과매도 구간이라고 불러요',
      '일반적으로 14일 기준을 많이 사용한대요',
      '50을 기준으로 위면 상승 우위, 아래면 하락 우위로 봐요',
    ],
    keyPoints: [
      '추세의 강도를 숫자로 보여줘요',
      '단독으로 사용하기보다 다른 지표와 함께 보는 경우가 많대요',
      '다이버전스(가격과 RSI 방향 불일치)도 살펴보면 좋대요',
    ],
  },
  {
    id: '스토캐스틱',
    name: '스토캐스틱',
    english: 'Stochastic Oscillator',
    category: '모멘텀',
    difficulty: 'intermediate',
    whatIsIt: '스토캐스틱은 현재 가격이 일정 기간 동안의 가격 범위에서 어디쯤에 위치하는지를 보여주는 지표예요.',
    howToRead: [
      '80 이상이면 과매수 구간으로 봐요',
      '20 이하면 과매도 구간으로 봐요',
      '%K선과 %D선의 교차가 중요한 신호예요',
      'Fast와 Slow 두 가지 버전이 있어요',
    ],
    keyPoints: [
      '현재 가격의 상대적 위치를 파악할 수 있어요',
      'RSI와 비슷하지만 계산 방식이 달라요',
      '횡보 구간에서 특히 유용하다고 알려져 있어요',
    ],
  },
  {
    id: 'CCI',
    name: 'CCI',
    english: 'Commodity Channel Index',
    category: '모멘텀',
    difficulty: 'intermediate',
    whatIsIt: 'CCI는 가격이 통계적 평균에서 얼마나 벗어났는지를 측정하는 지표예요. 원래 원자재용으로 개발되었지만 주식에서도 많이 사용해요.',
    howToRead: [
      '+100 이상이면 평균보다 많이 올랐다는 뜻이에요',
      '-100 이하면 평균보다 많이 내렸다는 뜻이에요',
      '0선 기준으로 위아래를 구분해 봐요',
      '기본 기간은 20일을 사용한대요',
    ],
    keyPoints: [
      '가격이 평균에서 얼마나 벗어났는지 알 수 있어요',
      '추세의 시작과 끝을 감지하는 데 도움이 된대요',
      '다른 모멘텀 지표와 함께 활용하면 좋대요',
    ],
  },
  {
    id: '윌리엄스R',
    name: '윌리엄스 %R',
    english: 'Williams %R',
    category: '모멘텀',
    difficulty: 'intermediate',
    whatIsIt: '윌리엄스 %R은 스토캐스틱과 비슷하지만 값을 반대로(0에서 -100) 표현하는 모멘텀 지표예요.',
    howToRead: [
      '-20 이상이면 과매수 구간으로 봐요',
      '-80 이하면 과매도 구간으로 봐요',
      '기본 기간은 14일을 사용한대요',
      '스토캐스틱 %K를 뒤집어 놓은 것과 비슷해요',
    ],
    keyPoints: [
      '스토캐스틱과 유사하지만 표현 방식이 달라요',
      '빠르게 반응하는 편이라 단기 분석에 많이 사용한대요',
      '다른 지표와 함께 확인하면 좋대요',
    ],
  },
  // 변동성 지표
  {
    id: '볼린저밴드',
    name: '볼린저밴드',
    english: 'Bollinger Bands',
    category: '변동성',
    difficulty: 'intermediate',
    whatIsIt: '볼린저밴드는 이동평균선 위아래로 표준편차 밴드를 그려서 가격의 변동 범위를 보여주는 지표예요.',
    howToRead: [
      '밴드 폭이 좁아지면 수렴(Squeeze)이라고 해요',
      '밴드 폭이 넓어지면 확산(Expansion)이라고 해요',
      '가격이 상단밴드에 닿으면 과매수, 하단밴드에 닿으면 과매도 가능성이 있대요',
      '기본 설정은 20일 이동평균, 2 표준편차예요',
    ],
    keyPoints: [
      '가격의 변동 범위를 시각적으로 확인할 수 있어요',
      '수렴 후 확산이 나타날 때 큰 움직임이 올 수 있대요',
      '밴드 밖으로 벗어나는 건 이례적인 상황이래요',
    ],
  },
  {
    id: 'ATR',
    name: 'ATR',
    english: 'Average True Range',
    category: '변동성',
    difficulty: 'advanced',
    whatIsIt: 'ATR은 가격이 하루에 평균적으로 얼마나 움직이는지를 측정하는 변동성 지표예요.',
    howToRead: [
      'ATR 값이 크면 변동성이 크다는 뜻이에요',
      'ATR 값이 작으면 변동성이 작다는 뜻이에요',
      '기본 기간은 14일을 사용한대요',
      '방향은 알려주지 않고 크기만 측정해요',
    ],
    keyPoints: [
      '변동성의 크기를 객관적인 숫자로 파악할 수 있어요',
      '방향은 알 수 없고 움직임의 크기만 봐요',
      '리스크 관리 도구로 많이 활용한대요',
    ],
  },
  {
    id: '켈트너채널',
    name: '켈트너 채널',
    english: 'Keltner Channel',
    category: '변동성',
    difficulty: 'advanced',
    whatIsIt: '켈트너 채널은 볼린저밴드와 비슷하지만 표준편차 대신 ATR을 사용해서 채널을 그리는 지표예요.',
    howToRead: [
      '가격이 상단 채널 위로 올라가면 강한 상승이래요',
      '가격이 하단 채널 아래로 내려가면 강한 하락이래요',
      '채널 안에서 움직이면 일반적인 범위라고 봐요',
      'EMA 20일, ATR 10일이 기본 설정이래요',
    ],
    keyPoints: [
      '볼린저밴드보다 부드럽게 움직이는 편이에요',
      '볼린저밴드와 함께 사용하면 수렴 구간을 찾는 데 도움이 된대요',
      '추세와 변동성을 동시에 파악할 수 있어요',
    ],
  },
  // 거래량 지표
  {
    id: 'OBV',
    name: 'OBV',
    english: 'On Balance Volume',
    category: '거래량',
    difficulty: 'intermediate',
    whatIsIt: 'OBV는 거래량을 누적으로 더하거나 빼서 매수·매도의 힘을 파악하는 지표예요.',
    howToRead: [
      '가격이 오른 날은 거래량을 더하고, 내린 날은 빼요',
      'OBV가 상승하면 매수 압력이 크다고 봐요',
      'OBV가 하락하면 매도 압력이 크다고 봐요',
      '가격과 OBV 방향이 다르면 다이버전스라고 해요',
    ],
    keyPoints: [
      '거래량의 흐름을 하나의 선으로 파악할 수 있어요',
      '가격보다 먼저 움직이는 선행 지표로 알려져 있어요',
      '다이버전스가 중요한 신호로 여겨진대요',
    ],
  },
  {
    id: '거래량이동평균',
    name: '거래량 이동평균',
    english: 'Volume MA',
    category: '거래량',
    difficulty: 'beginner',
    whatIsIt: '거래량 이동평균은 일정 기간의 거래량 평균을 선으로 이은 지표예요. 현재 거래량이 평소보다 많은지 적은지 비교할 수 있어요.',
    howToRead: [
      '거래량이 이동평균보다 위면 평소보다 활발하다는 뜻이에요',
      '거래량이 이동평균보다 아래면 평소보다 조용하다는 뜻이에요',
      '5일, 20일 등 다양한 기간을 사용해요',
      '거래량 급증은 시장 관심이 높아졌다는 신호예요',
    ],
    keyPoints: [
      '현재 거래량이 평균 대비 어느 정도인지 알 수 있어요',
      '가격 변동과 함께 거래량을 확인하면 신뢰도가 높아진대요',
      '가장 기본적인 거래량 분석 도구예요',
    ],
  },
  {
    id: 'VWAP',
    name: 'VWAP',
    english: 'Volume Weighted Average Price',
    category: '거래량',
    difficulty: 'advanced',
    whatIsIt: 'VWAP은 거래량을 가중치로 반영한 평균 가격이에요. 해당 기간 동안 평균적으로 어느 가격에서 거래가 이루어졌는지 보여줘요.',
    howToRead: [
      '가격이 VWAP 위에 있으면 평균보다 높은 가격이에요',
      '가격이 VWAP 아래에 있으면 평균보다 낮은 가격이에요',
      '주로 일중(intraday) 분석에 많이 사용해요',
      '기관 투자자들이 많이 참고하는 지표래요',
    ],
    keyPoints: [
      '거래량을 반영한 "진짜" 평균 가격을 볼 수 있어요',
      '주로 단기 분석에 사용되는 지표예요',
      '기관의 매매 기준으로 많이 활용된대요',
    ],
  },
];
