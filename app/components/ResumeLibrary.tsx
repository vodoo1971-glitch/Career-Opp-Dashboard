import type { Opportunity } from "../lib/career";

export default function ResumeLibrary({ opps }: { opps: Opportunity[] }) {
  const versions = Array.from(
    new Set(opps.map((o) => o.resumeVersion).filter(Boolean)),
  );
  return (
    <div className="card detail">
      <h2>Resume Library</h2>
      <p className="small">
        Resume versions are inferred from opportunities. Add or edit resume
        version names in job records.
      </p>
      <table className="table">
        <thead>
          <tr>
            <th>Resume Version</th>
            <th>Jobs Using It</th>
            <th>Applied</th>
            <th>Interviews</th>
          </tr>
        </thead>
        <tbody>
          {versions.map((v) => {
            const rows = opps.filter((o) => o.resumeVersion === v);
            return (
              <tr key={v}>
                <td>{v}</td>
                <td>{rows.length}</td>
                <td>{rows.filter((o) => o.status === "Applied").length}</td>
                <td>{rows.filter((o) => o.status === "Interview").length}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
