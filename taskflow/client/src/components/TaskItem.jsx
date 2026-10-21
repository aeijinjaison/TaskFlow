import { useState } from 'react';
import Icon from './Icon';
import { describeDue } from '../utils/date';

export default function TaskItem({ task, today, onToggle, onEdit, onDelete }) {
  const [busy, setBusy] = useState(false);
  const done = task.status === 'Done';
  const due = describeDue(task, today);

  const handleToggle = async () => {
    setBusy(true);
    await onToggle(task);
    setBusy(false);
  };

  return (
    <li className={`task priority-${task.priority.toLowerCase()} ${done ? 'is-done' : ''}`}>
      <button
        type="button"
        className="check"
        onClick={handleToggle}
        disabled={busy}
        aria-pressed={done}
        aria-label={done ? `Mark "${task.title}" as pending` : `Mark "${task.title}" as done`}
      >
        <Icon name="check" size={16} strokeWidth={3.2} />
      </button>

      <div className="task-main">
        <h3 className="task-title">{task.title}</h3>
        {task.description && <p className="task-desc">{task.description}</p>}
        <div className="task-meta">
          <span className={`chip chip-${task.priority.toLowerCase()}`}>
            <Icon name="flag" size={13} /> {task.priority}
          </span>
          <span className={`chip chip-due chip-due-${due.tone}`}>
            <Icon name="calendar" size={13} /> {due.label}
          </span>
        </div>
      </div>

      <div className="task-actions">
        <button type="button" className="icon-btn" onClick={() => onEdit(task)} aria-label={`Edit "${task.title}"`} title="Edit">
          <Icon name="edit" size={17} />
        </button>
        <button type="button" className="icon-btn icon-btn-danger" onClick={() => onDelete(task)} aria-label={`Delete "${task.title}"`} title="Delete">
          <Icon name="trash" size={17} />
        </button>
      </div>
    </li>
  );
}
