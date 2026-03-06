import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, ListRow } from '@toss/tds-mobile';
import { storage } from '../utils/storage';
import PageHeader from '../components/PageHeader';
import '../styles/History.css';

export default function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState(storage.getHistory());

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    storage.removeHistory(id);
    setHistory(storage.getHistory());
  };

  const handleClearAll = () => {
    storage.clearHistory();
    setHistory([]);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <>
      <PageHeader title="히스토리" />
      <div className="history-container">
        <div className="history-header">
          <h1>생성 기록</h1>
          {history.length > 0 && (
            <Button color="danger" variant="weak" size="small" onClick={handleClearAll}>
              전체 삭제
            </Button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="history-empty">
            <span className="history-empty__emoji">📭</span>
            <p className="history-empty__title">아직 기록이 없어요</p>
            <p className="history-empty__desc">QR코드나 바코드를 만들어보세요</p>
            <div style={{ marginTop: 20 }}>
              <Button color="primary" variant="fill" size="medium" onClick={() => navigate('/')}>
                만들러 가기
              </Button>
            </div>
          </div>
        ) : (
          <div className="history-list">
            {history.map((item) => (
              <ListRow
                key={item.id}
                onClick={() => {
                  const params = new URLSearchParams({
                    mode: item.mode,
                    value: item.encodedValue,
                    label: item.label,
                    typeOrFormat: item.typeOrFormat,
                  });
                  navigate(`/result?${params.toString()}`);
                }}
                contents={
                  <ListRow.Texts
                    type="2RowTypeA"
                    top={item.label}
                    bottom={`${item.encodedValue} · ${formatDate(item.createdAt)}`}
                    bottomProps={{ color: '#8B95A1' }}
                  />
                }
                right={
                  <button
                    className="history-item__delete"
                    onClick={(e) => handleDelete(e, item.id)}
                    aria-label="삭제"
                  >
                    ✕
                  </button>
                }
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
