import { useState } from 'react';
import Navbar from '../components/Navbar';
import Icon from '../components/Icon';
import ProgressPanel from '../components/ProgressPanel';
import TaskFilters from '../components/TaskFilters';
import TaskList from '../components/TaskList';
import Pagination from '../components/Pagination';
import TaskForm from '../components/TaskForm';
import ConfirmDialog from '../components/ConfirmDialog';
import useTasks from '../hooks/useTasks';
import { useAuth } from '../context/AuthContext';
import { formatToday, greeting, todayStr } from '../utils/date';

export default function DashboardPage() {
  const { user } = useAuth();
  const t = useTasks();
  const [formTask, setFormTask] = useState(undefined); // undefined = closed, null = new, object = editing
  const [deleting, setDeleting] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const firstName = (user?.name || '').split(' ')[0];

  return (
    <>
      <Navbar />
      <main className="container page">
        <div className="page-head">
          <div>
            <h1>{greeting()}, {firstName}</h1>
            <p className="muted">{formatToday()}</p>
          </div>
          <button type="button" className="btn btn-primary" onClick={() => setFormTask(null)}>
            <Icon name="plus" size={18} strokeWidth={2.5} /> New task
          </button>
        </div>

        <ProgressPanel stats={t.stats} filters={t.filters} onSelect={t.setQuickFilter} />

        <section className="panel list-panel" aria-label="Task list">
          <TaskFilters
            filters={t.filters}
            onChange={t.setFilter}
            onReset={t.resetFilters}
            hasActiveFilters={t.hasActiveFilters}
            completedCount={t.stats?.done || 0}
            onClearCompleted={() => setConfirmClear(true)}
          />

          <TaskList
            tasks={t.tasks}
            loading={t.loading}
            error={t.error}
            hasActiveFilters={t.hasActiveFilters}
            totalTasks={t.stats?.total || 0}
            today={todayStr()}
            onRetry={() => t.reload()}
            onAdd={() => setFormTask(null)}
            onResetFilters={t.resetFilters}
            onToggle={t.toggleTask}
            onEdit={(task) => setFormTask(task)}
            onDelete={(task) => setDeleting(task)}
          />

          {!t.loading && !t.error && <Pagination pagination={t.pagination} onPage={(p) => t.setFilter('page', p)} />}
        </section>
      </main>

      {formTask !== undefined && (
        <TaskForm
          task={formTask}
          onClose={() => setFormTask(undefined)}
          onSubmit={(data) => (formTask ? t.updateTask(formTask.id, data) : t.createTask(data))}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete this task?"
          message={`"${deleting.title}" will be permanently removed. This cannot be undone.`}
          onConfirm={() => t.deleteTask(deleting)}
          onClose={() => setDeleting(null)}
        />
      )}

      {confirmClear && (
        <ConfirmDialog
          title="Clear completed tasks?"
          message={`All ${t.stats?.done || 0} completed tasks will be permanently removed.`}
          confirmLabel="Clear completed"
          onConfirm={t.clearCompleted}
          onClose={() => setConfirmClear(false)}
        />
      )}
    </>
  );
}
