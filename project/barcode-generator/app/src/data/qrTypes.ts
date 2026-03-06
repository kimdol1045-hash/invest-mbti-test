import type { QRTypeOption } from '../types';

export const qrTypes: QRTypeOption[] = [
  {
    id: 'url',
    label: 'URL',
    emoji: '🔗',
    description: '웹사이트 주소',
    fields: [
      { key: 'url', label: 'URL', placeholder: 'example.com', required: true },
    ],
  },
  {
    id: 'text',
    label: '텍스트',
    emoji: '📝',
    description: '자유 텍스트',
    fields: [
      { key: 'text', label: '텍스트', placeholder: '텍스트를 입력해주세요', required: true },
    ],
  },
  {
    id: 'contact',
    label: '연락처',
    emoji: '👤',
    description: 'vCard 연락처',
    fields: [
      { key: 'name', label: '이름', placeholder: '홍길동', required: true },
      { key: 'phone', label: '전화번호', placeholder: '010-1234-5678', type: 'tel' },
      { key: 'email', label: '이메일', placeholder: 'email@example.com', type: 'email' },
      { key: 'org', label: '회사', placeholder: '회사명' },
    ],
  },
  {
    id: 'wifi',
    label: 'Wi-Fi',
    emoji: '📶',
    description: 'Wi-Fi 접속 정보',
    fields: [
      { key: 'ssid', label: 'SSID (네트워크 이름)', placeholder: 'MyWiFi', required: true },
      { key: 'password', label: '비밀번호', placeholder: '비밀번호 입력' },
      {
        key: 'encryption',
        label: '보안 방식',
        placeholder: '보안 방식 선택',
        type: 'select',
        options: [
          { value: 'WPA', label: 'WPA/WPA2' },
          { value: 'WPA3', label: 'WPA3' },
          { value: 'WEP', label: 'WEP' },
          { value: 'nopass', label: '없음 (개방형)' },
        ],
      },
    ],
  },
  {
    id: 'email',
    label: '이메일',
    emoji: '📧',
    description: '이메일 보내기',
    fields: [
      { key: 'to', label: '받는 사람', placeholder: 'email@example.com', type: 'email', required: true },
      { key: 'subject', label: '제목', placeholder: '이메일 제목' },
      { key: 'body', label: '내용', placeholder: '이메일 내용' },
    ],
  },
  {
    id: 'sms',
    label: 'SMS',
    emoji: '💬',
    description: '문자 메시지',
    fields: [
      { key: 'phone', label: '전화번호', placeholder: '010-1234-5678', type: 'tel', required: true },
      { key: 'message', label: '내용', placeholder: '메시지 내용' },
    ],
  },
  {
    id: 'phone',
    label: '전화번호',
    emoji: '📞',
    description: '전화 걸기',
    fields: [
      { key: 'phone', label: '전화번호', placeholder: '010-1234-5678', type: 'tel', required: true },
    ],
  },
  {
    id: 'location',
    label: '위치',
    emoji: '📍',
    description: '지도에서 장소 열기',
    fields: [
      { key: 'address', label: '주소', placeholder: '서울특별시 중구 세종대로 110', required: true },
      { key: 'label', label: '장소 이름', placeholder: '서울시청 (선택)' },
    ],
  },
];
