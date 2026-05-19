import type { PhotoStatus } from '../../types/database';

export type FilterValue = 'all' | PhotoStatus | 'unpaid';

interface FilterTabsProps {
  active: FilterValue;
  onChange: (filter: FilterValue) => void;
  counts: Record<PhotoStatus, number>;
  total: number;
  unpaidCount?: number;
  showUnpaid?: boolean;
}

const BASE_TABS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'All Photos' },
  { value: 'new', label: 'New' },
  { value: 'printed', label: 'Printed' },
  { value: 'completed', label: 'Completed' },
];

export default function FilterTabs({ active, onChange, counts, total, unpaidCount = 0, showUnpaid = false }: FilterTabsProps) {
  const tabs = showUnpaid
    ? [...BASE_TABS, { value: 'unpaid' as FilterValue, label: 'Unpaid' }]
    : BASE_TABS;

  function getCount(value: FilterValue) {
    if (value === 'all') return total;
    if (value === 'unpaid') return unpaidCount;
    return counts[value as PhotoStatus];
  }

  return (
    <div className="flex w-full border-b border-outline-variant pb-px overflow-x-auto">
      {tabs.map((tab) => {
        const count = getCount(tab.value);
        const isActive = active === tab.value;
        const isUnpaidTab = tab.value === 'unpaid';
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={`flex-shrink-0 flex items-center justify-center gap-1.5 font-mono-brand text-label-tag whitespace-nowrap px-3 py-2 border-b-2 transition-colors ${
              isActive
                ? isUnpaidTab
                  ? 'text-on-primary-container border-primary-container'
                  : 'text-primary border-primary'
                : 'text-on-surface-variant border-transparent hover:text-on-surface hover:border-outline-variant'
            }`}
          >
            {tab.label.toUpperCase()}
            {count > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                isActive
                  ? isUnpaidTab
                    ? 'bg-primary-container text-on-primary-container'
                    : 'bg-primary-container text-on-primary-container'
                  : isUnpaidTab
                    ? 'bg-primary-container/40 text-on-primary-container'
                    : 'bg-surface-container text-on-surface-variant'
              }`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
