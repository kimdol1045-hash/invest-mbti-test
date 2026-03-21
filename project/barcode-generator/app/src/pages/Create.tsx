import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { BottomCTA } from '@toss/tds-mobile';
import type { CodeMode, QRInputType, BarcodeFormatId, FormData } from '../types';
import { qrTypes } from '../data/qrTypes';
import { barcodeFormats } from '../data/barcodeFormats';
import { encodeQRValue } from '../utils/encoders';
import { validateQRForm, validateBarcodeInput } from '../utils/validation';
import { storage } from '../utils/storage';
import QRPreview from '../components/QRPreview';
import BarcodePreview from '../components/BarcodePreview';
import PageHeader from '../components/PageHeader';
import '../styles/Create.css';

export default function Create() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const mode = (searchParams.get('mode') || 'qr') as CodeMode;
  const qrType = searchParams.get('type') as QRInputType | null;
  const barcodeFormat = searchParams.get('format') as BarcodeFormatId | null;

  const [formData, setFormData] = useState<FormData>({});
  const [error, setError] = useState<string | null>(null);

  const qrTypeConfig = qrType ? qrTypes.find((t) => t.id === qrType) : null;
  const barcodeConfig = barcodeFormat ? barcodeFormats.find((f) => f.id === barcodeFormat) : null;

  const title = mode === 'qr'
    ? qrTypeConfig?.label || 'QR 코드'
    : barcodeConfig?.label || '바코드';

  const previewValue = useMemo(() => {
    if (mode === 'qr' && qrType) {
      return encodeQRValue(qrType, formData);
    }
    if (mode === 'barcode') {
      return formData.value || '';
    }
    return '';
  }, [mode, qrType, formData]);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const handleGenerate = () => {
    if (mode === 'qr' && qrType) {
      const err = validateQRForm(qrType, formData);
      if (err) {
        setError(err);
        return;
      }
      const encoded = encodeQRValue(qrType, formData);
      const label = `${qrTypeConfig?.emoji || ''} ${qrTypeConfig?.label || 'QR'}`;

      storage.addHistory({
        mode: 'qr',
        typeOrFormat: qrType,
        label,
        encodedValue: encoded,
        formData,
      });

      const params = new URLSearchParams({
        mode: 'qr',
        value: encoded,
        label,
        typeOrFormat: qrType,
      });
      navigate(`/result?${params.toString()}`, { replace: true });
    } else if (mode === 'barcode' && barcodeFormat) {
      const value = formData.value || '';
      const err = validateBarcodeInput(barcodeFormat, value);
      if (err) {
        setError(err);
        return;
      }
      const label = barcodeConfig?.label || barcodeFormat;

      storage.addHistory({
        mode: 'barcode',
        typeOrFormat: barcodeFormat,
        label,
        encodedValue: value,
        formData,
      });

      const params = new URLSearchParams({
        mode: 'barcode',
        value,
        label,
        typeOrFormat: barcodeFormat,
      });
      navigate(`/result?${params.toString()}`, { replace: true });
    }
  };

  return (
    <>
      <PageHeader title={title} />
      <div className="create-container">
        <div className="create-header">
          <h1>{title} 만들기</h1>
          <p>{mode === 'qr' ? qrTypeConfig?.description : barcodeConfig?.description}</p>
        </div>

        <div className={`create-preview ${!previewValue ? 'create-preview--empty' : ''}`}>
          {previewValue ? (
            mode === 'qr' ? (
              <QRPreview value={previewValue} size={180} />
            ) : (
              <BarcodePreview value={previewValue} format={barcodeFormat!} />
            )
          ) : (
            <span>입력하면 미리보기가 나타나요</span>
          )}
        </div>

        <div className="create-form">
          {mode === 'qr' && qrTypeConfig
            ? qrTypeConfig.fields.map((field) => (
                <div key={field.key} className="create-field">
                  <label className="create-field__label">
                    {field.label}
                    {field.required && <span className="create-field__required">*</span>}
                  </label>
                  {field.type === 'select' && field.options ? (
                    <select
                      className="create-field__select"
                      value={formData[field.key] || field.options[0]?.value || ''}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                    >
                      {field.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="create-field__input"
                      type={field.type || 'text'}
                      placeholder={field.placeholder}
                      value={formData[field.key] || ''}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                    />
                  )}
                </div>
              ))
            : mode === 'barcode' && barcodeConfig && (
                <div className="create-field">
                  <label className="create-field__label">
                    값 입력
                    <span className="create-field__required">*</span>
                  </label>
                  <input
                    className="create-field__input"
                    type="text"
                    placeholder={barcodeConfig.placeholder}
                    value={formData.value || ''}
                    onChange={(e) => handleChange('value', e.target.value)}
                    maxLength={barcodeConfig.maxLength}
                  />
                </div>
              )}

          {error && <p className="create-field__error">{error}</p>}
        </div>

        <BottomCTA.Single fixed onClick={handleGenerate}>
          코드 생성하기
        </BottomCTA.Single>
      </div>
    </>
  );
}
