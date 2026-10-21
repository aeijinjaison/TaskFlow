import Icon from './Icon';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const initials = (user?.name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <a className="brand" href="/" aria-label="TaskFlow home">
          <span className="brand-mark"><Icon name="logo" size={20} strokeWidth={3} /></span>
          <span className="brand-name">TaskFlow</span>
        </a>

        <div className="navbar-actions">
          <button
            type="button"
            className="icon-btn"
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            title={theme === 'dark' ? 'Light theme' : 'Dark theme'}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
          </button>

          <div className="user-chip" title={user?.email}>
            <span className="avatar" aria-hidden="true">{initials}</span>
            <span className="user-name">{user?.name}</span>
          </div>

          <button type="button" className="btn btn-ghost btn-sm" onClick={logout} aria-label="Log out">
            <Icon name="logout" size={16} />
            <span className="hide-sm">Log out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
