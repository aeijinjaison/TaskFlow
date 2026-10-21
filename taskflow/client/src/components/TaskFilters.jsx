import Icon from './Icon';
import { PRIORITIES, SORT_OPTIONS } from '../utils/constants';

export default function TaskFilters({ filters, onChange, onReset, hasActiveFilters, completedCount, onClearCompleted }) {
  return (
    <div className="toolbar">
      <div className="search">
        <Icon name="search" size={18} />
        <input
          type="search"
          value={filters.search}
          onChange={(e) => onChange('search', e.target.value)}
          placeholder="Search tasks"
          aria-label="Search tasks"
          maxLength={100}
        />
      </div>

      <label className="select-wrap">
        <span className="sr-only">Priority</span>
        <select value={filters.priority} onChange={(e) => onChange('priority', e.target.value)}>
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>{p} priority</option>
          ))}
        </select>
      </label>

      <label className="select-wrap">
        <span className="sr-only">Sort by</span>
        <select value={filters.sort} onChange={(e) => onChange('sort', e.target.value)}>
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>Sort: {o.label}</option>
          ))}
        </select>
      </label>

      <div className="toolbar-end">
        {hasActiveFilters && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={onReset}>
            <Icon name="x" size={16} /> Clear filters
          </button>
        )}
        {completedCount > 0 && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClearCompleted}>
            <Icon name="checkAll" size={16} /> Clear completed
          </button>
        )}
      </div>
    </div>
  );
}
