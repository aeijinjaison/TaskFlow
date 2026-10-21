import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { taskService } from '../services/taskService';
import { useToast } from '../context/ToastContext';
import { todayStr } from '../utils/date';
import { PAGE_SIZE } from '../utils/constants';
import useDebounce from './useDebounce';

const DEFAULT_FILTERS = { status: '', priority: '', due: '', sort: 'newest', search: '', page: 1 };

/** All task data + actions for the dashboard in one place. */
export default function useTasks() {
  const toast = useToast();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: PAGE_SIZE });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const requestId = useRef(0);

  const search = useDebounce(filters.search.trim(), 350);
  const today = todayStr();

  const params = useMemo(
    () => ({
      page: filters.page,
      limit: PAGE_SIZE,
      status: filters.status,
      priority: filters.priority,
      due: filters.due,
      sort: filters.sort,
      search,
      today,
    }),
    [filters.page, filters.status, filters.priority, filters.due, filters.sort, search, today]
  );

  const load = useCallback(
    async ({ silent = false } = {}) => {
      const id = ++requestId.current; // ignore out-of-order responses
      if (!silent) setLoading(true);
      setError('');
      try {
        const [list, st] = await Promise.all([taskService.list(params), taskService.stats(params.today)]);
        if (id !== requestId.current) return;
        setTasks(list.data);
        setPagination(list.pagination);
        setStats(st.data);
        // Deleted the last item on a page? Step back one page.
        if (list.data.length === 0 && params.page > 1) {
          setFilters((f) => ({ ...f, page: Math.max(1, list.pagination.pages) }));
        }
      } catch (err) {
        if (id === requestId.current) setError(err.message);
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    },
    [params]
  );

  useEffect(() => {
    load();
  }, [load]);

  const setFilter = useCallback((key, value) => {
    setFilters((f) => ({ ...f, [key]: value, page: key === 'page' ? value : 1 }));
  }, []);

  const setQuickFilter = useCallback((status, due) => setFilters((f) => ({ ...f, status, due, page: 1 })), []);

  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const hasActiveFilters = Boolean(filters.status || filters.priority || filters.due || filters.search.trim());

  // --- actions (form errors propagate to the caller; quick actions toast their own errors) ---
  const createTask = useCallback(
    async (data) => {
      await taskService.create(data);
      toast.success('Task added');
      await load({ silent: true });
    },
    [load, toast]
  );

  const updateTask = useCallback(
    async (id, data) => {
      await taskService.update(id, data);
      toast.success('Task saved');
      await load({ silent: true });
    },
    [load, toast]
  );

  const toggleTask = useCallback(
    async (task) => {
      try {
        await taskService.toggle(task.id);
        toast.success(task.status === 'Done' ? 'Moved back to pending' : 'Marked as done');
        await load({ silent: true });
      } catch (err) {
        toast.error(err.message);
      }
    },
    [load, toast]
  );

  const deleteTask = useCallback(
    async (task) => {
      try {
        await taskService.remove(task.id);
        toast.success('Task deleted');
        await load({ silent: true });
        return true;
      } catch (err) {
        toast.error(err.message);
        return false;
      }
    },
    [load, toast]
  );

  const clearCompleted = useCallback(async () => {
    try {
      const res = await taskService.clearCompleted();
      toast.success(`Removed ${res.data.deleted} completed ${res.data.deleted === 1 ? 'task' : 'tasks'}`);
      await load({ silent: true });
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    }
  }, [load, toast]);

  return {
    tasks, pagination, stats, loading, error, filters, hasActiveFilters,
    setFilter, setQuickFilter, resetFilters, reload: load,
    createTask, updateTask, toggleTask, deleteTask, clearCompleted,
  };
}
