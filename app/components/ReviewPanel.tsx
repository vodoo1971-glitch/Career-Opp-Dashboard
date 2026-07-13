"use client";

import { PASS_REASONS, today, type Decision, type Opportunity } from "../lib/career";

export default function ReviewPanel({
  opportunity,
  onChange,
}: {
  opportunity: Opportunity;
  onChange: (patch: Partial<Opportunity>) => void;
}) {
  const choose = (decision: Decision) => {
    const patch: Partial<Opportunity> = { decision, reviewedAt: today() };
    if (decision === "Apply") {
      patch.status = "Apply";
      patch.rating =
        opportunity.rating === "Unrated" ? "Good" : opportunity.rating;
      patch.passReasons = [];
    }
    if (decision === "Interested") {
      patch.status = "Watch";
      patch.rating =
        opportunity.rating === "Unrated" ? "Good" : opportunity.rating;
      patch.passReasons = [];
    }
    if (decision === "Maybe") {
      patch.status = "Review";
      patch.rating =
        opportunity.rating === "Unrated" ? "Neutral" : opportunity.rating;
      patch.passReasons = [];
    }
    if (decision === "Pass") {
      patch.status = "Pass";
      patch.rating =
        opportunity.rating === "Unrated" ? "Bad" : opportunity.rating;
    }
    onChange(patch);
  };
  const toggle = (reason: string) =>
    onChange({
      decision: "Pass",
      status: "Pass",
      reviewedAt: today(),
      passReasons: opportunity.passReasons.includes(reason)
        ? opportunity.passReasons.filter((r) => r !== reason)
        : [...opportunity.passReasons, reason],
    });
  return (
    <div
      className="section"
      style={{ border: "2px solid #dbeafe", background: "#f8fbff" }}
    >
      <h3>My Evaluation</h3>
      <div
        style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}
      >
        {(["Apply", "Interested", "Maybe", "Pass"] as Decision[]).map((d) => (
          <button
            key={d}
            className={`btn ${opportunity.decision === d ? (d === "Pass" ? "bad" : d === "Maybe" ? "neutral" : "primary") : ""}`}
            onClick={() => choose(d)}
          >
            {d}
          </button>
        ))}
      </div>
      {opportunity.decision === "Pass" && (
        <>
          <div className="small" style={{ fontWeight: 700, marginBottom: 8 }}>
            Why are you passing? Select all that apply.
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))",
              gap: 8,
              marginBottom: 12,
            }}
          >
            {PASS_REASONS.map((r) => (
              <label
                key={r}
                style={{
                  display: "flex",
                  gap: 8,
                  padding: "8px 10px",
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  background: "white",
                }}
              >
                <input
                  type="checkbox"
                  checked={opportunity.passReasons.includes(r)}
                  onChange={() => toggle(r)}
                />
                <span>{r}</span>
              </label>
            ))}
          </div>
        </>
      )}
      <label style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>
        Evaluation notes
      </label>
      <textarea
        value={opportunity.feedbackNotes}
        onChange={(e) =>
          onChange({ feedbackNotes: e.target.value, reviewedAt: today() })
        }
        style={{ width: "100%", minHeight: 90 }}
        placeholder="Why this role is or is not worth pursuing."
      />
      <div className="small" style={{ marginTop: 6 }}>
        Last evaluated: {opportunity.reviewedAt || "Not yet reviewed"}
      </div>
    </div>
  );
}
