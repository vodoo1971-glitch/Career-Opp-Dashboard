export type Tier = "1" | "2" | "3";
export type Status =
  | "Review"
  | "Apply"
  | "Applied"
  | "Interview"
  | "Offer"
  | "Pass"
  | "Watch"
  | "Closed"
  | "Archived";
export type Rating = "Unrated" | "Good" | "Bad" | "Neutral" | "Dream";
export type Decision = "Unreviewed" | "Apply" | "Interested" | "Maybe" | "Pass";
export type VerificationStatus = "Verified" | "Unverified" | "Closed" | "Needs Review";
export type Confidence = "Very High" | "High" | "Medium" | "Low";

export const PASS_REASONS = [
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

export type Opportunity = {
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

export type Organization = {
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

export const today = () => new Date().toISOString().slice(0, 10);
export const addDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};
export const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
export const clean = (v: unknown) => String(v ?? "").trim();
export const normalizeText = (v: unknown) =>
  clean(v)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
export const canonicalKeyFor = (o: Partial<Opportunity>) => {
  const org = normalizeText(o.organization);
  const role = normalizeText(o.position);
  const loc = normalizeText(o.location || o.remote);
  const req = normalizeText(o.sourceJobId);
  return [org, role, req || loc].filter(Boolean).join("|");
};
export const uniqueStrings = (...values: unknown[]) =>
  Array.from(
    new Set(
      values
        .flatMap((v) => (Array.isArray(v) ? v : clean(v) ? [clean(v)] : []))
        .filter(Boolean),
    ),
  );
export const defaultBatch = () => `${today()}-manual`;

export const seed: Opportunity[] = [
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

export const seedOrgs: Organization[] = [
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

export const blankOpportunity = (): Opportunity => ({
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

export function hydrateOpportunity(x: Partial<Opportunity>): Opportunity {
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

export const statusOptions: Status[] = [
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
export const ratingOptions: Rating[] = ["Unrated", "Good", "Bad", "Neutral", "Dream"];

export function normalizeKey(o: Partial<Opportunity>) {
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

export function fromDbOpportunity(row: any): Opportunity {
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

export function toDbOpportunity(o: Opportunity): DbOpportunity {
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

export function fromDbOrganization(row: any): Organization {
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

export function toDbOrganization(o: Organization) {
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

export function toCSV(rows: Opportunity[]) {
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

export function download(filename: string, text: string, type = "text/plain") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
