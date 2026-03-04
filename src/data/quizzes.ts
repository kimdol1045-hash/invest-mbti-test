export interface QuizItem {
  indicatorId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const quizzes: QuizItem[] = [
  // 보조지표 퀴즈
  { indicatorId: '이동평균선', question: '단기 이동평균선이 장기 이동평균선을 위로 교차하는 것을 뭐라고 부르나요?', options: ['데드크로스', '골든크로스', '다이버전스', '컨버전스'], correctIndex: 1, explanation: '단기선이 장기선을 위로 교차하면 골든크로스, 아래로 교차하면 데드크로스라고 불러요.' },
  { indicatorId: 'RSI', question: 'RSI에서 70 이상 구간을 뭐라고 부르나요?', options: ['과매도 구간', '과매수 구간', '추세 전환 구간', '횡보 구간'], correctIndex: 1, explanation: 'RSI 70 이상은 과매수, 30 이하는 과매도 구간이라고 불러요.' },
  { indicatorId: 'MACD', question: 'MACD에서 시그널선을 위로 교차하는 것을 뭐라고 부르나요?', options: ['데드크로스', '골든크로스', '다이버전스', '수렴'], correctIndex: 1, explanation: 'MACD선이 시그널선을 위로 교차하면 골든크로스라고 해요.' },
  { indicatorId: '볼린저밴드', question: '볼린저밴드에서 밴드 폭이 좁아지는 현상을 뭐라고 하나요?', options: ['확산', '수렴(Squeeze)', '돌파', '이탈'], correctIndex: 1, explanation: '밴드 폭이 좁아지는 것을 수렴(Squeeze)이라고 해요. 이후 확산이 나타날 수 있대요.' },
  { indicatorId: '스토캐스틱', question: '스토캐스틱에서 과매수로 보는 기준은?', options: ['50 이상', '60 이상', '70 이상', '80 이상'], correctIndex: 3, explanation: '스토캐스틱은 80 이상이면 과매수, 20 이하면 과매도로 봐요.' },
  { indicatorId: 'OBV', question: 'OBV에서 가격이 오른 날은 거래량을 어떻게 하나요?', options: ['빼요', '더해요', '절반만 더해요', '무시해요'], correctIndex: 1, explanation: 'OBV는 가격이 오른 날 거래량을 더하고, 내린 날 거래량을 빼서 누적해요.' },
  { indicatorId: '일목균형표', question: '일목균형표에서 가격이 구름대 위에 있으면 어떤 추세로 보나요?', options: ['하락 추세', '횡보', '상승 추세', '판단 불가'], correctIndex: 2, explanation: '가격이 구름대 위에 있으면 상승 추세, 아래에 있으면 하락 추세로 봐요.' },
  { indicatorId: 'ATR', question: 'ATR이 알려주는 것은?', options: ['추세의 방향', '가격의 목표', '변동성의 크기', '거래량'], correctIndex: 2, explanation: 'ATR은 가격 변동성의 크기를 측정하는 지표예요. 방향은 알려주지 않아요.' },
  { indicatorId: 'CCI', question: 'CCI에서 +100 이상이면 어떤 상태인가요?', options: ['평균보다 많이 올랐어요', '평균보다 많이 내렸어요', '평균과 같아요', '판단 불가'], correctIndex: 0, explanation: 'CCI +100 이상이면 평균보다 많이 올랐다는 뜻이에요.' },
  { indicatorId: 'ADX', question: 'ADX 값이 25 이상이면 무엇을 의미하나요?', options: ['추세가 약해요', '추세가 강해요', '횡보 구간이에요', '하락 추세예요'], correctIndex: 1, explanation: 'ADX 25 이상이면 추세가 강하다고 봐요. ADX는 방향이 아닌 강도를 보여줘요.' },

  // 캔들 패턴 퀴즈
  { indicatorId: '도지', question: '도지 캔들의 특징은?', options: ['몸통이 매우 길어요', '시가와 종가가 거의 같아요', '꼬리가 전혀 없어요', '항상 양봉이에요'], correctIndex: 1, explanation: '도지는 시가와 종가가 거의 같아서 몸통이 매우 작거나 없는 캔들이에요.' },
  { indicatorId: '망치형', question: '아래꼬리가 길고 몸통이 위쪽에 작게 있는 캔들을 뭐라고 부르나요?', options: ['도지', '마루보즈', '망치형', '유성형'], correctIndex: 2, explanation: '망치형은 아래꼬리가 길고 몸통이 위쪽에 작게 있는 캔들이에요.' },
  { indicatorId: '장악형', question: '이전 캔들을 완전히 감싸는 큰 캔들 패턴의 이름은?', options: ['십자형', '관통형', '장악형', '먹구름형'], correctIndex: 2, explanation: '장악형(Engulfing)은 두 번째 캔들이 첫 번째 캔들 몸통을 완전히 감싸는 패턴이에요.' },
  { indicatorId: '마루보즈', question: '마루보즈 캔들의 특징은?', options: ['꼬리가 매우 길어요', '꼬리가 거의 없이 몸통만 있어요', '몸통이 없어요', '위아래 꼬리가 같아요'], correctIndex: 1, explanation: '마루보즈는 꼬리 없이 몸통만 있는 강한 캔들이에요.' },
  { indicatorId: '샛별형', question: '샛별형(Morning Star)은 몇 개의 캔들로 구성되나요?', options: ['1개', '2개', '3개', '4개'], correctIndex: 2, explanation: '샛별형은 하락→작은 캔들→상승, 세 개의 캔들이 한 세트인 패턴이에요.' },

  // 차트 패턴 퀴즈
  { indicatorId: '더블탑', question: 'M자 모양으로 같은 가격대에서 두 번 고점을 찍는 패턴은?', options: ['헤드앤숄더', '더블탑', '삼각수렴', '컵앤핸들'], correctIndex: 1, explanation: '더블탑은 비슷한 가격대에서 두 번 고점을 찍는 M자 모양의 패턴이에요.' },
  { indicatorId: '삼각수렴', question: '가격 범위가 점점 좁아지며 삼각형을 만드는 패턴은?', options: ['쐐기형', '플래그', '삼각수렴', '더블바텀'], correctIndex: 2, explanation: '삼각수렴은 고점은 낮아지고 저점은 높아지면서 삼각형을 만드는 패턴이에요.' },
  { indicatorId: '헤드앤숄더', question: '헤드앤숄더 패턴에서 양 어깨의 저점을 연결한 선을 뭐라고 하나요?', options: ['추세선', '넥라인', '지지선', '기준선'], correctIndex: 1, explanation: '양 어깨의 저점을 연결한 선을 넥라인이라고 해요. 이 선의 이탈이 핵심이에요.' },
  { indicatorId: '피보나치', question: '피보나치 되돌림에서 황금비율로 불리는 수준은?', options: ['23.6%', '38.2%', '50%', '61.8%'], correctIndex: 3, explanation: '61.8%는 피보나치의 황금비율로, 가장 많이 주목하는 되돌림 수준이에요.' },
  { indicatorId: '더블바텀', question: 'W자 모양으로 두 번 저점을 찍는 패턴을 뭐라고 하나요?', options: ['더블탑', '더블바텀', '컵앤핸들', '헤드앤숄더'], correctIndex: 1, explanation: '더블바텀은 비슷한 가격대에서 두 번 저점을 찍는 W자 모양의 패턴이에요.' },
];
