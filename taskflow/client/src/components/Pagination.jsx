import Icon from './Icon';

export default function Pagination({ pagination, onPage }) {
  const { page, pages, total } = pagination;
  if (total === 0) return null;
  return (
    <nav className="pagination" aria-label="Pagination">
      <span className="muted">
        {total} {total === 1 ? 'task' : 'tasks'}
      </span>
      {pages > 1 && (
        <div className="pagination-controls">
          <button type="button" className="icon-btn" onClick={() => onPage(page - 1)} disabled={page <= 1} aria-label="Previous page">
            <Icon name="left" />
          </button>
          <span className="pagination-page">Page {page} of {pages}</span>
          <button type="button" className="icon-btn" onClick={() => onPage(page + 1)} disabled={page >= pages} aria-label="Next page">
            <Icon name="right" />
          </button>
        </div>
      )}
    </nav>
  );
}
