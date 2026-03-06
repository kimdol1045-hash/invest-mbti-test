import { QRCodeSVG } from 'qrcode.react';

interface QRPreviewProps {
  value: string;
  size?: number;
}

export default function QRPreview({ value, size = 200 }: QRPreviewProps) {
  if (!value) return null;

  return (
    <QRCodeSVG
      value={value}
      size={size}
      level="M"
      bgColor="#FFFFFF"
      fgColor="#191F28"
    />
  );
}
