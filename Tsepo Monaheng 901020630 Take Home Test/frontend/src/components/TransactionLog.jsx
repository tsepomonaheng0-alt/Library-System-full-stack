const LABEL = { restock: 'Stock added', borrow: 'Borrowed', return: 'Returned' };

export default function TransactionLog({ transactions, onUndo }) {
  if (!transactions.length) return <p className="empty">No transactions yet. Borrow a book or add stock to start the log.</p>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>When</th><th>Book</th><th>Action</th><th className="num">Qty</th><th>Member</th><th>Note</th>
            {onUndo && <th><span className="sr-only">Actions</span></th>}
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td className="muted nowrap">{new Date(t.created_at).toLocaleString()}</td>
              <td className="strong">{t.book_title}</td>
              <td><span className={`badge badge-${t.type}`}>{LABEL[t.type]}</span></td>
              <td className="num">{t.type === 'borrow' ? `−${t.quantity}` : `+${t.quantity}`}</td>
              <td>{t.user_name ? `${t.user_name} (${t.membership_id})` : '—'}</td>
              <td className="muted">{t.note || '—'}</td>
              {onUndo && (
                <td className="row-actions">
                  <button className="btn btn-small btn-danger" onClick={() => onUndo(t)}>Undo</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
