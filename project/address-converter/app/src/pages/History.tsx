import { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { copyToClipboard } from '../utils/clipboard';
import type { ConversionRecord } from '../types/address';
import { ListRow } from '@toss/tds-mobile';
import PageHeader from '../components/PageHeader';
import '../styles/History.css';

function formatDate(isoString: string): string {
  const d = new Date(isoString);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function History() {
  const [history, setHistory] = useState<ConversionRecord[]>([]);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    setHistory(storage.getHistory());
  }, []);

  const handleCopy = async (text: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setToastMsg('주소를 복사했어요');
      setTimeout(() => setToastMsg(''), 2000);
    }
  };

  return (
    <div className="history">
      <PageHeader title="변환 기록" />

      <div className="history-divider" />

      {history.length === 0 ? (
        <div className="history-empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D1D6DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
            <path d="m14.5 7.5-5 5" />
            <path d="m9.5 7.5 5 5" />
          </svg>
          <p className="history-empty-title">변환 기록이 없어요</p>
          <p className="history-empty-sub">주소를 변환하면 여기에 기록돼요</p>
        </div>
      ) : (
        <div className="history-list">
          {history.map((record) => (
            <ListRow
              key={record.id}
              onClick={() => handleCopy(record.convertedAddress)}
              left={<span className="history-flag">{record.flag}</span>}
              contents={
                <ListRow.Texts
                  type="2RowTypeA"
                  top={
                    record.convertedAddress.length > 30
                      ? record.convertedAddress.slice(0, 30) + '...'
                      : record.convertedAddress
                  }
                  bottom={
                    (record.korAddress.length > 15
                      ? record.korAddress.slice(0, 15) + '...'
                      : record.korAddress) +
                    ` · ${record.language} · ${formatDate(record.createdAt)}`
                  }
                />
              }
              right={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B0B8C1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
              }
            />
          ))}
        </div>
      )}

      {toastMsg && <div className="custom-toast">{toastMsg}</div>}
    </div>
  );
}

export default History;
