import type { FilterType } from '../types/charger';
import '../styles/FilterChips.css';

const FILTERS: FilterType[] = ['전체', 'DC콤보', 'DC차데모', 'AC완속', 'AC3상'];

interface FilterChipsProps {
  selected: string;
  onChange: (filter: string) => void;
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
          {filter === '전체' ? '⚡ 전체' : filter}
        </button>
      ))}
    </div>
  );
}
