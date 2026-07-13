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

type Tier = "1" | "2" | "3";
type Status =
  | "Review"
  | "Apply"
  | "Applied"
  | "Interview"
  | "Offer"
  | "Pass"
  | "Watch"
  | "Closed"
  | "Archived";
type Rating = "Unrated" | "Good" | "Bad" | "Neutral" | "Dream";
type Decision = "Unreviewed" | "Apply" | "Interested" | "Maybe" | "Pass";
type VerificationStatus = "Verified" | "Unverified" | "Closed" | "Needs Review";
type Confidence = "Very High" | "High" | "Medium" | "Low";

const PASS_REASONS = [
  "Too Senior",
  "Too Junior",
  "Missing Required Experience",
  "Too Technical",
  "Wrong Industry",
  "Salary Too Low",
  "Salary Unknown",
  "Too Much Travel",
  "On-call / Unpredictable Hours",
  "Shift Work",
  "Relocation Required",
  "Not Remote Enough",
  "Too Administrative",
  "Too People-Facing",
  "Too Much Management",
  "Too Much Sales",
  "Too Much Formal Project Management",
  "Work Does Not Interest Me",
  "Culture Does Not Appeal",
  "Mission Does Not Interest Me",
  "Employer Does Not Interest Me",
  "Listing Closed / Unavailable",
  "Other",
] as const;

type Opportunity = {
  id: string;
  firstSeen: string;
  lastReviewed: string;
  tier: Tier;
  status: Status;
  rating: Rating;
  decision: Decision;
  passReasons: string[];
  feedbackNotes: string;
  reviewedAt: string;
  discoveredBy: string[];
  verificationStatus: VerificationStatus;
  verificationDate: string;
  importBatch: string;
  canonicalKey: string;
  careerLane: string;
  confidence: Confidence;
  source: string;
  sourceJobId: string;
  postingDate: string;
  appliedDate: string;
  followUpDate: string;
  jimScore: number;
  mission: number;
  roleFit: number;
  competitiveness: number;
  lifestyle: number;
  compensation: number;
  organization: string;
  position: string;
  location: string;
  remote: string;
  salary: string;
  travel: string;
  link: string;
  recommendation: string;
  synopsis: string;
  pros: string;
  cons: string;
  duties: string;
  requirements: string;
  gaps: string;
  notes: string;
  resumeVersion: string;
  coverLetter: string;
};

type Organization = {
  name: string;
  category: string;
  mission: string;
  watchPriority: number;
  qualityScore: number;
  careerLanes: string[];
  careerUrl: string;
  lastSearched: string;
  active: boolean;
  notes: string;
};

const today = () => new Date().toISOString().slice(0, 10);
const addDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};
const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
const clean = (v: unknown) => String(v ?? "").trim();
const normalizeText = (v: unknown) =>
  clean(v)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
const canonicalKeyFor = (o: Partial<Opportunity>) => {
  const org = normalizeText(o.organization);
  const role = normalizeText(o.position);
  const loc = normalizeText(o.location || o.remote);
  const req = normalizeText(o.sourceJobId);
  return [org, role, req || loc].filter(Boolean).join("|");
};
const uniqueStrings = (...values: unknown[]) =>
  Array.from(
    new Set(
      values
        .flatMap((v) => (Array.isArray(v) ? v : clean(v) ? [clean(v)] : []))
        .filter(Boolean),
    ),
  );
const defaultBatch = () => `${today()}-manual`;

const seed: Opportunity[] = [
  {
    id: uid(),
    firstSeen: "2026-07-08",
    lastReviewed: "2026-07-08",
    tier: "1",
    status: "Applied",
    rating: "Dream",
    decision: "Apply",
    passReasons: [],
    feedbackNotes: "",
    reviewedAt: "2026-07-08",
    discoveredBy: ["Seed"],
    verificationStatus: "Verified",
    verificationDate: "2026-07-08",
    importBatch: "baseline",
    canonicalKey: "",
    careerLane: "Program Operations",
    confidence: "High",
    source: "Employer",
    sourceJobId: "",
    postingDate: "2026-07-08",
    appliedDate: "",
    followUpDate: "",
    jimScore: 97,
    mission: 100,
    roleFit: 94,
    competitiveness: 88,
    lifestyle: 92,
    compensation: 82,
    organization: "St. Jude Children's Research Hospital",
    position: "Program Specialist, Global Critical Care Program",
    location: "Remote / Memphis, TN travel",
    remote: "Yes",
    salary: "$60,320-$105,040",
    travel: "Quarterly Memphis travel / as requested",
    link: "",
    recommendation: "Preserve as active high-priority application",
    synopsis:
      "Coordinates projects, budgets, processes, implementation support, training, communication, and quality improvement work across a global hospital network.",
    pros: "Exceptional mission fit; strong alignment with program coordination, process development, stakeholder communication, training support, and implementation work.",
    cons: "Healthcare/global health domain may require careful positioning; salary range may land below ideal.",
    duties:
      "Coordinate project activities; support evidence-based interventions; facilitate communication with hospitals and partners; track deliverables; support process and workflow standardization; organize implementation and quality improvement efforts.",
    requirements:
      "Bachelor's degree; 1+ year program coordination; project planning tools helpful; healthcare/QI/implementation science preferred but not required.",
    gaps: "No direct healthcare implementation background; need to position Red Cross multi-agency program work as transferable.",
    notes:
      "Use Healthcare / Mission implementation resume and St. Jude-specific cover letter.",
    resumeVersion: "Healthcare / Mission",
    coverLetter: "St. Jude custom",
  },
  {
    id: uid(),
    firstSeen: "2026-07-08",
    lastReviewed: "2026-07-08",
    tier: "1",
    status: "Applied",
    rating: "Good",
    decision: "Apply",
    passReasons: [],
    feedbackNotes: "",
    reviewedAt: "2026-07-08",
    discoveredBy: ["Seed"],
    verificationStatus: "Verified",
    verificationDate: "2026-07-08",
    importBatch: "baseline",
    canonicalKey: "",
    careerLane: "SIU / Investigations",
    confidence: "High",
    source: "Employer",
    sourceJobId: "",
    postingDate: "2026-07-08",
    appliedDate: "",
    followUpDate: "",
    jimScore: 94,
    mission: 90,
    roleFit: 95,
    competitiveness: 96,
    lifestyle: 88,
    compensation: 82,
    organization: "Auto-Owners Insurance",
    position: "Field Investigator",
    location: "Lexington, KY",
    remote: "Hybrid after training possible",
    salary: "Estimated $78k-$90k",
    travel: "Local field travel",
    link: "",
    recommendation: "Preserve as active application",
    synopsis:
      "Investigate, evaluate, and determine disposition of claims; meet with involved parties; analyze issues warranting additional investigation; report writing and customer service.",
    pros: "Very strong FBI + field operations fit; realistic transition; strong competitiveness.",
    cons: "Insurance claims experience may be preferred; salary may be near current range rather than a major increase.",
    duties:
      "Investigate claims; interview and meet people involved; evaluate documents and facts; provide customer service; write reports; support claims department associates.",
    requirements:
      "Bachelor's/equivalent; law enforcement preferred; field claim/auto experience preferred; report writing; conflict handling; valid driver license.",
    gaps: "No direct claims adjusting background.",
    notes: "Use Field Investigation resume.",
    resumeVersion: "Investigations / Field Operations",
    coverLetter: "Not required / LinkedIn recruiter note",
  },
];

const seedOrgs: Organization[] = [
  {
    name: "St. Jude Children's Research Hospital",
    category: "Healthcare / Research",
    mission: "Pediatric research and global care",
    watchPriority: 100,
    qualityScore: 95,
    careerLanes: ["Program Operations", "Research Operations"],
    careerUrl: "",
    lastSearched: "",
    active: true,
    notes: "Top-fit organization; global program implementation roles.",
  },
  {
    name: "Auto-Owners Insurance",
    category: "Mutual Insurance",
    mission: "Financial security and customer recovery",
    watchPriority: 94,
    qualityScore: 90,
    careerLanes: ["SIU / Fraud", "Business Operations"],
    careerUrl: "",
    lastSearched: "",
    active: true,
    notes: "Field investigator and SIU-style roles.",
  },
  {
    name: "RTI International",
    category: "Research Institute",
    mission: "Research and public impact",
    watchPriority: 95,
    qualityScore: 90,
    careerLanes: ["Program Operations", "Research Administration"],
    careerUrl: "",
    lastSearched: "",
    active: true,
    notes: "Implementation and program roles.",
  },
  {
    name: "University of Kentucky",
    category: "Higher Education",
    mission: "Local education, research, health",
    watchPriority: 90,
    qualityScore: 86,
    careerLanes: ["Academic Operations", "Research Administration"],
    careerUrl: "",
    lastSearched: "",
    active: true,
    notes: "Local advantage; pay sometimes lower.",
  },
];

const blankOpportunity = (): Opportunity => ({
  id: uid(),
  firstSeen: today(),
  lastReviewed: today(),
  tier: "2",
  status: "Review",
  rating: "Unrated",
  decision: "Unreviewed",
  passReasons: [],
  feedbackNotes: "",
  reviewedAt: "",
  discoveredBy: [],
  verificationStatus: "Needs Review",
  verificationDate: "",
  importBatch: defaultBatch(),
  canonicalKey: "",
  careerLane: "",
  confidence: "Medium",
  source: "",
  sourceJobId: "",
  postingDate: today(),
  appliedDate: "",
  followUpDate: "",
  jimScore: 80,
  mission: 80,
  roleFit: 80,
  competitiveness: 80,
  lifestyle: 80,
  compensation: 80,
  organization: "",
  position: "",
  location: "",
  remote: "",
  salary: "",
  travel: "",
  link: "",
  recommendation: "Review",
  synopsis: "",
  pros: "",
  cons: "",
  duties: "",
  requirements: "",
  gaps: "",
  notes: "",
  resumeVersion: "",
  coverLetter: "",
});

function hydrateOpportunity(x: Partial<Opportunity>): Opportunity {
  const base = blankOpportunity();
  return {
    ...base,
    ...x,
    id: x.id || uid(),
    firstSeen: x.firstSeen || (x as any).date || base.firstSeen,
    lastReviewed: x.lastReviewed || base.lastReviewed,
    status: (x.status as Status) || "Review",
    rating: (x.rating as Rating) || "Unrated",
    decision:
      (x.decision as Decision) ||
      (["Apply", "Applied", "Interview", "Offer"].includes(String(x.status))
        ? "Apply"
        : x.status === "Watch"
          ? "Interested"
          : x.status === "Pass"
            ? "Pass"
            : "Unreviewed"),
    passReasons: Array.isArray(x.passReasons) ? x.passReasons : [],
    feedbackNotes: x.feedbackNotes || "",
    reviewedAt: x.reviewedAt || "",
    discoveredBy: Array.isArray(x.discoveredBy) ? x.discoveredBy : [],
    verificationStatus:
      (x.verificationStatus as VerificationStatus) || "Needs Review",
    verificationDate: x.verificationDate || "",
    importBatch: x.importBatch || defaultBatch(),
    canonicalKey: x.canonicalKey || canonicalKeyFor(x),
    careerLane: x.careerLane || "",
    confidence: (x.confidence as Confidence) || "Medium",
    source: x.source || "",
    sourceJobId: x.sourceJobId || "",
    postingDate: x.postingDate || x.firstSeen || today(),
    appliedDate: x.appliedDate || "",
    followUpDate: x.followUpDate || "",
    tier: String(x.tier || "2") as Tier,
  };
}

const statusOptions: Status[] = [
  "Review",
  "Apply",
  "Applied",
  "Interview",
  "Offer",
  "Pass",
  "Watch",
  "Closed",
  "Archived",
];
const ratingOptions: Rating[] = ["Unrated", "Good", "Bad", "Neutral", "Dream"];

function normalizeKey(o: Partial<Opportunity>) {
  return o.canonicalKey || canonicalKeyFor(o);
}

type DbOpportunity = {
  id?: string;
  first_seen?: string | null;
  last_reviewed?: string | null;
  tier?: number | null;
  status?: string | null;
  rating?: string | null;
  decision?: string | null;
  pass_reasons?: string[] | null;
  feedback_notes?: string | null;
  reviewed_at?: string | null;
  discovered_by?: string[] | null;
  verification_status?: string | null;
  verification_date?: string | null;
  import_batch?: string | null;
  canonical_key?: string | null;
  career_lane?: string | null;
  confidence?: string | null;
  source?: string | null;
  source_job_id?: string | null;
  posting_date?: string | null;
  applied_date?: string | null;
  follow_up_date?: string | null;
  jim_score?: number | null;
  mission_score?: number | null;
  role_fit_score?: number | null;
  competitiveness_score?: number | null;
  lifestyle_score?: number | null;
  compensation_score?: number | null;
  organization?: string | null;
  title?: string | null;
  location?: string | null;
  remote?: string | null;
  salary?: string | null;
  travel?: string | null;
  link?: string | null;
  recommendation?: string | null;
  synopsis?: string | null;
  pros?: string | null;
  cons?: string | null;
  duties?: string | null;
  requirements?: string | null;
  gaps?: string | null;
  notes?: string | null;
  resume_version?: string | null;
  cover_letter?: string | null;
  date_found?: string | null;
};

function fromDbOpportunity(row: any): Opportunity {
  return hydrateOpportunity({
    id: row.id,
    firstSeen:
      row.first_seen ||
      row.date_found ||
      row.created_at?.slice?.(0, 10) ||
      today(),
    lastReviewed:
      row.last_reviewed || row.updated_at?.slice?.(0, 10) || today(),
    tier: String(row.tier || "2") as Tier,
    status: row.status || "Review",
    rating: row.rating || "Unrated",
    decision: row.decision || "Unreviewed",
    passReasons: row.pass_reasons || [],
    feedbackNotes: row.feedback_notes || "",
    reviewedAt: row.reviewed_at || "",
    discoveredBy: row.discovered_by || [],
    verificationStatus: row.verification_status || "Needs Review",
    verificationDate: row.verification_date || "",
    importBatch: row.import_batch || "",
    canonicalKey: row.canonical_key || "",
    careerLane: row.career_lane || "",
    confidence: row.confidence || "Medium",
    source: row.source || "",
    sourceJobId: row.source_job_id || "",
    postingDate: row.posting_date || row.first_seen || "",
    appliedDate: row.applied_date || "",
    followUpDate: row.follow_up_date || "",
    jimScore: row.jim_score || 0,
    mission: row.mission_score || 0,
    roleFit: row.role_fit_score || 0,
    competitiveness: row.competitiveness_score || 0,
    lifestyle: row.lifestyle_score || 0,
    compensation: row.compensation_score || 0,
    organization: row.organization || "",
    position: row.title || "",
    location: row.location || "",
    remote: row.remote || "",
    salary: row.salary || "",
    travel: row.travel || "",
    link: row.link || "",
    recommendation: row.recommendation || "",
    synopsis: row.synopsis || "",
    pros: row.pros || "",
    cons: row.cons || "",
    duties: row.duties || "",
    requirements: row.requirements || "",
    gaps: row.gaps || "",
    notes: row.notes || "",
    resumeVersion: row.resume_version || "",
    coverLetter: row.cover_letter || "",
  });
}

function toDbOpportunity(o: Opportunity): DbOpportunity {
  return {
    id: o.id,
    first_seen: o.firstSeen || today(),
    last_reviewed: o.lastReviewed || today(),
    date_found: o.firstSeen || today(),
    tier: Number(o.tier || 2),
    status: o.status,
    rating: o.rating,
    decision: o.decision,
    pass_reasons: o.passReasons,
    feedback_notes: o.feedbackNotes || null,
    reviewed_at: o.reviewedAt || null,
    discovered_by: o.discoveredBy,
    verification_status: o.verificationStatus,
    verification_date: o.verificationDate || null,
    import_batch: o.importBatch || null,
    canonical_key: o.canonicalKey || canonicalKeyFor(o),
    career_lane: o.careerLane || null,
    confidence: o.confidence,
    source: o.source || null,
    source_job_id: o.sourceJobId || null,
    posting_date: o.postingDate || o.firstSeen || null,
    applied_date: o.appliedDate || null,
    follow_up_date: o.followUpDate || null,
    jim_score: Number(o.jimScore || 0),
    mission_score: Number(o.mission || 0),
    role_fit_score: Number(o.roleFit || 0),
    competitiveness_score: Number(o.competitiveness || 0),
    lifestyle_score: Number(o.lifestyle || 0),
    compensation_score: Number(o.compensation || 0),
    organization: o.organization,
    title: o.position,
    location: o.location,
    remote: o.remote,
    salary: o.salary,
    travel: o.travel,
    link: o.link,
    recommendation: o.recommendation,
    synopsis: o.synopsis,
    pros: o.pros,
    cons: o.cons,
    duties: o.duties,
    requirements: o.requirements,
    gaps: o.gaps,
    notes: o.notes,
    resume_version: o.resumeVersion,
    cover_letter: o.coverLetter,
  };
}

function fromDbOrganization(row: any): Organization {
  return {
    name: row.name,
    category: row.category || "",
    mission: row.mission || "",
    watchPriority: row.watch_priority || 0,
    qualityScore: row.quality_score || 0,
    careerLanes: row.career_lanes || [],
    careerUrl: row.career_url || "",
    lastSearched: row.last_searched || "",
    active: row.active !== false,
    notes: row.notes || "",
  };
}

function toDbOrganization(o: Organization) {
  return {
    name: o.name,
    category: o.category,
    mission: o.mission,
    watch_priority: o.watchPriority,
    quality_score: o.qualityScore,
    career_lanes: o.careerLanes,
    career_url: o.careerUrl || null,
    last_searched: o.lastSearched || null,
    active: o.active,
    notes: o.notes,
  };
}

function toCSV(rows: Opportunity[]) {
  const headers = [
    "firstSeen",
    "lastReviewed",
    "tier",
    "status",
    "rating",
    "decision",
    "passReasons",
    "feedbackNotes",
    "reviewedAt",
    "discoveredBy",
    "verificationStatus",
    "verificationDate",
    "importBatch",
    "canonicalKey",
    "careerLane",
    "confidence",
    "source",
    "sourceJobId",
    "postingDate",
    "appliedDate",
    "followUpDate",
    "jimScore",
    "mission",
    "roleFit",
    "competitiveness",
    "lifestyle",
    "compensation",
    "organization",
    "position",
    "location",
    "remote",
    "salary",
    "travel",
    "link",
    "recommendation",
    "synopsis",
    "pros",
    "cons",
    "duties",
    "requirements",
    "gaps",
    "notes",
    "resumeVersion",
    "coverLetter",
  ];
  const esc = (v: unknown) => `"${String(v ?? "").replaceAll('"', '""')}"`;
  return [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => esc((r as any)[h])).join(",")),
  ].join("\n");
}

function download(filename: string, text: string, type = "text/plain") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

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
        await supabase
          .from("organizations")
          .upsert(normalizedOrgs.map(toDbOrganization), { onConflict: "name" });
        setOrgs((prev) => {
          const map = new Map(prev.map((o) => [normalizeText(o.name), o]));
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
      if (!Array.isArray(raw) || !raw.length)
        throw new Error(
          "No opportunities found. Accepted formats: array, { opportunities: [...] }, backup { opps: [...] }, or tier1/tier2/tier3 arrays.",
        );

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

      const existingByKey = new Map(opps.map((o) => [normalizeKey(o), o]));
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

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div className="scorebox">
      <div className="slabel">{label}</div>
      <div className="svalue">{value}</div>
    </div>
  );
}

function ReviewPanel({
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

function Organizations({ orgs }: { orgs: Organization[] }) {
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

function ArchiveTable({
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

function SimpleTable({ title, rows }: { title: string; rows: Opportunity[] }) {
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

function ResumeLibrary({ opps }: { opps: Opportunity[] }) {
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

function OpportunityModal({
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
  children: React.ReactNode;
  cls?: string;
}) {
  return (
    <div className={cls || ""}>
      <label>{label}</label>
      {children}
    </div>
  );
}

function ImportModal({
  text,
  setText,
  sample,
  onClose,
  onImport,
}: {
  text: string;
  setText: (s: string) => void;
  sample: () => void;
  onClose: () => void;
  onImport: () => void;
}) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-head">
          <strong>Import / Restore JSON</strong>
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="modal-body">
          <p className="small">
            Paste JSON from ChatGPT or a Backup JSON file. Accepted formats: an
            array, an opportunities object, or a full backup object. Existing
            jobs with the same organization + position are updated instead of
            duplicated.
          </p>
          <textarea
            className="jsonbox"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='[{ "organization": "...", "position": "...", "jimScore": 90 }]'
          />
        </div>
        <div className="modal-foot">
          <button className="btn" onClick={sample}>
            Insert Sample
          </button>
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn primary" onClick={onImport}>
            Import
          </button>
        </div>
      </div>
    </div>
  );
}
