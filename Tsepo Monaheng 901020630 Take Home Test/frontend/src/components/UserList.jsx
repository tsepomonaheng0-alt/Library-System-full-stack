export default function UserList({ users, currentUserId, onEdit, onDelete }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Name</th><th>Membership ID</th><th>Role</th>
            <th><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td className="strong">{u.name}</td>
              <td className="muted">{u.membership_id}</td>
              <td><span className={`badge badge-role-${u.role}`}>{u.role}</span></td>
              <td className="row-actions">
                <button className="btn btn-small" onClick={() => onEdit(u)}>Update</button>
                {u.id !== currentUserId && (
                  <button className="btn btn-small btn-danger" onClick={() => onDelete(u)}>Delete</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
