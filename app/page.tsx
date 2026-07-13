"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  Download,
  FileJson,
  Plus,
  Search,
  Star,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  Upload,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import {
  addDays,
  blankOpportunity,
  canonicalKeyFor,
  defaultBatch,
  download,
  fromDbOpportunity,
  fromDbOrganization,
  hydrateOpportunity,
  normalizeKey,
  normalizeText,
  seed,
  seedOrgs,
  statusOptions,
  ratingOptions,
  today,
  toCSV,
  toDbOpportunity,
  toDbOrganization,
  uniqueStrings,
  type Confidence,
  type Decision,
  type Opportunity,
  type Organization,
  type Rating,
  type Status,
  type Tier,
} from "./lib/career";
import ArchiveTable from "./components/ArchiveTable";
import ImportModal from "./components/ImportModal";
import OpportunityModal from "./components/OpportunityModal";
import Organizations from "./components/Organizations";
import ResumeLibrary from "./components/ResumeLibrary";
import ReviewPanel from "./components/ReviewPanel";
import Score from "./components/Score";
import SimpleTable from "./components/SimpleTable";

export default function Home() {
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [orgs, setOrgs] = useState<Organization[]>(seedOrgs);
  const [selectedId, setSelectedId] = useState<string>("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [tierFilter, setTierFilter] = useState("All");
  const [ratingFilter, setRatingFilter] = useState("All");
  const [tab, setTab] = useState<
    "opps" | "archive" | "orgs" | "apps" | "interviews" | "resumes"
  >("opps");
  const [editing, setEditing] = useState<Opportunity | null>(null);
  const [importing, setImporting] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setDbError("");
      const [
        { data: opportunityRows, error: opportunityError },
        { data: organizationRows, error: organizationError },
      ] = await Promise.all([
        supabase
          .from("opportunities")
          .select("*")
          .order("jim_score", { ascending: false }),
        supabase
          .from("organizations")
          .select("*")
          .order("watch_priority", { ascending: false }),
      ]);

      if (opportunityError || organizationError) {
        setDbError(
          opportunityError?.message ||
            organizationError?.message ||
            "Unable to load Supabase data.",
        );
        setLoading(false);
        return;
      }

      let loadedOpps = (opportunityRows || []).map(fromDbOpportunity);
      let loadedOrgs = (organizationRows || []).map(fromDbOrganization);

      if (!loadedOpps.length) {
        const seedRows = seed.map(toDbOpportunity);
        const { data, error } = await supabase
          .from("opportunities")
          .upsert(seedRows)
          .select("*");
        if (error) setDbError(error.message);
        loadedOpps = (data || []).map(fromDbOpportunity);
      }

      if (!loadedOrgs.length) {
        const { data, error } = await supabase
          .from("organizations")
          .upsert(seedOrgs.map(toDbOrganization), { onConflict: "name" })
          .select("*");
        if (error) setDbError(error.message);
        loadedOrgs = (data || []).map(fromDbOrganization);
      }

      setOpps(loadedOpps);
      setOrgs(loadedOrgs.length ? loadedOrgs : seedOrgs);
      setSelectedId(loadedOpps[0]?.id || "");
      setLoading(false);
    }
    loadData();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return opps
      .filter((o) =>
        statusFilter === "Archived"
          ? o.status === "Archived"
          : statusFilter === "All"
            ? o.status !== "Archived"
            : o.status === statusFilter,
      )
      .filter((o) => tierFilter === "All" || o.tier === tierFilter)
      .filter((o) => ratingFilter === "All" || o.rating === ratingFilter)
      .filter(
        (o) =>
          !q ||
          [
            o.organization,
            o.position,
            o.synopsis,
            o.notes,
            o.feedbackNotes,
            o.passReasons.join(" "),
            o.careerLane,
            o.location,
          ]
            .join(" ")
            .toLowerCase()
            .includes(q),
      )
      .sort(
        (a, b) =>
          b.jimScore - a.jimScore ||
          b.lastReviewed.localeCompare(a.lastReviewed),
      );
  }, [opps, query, statusFilter, tierFilter, ratingFilter]);

  const selected =
    opps.find((o) => o.id === selectedId) || filtered[0] || opps[0];

  const metrics = useMemo(() => {
    const active = opps.filter(
      (o) => !["Pass", "Closed", "Archived"].includes(o.status),
    );
    const followUps = opps.filter(
      (o) =>
        o.followUpDate &&
        !["Closed", "Archived", "Pass"].includes(o.status) &&
        o.followUpDate <= today(),
    ).length;
    const avg = opps.length
      ? Math.round(
          opps.reduce((s, o) => s + Number(o.jimScore || 0), 0) / opps.length,
        )
      : 0;
    return {
      total: opps.length,
      review: opps.filter((o) => o.status === "Review").length,
      apply: opps.filter((o) => o.status === "Apply").length,
      applied: opps.filter((o) => o.status === "Applied").length,
      interviews: opps.filter((o) => o.status === "Interview").length,
      dream: opps.filter((o) => o.rating === "Dream").length,
      good: opps.filter((o) => o.rating === "Good").length,
      bad: opps.filter((o) => o.rating === "Bad").length,
      followUps,
      avg,
      active: active.length,
    };
  }, [opps]);

  async function saveOpportunity(o: Opportunity) {
    const normalized = hydrateOpportunity({ ...o, lastReviewed: today() });
    const { data, error } = await supabase
      .from("opportunities")
      .upsert(toDbOpportunity(normalized))
      .select("*")
      .single();
    if (error) {
      alert(`Save failed: ${error.message}`);
      return;
    }
    const saved = fromDbOpportunity(data);
    setOpps((prev) => {
      const exists = prev.some((x) => x.id === saved.id);
      if (exists) return prev.map((x) => (x.id === saved.id ? saved : x));
      return [saved, ...prev];
    });
    setSelectedId(saved.id);
    setEditing(null);
  }

  async function quickUpdate(id: string, patch: Partial<Opportunity>) {
    const current = opps.find((o) => o.id === id);
    if (!current) return;
    const updated = hydrateOpportunity({
      ...current,
      ...patch,
      lastReviewed: today(),
    });
    setOpps((prev) => prev.map((o) => (o.id === id ? updated : o)));
    const { error } = await supabase
      .from("opportunities")
      .update(toDbOpportunity(updated))
      .eq("id", id);
    if (error) {
      alert(`Update failed: ${error.message}`);
      const { data } = await supabase
        .from("opportunities")
        .select("*")
        .order("jim_score", { ascending: false });
      setOpps((data || []).map(fromDbOpportunity));
    }
  }

  async function deleteOpportunity(id: string) {
    if (!confirm("Delete this opportunity?")) return;
    const { error } = await supabase
      .from("opportunities")
      .delete()
      .eq("id", id);
    if (error) {
      alert(`Delete failed: ${error.message}`);
      return;
    }
    setOpps((prev) => prev.filter((o) => o.id !== id));
    setSelectedId("");
  }

  async function importJSON() {
    try {
      const parsed = JSON.parse(jsonText);
      if (parsed.orgs && Array.isArray(parsed.orgs)) {
        const normalizedOrgs = parsed.orgs
          .map((o: any) => ({
            name: o.name || o.organization || "",
            category: o.category || "",
            mission: o.mission || "",
            watchPriority: Number(o.watchPriority ?? o.watch_priority ?? 50),
            qualityScore: Number(o.qualityScore ?? o.quality_score ?? 50),
            careerLanes: Array.isArray(o.careerLanes)
              ? o.careerLanes
              : Array.isArray(o.career_lanes)
                ? o.career_lanes
                : [],
            careerUrl: o.careerUrl || o.career_url || "",
            lastSearched: o.lastSearched || o.last_searched || "",
            active: o.active !== false,
            notes: o.notes || "",
          }))
          .filter((o: Organization) => o.name);
        const { error: organizationImportError } = await supabase
          .from("organizations")
          .upsert(normalizedOrgs.map(toDbOrganization), { onConflict: "name" });
        if (organizationImportError) {
          throw new Error(`Organization import failed: ${organizationImportError.message}`);
        }
        setOrgs((prev) => {
          const map = new Map<string, Organization>(prev.map((o) => [normalizeText(o.name), o]));
          normalizedOrgs.forEach((o: Organization) =>
            map.set(normalizeText(o.name), {
              ...map.get(normalizeText(o.name)),
              ...o,
            }),
          );
          return Array.from(map.values()).sort(
            (a, b) => b.watchPriority - a.watchPriority,
          );
        });
      }

      const raw: any[] = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed.opportunities)
          ? parsed.opportunities
          : Array.isArray(parsed.opps)
            ? parsed.opps
            : [
                ...(parsed.tier1 || []),
                ...(parsed.tier2 || []),
                ...(parsed.tier3 || []),
              ];
      const importedOrganizationCount =
        parsed.orgs && Array.isArray(parsed.orgs)
          ? parsed.orgs.filter((o: any) => o?.name || o?.organization).length
          : 0;

      if (!Array.isArray(raw) || !raw.length) {
        if (importedOrganizationCount > 0) {
          const refreshedOrgs = await supabase
            .from("organizations")
            .select("*")
            .order("watch_priority", { ascending: false });
          if (refreshedOrgs.error) {
            throw new Error(`Organizations imported, but refresh failed: ${refreshedOrgs.error.message}`);
          }
          setOrgs((refreshedOrgs.data || []).map(fromDbOrganization));
          setImporting(false);
          setJsonText("");
          setTimeout(
            () => alert(`Organization import complete: ${importedOrganizationCount} organizations imported or updated.`),
            50,
          );
          return;
        }

        throw new Error(
          "No opportunities or organizations found. Accepted formats: array, { opportunities: [...] }, backup { opps: [...], orgs: [...] }, or tier1/tier2/tier3 arrays.",
        );
      }

      const batch =
        parsed.importBatch ||
        parsed.reportDate ||
        parsed.reportPeriod?.end ||
        defaultBatch();
      const sourceName = parsed.sourceAI || parsed.source || "Manual Import";
      const normalized = raw
        .map((x: any) => {
          const position = x.position || x.title || x.jobTitle || "";
          const organization = x.organization || x.company || x.employer || "";
          const sourceLink =
            x.link ||
            x.directLink ||
            x.directEmployerLink ||
            x.applyUrl ||
            x.url ||
            "";
          const firstSeen =
            x.firstSeen ||
            x.postingDate ||
            x.datePosted ||
            parsed.reportDate ||
            today();
          const notesParts = [
            x.notes,
            x.lane ? `Career Lane: ${x.lane}` : "",
            x.reviewStatus ? `External Review Status: ${x.reviewStatus}` : "",
            x.fitRationale ? `Fit rationale: ${x.fitRationale}` : "",
          ].filter(Boolean);
          const discovered = uniqueStrings(
            x.discoveredBy,
            x.sourceAI,
            x.aiSource,
            sourceName,
          );
          const item = hydrateOpportunity({
            ...x,
            organization,
            position,
            firstSeen,
            lastReviewed: today(),
            postingDate: x.postingDate || x.datePosted || firstSeen,
            tier: String(x.tier || "2") as Tier,
            status: "Review",
            rating: "Unrated",
            decision: "Unreviewed",
            salary: x.salary || x.salaryRange || x.compensation || "Unknown",
            remote: x.remote || x.remoteType || x.workArrangement || "Unknown",
            link: sourceLink,
            source: x.source || sourceName,
            sourceJobId: x.sourceJobId || x.requisitionId || x.reqId || "",
            synopsis: x.synopsis || x.fitRationale || x.whyMatch || "",
            duties:
              x.duties ||
              (Array.isArray(x.actualResponsibilities)
                ? x.actualResponsibilities.join("; ")
                : x.actualResponsibilities) ||
              "",
            requirements: x.requirements || "Unknown",
            gaps: x.gaps || x.majorGaps || "",
            pros: x.pros || x.whyMatch || "",
            cons: x.cons || x.majorGaps || "",
            careerLane: x.careerLane || x.lane || "",
            confidence: x.confidence || x.recommendationConfidence || "Medium",
            verificationStatus:
              x.verificationStatus ||
              (sourceLink ? "Needs Review" : "Unverified"),
            verificationDate: x.verificationDate || "",
            discoveredBy: discovered,
            importBatch: x.importBatch || batch,
            notes: notesParts.join("\n"),
            canonicalKey: "",
          });
          item.canonicalKey = canonicalKeyFor(item);
          return item;
        })
        .filter((x: Opportunity) => x.organization && x.position);
      if (!normalized.length)
        throw new Error(
          "All imported rows were missing an organization or position.",
        );

      const existingByKey = new Map<string, Opportunity>(opps.map((o) => [normalizeKey(o), o]));
      let added = 0,
        merged = 0;
      const rows = normalized.map((item) => {
        const existing = existingByKey.get(normalizeKey(item));
        if (!existing) {
          added++;
          return toDbOpportunity(item);
        }
        merged++;
        const combined = hydrateOpportunity({
          ...existing,
          ...item,
          id: existing.id,
          firstSeen: existing.firstSeen || item.firstSeen,
          discoveredBy: uniqueStrings(existing.discoveredBy, item.discoveredBy),
          passReasons: existing.passReasons,
          feedbackNotes: existing.feedbackNotes,
          decision: existing.decision,
          reviewedAt: existing.reviewedAt,
          importBatch: uniqueStrings(
            existing.importBatch,
            item.importBatch,
          ).join(", "),
          notes: uniqueStrings(existing.notes, item.notes).join("\n"),
          canonicalKey: existing.canonicalKey || item.canonicalKey,
        });
        return toDbOpportunity(combined);
      });

      const { error } = await supabase
        .from("opportunities")
        .upsert(rows, { onConflict: "id" });
      if (error) throw error;
      const refreshed = await supabase
        .from("opportunities")
        .select("*")
        .order("jim_score", { ascending: false });
      if (refreshed.error) throw refreshed.error;
      setOpps((refreshed.data || []).map(fromDbOpportunity));
      setImporting(false);
      setJsonText("");
      setTimeout(
        () =>
          alert(
            `Import complete: ${added} added, ${merged} merged as duplicates.`,
          ),
        50,
      );
    } catch (e: any) {
      alert(`Import failed: ${e.message}`);
    }
  }

  function sampleJSON() {
    const sample = [
      {
        firstSeen: today(),
        tier: "1",
        status: "Review",
        rating: "Unrated",
        jimScore: 91,
        mission: 90,
        roleFit: 94,
        competitiveness: 92,
        lifestyle: 90,
        compensation: 89,
        organization: "Example Mission Organization",
        position: "Program Operations Manager",
        location: "Remote",
        remote: "Yes",
        salary: "$90,000-$110,000",
        travel: "10%",
        link: "https://example.com/job",
        recommendation: "Review",
        synopsis: "Example spreadsheet-free import row.",
        pros: "Strong mission; operations; stakeholder coordination.",
        cons: "May prefer direct sector experience.",
        duties:
          "Coordinate initiatives; track deliverables; improve workflows.",
        requirements: "Bachelor's; program coordination; communication skills.",
        gaps: "No direct sector background.",
        notes: "Use Program / Operations resume.",
        resumeVersion: "Program / Operations",
        coverLetter: "Mission template",
      },
    ];
    setJsonText(JSON.stringify(sample, null, 2));
  }

  return (
    <main className="app">
      <div className="topbar">
        <div>
          <h1>Career Opp Dashboard</h1>
          <p>
            Career intelligence, opportunity scoring, and application tracking
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            className="btn"
            onClick={() =>
              download(
                `career-opportunities-${today()}.csv`,
                toCSV(opps),
                "text/csv",
              )
            }
          >
            <Download size={16} /> Export CSV
          </button>
          <button
            className="btn"
            onClick={() =>
              download(
                `career-intelligence-backup-${today()}.json`,
                JSON.stringify({ opps, orgs }, null, 2),
                "application/json",
              )
            }
          >
            <FileJson size={16} /> Backup JSON
          </button>
          <button className="btn" onClick={() => setImporting(true)}>
            <Upload size={16} /> Restore / Import
          </button>
        </div>
      </div>

      <div className="wrap">
        {loading && (
          <div className="card">
            <strong>Loading Supabase data...</strong>
          </div>
        )}
        {dbError && (
          <div
            className="card"
            style={{ borderColor: "#fca5a5", color: "#991b1b" }}
          >
            <strong>Database error:</strong> {dbError}
          </div>
        )}
        <div className="grid metrics">
          <div className="card metric">
            <div className="label">Total Jobs</div>
            <div className="value">{metrics.total}</div>
          </div>
          <div className="card metric">
            <div className="label">Active</div>
            <div className="value">{metrics.active}</div>
          </div>
          <div className="card metric">
            <div className="label">Review</div>
            <div className="value">{metrics.review}</div>
          </div>
          <div className="card metric">
            <div className="label">Apply</div>
            <div className="value">{metrics.apply}</div>
          </div>
          <div className="card metric">
            <div className="label">Applied</div>
            <div className="value">{metrics.applied}</div>
          </div>
          <div className="card metric">
            <div className="label">Dream / Good</div>
            <div className="value">{metrics.dream + metrics.good}</div>
          </div>
          <div className="card metric">
            <div className="label">Follow-ups Due</div>
            <div className="value">{metrics.followUps}</div>
          </div>
        </div>

        <div className="tabs">
          {[
            ["opps", "Active Opportunities"],
            ["archive", "Archive"],
            ["orgs", "Organizations"],
            ["apps", "Applications"],
            ["interviews", "Interviews"],
            ["resumes", "Resume Library"],
          ].map(([k, v]) => (
            <button
              key={k}
              className={`tab ${tab === k ? "active" : ""}`}
              onClick={() => setTab(k as any)}
            >
              {v}
            </button>
          ))}
        </div>

        {tab === "opps" && (
          <>
            <div className="card toolbar">
              <Search size={17} />
              <input
                className="search"
                placeholder="Search organization, role, notes..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {["All", ...statusOptions].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
              >
                {["All", "1", "2", "3"].map((s) => (
                  <option key={s} value={s}>
                    {s === "All" ? "All Tiers" : `Tier ${s}`}
                  </option>
                ))}
              </select>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
              >
                {["All", ...ratingOptions].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <button
                className="btn primary"
                onClick={() => setEditing(blankOpportunity())}
              >
                <Plus size={16} /> Add Job
              </button>
              <button className="btn" onClick={() => setImporting(true)}>
                <Upload size={16} /> Import JSON
              </button>
            </div>

            <div className="content">
              <div className="card list">
                <div className="list-header">
                  <strong>{filtered.length} opportunities</strong>
                  <span className="small">Click to review</span>
                </div>
                <div className="jobs">
                  {filtered.map((o) => (
                    <div
                      key={o.id}
                      className={`job-item ${selected?.id === o.id ? "active" : ""}`}
                      onClick={() => setSelectedId(o.id)}
                    >
                      <div className="job-title">{o.position}</div>
                      <div className="job-org">{o.organization}</div>
                      <div className="job-meta">
                        <span className="chip score">{o.jimScore}</span>
                        <span className={`chip tier${o.tier}`}>
                          Tier {o.tier}
                        </span>
                        <span className="chip">{o.status}</span>
                        <span className="chip">{o.decision}</span>
                        <span
                          className={`chip rating-${o.rating.toLowerCase()}`}
                        >
                          {o.rating}
                        </span>
                        <span className="chip">{o.verificationStatus}</span>
                        <span className="chip">{o.remote || "Remote?"}</span>
                      </div>
                    </div>
                  ))}
                  {!filtered.length && (
                    <div className="empty">No jobs match the filters.</div>
                  )}
                </div>
              </div>

              <div className="card detail">
                {selected ? (
                  <>
                    <div className="detail-head">
                      <div>
                        <h2>{selected.position}</h2>
                        <div className="sub">
                          {selected.organization} • {selected.location} •{" "}
                          {selected.salary}
                        </div>
                        <div className="job-meta">
                          <span className="chip">
                            Status: {selected.status}
                          </span>
                          <span className="chip">
                            Decision: {selected.decision}
                          </span>
                          <span
                            className={`chip rating-${selected.rating.toLowerCase()}`}
                          >
                            Rating: {selected.rating}
                          </span>
                          <span className="chip">
                            Verified: {selected.verificationStatus}
                          </span>
                          <span className="chip">
                            Applied: {selected.appliedDate || "—"}
                          </span>
                          <span className="chip">
                            Follow-up: {selected.followUpDate || "—"}
                          </span>
                        </div>
                      </div>
                      <div
                        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                      >
                        <button
                          className="btn good"
                          onClick={() =>
                            quickUpdate(selected.id, {
                              rating: "Good",
                              status:
                                selected.status === "Review"
                                  ? "Apply"
                                  : selected.status,
                            })
                          }
                        >
                          <ThumbsUp size={16} /> Good
                        </button>
                        <button
                          className="btn dream"
                          onClick={() =>
                            quickUpdate(selected.id, {
                              rating: "Dream",
                              status: "Apply",
                            })
                          }
                        >
                          <Star size={16} /> Dream
                        </button>
                        <button
                          className="btn neutral"
                          onClick={() =>
                            quickUpdate(selected.id, { rating: "Neutral" })
                          }
                        >
                          Neutral
                        </button>
                        <button
                          className="btn bad"
                          onClick={() =>
                            quickUpdate(selected.id, {
                              rating: "Bad",
                              status: "Pass",
                            })
                          }
                        >
                          <ThumbsDown size={16} /> Bad
                        </button>
                        <button
                          className="btn"
                          onClick={() =>
                            quickUpdate(selected.id, { status: "Watch" })
                          }
                        >
                          Watch
                        </button>
                        <button
                          className="btn"
                          onClick={() =>
                            quickUpdate(selected.id, {
                              status: "Applied",
                              appliedDate: selected.appliedDate || today(),
                              followUpDate: selected.followUpDate || addDays(7),
                            })
                          }
                        >
                          Mark Applied
                        </button>
                        <button
                          className="btn"
                          onClick={() =>
                            quickUpdate(selected.id, { status: "Interview" })
                          }
                        >
                          Interview
                        </button>
                        <button
                          className="btn"
                          onClick={() =>
                            quickUpdate(selected.id, {
                              status: "Pass",
                              rating:
                                selected.rating === "Unrated"
                                  ? "Bad"
                                  : selected.rating,
                            })
                          }
                        >
                          Pass
                        </button>
                        <button
                          className="btn"
                          onClick={() =>
                            quickUpdate(selected.id, { status: "Closed" })
                          }
                        >
                          Close
                        </button>
                        <button
                          className="btn"
                          onClick={() => {
                            quickUpdate(selected.id, { status: "Archived" });
                            setSelectedId("");
                          }}
                        >
                          <Archive size={16} /> Archive
                        </button>
                        {selected.link && (
                          <a
                            className="btn"
                            href={selected.link}
                            target="_blank"
                          >
                            Open Listing
                          </a>
                        )}
                        <button
                          className="btn"
                          onClick={() => setEditing(selected)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn danger"
                          onClick={() => deleteOpportunity(selected.id)}
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    </div>
                    <div className="detail-grid">
                      <Score label="Jim Score" value={selected.jimScore} />
                      <Score label="Mission" value={selected.mission} />
                      <Score label="Role Fit" value={selected.roleFit} />
                      <Score
                        label="Competitive"
                        value={selected.competitiveness}
                      />
                      <Score label="Lifestyle" value={selected.lifestyle} />
                      <Score
                        label="Compensation"
                        value={selected.compensation}
                      />
                    </div>
                    <ReviewPanel
                      opportunity={selected}
                      onChange={(patch) => quickUpdate(selected.id, patch)}
                    />
                    <div className="section">
                      <h3>Intelligence Metadata</h3>
                      <p>
                        <strong>Career Lane:</strong>{" "}
                        {selected.careerLane || "Unknown"} &nbsp;{" "}
                        <strong>Confidence:</strong> {selected.confidence}{" "}
                        &nbsp; <strong>Verification:</strong>{" "}
                        {selected.verificationStatus}{" "}
                        {selected.verificationDate
                          ? `(${selected.verificationDate})`
                          : ""}
                      </p>
                      <p>
                        <strong>Discovered By:</strong>{" "}
                        {selected.discoveredBy.join(", ") || "Unknown"} &nbsp;{" "}
                        <strong>Batch:</strong>{" "}
                        {selected.importBatch || "Unknown"}
                      </p>
                      <p>
                        <strong>Canonical Key:</strong>{" "}
                        {selected.canonicalKey || canonicalKeyFor(selected)}
                      </p>
                    </div>
                    <div className="section">
                      <h3>Synopsis</h3>
                      <p>{selected.synopsis || "No synopsis yet."}</p>
                    </div>
                    <div className="twocol">
                      <div className="section">
                        <h3>Pros</h3>
                        <p>{selected.pros || "—"}</p>
                      </div>
                      <div className="section">
                        <h3>Cons / Concerns</h3>
                        <p>{selected.cons || "—"}</p>
                      </div>
                    </div>
                    <div className="twocol">
                      <div className="section">
                        <h3>Primary Duties</h3>
                        <p>{selected.duties || "—"}</p>
                      </div>
                      <div className="section">
                        <h3>Requirements</h3>
                        <p>{selected.requirements || "—"}</p>
                      </div>
                    </div>
                    <div className="twocol">
                      <div className="section">
                        <h3>Gaps</h3>
                        <p>{selected.gaps || "—"}</p>
                      </div>
                      <div className="section">
                        <h3>Notes</h3>
                        <p>{selected.notes || "—"}</p>
                      </div>
                    </div>
                    <div className="section">
                      <h3>Application Plan</h3>
                      <p>
                        <strong>Resume:</strong> {selected.resumeVersion || "—"}{" "}
                        &nbsp; <strong>Cover Letter:</strong>{" "}
                        {selected.coverLetter || "—"} &nbsp;{" "}
                        <strong>Travel:</strong> {selected.travel || "—"}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="empty">Select or add an opportunity.</div>
                )}
              </div>
            </div>
          </>
        )}

        {tab === "archive" && (
          <ArchiveTable
            rows={opps.filter((o) => o.status === "Archived")}
            onUnarchive={(id) => quickUpdate(id, { status: "Review" })}
            onDelete={deleteOpportunity}
          />
        )}
        {tab === "orgs" && <Organizations orgs={orgs} />}
        {tab === "apps" && (
          <SimpleTable
            title="Applications"
            rows={opps.filter((o) =>
              ["Apply", "Applied", "Interview", "Offer"].includes(o.status),
            )}
          />
        )}
        {tab === "interviews" && (
          <SimpleTable
            title="Interview Pipeline"
            rows={opps.filter((o) => ["Interview", "Offer"].includes(o.status))}
          />
        )}
        {tab === "resumes" && <ResumeLibrary opps={opps} />}
      </div>

      {editing && (
        <OpportunityModal
          value={editing}
          onClose={() => setEditing(null)}
          onSave={saveOpportunity}
        />
      )}
      {importing && (
        <ImportModal
          text={jsonText}
          setText={setJsonText}
          sample={sampleJSON}
          onClose={() => setImporting(false)}
          onImport={importJSON}
        />
      )}
    </main>
  );
}
