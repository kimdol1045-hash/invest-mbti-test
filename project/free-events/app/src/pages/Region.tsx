import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { REGIONS } from '../utils/regions';
import { storage } from '../utils/storage';
import PageHeader from '../components/PageHeader';
import '../styles/Region.css';

export default function Region() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(() => storage.getRegion());

  const handleSelect = (code: string) => {
    setSelected(code);
    storage.setRegion(code);
    navigate('/', { replace: true });
  };

  const handleSelectAll = () => {
    setSelected('');
    storage.setRegion('');
    navigate('/', { replace: true });
  };

  return (
    <div className="region">
      <PageHeader title="지역 선택" onBack={() => navigate(-1)} />

      <div className="region-list">
        <button
          className={`region-item ${selected === '' ? 'region-item-selected' : ''}`}
          onClick={handleSelectAll}
        >
          <span className="region-item-name">전체 지역</span>
          {selected === '' && <Check size={20} color="#3182F6" strokeWidth={2.5} />}
        </button>

        {REGIONS.map(region => (
          <button
            key={region.code}
            className={`region-item ${selected === region.code ? 'region-item-selected' : ''}`}
            onClick={() => handleSelect(region.code)}
          >
            <span className="region-item-name">{region.fullName}</span>
            {selected === region.code && <Check size={20} color="#3182F6" strokeWidth={2.5} />}
          </button>
        ))}
      </div>
    </div>
  );
}
