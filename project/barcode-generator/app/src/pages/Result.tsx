import { useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button, Toast } from '@toss/tds-mobile';
import type { CodeMode, BarcodeFormatId } from '../types';
import QRPreview from '../components/QRPreview';
import BarcodePreview from '../components/BarcodePreview';
import PageHeader from '../components/PageHeader';
import { shareCode } from '../utils/share';
import { saveCodeImage } from '../utils/imageSave';
import '../styles/Result.css';

export default function Result() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const codeRef = useRef<HTMLDivElement>(null);

  const mode = (searchParams.get('mode') || 'qr') as CodeMode;
  const value = searchParams.get('value') || '';
  const label = searchParams.get('label') || '';
  const typeOrFormat = searchParams.get('typeOrFormat') || '';

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastOpen(true);
  };

  const handleSaveImage = async () => {
    if (!codeRef.current) return;
    const filename = `barocode-${mode}-${Date.now()}`;
    const ok = await saveCodeImage(codeRef.current, filename);
    showToast(ok ? '이미지가 저장됐어요' : '저장에 실패했어요');
  };

  const handleShare = async () => {
    const result = await shareCode(label, value, codeRef.current);
    if (result.method === 'clipboard-image') {
      showToast('이미지를 클립보드에 복사했어요');
    } else if (result.method === 'clipboard') {
      showToast('클립보드에 복사했어요');
    } else if (result.method === 'cancelled') {
      // 취소
    } else if (!result.success) {
      showToast('공유에 실패했어요');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      showToast('값을 복사했어요');
    } catch {
      showToast('복사에 실패했어요');
    }
  };

  return (
    <>
      <PageHeader title="결과" />
      <div className="result-container">
        <div className="result-header">
          <h1>코드가 만들어졌어요!</h1>
          <p>{label}</p>
        </div>

        <div className="result-code-area" ref={codeRef}>
          {mode === 'qr' ? (
            <QRPreview value={value} size={220} />
          ) : (
            <BarcodePreview value={value} format={typeOrFormat as BarcodeFormatId} />
          )}
          <p className="result-code-label">{label}</p>
          <p className="result-code-value">{value}</p>
        </div>

        <div className="result-actions">
          <div className="result-action-row">
            <Button color="primary" variant="fill" size="large" onClick={handleSaveImage}>
              이미지 저장
            </Button>
            <Button color="primary" variant="weak" size="large" onClick={handleShare}>
              공유하기
            </Button>
          </div>
          <Button color="light" variant="fill" size="large" onClick={handleCopy}>
            값 복사하기
          </Button>
        </div>

        <div className="result-info">
          <div className="result-info__row">
            <span className="result-info__key">유형</span>
            <span className="result-info__val">{mode === 'qr' ? 'QR 코드' : '바코드'}</span>
          </div>
          <div className="result-info__row">
            <span className="result-info__key">{mode === 'qr' ? '입력 타입' : '포맷'}</span>
            <span className="result-info__val">{typeOrFormat}</span>
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <Button
            color="light"
            variant="fill"
            size="large"
            style={{ width: '100%' }}
            onClick={() => navigate('/', { replace: true })}
          >
            홈으로 돌아가기
          </Button>
        </div>
      </div>

      <Toast position="bottom" open={toastOpen} onClose={() => setToastOpen(false)} duration={2000} text={toastMsg} />
    </>
  );
}
