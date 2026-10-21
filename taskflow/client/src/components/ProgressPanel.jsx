import { useMemo } from 'react';

/**
 * Overall progress: derived entirely from the stats numbers the API returns.
 * The summary buttons double as quick filters.
 */
export default function ProgressPanel({ stats, filters, onSelect }) {
  const quick = useMemo(() => {
    if (!stats) return [];
    return [
      { key: 'all', label: 'All', count: stats.total, status: '', due: '' },
      { key: 'pending', label: 'Pending', count: stats.pending, status: 'Pending', due: '' },
      { key: 'done', label: 'Done', count: stats.done, status: 'Done', due: '' },
      { key: 'overdue', label: 'Overdue', count: stats.overdue, status: '', due: 'overdue', tone: 'danger' },
      { key: 'today', label: 'Due today', count: stats.dueToday, status: '', due: 'today', tone: 'warn' },
    ];
  }, [stats]);

  if (!stats) {
    return (
      <section className="panel progress-panel" aria-busy="true" aria-label="Progress loading">
        <div className="skeleton" style={{ height: 56, width: '40%' }} />
        <div className="skeleton" style={{ height: 12, marginTop: 20 }} />
        <div className="skeleton" style={{ height: 36, marginTop: 20, width: '70%' }} />
      </section>
    );
  }

  const { percentComplete: pct, done, total } = stats;
  const caption =
    total === 0
      ? 'Add your first task to start tracking progress'
      : pct === 100
        ? `All ${total} tasks done. Nice work.`
        : `${done} of ${total} ${total === 1 ? 'task' : 'tasks'} done`;

  const activeKey = filters.due || (filters.status === 'Pending' ? 'pending' : filters.status === 'Done' ? 'done' : 'all');
  const isActive = (item) => (item.due ? filters.due === item.due : !filters.due && activeKey === item.key);

  return (
    <section className="panel progress-panel" aria-label="Progress summary">
      <div className="progress-head">
        <div className="progress-number" aria-hidden="true">
          {pct}<span>%</span>
        </div>
        <div className="progress-text">
          <h2>Overall progress</h2>
          <p className="muted">{caption}</p>
        </div>
      </div>

      <div
        className={`progress-track ${pct === 100 ? 'is-complete' : ''}`}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label="Percentage of tasks completed"
      >
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="quick-filters" role="group" aria-label="Quick filters">
        {quick.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`quick ${item.tone ? `quick-${item.tone}` : ''} ${isActive(item) ? 'is-active' : ''} ${item.tone && item.count > 0 ? 'has-count' : ''}`}
            aria-pressed={isActive(item)}
            onClick={() => onSelect(item.status, item.due)}
          >
            <span className="quick-count">{item.count}</span>
            <span className="quick-label">{item.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
