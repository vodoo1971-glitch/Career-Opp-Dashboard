import type { Organization } from "../lib/career";

export default function Organizations({ orgs }: { orgs: Organization[] }) {
  return (
    <div className="card detail">
      <h2>Employer Watch List</h2>
      <p className="small">
        Priority employers for direct career-page monitoring. Quality score
        reflects mission, salary, remote friendliness, and historical fit.
      </p>
      <table className="table">
        <thead>
          <tr>
            <th>Priority</th>
            <th>Quality</th>
            <th>Organization</th>
            <th>Category</th>
            <th>Career Lanes</th>
            <th>Last Searched</th>
            <th>Active</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {orgs.map((o) => (
            <tr key={o.name}>
              <td>{o.watchPriority}</td>
              <td>{o.qualityScore}</td>
              <td>
                {o.careerUrl ? (
                  <a href={o.careerUrl} target="_blank">
                    {o.name}
                  </a>
                ) : (
                  o.name
                )}
              </td>
              <td>{o.category}</td>
              <td>{o.careerLanes.join(", ")}</td>
              <td>{o.lastSearched || "—"}</td>
              <td>{o.active ? "Yes" : "No"}</td>
              <td>{o.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
