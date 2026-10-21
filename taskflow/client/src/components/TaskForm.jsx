import { useId, useState } from 'react';
import Modal from './Modal';
import Spinner from './Spinner';
import { ApiError } from '../services/api';
import { PRIORITIES } from '../utils/constants';

const TITLE_MAX = 120;
const DESC_MAX = 1000;

/** Create / edit dialog. Validates in the browser first; the server validates again. */
export default function TaskForm({ task, onSubmit, onClose }) {
  const uid = useId();
  const isEdit = Boolean(task);
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'Medium',
    dueDate: task?.dueDate || '',
    status: task?.status || 'Pending',
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((errs) => ({ ...errs, [key]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = 'Title is required';
    else if (form.title.trim().length > TITLE_MAX) next.title = `Title must be ${TITLE_MAX} characters or fewer`;
    if (form.description.length > DESC_MAX) next.description = `Description must be ${DESC_MAX} characters or fewer`;
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        dueDate: form.dueDate || null,
      };
      if (isEdit) payload.status = form.status;
      await onSubmit(payload);
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.errors.length) setErrors(err.fieldErrors);
      setFormError(err.message);
      setSubmitting(false);
    }
  };

  const id = (name) => `${uid}-${name}`;

  return (
    <Modal titleId={id('title-heading')} title={isEdit ? 'Edit task' : 'New task'} onClose={submitting ? () => {} : onClose}>
      <form onSubmit={handleSubmit} noValidate>
        <div className="modal-body form-grid">
          {formError && <div className="alert alert-danger" role="alert">{formError}</div>}

          <div className="field">
            <label htmlFor={id('title')}>Title</label>
            <input
              id={id('title')}
              type="text"
              value={form.title}
              onChange={set('title')}
              maxLength={TITLE_MAX + 20}
              placeholder="What needs to get done?"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? id('title-err') : undefined}
              data-autofocus
            />
            <div className="field-foot">
              {errors.title ? <p id={id('title-err')} className="field-error" role="alert">{errors.title}</p> : <span />}
              <span className={`counter ${form.title.length > TITLE_MAX ? 'over' : ''}`}>{form.title.length}/{TITLE_MAX}</span>
            </div>
          </div>

          <div className="field">
            <label htmlFor={id('desc')}>Description <span className="optional">optional</span></label>
            <textarea
              id={id('desc')}
              rows={3}
              value={form.description}
              onChange={set('description')}
              placeholder="Add details, links or notes"
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? id('desc-err') : undefined}
            />
            {errors.description && <p id={id('desc-err')} className="field-error" role="alert">{errors.description}</p>}
          </div>

          <div className="field">
            <span className="label" id={id('prio')}>Priority</span>
            <div className="segmented" role="radiogroup" aria-labelledby={id('prio')}>
              {PRIORITIES.map((p) => (
                <label key={p} className={`segment segment-${p.toLowerCase()} ${form.priority === p ? 'is-selected' : ''}`}>
                  <input type="radio" name={id('priority')} value={p} checked={form.priority === p} onChange={set('priority')} />
                  {p}
                </label>
              ))}
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor={id('due')}>Due date <span className="optional">optional</span></label>
              <input
                id={id('due')}
                type="date"
                value={form.dueDate}
                onChange={set('dueDate')}
                aria-invalid={Boolean(errors.dueDate)}
              />
              {errors.dueDate && <p className="field-error" role="alert">{errors.dueDate}</p>}
            </div>

            {isEdit && (
              <div className="field">
                <label htmlFor={id('status')}>Status</label>
                <select id={id('status')} value={form.status} onChange={set('status')}>
                  <option value="Pending">Pending</option>
                  <option value="Done">Done</option>
                </select>
              </div>
            )}
          </div>
        </div>

        <footer className="modal-footer">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting && <Spinner />} {isEdit ? 'Save changes' : 'Add task'}
          </button>
        </footer>
      </form>
    </Modal>
  );
}
