"use client";

import { useState, type ReactNode } from "react";
import { statusOptions, ratingOptions, type Confidence, type Decision, type Opportunity, type Rating, type Status, type Tier, type VerificationStatus } from "../lib/career";

export default function OpportunityModal({
  value,
  onClose,
  onSave,
}: {
  value: Opportunity;
  onClose: () => void;
  onSave: (o: Opportunity) => void;
}) {
  const [form, setForm] = useState<Opportunity>(value);
  const set = (k: keyof Opportunity, v: any) =>
    setForm((prev) => ({ ...prev, [k]: v }));
  const num = (k: keyof Opportunity, v: string) => set(k, Number(v || 0));
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-head">
          <strong>
            {value.position ? "Edit Opportunity" : "Add Opportunity"}
          </strong>
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <Field label="Organization">
              <input
                value={form.organization}
                onChange={(e) => set("organization", e.target.value)}
              />
            </Field>
            <Field label="Position">
              <input
                value={form.position}
                onChange={(e) => set("position", e.target.value)}
              />
            </Field>
            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value as Status)}
              >
                {statusOptions.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Rating">
              <select
                value={form.rating}
                onChange={(e) => set("rating", e.target.value as Rating)}
              >
                {ratingOptions.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Decision">
              <select
                value={form.decision}
                onChange={(e) => set("decision", e.target.value as Decision)}
              >
                {["Unreviewed", "Apply", "Interested", "Maybe", "Pass"].map(
                  (v) => (
                    <option key={v}>{v}</option>
                  ),
                )}
              </select>
            </Field>
            <Field label="Verification">
              <select
                value={form.verificationStatus}
                onChange={(e) =>
                  set(
                    "verificationStatus",
                    e.target.value as VerificationStatus,
                  )
                }
              >
                {["Verified", "Unverified", "Closed", "Needs Review"].map(
                  (v) => (
                    <option key={v}>{v}</option>
                  ),
                )}
              </select>
            </Field>
            <Field label="Career Lane">
              <input
                value={form.careerLane}
                onChange={(e) => set("careerLane", e.target.value)}
              />
            </Field>
            <Field label="Confidence">
              <select
                value={form.confidence}
                onChange={(e) =>
                  set("confidence", e.target.value as Confidence)
                }
              >
                {["Very High", "High", "Medium", "Low"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </Field>
            <Field label="Tier">
              <select
                value={form.tier}
                onChange={(e) => set("tier", e.target.value as Tier)}
              >
                <option value="1">Tier 1</option>
                <option value="2">Tier 2</option>
                <option value="3">Tier 3</option>
              </select>
            </Field>
            <Field label="Jim Score">
              <input
                type="number"
                value={form.jimScore}
                onChange={(e) => num("jimScore", e.target.value)}
              />
            </Field>
            <Field label="Mission">
              <input
                type="number"
                value={form.mission}
                onChange={(e) => num("mission", e.target.value)}
              />
            </Field>
            <Field label="Role Fit">
              <input
                type="number"
                value={form.roleFit}
                onChange={(e) => num("roleFit", e.target.value)}
              />
            </Field>
            <Field label="Competitiveness">
              <input
                type="number"
                value={form.competitiveness}
                onChange={(e) => num("competitiveness", e.target.value)}
              />
            </Field>
            <Field label="Lifestyle">
              <input
                type="number"
                value={form.lifestyle}
                onChange={(e) => num("lifestyle", e.target.value)}
              />
            </Field>
            <Field label="Compensation">
              <input
                type="number"
                value={form.compensation}
                onChange={(e) => num("compensation", e.target.value)}
              />
            </Field>
            <Field label="Location">
              <input
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
              />
            </Field>
            <Field label="Remote">
              <input
                value={form.remote}
                onChange={(e) => set("remote", e.target.value)}
              />
            </Field>
            <Field label="Applied Date">
              <input
                type="date"
                value={form.appliedDate}
                onChange={(e) => set("appliedDate", e.target.value)}
              />
            </Field>
            <Field label="Follow-up Date">
              <input
                type="date"
                value={form.followUpDate}
                onChange={(e) => set("followUpDate", e.target.value)}
              />
            </Field>
            <Field label="Salary" cls="half">
              <input
                value={form.salary}
                onChange={(e) => set("salary", e.target.value)}
              />
            </Field>
            <Field label="Travel" cls="half">
              <input
                value={form.travel}
                onChange={(e) => set("travel", e.target.value)}
              />
            </Field>
            <Field label="Link" cls="wide">
              <input
                value={form.link}
                onChange={(e) => set("link", e.target.value)}
              />
            </Field>
            <Field label="Source" cls="half">
              <input
                value={form.source}
                onChange={(e) => set("source", e.target.value)}
              />
            </Field>
            <Field label="Source Job ID" cls="half">
              <input
                value={form.sourceJobId}
                onChange={(e) => set("sourceJobId", e.target.value)}
              />
            </Field>
            <Field label="Import Batch" cls="half">
              <input
                value={form.importBatch}
                onChange={(e) => set("importBatch", e.target.value)}
              />
            </Field>
            <Field label="Verification Date" cls="half">
              <input
                type="date"
                value={form.verificationDate}
                onChange={(e) => set("verificationDate", e.target.value)}
              />
            </Field>
            <Field label="Posting Date" cls="half">
              <input
                type="date"
                value={form.postingDate}
                onChange={(e) => set("postingDate", e.target.value)}
              />
            </Field>
            <Field label="Recommendation" cls="wide">
              <input
                value={form.recommendation}
                onChange={(e) => set("recommendation", e.target.value)}
              />
            </Field>
            <Field label="Synopsis" cls="wide">
              <textarea
                value={form.synopsis}
                onChange={(e) => set("synopsis", e.target.value)}
              />
            </Field>
            <Field label="Pros" cls="half">
              <textarea
                value={form.pros}
                onChange={(e) => set("pros", e.target.value)}
              />
            </Field>
            <Field label="Cons" cls="half">
              <textarea
                value={form.cons}
                onChange={(e) => set("cons", e.target.value)}
              />
            </Field>
            <Field label="Primary Duties" cls="half">
              <textarea
                value={form.duties}
                onChange={(e) => set("duties", e.target.value)}
              />
            </Field>
            <Field label="Requirements" cls="half">
              <textarea
                value={form.requirements}
                onChange={(e) => set("requirements", e.target.value)}
              />
            </Field>
            <Field label="Gaps" cls="half">
              <textarea
                value={form.gaps}
                onChange={(e) => set("gaps", e.target.value)}
              />
            </Field>
            <Field label="Notes" cls="half">
              <textarea
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
              />
            </Field>
            <Field label="Evaluation Notes" cls="wide">
              <textarea
                value={form.feedbackNotes}
                onChange={(e) => set("feedbackNotes", e.target.value)}
              />
            </Field>
            <Field label="Resume Version" cls="half">
              <input
                value={form.resumeVersion}
                onChange={(e) => set("resumeVersion", e.target.value)}
              />
            </Field>
            <Field label="Cover Letter" cls="half">
              <input
                value={form.coverLetter}
                onChange={(e) => set("coverLetter", e.target.value)}
              />
            </Field>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn primary" onClick={() => onSave(form)}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  cls,
}: {
  label: string;
  children: ReactNode;
  cls?: string;
}) {
  return (
    <div className={cls || ""}>
      <label>{label}</label>
      {children}
    </div>
  );
}
