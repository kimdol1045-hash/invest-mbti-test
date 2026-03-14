import type { FilterType } from '../types/restroom.ts';
import '../styles/FilterChips.css';

const FILTERS: FilterType[] = ['전체', '장애인', '24시간', '남녀공용'];

interface FilterChipsProps {
  selected: FilterType;
  onChange: (filter: FilterType) => void;
}

export default function FilterChips({ selected, onChange }: FilterChipsProps) {
  return (
    <div className="filter-chips">
      {FILTERS.map(filter => (
        <button
          key={filter}
          className={`filter-chip ${selected === filter ? 'filter-chip-active' : ''}`}
          onClick={() => onChange(filter)}
        >
          {filter === '전체' ? '🚻 전체' : filter === '장애인' ? '♿ 장애인' : filter}
        </button>
      ))}
    </div>
  );
}
