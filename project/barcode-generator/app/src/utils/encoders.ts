import type { QRInputType, FormData } from '../types';

export function encodeQRValue(type: QRInputType, data: FormData): string {
  switch (type) {
    case 'url': {
      let url = data.url || '';
      if (url && !/^https?:\/\//i.test(url)) {
        url = `https://${url}`;
      }
      return url;
    }

    case 'text':
      return data.text || '';

    case 'contact':
      return encodeVCard(data);

    case 'wifi':
      return encodeWifi(data);

    case 'email':
      return encodeMailto(data);

    case 'sms':
      return encodeSMS(data);

    case 'phone':
      return `tel:${data.phone || ''}`;

    case 'location':
      return encodeGeo(data);

    default:
      return '';
  }
}

function encodeVCard(data: FormData): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${data.name || ''}`,
  ];
  if (data.phone) lines.push(`TEL:${data.phone}`);
  if (data.email) lines.push(`EMAIL:${data.email}`);
  if (data.org) lines.push(`ORG:${data.org}`);
  lines.push('END:VCARD');
  return lines.join('\n');
}

function encodeWifi(data: FormData): string {
  const encryption = data.encryption || 'WPA';
  const hidden = 'false';
  return `WIFI:T:${encryption};S:${data.ssid || ''};P:${data.password || ''};H:${hidden};`;
}

function encodeMailto(data: FormData): string {
  const params: string[] = [];
  if (data.subject) params.push(`subject=${encodeURIComponent(data.subject)}`);
  if (data.body) params.push(`body=${encodeURIComponent(data.body)}`);
  const query = params.length > 0 ? `?${params.join('&')}` : '';
  return `mailto:${data.to || ''}${query}`;
}

function encodeSMS(data: FormData): string {
  const body = data.message ? `?body=${encodeURIComponent(data.message)}` : '';
  return `smsto:${data.phone || ''}${body}`;
}

function encodeGeo(data: FormData): string {
  const query = data.label ? `${data.label} ${data.address}` : data.address || '';
  return `https://map.naver.com/v5/search/${encodeURIComponent(query.trim())}`;
}
