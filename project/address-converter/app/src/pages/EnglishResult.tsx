import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { searchEnglishAddress } from '../utils/api';
import { copyToClipboard } from '../utils/clipboard';
import { storage } from '../utils/storage';
import type { KoreanAddress, EnglishAddress, AddressField } from '../types/address';
import { Button, ListRow } from '@toss/tds-mobile';
import PageHeader from '../components/PageHeader';
import '../styles/EnglishResult.css';

function parseAddressFields(eng: EnglishAddress): AddressField[] {
  const parts = eng.roadAddr.split(',').map((s) => s.trim());

  // 마지막이 국가명(South Korea, Republic of Korea 등)이면 제외
  const countryPatterns = ['South Korea', 'Republic of Korea', 'Korea'];
  const last = parts[parts.length - 1] || '';
  const hasCountry = countryPatterns.some((c) => last.includes(c));
  const addrParts = hasCountry ? parts.slice(0, -1) : parts;

  // "7 Sinwon-ro, Gwanak-gu, Seoul" → line1=7 Sinwon-ro, line2=Gwanak-gu, city=Seoul
  const addressLine1 = addrParts[0] || '';
  const city = addrParts.length > 1 ? addrParts[addrParts.length - 1] : '';
  const addressLine2 = addrParts.length > 2 ? addrParts.slice(1, -1).join(', ') : '';

  return [
    { label: 'Address Line 1', value: addressLine1 },
    { label: 'Address Line 2', value: addressLine2 },
    { label: 'City', value: city },
    { label: 'State / Province', value: '' },
    { label: 'Postal Code', value: eng.zipNo },
    { label: 'Country', value: 'South Korea' },
  ];
}

function EnglishResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const address = location.state?.address as KoreanAddress | undefined;
  const [engAddress, setEngAddress] = useState<EnglishAddress | null>(null);
  const [fields, setFields] = useState<AddressField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    if (!address) {
      navigate('/', { replace: true });
      return;
    }

    (async () => {
      setLoading(true);
      try {
        const results = await searchEnglishAddress(address.roadAddr, address.zipNo);
        if (results.length > 0) {
          const eng = results[0];
          setEngAddress(eng);
          setFields(parseAddressFields(eng));

          storage.addRecord({
            korAddress: address.roadAddr,
            convertedAddress: eng.roadAddr,
            language: '영어',
            languageCode: 'en',
            flag: '🇺🇸',
            zipNo: address.zipNo,
          });
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [address, navigate]);

  const handleCopy = async (text: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setToastMsg('주소를 복사했어요');
      setTimeout(() => setToastMsg(''), 2000);
    }
  };

  if (!address) return null;

  return (
    <div className="eng-result">
      <PageHeader title="영문 변환 결과" />

      <div className="eng-scroll">
        <div className="eng-orig-section">
          <span className="eng-label">원본 주소</span>
          <span className="eng-orig-addr">{address.roadAddr}</span>
          <span className="eng-orig-zip">우편번호 {address.zipNo}</span>
        </div>

        <div className="eng-section-divider" />

        {loading ? (
          <div className="eng-loading">
            <p>영문 주소를 변환하고 있어요...</p>
          </div>
        ) : error ? (
          <div className="eng-loading">
            <p>변환 중 오류가 발생했어요. 다시 시도해 주세요.</p>
          </div>
        ) : engAddress ? (
          <>
            <div className="eng-section">
              <span className="eng-label">영문 주소</span>
              <div className="eng-box">
                <span className="eng-box-addr">{engAddress.roadAddr}</span>
                {engAddress.jibunAddr && (
                  <span className="eng-box-jibun">{engAddress.jibunAddr}</span>
                )}
              </div>
              <Button
                color="primary"
                variant="fill"
                size="xlarge"
                display="block"
                onClick={() => handleCopy(engAddress.roadAddr)}
              >
                전체 주소 복사
              </Button>
            </div>

            <div className="eng-section-divider" />

            <div className="eng-fields-section">
              <span className="eng-label">해외 사이트 입력용</span>
              {fields.map((field) => (
                <ListRow
                  key={field.label}
                  contents={
                    <ListRow.Texts
                      type="2RowTypeA"
                      top={field.label}
                      bottom={field.value || '-'}
                    />
                  }
                  right={
                    field.value ? (
                      <button
                        className="eng-field-copy"
                        onClick={() => handleCopy(field.value)}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B0B8C1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                        </svg>
                      </button>
                    ) : undefined
                  }
                />
              ))}
            </div>
          </>
        ) : (
          <div className="eng-loading">
            <p>영문 주소를 찾을 수 없어요</p>
          </div>
        )}
      </div>

      <div className="eng-bottom-cta">
        <Button
          color="primary"
          size="xlarge"
          display="block"
          onClick={() => navigate('/')}
        >
          다른 주소 변환하기
        </Button>
      </div>

      {toastMsg && <div className="custom-toast">{toastMsg}</div>}
    </div>
  );
}

export default EnglishResult;
