import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="center-screen">
      <div className="state">
        <h1 className="not-found-code">404</h1>
        <h3>This page does not exist</h3>
        <p className="muted">The link may be broken or the page may have moved.</p>
        <Link to="/" className="btn btn-primary">Back to your tasks</Link>
      </div>
    </div>
  );
}
