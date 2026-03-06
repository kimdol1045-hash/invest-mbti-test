import type { QRInputType, FormData, BarcodeFormatId } from '../types';
import { qrTypes } from '../data/qrTypes';
import { barcodeFormats } from '../data/barcodeFormats';

export function validateQRForm(type: QRInputType, data: FormData): string | null {
  const qrType = qrTypes.find((t) => t.id === type);
  if (!qrType) return '지원하지 않는 QR 유형이에요';

  for (const field of qrType.fields) {
    if (field.required && !data[field.key]?.trim()) {
      return `${field.label}을(를) 입력해주세요`;
    }
  }

  if (type === 'url' && data.url) {
    let url = data.url;
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }
    try {
      new URL(url);
    } catch {
      return '올바른 URL 형식이 아니에요';
    }
  }

  if (type === 'email' && data.to) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.to)) {
      return '올바른 이메일 형식이 아니에요';
    }
  }

  return null;
}

export function validateBarcodeInput(
  formatId: BarcodeFormatId,
  value: string,
): string | null {
  if (!value.trim()) return '값을 입력해주세요';

  const format = barcodeFormats.find((f) => f.id === formatId);
  if (!format) return '지원하지 않는 바코드 형식이에요';

  if (format.maxLength && value.length !== format.maxLength) {
    return `${format.maxLength}자리 숫자를 입력해주세요`;
  }

  if (format.pattern && !format.pattern.test(value)) {
    return `${format.label} 형식에 맞지 않아요`;
  }

  return null;
}
