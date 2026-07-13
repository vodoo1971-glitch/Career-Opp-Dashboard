import type { Opportunity } from "../lib/career";

export default function ArchiveTable({
  rows,
  onUnarchive,
  onDelete,
}: {
  rows: Opportunity[];
  onUnarchive: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="card detail">
      <h2>Archive</h2>
      <p className="small">
        Archived opportunities are preserved here but removed from the active
        opportunity queue.
      </p>
      <table className="table">
        <thead>
          <tr>
            <th>Score</th>
            <th>Rating</th>
            <th>Organization</th>
            <th>Role</th>
            <th>Salary</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((o) => (
            <tr key={o.id}>
              <td>{o.jimScore}</td>
              <td>{o.rating}</td>
              <td>{o.organization}</td>
              <td>{o.position}</td>
              <td>{o.salary}</td>
              <td>{o.notes}</td>
              <td>
                <button className="btn" onClick={() => onUnarchive(o.id)}>
                  Unarchive
                </button>{" "}
                <button className="btn danger" onClick={() => onDelete(o.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && (
        <div className="empty">No archived opportunities yet.</div>
      )}
    </div>
  );
}
