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
  { indicatorId: '파라볼릭SAR', question: '파라볼릭 SAR에서 점이 가격 아래에 있으면 어떤 추세인가요?', options: ['하락 추세', '횡보', '상승 추세', '추세 없음'], correctIndex: 2, explanation: '점이 가격 아래에 있으면 상승 추세, 위에 있으면 하락 추세로 봐요.' },
  { indicatorId: '윌리엄스R', question: '윌리엄스 %R에서 과매수로 보는 구간은?', options: ['-80 이하', '-50 이하', '-20 이상', '0 이상'], correctIndex: 2, explanation: '윌리엄스 %R은 -20 이상이면 과매수, -80 이하면 과매도 구간으로 봐요.' },
  { indicatorId: '켈트너채널', question: '켈트너 채널은 볼린저밴드와 달리 무엇을 사용해서 채널을 그리나요?', options: ['표준편차', 'ATR', 'RSI', 'MACD'], correctIndex: 1, explanation: '켈트너 채널은 표준편차 대신 ATR을 사용해서 채널을 그려요.' },
  { indicatorId: '거래량이동평균', question: '거래량이 거래량 이동평균보다 위에 있으면 무슨 뜻인가요?', options: ['평소보다 조용해요', '추세가 끝났어요', '평소보다 활발해요', '하락 신호예요'], correctIndex: 2, explanation: '거래량이 이동평균보다 위에 있으면 평소보다 거래가 활발하다는 뜻이에요.' },
  { indicatorId: 'VWAP', question: 'VWAP은 어떤 가중치를 반영한 평균 가격인가요?', options: ['시간', '거래량', '변동성', '시가총액'], correctIndex: 1, explanation: 'VWAP은 거래량을 가중치로 반영한 평균 가격이에요.' },

  // 캔들 패턴 퀴즈
  { indicatorId: '도지', question: '도지 캔들의 특징은?', options: ['몸통이 매우 길어요', '시가와 종가가 거의 같아요', '꼬리가 전혀 없어요', '항상 양봉이에요'], correctIndex: 1, explanation: '도지는 시가와 종가가 거의 같아서 몸통이 매우 작거나 없는 캔들이에요.' },
  { indicatorId: '망치형', question: '아래꼬리가 길고 몸통이 위쪽에 작게 있는 캔들을 뭐라고 부르나요?', options: ['도지', '마루보즈', '망치형', '유성형'], correctIndex: 2, explanation: '망치형은 아래꼬리가 길고 몸통이 위쪽에 작게 있는 캔들이에요.' },
  { indicatorId: '장악형', question: '이전 캔들을 완전히 감싸는 큰 캔들 패턴의 이름은?', options: ['십자형', '관통형', '장악형', '먹구름형'], correctIndex: 2, explanation: '장악형(Engulfing)은 두 번째 캔들이 첫 번째 캔들 몸통을 완전히 감싸는 패턴이에요.' },
  { indicatorId: '마루보즈', question: '마루보즈 캔들의 특징은?', options: ['꼬리가 매우 길어요', '꼬리가 거의 없이 몸통만 있어요', '몸통이 없어요', '위아래 꼬리가 같아요'], correctIndex: 1, explanation: '마루보즈는 꼬리 없이 몸통만 있는 강한 캔들이에요.' },
  { indicatorId: '샛별형', question: '샛별형(Morning Star)은 몇 개의 캔들로 구성되나요?', options: ['1개', '2개', '3개', '4개'], correctIndex: 2, explanation: '샛별형은 하락→작은 캔들→상승, 세 개의 캔들이 한 세트인 패턴이에요.' },
  { indicatorId: '역망치형', question: '역망치형 캔들의 특징은?', options: ['아래꼬리가 길어요', '위꼬리가 길고 몸통이 아래에 있어요', '꼬리가 없어요', '몸통이 매우 커요'], correctIndex: 1, explanation: '역망치형은 위꼬리가 길고 몸통이 아래쪽에 작게 있는 캔들이에요.' },
  { indicatorId: '교수형', question: '교수형과 망치형의 차이점은?', options: ['모양이 달라요', '나타나는 위치가 달라요', '꼬리 길이가 달라요', '몸통 색상이 달라요'], correctIndex: 1, explanation: '교수형은 망치형과 모양이 같지만, 상승 후에 나타난다는 점이 달라요.' },
  { indicatorId: '유성형', question: '유성형(Shooting Star) 캔들은 어디에서 나타나면 주목하나요?', options: ['하락 추세 끝', '상승 추세 끝', '횡보 구간', '어디서든 동일해요'], correctIndex: 1, explanation: '유성형은 상승 추세 끝에서 나타나면 하락 전환 가능성을 시사하는 패턴이에요.' },
  { indicatorId: '관통형', question: '관통형에서 둘째 날 양봉은 전날 음봉 몸통의 몇 % 이상을 회복해야 하나요?', options: ['25%', '30%', '50%', '75%'], correctIndex: 2, explanation: '관통형은 둘째 날 양봉이 전날 음봉 몸통의 50% 이상을 회복하는 패턴이에요.' },
  { indicatorId: '먹구름형', question: '먹구름형(Dark Cloud Cover)은 어떤 패턴의 반대인가요?', options: ['장악형', '관통형', '샛별형', '도지'], correctIndex: 1, explanation: '먹구름형은 관통형의 반대 패턴이에요. 상승 후 음봉이 전날 양봉의 50% 아래로 내려와요.' },
  { indicatorId: '십자형', question: '십자형(하라미)에서 둘째 캔들은 어떤 특징이 있나요?', options: ['첫째 캔들보다 커요', '첫째 캔들 몸통 안에 들어가요', '꼬리가 없어요', '항상 양봉이에요'], correctIndex: 1, explanation: '십자형(하라미)은 둘째 캔들이 첫째 캔들의 몸통 안에 쏙 들어가는 패턴이에요.' },
  { indicatorId: '저녁별형', question: '저녁별형(Evening Star)은 어떤 패턴의 반대인가요?', options: ['도지', '장악형', '샛별형', '마루보즈'], correctIndex: 2, explanation: '저녁별형은 샛별형의 반대 패턴이에요. 상승→작은 캔들→하락 순서로 나타나요.' },

  // 차트 패턴 퀴즈
  { indicatorId: '더블탑', question: 'M자 모양으로 같은 가격대에서 두 번 고점을 찍는 패턴은?', options: ['헤드앤숄더', '더블탑', '삼각수렴', '컵앤핸들'], correctIndex: 1, explanation: '더블탑은 비슷한 가격대에서 두 번 고점을 찍는 M자 모양의 패턴이에요.' },
  { indicatorId: '삼각수렴', question: '가격 범위가 점점 좁아지며 삼각형을 만드는 패턴은?', options: ['쐐기형', '플래그', '삼각수렴', '더블바텀'], correctIndex: 2, explanation: '삼각수렴은 고점은 낮아지고 저점은 높아지면서 삼각형을 만드는 패턴이에요.' },
  { indicatorId: '헤드앤숄더', question: '헤드앤숄더 패턴에서 양 어깨의 저점을 연결한 선을 뭐라고 하나요?', options: ['추세선', '넥라인', '지지선', '기준선'], correctIndex: 1, explanation: '양 어깨의 저점을 연결한 선을 넥라인이라고 해요. 이 선의 이탈이 핵심이에요.' },
  { indicatorId: '피보나치', question: '피보나치 되돌림에서 황금비율로 불리는 수준은?', options: ['23.6%', '38.2%', '50%', '61.8%'], correctIndex: 3, explanation: '61.8%는 피보나치의 황금비율로, 가장 많이 주목하는 되돌림 수준이에요.' },
  { indicatorId: '더블바텀', question: 'W자 모양으로 두 번 저점을 찍는 패턴을 뭐라고 하나요?', options: ['더블탑', '더블바텀', '컵앤핸들', '헤드앤숄더'], correctIndex: 1, explanation: '더블바텀은 비슷한 가격대에서 두 번 저점을 찍는 W자 모양의 패턴이에요.' },
  { indicatorId: '지지저항선', question: '지지선이 뚫리면 어떤 역할로 바뀌는 경우가 있나요?', options: ['추세선', '저항선', '이동평균선', '기준선'], correctIndex: 1, explanation: '지지선이 뚫리면 저항선으로, 저항선이 뚫리면 지지선으로 역할이 바뀌기도 해요.' },
  { indicatorId: '추세선', question: '상승 추세선은 어떤 점들을 연결한 것인가요?', options: ['고점들', '저점들', '종가들', '시가들'], correctIndex: 1, explanation: '상승 추세선은 저점들을 연결한 직선이에요. 하락 추세선은 고점들을 연결해요.' },
  { indicatorId: '컵앤핸들', question: '컵앤핸들 패턴에서 "컵"의 이상적인 모양은?', options: ['V자', 'U자', 'W자', 'M자'], correctIndex: 1, explanation: '컵앤핸들에서 컵은 V자보다 U자 모양일수록 전형적인 패턴이래요.' },
  { indicatorId: '플래그페넌트', question: '플래그/페넌트 패턴이 형성되기 전에 먼저 나타나는 것은?', options: ['횡보 구간', '급등 또는 급락', '삼각수렴', '도지 캔들'], correctIndex: 1, explanation: '플래그/페넌트는 급등이나 급락(깃대) 후 잠시 쉬어가는 구간에서 형성돼요.' },
  { indicatorId: '쐐기형', question: '상승 쐐기형은 어떤 방향의 전환 가능성을 시사하나요?', options: ['상승 지속', '하락 전환', '횡보 전환', '방향 알 수 없어요'], correctIndex: 1, explanation: '상승 쐐기는 하락 전환, 하락 쐐기는 상승 전환 가능성을 시사한대요. 기울기 반대 방향으로 이탈하는 경우가 많아요.' },
];
