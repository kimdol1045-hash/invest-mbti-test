import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, ListRow, Badge } from '@toss/tds-mobile';
import type { Pharmacy } from '../types/pharmacy';
import { getFavorites, removeFavorite } from '../utils/storage';
import { getStatus, getStatusLabel, formatDistance } from '../utils/pharmacy';
import PageHeader from '../components/PageHeader';

const STATUS_COLOR: Record<string, 'green' | 'red' | 'grey'> = {
  open: 'green',
  closing: 'red',
  closed: 'grey',
};

export default function Favorites() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Pharmacy[]>([]);

  useEffect(() => {
    getFavorites().then(setFavorites);
  }, []);

  const handleRemove = async (id: string) => {
    await removeFavorite(id);
    setFavorites(await getFavorites());
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <PageHeader title="즐겨찾기" />
      <div style={{ height: 1, background: '#E5E8EB' }} />

      {favorites.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 40 }}>
          <div style={{ width: 80, height: 80, borderRadius: 40, background: '#F2F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#D1D6DB" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </div>
          <p style={{ fontSize: 17, fontWeight: 600, color: '#191F28' }}>즐겨찾기한 약국을 추가해 보세요</p>
          <p style={{ fontSize: 14, color: '#8B95A1' }}>자주 이용하는 약국을 저장해 보세요</p>
          <Button color="primary" variant="fill" size="large" onClick={() => navigate('/')}>
            주변 약국 찾아보기
          </Button>
        </div>
      ) : (
        <div style={{ flex: 1 }}>
          {favorites.map((p, i) => {
            const status = getStatus(p);
            const isOpen = status !== 'closed';
            const addr = p.address.split(' ').slice(1).join(' ').replace(/,\s*$/, '');
            const dist = p.distance != null ? formatDistance(p.distance) : '';
            const bottomText = dist ? `${addr} · ${dist}` : addr;

            return (
              <div key={p.id}>
                {i > 0 && <div style={{ height: 1, background: '#F2F4F6' }} />}
                <ListRow
                  onClick={() => navigate(`/detail/${p.id}`)}
                  left={
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: isOpen ? '#E8F3FF' : '#F2F4F6',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={isOpen ? '#3182F6' : '#8B95A1'} strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                    </div>
                  }
                  contents={
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 16, fontWeight: 600, color: '#191F28' }}>{p.name}</span>
                        <Badge size="small" variant="weak" color={STATUS_COLOR[status]}>
                          {getStatusLabel(status)}
                        </Badge>
                      </div>
                      <span style={{ fontSize: 13, color: '#8B95A1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                        {bottomText}
                      </span>
                    </div>
                  }
                  right={
                    <button onClick={(e) => { e.stopPropagation(); handleRemove(p.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="#F04452" stroke="#F04452" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                      </svg>
                    </button>
                  }
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
