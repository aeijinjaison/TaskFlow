const mongoose = require('mongoose');
const { PRIORITIES, STATUSES } = require('../utils/validators');

const PRIORITY_RANK = { Low: 1, Medium: 2, High: 3 };

const taskSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: [120, 'Title must be 120 characters or fewer'] },
    description: { type: String, trim: true, maxlength: [1000, 'Description must be 1000 characters or fewer'], default: '' },
    priority: { type: String, enum: PRIORITIES, default: 'Medium' },
    status: { type: String, enum: STATUSES, default: 'Pending' },
    // Stored as midnight UTC of the chosen calendar day. API exposes it as "YYYY-MM-DD".
    dueDate: { type: Date, default: null },
    completedAt: { type: Date, default: null },

    // Helper fields used only for sorting (kept in sync by the hook below, hidden from API output)
    priorityRank: { type: Number, default: 2 },
    hasDueDate: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        ret.user = ret.user && ret.user.toString();
        ret.dueDate = ret.dueDate ? new Date(ret.dueDate).toISOString().slice(0, 10) : null;
        delete ret._id;
        delete ret.__v;
        delete ret.priorityRank;
        delete ret.hasDueDate;
        return ret;
      },
    },
  }
);

// Common query: "my tasks, filtered by status, ordered by due date"
taskSchema.index({ user: 1, status: 1, dueDate: 1 });
taskSchema.index({ user: 1, createdAt: -1 });

taskSchema.pre('validate', function syncDerivedFields() {
  this.priorityRank = PRIORITY_RANK[this.priority] || 2;
  this.hasDueDate = Boolean(this.dueDate);
  if (this.isNew || this.isModified('status')) {
    this.completedAt = this.status === 'Done' ? this.completedAt || new Date() : null;
  }
});

module.exports = mongoose.model('Task', taskSchema);
