import Icon from './Icon';
import TaskItem from './TaskItem';

function SkeletonRows() {
  return (
    <ul className="task-list" aria-busy="true" aria-label="Loading tasks">
      {[0, 1, 2, 3].map((i) => (
        <li key={i} className="task task-skeleton">
          <div className="skeleton skeleton-circle" />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ height: 16, width: `${55 + i * 8}%` }} />
            <div className="skeleton" style={{ height: 12, width: '30%', marginTop: 12 }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Handles the four screen states: loading, error, empty, success. */
export default function TaskList({ tasks, loading, error, hasActiveFilters, totalTasks, today, onRetry, onAdd, onResetFilters, onToggle, onEdit, onDelete }) {
  if (loading) return <SkeletonRows />;

  if (error) {
    return (
      <div className="state" role="alert">
        <span className="state-icon state-icon-danger"><Icon name="alert" size={26} /></span>
        <h3>We could not load your tasks</h3>
        <p className="muted">{error}</p>
        <button type="button" className="btn btn-primary" onClick={onRetry}>
          <Icon name="refresh" size={16} /> Try again
        </button>
      </div>
    );
  }

  if (tasks.length === 0) {
    const filtered = hasActiveFilters && totalTasks > 0;
    return (
      <div className="state">
        <span className="state-icon"><Icon name="inbox" size={26} /></span>
        {filtered ? (
          <>
            <h3>No tasks match these filters</h3>
            <p className="muted">Try a different search or clear the filters to see everything.</p>
            <button type="button" className="btn btn-ghost" onClick={onResetFilters}>Clear filters</button>
          </>
        ) : (
          <>
            <h3>Your list is empty</h3>
            <p className="muted">Add a task with a priority and due date, and track your progress here.</p>
            <button type="button" className="btn btn-primary" onClick={onAdd}>
              <Icon name="plus" size={16} /> Add your first task
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <ul className="task-list" aria-label="Tasks">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} today={today} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </ul>
  );
}
