# 앱인토스 프로젝트 규칙

## 필수 준수 사항

이 프로젝트의 모든 코드 작성, 기획, 디자인은 반드시 `docs/` 폴더의 앱인토스 스펙을 따라야 합니다.

### 개발 규칙
1. **TDS(Toss Design System) 필수 사용** - 비게임 WebView 미니앱은 반드시 `@toss/tds-mobile` 또는 `@toss/tds-react-native` 사용
2. **토스 로그인만 사용** - 자체/제3자 로그인 절대 불가, OAuth 2.0 기반
3. **mTLS 인증서 기반 서버 통신** - 모든 서버 API 호출 시 필수
4. **다크모드 미지원** - 라이트 모드로만 개발
5. **Primary Color: #3182F6** (토스 블루)
6. **intoss:// scheme** 라우팅 사용
7. **granite.config.ts** 설정 파일 기반 프로젝트 구조

### 디자인 규칙
1. TDS 컴포넌트 우선 사용 (Button, ListRow, Navigation, BottomCTA 등)
2. 컬러는 TDS 컬러 시스템 사용 (Grey, Blue, Red, Green 등 50-900 단계)
3. UX Writing은 **해요체** (비격식 존대체), 능동태, 간결한 메시지
4. 접근성 명도 대비 4.5:1 이상

### 정책 규칙
1. **절대 금지 서비스** 기획 불가: 가상자산, 금융상품 중개, 사행성, 데이팅
2. **생성형 AI 사용 시**: AI 사용 고지 필수, 생성물 가시적 표시 필수
3. **다크패턴 금지**: 기만적 UX 패턴 사용 금지
4. **외부 앱 설치 유도 금지**, 외부 결제 페이지 이동 금지
5. **개인정보보호법/정보통신망법** 준수

### 참고 문서
- `docs/01-개발-스펙.md` - 개발 종합 스펙
- `docs/02-TDS-디자인-가이드.md` - TDS 디자인 가이드
- `docs/03-정책-심사기준.md` - 정책 및 심사 기준
- 개발자센터: https://developers-apps-in-toss.toss.im/
- LLM 전체 문서: https://developers-apps-in-toss.toss.im/llms-full.txt
