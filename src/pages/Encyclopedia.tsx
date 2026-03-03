import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { indicators } from '../data/indicators';
import { candlePatterns } from '../data/candlePatterns';
import { chartPatterns } from '../data/chartPatterns';
import Disclaimer from '../components/Disclaimer';
import '../styles/Encyclopedia.css';

type TabType = 'indicators' | 'candles' | 'charts';

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: '입문',
  intermediate: '중급',
  advanced: '고급',
};

export default function Encyclopedia() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('indicators');

  const tabs: { key: TabType; label: string }[] = [
    { key: 'indicators', label: '보조지표' },
    { key: 'candles', label: '캔들 패턴' },
    { key: 'charts', label: '차트 패턴' },
  ];

  const getItems = () => {
    switch (activeTab) {
      case 'indicators':
        return indicators;
      case 'candles':
        return candlePatterns;
      case 'charts':
        return chartPatterns;
    }
  };

  const items = getItems();

  return (
    <div className="encyclopedia">

      <div className="encyclopedia-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`encyclopedia-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <main className="encyclopedia-list">
        {items.map((item) => (
          <button
            key={item.id}
            className="encyclopedia-item"
            onClick={() => navigate(`/indicator/${item.id}`)}
          >
            <div className="encyclopedia-item-info">
              <span className="encyclopedia-item-name">{item.name}</span>
              <span className="encyclopedia-item-english">{item.english}</span>
            </div>
            <div className="encyclopedia-item-meta">
              <span
                className={`encyclopedia-badge difficulty-${item.difficulty}`}
              >
                {DIFFICULTY_LABEL[item.difficulty]}
              </span>
            </div>
          </button>
        ))}
        <Disclaimer />
      </main>
    </div>
  );
}
