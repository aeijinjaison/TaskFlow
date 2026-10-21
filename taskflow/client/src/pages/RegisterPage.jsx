import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import PasswordInput from '../components/PasswordInput';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/api';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((x) => ({ ...x, [key]: undefined }));
  };

  const validate = () => {
    const found = {};
    const name = form.name.trim();
    if (name.length < 2 || name.length > 50) found.name = 'Name must be 2-50 characters';
    if (!EMAIL_RE.test(form.email.trim())) found.email = 'Enter a valid email address';
    if (form.password.length < 8) found.password = 'Password must be at least 8 characters';
    else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) found.password = 'Use at least one letter and one number';
    return found;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      navigate('/', { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.errors.length) setErrors(err.fieldErrors);
      setFormError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="It takes a few seconds. No card needed."
      footer={<>Already have an account? <Link to="/login">Log in</Link></>}
    >
      <form onSubmit={handleSubmit} noValidate className="form-grid">
        {formError && <div className="alert alert-danger" role="alert">{formError}</div>}

        <div className="field">
          <label htmlFor="reg-name">Name</label>
          <input
            id="reg-name"
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={set('name')}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'reg-name-err' : undefined}
            autoFocus
          />
          {errors.name && <p id="reg-name-err" className="field-error" role="alert">{errors.name}</p>}
        </div>

        <div className="field">
          <label htmlFor="reg-email">Email</label>
          <input
            id="reg-email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={set('email')}
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'reg-email-err' : undefined}
          />
          {errors.email && <p id="reg-email-err" className="field-error" role="alert">{errors.email}</p>}
        </div>

        <div className="field">
          <label htmlFor="reg-password">Password</label>
          <PasswordInput
            id="reg-password"
            value={form.password}
            onChange={set('password')}
            autoComplete="new-password"
            invalid={Boolean(errors.password)}
            describedBy={errors.password ? 'reg-password-err' : 'reg-password-hint'}
          />
          {errors.password ? (
            <p id="reg-password-err" className="field-error" role="alert">{errors.password}</p>
          ) : (
            <p id="reg-password-hint" className="hint">At least 8 characters, with a letter and a number.</p>
          )}
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting && <Spinner />} Create account
        </button>
      </form>
    </AuthLayout>
  );
}
