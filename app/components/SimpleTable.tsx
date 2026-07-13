import type { Opportunity } from "../lib/career";

export default function SimpleTable({ title, rows }: { title: string; rows: Opportunity[] }) {
  return (
    <div className="card detail">
      <h2>{title}</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Score</th>
            <th>Status</th>
            <th>Rating</th>
            <th>Organization</th>
            <th>Role</th>
            <th>Salary</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((o) => (
            <tr key={o.id}>
              <td>{o.jimScore}</td>
              <td>{o.status}</td>
              <td>{o.rating}</td>
              <td>{o.organization}</td>
              <td>{o.position}</td>
              <td>{o.salary}</td>
              <td>{o.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
