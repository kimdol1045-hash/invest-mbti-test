import { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import type { BarcodeFormatId } from '../types';

interface BarcodePreviewProps {
  value: string;
  format: BarcodeFormatId;
  width?: number;
  height?: number;
}

export default function BarcodePreview({
  value,
  format,
  width = 2,
  height = 80,
}: BarcodePreviewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!svgRef.current || !value) return;

    try {
      JsBarcode(svgRef.current, value, {
        format,
        width,
        height,
        displayValue: true,
        fontSize: 14,
        margin: 10,
        background: '#FFFFFF',
        lineColor: '#191F28',
      });
      setError(false);
    } catch {
      setError(true);
    }
  }, [value, format, width, height]);

  if (!value) return null;

  if (error) {
    return (
      <p style={{ color: '#E5503C', fontSize: 14 }}>
        바코드를 생성할 수 없어요
      </p>
    );
  }

  return <svg ref={svgRef} />;
}
