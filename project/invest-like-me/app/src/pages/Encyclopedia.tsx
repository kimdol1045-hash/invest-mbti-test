import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tab, ListRow, Badge } from '@toss/tds-mobile';
import { indicators } from '../data/indicators';
import { candlePatterns } from '../data/candlePatterns';
import { chartPatterns } from '../data/chartPatterns';
import PageHeader from '../components/PageHeader';

type TabType = 'indicators' | 'candles' | 'charts';

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: '입문',
  intermediate: '중급',
  advanced: '고급',
};

const DIFFICULTY_COLOR: Record<string, 'blue' | 'yellow' | 'red'> = {
  beginner: 'blue',
  intermediate: 'yellow',
  advanced: 'red',
};

const TAB_KEYS: TabType[] = ['indicators', 'candles', 'charts'];

export default function Encyclopedia() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('indicators');

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
    <div style={{ minHeight: '100vh' }}>
      <PageHeader title="보조지표 도감" />

      <div style={{ padding: '0 20px', marginBottom: 16 }}>
        <Tab onChange={(index) => setActiveTab(TAB_KEYS[index])}>
          <Tab.Item selected={activeTab === 'indicators'}>보조지표</Tab.Item>
          <Tab.Item selected={activeTab === 'candles'}>캔들 패턴</Tab.Item>
          <Tab.Item selected={activeTab === 'charts'}>차트 패턴</Tab.Item>
        </Tab>
      </div>

      <main>
        {items.map((item) => (
          <ListRow
            key={item.id}
            onClick={() => navigate(`/indicator/${item.id}`)}
            contents={
              <ListRow.Texts
                type="2RowTypeA"
                top={item.name}
                bottom={item.english}
                bottomProps={{ color: '#6B7684' }}
              />
            }
            right={
              <Badge
                size="small"
                variant="weak"
                color={DIFFICULTY_COLOR[item.difficulty]}
              >
                {DIFFICULTY_LABEL[item.difficulty]}
              </Badge>
            }
            withArrow
          />
        ))}
      </main>
    </div>
  );
}
