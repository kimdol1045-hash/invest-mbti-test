import type { EventCategory } from '../types/event';
import '../styles/CategoryTabs.css';

const CATEGORIES: EventCategory[] = ['전체', '전시', '공연', '축제', '체험'];

interface CategoryTabsProps {
  selected: EventCategory;
  onChange: (category: EventCategory) => void;
}

function CategoryTabs({ selected, onChange }: CategoryTabsProps) {
  return (
    <div className="category-tabs">
      {CATEGORIES.map(cat => (
        <button
          key={cat}
          className={`category-tab ${selected === cat ? 'category-tab-active' : ''}`}
          onClick={() => onChange(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

export default CategoryTabs;
