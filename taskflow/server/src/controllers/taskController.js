const mongoose = require('mongoose');
const Task = require('../models/Task');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { PRIORITIES, STATUSES, parseDateOnly, validateTask } = require('../utils/validators');

const MAX_LIMIT = 50;
const DAY_MS = 24 * 60 * 60 * 1000;

const SORTS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  due: { hasDueDate: -1, dueDate: 1, createdAt: -1 }, // tasks without a due date go last
  priority: { priorityRank: -1, hasDueDate: -1, dueDate: 1, createdAt: -1 },
  title: { title: 1 },
};

const asString = (v) => (typeof v === 'string' ? v : undefined);
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** "Today" comes from the browser (its local date) so overdue logic respects the user's timezone. */
function resolveToday(value) {
  return parseDateOnly(asString(value)) || parseDateOnly(new Date().toISOString().slice(0, 10));
}

/** Loads one task that belongs to the logged-in user, or throws 404 (never reveals other users' tasks). */
async function findOwnTask(req) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new AppError('Task not found', 404);
  const task = await Task.findOne({ _id: id, user: req.user._id });
  if (!task) throw new AppError('Task not found', 404);
  return task;
}

// GET /api/tasks?page&limit&status&priority&due&search&sort&today
exports.getTasks = asyncHandler(async (req, res) => {
  const q = req.query;
  const page = Math.max(parseInt(q.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(q.limit, 10) || 10, 1), MAX_LIMIT);
  const today = resolveToday(q.today);

  const filter = { user: req.user._id };

  const status = asString(q.status);
  if (status) {
    if (!STATUSES.includes(status)) throw new AppError(`status must be one of: ${STATUSES.join(', ')}`, 400);
    filter.status = status;
  }

  const priority = asString(q.priority);
  if (priority) {
    if (!PRIORITIES.includes(priority)) throw new AppError(`priority must be one of: ${PRIORITIES.join(', ')}`, 400);
    filter.priority = priority;
  }

  const due = asString(q.due);
  if (due === 'overdue') {
    filter.status = 'Pending';
    filter.dueDate = { $lt: today };
  } else if (due === 'today') {
    filter.dueDate = today;
  } else if (due === 'week') {
    filter.dueDate = { $gte: today, $lte: new Date(today.getTime() + 7 * DAY_MS) };
  } else if (due) {
    throw new AppError('due must be one of: overdue, today, week', 400);
  }

  const search = asString(q.search)?.trim().slice(0, 100);
  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ title: rx }, { description: rx }];
  }

  const sort = SORTS[asString(q.sort)] || SORTS.newest;

  const [tasks, total] = await Promise.all([
    Task.find(filter).sort(sort).skip((page - 1) * limit).limit(limit),
    Task.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: tasks,
    pagination: { page, limit, total, pages: Math.max(Math.ceil(total / limit), 1) },
  });
});

// GET /api/tasks/stats?today=YYYY-MM-DD
exports.getStats = asyncHandler(async (req, res) => {
  const today = resolveToday(req.query.today);
  const base = { user: req.user._id };

  const [total, done, overdue, dueToday, highPriority] = await Promise.all([
    Task.countDocuments(base),
    Task.countDocuments({ ...base, status: 'Done' }),
    Task.countDocuments({ ...base, status: 'Pending', dueDate: { $lt: today } }),
    Task.countDocuments({ ...base, status: 'Pending', dueDate: today }),
    Task.countDocuments({ ...base, status: 'Pending', priority: 'High' }),
  ]);

  res.json({
    success: true,
    data: {
      total,
      done,
      pending: total - done,
      overdue,
      dueToday,
      highPriority,
      percentComplete: total ? Math.round((done / total) * 100) : 0,
    },
  });
});

// POST /api/tasks
exports.createTask = asyncHandler(async (req, res) => {
  const { errors, data } = validateTask(req.body);
  if (errors.length) throw new AppError('Validation failed', 400, errors);

  const task = await Task.create({ ...data, user: req.user._id });
  res.status(201).json({ success: true, data: task });
});

// GET /api/tasks/:id
exports.getTask = asyncHandler(async (req, res) => {
  const task = await findOwnTask(req);
  res.json({ success: true, data: task });
});

// PATCH /api/tasks/:id   (also mounted as PUT)
exports.updateTask = asyncHandler(async (req, res) => {
  const { errors, data } = validateTask(req.body, { partial: true });
  if (errors.length) throw new AppError('Validation failed', 400, errors);

  const task = await findOwnTask(req);
  task.set(data);
  await task.save(); // runs validators + hooks (keeps completedAt and sort helpers in sync)
  res.json({ success: true, data: task });
});

// PATCH /api/tasks/:id/toggle
exports.toggleTask = asyncHandler(async (req, res) => {
  const task = await findOwnTask(req);
  task.status = task.status === 'Done' ? 'Pending' : 'Done';
  await task.save();
  res.json({ success: true, data: task });
});

// DELETE /api/tasks/completed
exports.clearCompleted = asyncHandler(async (req, res) => {
  const result = await Task.deleteMany({ user: req.user._id, status: 'Done' });
  res.json({ success: true, data: { deleted: result.deletedCount } });
});

// DELETE /api/tasks/:id
exports.deleteTask = asyncHandler(async (req, res) => {
  const task = await findOwnTask(req);
  await task.deleteOne();
  res.json({ success: true, data: { id: req.params.id } });
});
