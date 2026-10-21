import Icon from './Icon';

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth">
      <aside className="auth-aside">
        <a className="brand brand-light" href="/">
          <span className="brand-mark"><Icon name="logo" size={20} strokeWidth={3} /></span>
          <span className="brand-name">TaskFlow</span>
        </a>
        <div className="auth-pitch">
          <h2>Know what is due, what is late and how far along you are.</h2>
          <ul>
            <li><Icon name="check" size={18} strokeWidth={3} /> Priorities and due dates on every task</li>
            <li><Icon name="check" size={18} strokeWidth={3} /> A live progress bar that updates as you finish work</li>
            <li><Icon name="check" size={18} strokeWidth={3} /> Overdue and due-today tasks one click away</li>
          </ul>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <a className="brand auth-brand-mobile" href="/">
            <span className="brand-mark"><Icon name="logo" size={20} strokeWidth={3} /></span>
            <span className="brand-name">TaskFlow</span>
          </a>
          <h1>{title}</h1>
          <p className="muted auth-sub">{subtitle}</p>
          {children}
          <p className="auth-footer">{footer}</p>
        </div>
      </main>
    </div>
  );
}
