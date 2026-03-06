import type { BarcodeFormatOption } from '../types';

export const barcodeFormats: BarcodeFormatOption[] = [
  {
    id: 'CODE128',
    label: 'Code 128',
    description: '범용 (영문+숫자+특수문자)',
    placeholder: 'Hello123',
  },
  {
    id: 'EAN13',
    label: 'EAN-13',
    description: '국제 상품 코드 (13자리)',
    placeholder: '5901234123457',
    pattern: /^\d{13}$/,
    maxLength: 13,
  },
  {
    id: 'EAN8',
    label: 'EAN-8',
    description: '소형 상품 코드 (8자리)',
    placeholder: '96385074',
    pattern: /^\d{8}$/,
    maxLength: 8,
  },
  {
    id: 'UPC',
    label: 'UPC-A',
    description: '미국/캐나다 상품 (12자리)',
    placeholder: '123456789012',
    pattern: /^\d{12}$/,
    maxLength: 12,
  },
  {
    id: 'CODE39',
    label: 'Code 39',
    description: '산업용 (영문 대문자+숫자)',
    placeholder: 'CODE39',
    pattern: /^[0-9A-Z\-. $/+%]+$/,
  },
  {
    id: 'ITF14',
    label: 'ITF-14',
    description: '물류/박스용 (14자리)',
    placeholder: '98249880215005',
    pattern: /^\d{14}$/,
    maxLength: 14,
  },
];
