import StockBadge from './StockBadge.jsx';
import { stockLevel } from '../constants.js';

// Read-only when onEdit/onDelete aren't passed (dashboard and members).
export default function BookList({ books, onEdit, onDelete }) {
  if (!books.length) return <p className="empty">No books yet. Add the first one above.</p>;
  const editable = Boolean(onEdit || onDelete);

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Title</th><th>Author</th><th>Genre</th><th>ISBN</th>
            <th className="num">Copies</th><th>Status</th>
            {editable && <th><span className="sr-only">Actions</span></th>}
          </tr>
        </thead>
        <tbody>
          {books.map((b) => (
            <tr key={b.id} className={`spine spine-${stockLevel(b.quantity)}`}>
              <td className="strong">{b.title}</td>
              <td>{b.author}</td>
              <td>{b.genre || '—'}</td>
              <td className="muted">{b.isbn}</td>
              <td className="num">{b.quantity}</td>
              <td><StockBadge quantity={b.quantity} /></td>
              {editable && (
                <td className="row-actions">
                  <button className="btn btn-small" onClick={() => onEdit(b)}>Update</button>
                  <button className="btn btn-small btn-danger" onClick={() => onDelete(b)}>Delete</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
