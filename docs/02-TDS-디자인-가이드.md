# TDS (Toss Design System) 디자인 가이드

## 개요
TDS는 토스 생태계 전반에서 사용되는 통합 디자인 시스템.
비게임 WebView 미니앱은 **반드시 TDS를 사용해야 하며, 심사 기준에 포함됨.**

## 패키지

| Framework 버전 | WebView | React Native |
|----------------|---------|--------------|
| < 1.0.0 | `@toss-design-system/mobile` | `@toss-design-system/react-native` |
| >= 1.0.0 | `@toss/tds-mobile` | `@toss/tds-react-native` |

추가: `@toss/tds-mobile-ait` (v1.0.1)

---

## 핵심 컴포넌트 (11개)

| 컴포넌트 | 용도 |
|----------|------|
| Badge | 상태 표시 |
| Border | 레이아웃 구조 |
| BottomCTA | 하단 CTA 배치 |
| Button | 인터랙션 요소 |
| Asset | 공통 시각 요소 |
| ListRow | 리스트 아이템 패턴 |
| ListHeader | 리스트 섹션 헤더 |
| Navigation | 화면 네비게이션 |
| Paragraph | 텍스트 콘텐츠 |
| Tab | 탭 네비게이션 |
| Top | 상단 섹션 |

## 전체 컴포넌트 (40개+)
TextField, TextArea, SearchField, Toast, Tooltip, ProgressBar, BottomSheet, Modal, Dialog, Checkbox, SegmentedControl, Stepper, Keypad, Chart, ListRow 등

---

## 컬러 시스템

```javascript
import { colors } from '@toss/tds-react-native';
<View style={{ backgroundColor: colors.blue500 }} />
```

### 10가지 컬러 패밀리 (각 50-900 단계)
| 컬러 | 용도 |
|-------|------|
| Grey | 중립색 (#f9fafb ~ #191f28) |
| **Blue** | **브랜드 Primary (#3182F6)** |
| Red | 에러/알림 |
| Orange | 보조색 |
| Yellow | 보조색 |
| Green | 성공/확인 |
| Teal | 보조색 |
| Purple | 보조색 |
| Grey Opacity | 반투명 오버레이 |

### 시맨틱 배경 토큰
- `background`: #FFFFFF
- `greyBackground`: 라이트 중립색
- `layeredBackground` / `floatedBackground`: #FFFFFF

### Primary Color: `#3182F6` (토스 블루)

---

## 다크모드
**현재 다크모드 미지원** - 라이트 모드로만 개발.
(TDS 내부적으로 System/Light/Dark 구조 준비됨)

---

## UX Writing 가이드
- **어조**: "해요체" (비격식 존대체)
- **능동태** 우선
- **간결한 메시지** 필수
- **버튼 라벨링** 규약 준수

---

## 디자인 도구
| 도구 | 설명 |
|------|------|
| App Builder | 웹 기반 UI 디자인 도구, TDS 컴포넌트 내장 |
| Figma | 커스텀 UI 디자인 (Mobile UI Kit 라이선스) |
| DEUS | 토스 자체 디자인 에디터 |
| TOSST | 생성형 AI 기반 그래픽 디자인 |
| TUBA | 데이터 기반 실험 분석 플랫폼 |

---

## 접근성
- 명도 대비 4.5:1 이상
- 표준 모바일 접근성 지침 준수

---

## 참고 URL
- TDS 컴포넌트 문서: https://developers-apps-in-toss.toss.im/design/components.html
- TDS Mobile 문서: https://tossmini-docs.toss.im/tds-mobile/
- TDS React Native Colors: https://tossmini-docs.toss.im/tds-react-native/foundation/colors/
