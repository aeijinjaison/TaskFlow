import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import PasswordInput from '../components/PasswordInput';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/api';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((x) => ({ ...x, [key]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const found = {};
    if (!EMAIL_RE.test(form.email.trim())) found.email = 'Enter a valid email address';
    if (!form.password) found.password = 'Enter your password';
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    try {
      await login({ email: form.email.trim(), password: form.password });
      navigate('/', { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.errors.length) setErrors(err.fieldErrors);
      setFormError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to see your tasks."
      footer={<>New to TaskFlow? <Link to="/register">Create an account</Link></>}
    >
      <form onSubmit={handleSubmit} noValidate className="form-grid">
        {formError && <div className="alert alert-danger" role="alert">{formError}</div>}

        <div className="field">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={set('email')}
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'login-email-err' : undefined}
            autoFocus
          />
          {errors.email && <p id="login-email-err" className="field-error" role="alert">{errors.email}</p>}
        </div>

        <div className="field">
          <label htmlFor="login-password">Password</label>
          <PasswordInput
            id="login-password"
            value={form.password}
            onChange={set('password')}
            autoComplete="current-password"
            invalid={Boolean(errors.password)}
            describedBy={errors.password ? 'login-password-err' : undefined}
          />
          {errors.password && <p id="login-password-err" className="field-error" role="alert">{errors.password}</p>}
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting && <Spinner />} Log in
        </button>
      </form>
    </AuthLayout>
  );
}
