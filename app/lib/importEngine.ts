export type ImportSource =
  | "ChatGPT"
  | "Claude"
  | "Gemini"
  | "Perplexity"
  | "Copilot"
  | "Grok"
  | "DeepSeek"
  | "Manual Import"
  | string;

export type ImportVerificationStatus =
  | "Verified"
  | "Needs Review"
  | "Unverified"
  | "Closed";

export type ImportConfidence =
  | "Very High"
  | "High"
  | "Medium"
  | "Low";

export type ImportTier = "1" | "2" | "3";

export type ImportedOpportunity = {
  organization: string;
  position: string;

  firstSeen: string;
  lastReviewed: string;
  postingDate: string;

  tier: ImportTier;
  status: "Review";
  rating: "Unrated";
  decision: "Unreviewed";

  passReasons: string[];
  feedbackNotes: string;
  reviewedAt: string;

  jimScore: number;
  mission: number;
  roleFit: number;
  competitiveness: number;
  lifestyle: number;
  compensation: number;

  location: string;
  remote: string;
  salary: string;
  travel: string;

  link: string;
  source: string;
  sourceJobId: string;

  discoveredBy: string[];
  importBatch: string;
  canonicalKey: string;

  verificationStatus: ImportVerificationStatus;
  verificationDate: string;
  confidence: ImportConfidence;
  careerLane: string;

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

export type ImportedOrganization = {
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

export type ImportSummary = {
  sourceAI: string;
  importBatch: string;
  reportDate: string;
  opportunities: ImportedOpportunity[];
  organizations: ImportedOrganization[];
  rejectedRows: RejectedImportRow[];
};

export type RejectedImportRow = {
  index: number;
  reason: string;
  raw: unknown;
};

type AnyRecord = Record<string, any>;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function clean(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeText(value: unknown): string {
  return clean(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const parsed = Number.parseFloat(
    String(value ?? "")
      .replace(/[$,%]/g, "")
      .trim(),
  );

  return Number.isFinite(parsed) ? parsed : fallback;
}

function clampScore(value: unknown, fallback = 0): number {
  return Math.max(0, Math.min(100, Math.round(asNumber(value, fallback))));
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return Array.from(
      new Set(
        value
          .map((item) => clean(item))
          .filter(Boolean),
      ),
    );
  }

  const text = clean(value);
  if (!text) return [];

  return Array.from(
    new Set(
      text
        .split(/[,;|]/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

function uniqueStrings(...values: unknown[]): string[] {
  return Array.from(
    new Set(
      values
        .flatMap((value) => asStringArray(value))
        .filter(Boolean),
    ),
  );
}

function firstNonBlank(...values: unknown[]): string {
  for (const value of values) {
    const text = clean(value);
    if (text) return text;
  }

  return "";
}

function normalizeTier(value: unknown): ImportTier {
  const tier = clean(value).replace(/[^123]/g, "");

  if (tier === "1") return "1";
  if (tier === "3") return "3";
  return "2";
}

function normalizeConfidence(value: unknown): ImportConfidence {
  const text = normalizeText(value);

  if (text.includes("very high")) return "Very High";
  if (text === "high" || text.includes("high confidence")) return "High";
  if (text === "low" || text.includes("low confidence")) return "Low";

  return "Medium";
}

function normalizeVerificationStatus(
  value: unknown,
  link: string,
): ImportVerificationStatus {
  const text = normalizeText(value);

  if (
    text.includes("closed") ||
    text.includes("expired") ||
    text.includes("filled") ||
    text.includes("no longer accepting")
  ) {
    return "Closed";
  }

  if (text.includes("verified")) {
    return "Verified";
  }

  if (text.includes("unverified")) {
    return "Unverified";
  }

  if (text.includes("needs review") || text.includes("ambiguous")) {
    return "Needs Review";
  }

  return link ? "Needs Review" : "Unverified";
}

function normalizeRemote(value: unknown): string {
  const text = clean(value);

  if (!text) return "Unknown";

  const normalized = normalizeText(text);

  if (
    normalized === "yes" ||
    normalized.includes("fully remote") ||
    normalized.includes("100 remote") ||
    normalized.includes("remote us") ||
    normalized.includes("united states remote")
  ) {
    return "Remote";
  }

  if (normalized.includes("hybrid")) {
    return "Hybrid";
  }

  if (
    normalized === "no" ||
    normalized.includes("on site") ||
    normalized.includes("onsite")
  ) {
    return "On-site";
  }

  return text;
}

function canonicalKeyFor(input: {
  organization: string;
  position: string;
  location: string;
  remote: string;
  sourceJobId: string;
}): string {
  const organization = normalizeText(input.organization);
  const position = normalizeText(input.position);
  const location = normalizeText(input.location || input.remote);
  const requisition = normalizeText(input.sourceJobId);

  return [organization, position, requisition || location]
    .filter(Boolean)
    .join("|");
}

function inferSourceName(parsed: AnyRecord): string {
  return firstNonBlank(
    parsed.sourceAI,
    parsed.aiSource,
    parsed.sourceName,
    parsed.source,
    "Manual Import",
  );
}

function inferReportDate(parsed: AnyRecord): string {
  return firstNonBlank(
    parsed.reportDate,
    parsed.reportPeriod?.end,
    parsed.searchDate,
    parsed.date,
    today(),
  );
}

function inferImportBatch(
  parsed: AnyRecord,
  sourceName: string,
  reportDate: string,
): string {
  return firstNonBlank(
    parsed.importBatch,
    parsed.batchId,
    parsed.batchID,
    `${reportDate}-${sourceName.replace(/\s+/g, "")}`,
  );
}

function flattenOpportunityRows(parsed: unknown): AnyRecord[] {
  if (Array.isArray(parsed)) {
    return parsed.filter(
      (item): item is AnyRecord =>
        Boolean(item) && typeof item === "object" && !Array.isArray(item),
    );
  }

  if (!parsed || typeof parsed !== "object") {
    return [];
  }

  const record = parsed as AnyRecord;

  if (Array.isArray(record.opportunities)) {
    return record.opportunities;
  }

  if (Array.isArray(record.opps)) {
    return record.opps;
  }

  if (Array.isArray(record.jobs)) {
    return record.jobs;
  }

  if (Array.isArray(record.results)) {
    return record.results;
  }

  return [
    ...(Array.isArray(record.tier1) ? record.tier1 : []),
    ...(Array.isArray(record.tier2) ? record.tier2 : []),
    ...(Array.isArray(record.tier3) ? record.tier3 : []),
  ];
}

function flattenOrganizationRows(parsed: unknown): AnyRecord[] {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return [];
  }

  const record = parsed as AnyRecord;

  if (Array.isArray(record.orgs)) return record.orgs;
  if (Array.isArray(record.organizations)) return record.organizations;
  if (Array.isArray(record.employers)) return record.employers;
  if (Array.isArray(record.watchList)) return record.watchList;

  return [];
}

function joinText(value: unknown): string {
  if (Array.isArray(value)) {
    return value
      .map((item) => clean(item))
      .filter(Boolean)
      .join("; ");
  }

  return clean(value);
}

function normalizeOpportunity(
  row: AnyRecord,
  sourceName: string,
  importBatch: string,
  reportDate: string,
): ImportedOpportunity {
  const organization = firstNonBlank(
    row.organization,
    row.company,
    row.employer,
    row.organizationName,
  );

  const position = firstNonBlank(
    row.position,
    row.title,
    row.jobTitle,
    row.role,
  );

  const firstSeen = firstNonBlank(
    row.firstSeen,
    row.postingDate,
    row.datePosted,
    row.postedDate,
    reportDate,
  );

  const postingDate = firstNonBlank(
    row.postingDate,
    row.datePosted,
    row.postedDate,
    firstSeen,
    "Unknown",
  );

  const link = firstNonBlank(
    row.link,
    row.directLink,
    row.directEmployerLink,
    row.applicationUrl,
    row.applyUrl,
    row.url,
  );

  const sourceJobId = firstNonBlank(
    row.sourceJobId,
    row.requisitionId,
    row.reqId,
    row.jobId,
    row.requisitionNumber,
    "Unknown",
  );

  const location = firstNonBlank(
    row.location,
    row.jobLocation,
    row.cityState,
    row.workLocation,
    "Unknown",
  );

  const remote = normalizeRemote(
    firstNonBlank(
      row.remote,
      row.remoteType,
      row.workArrangement,
      row.locationType,
      "Unknown",
    ),
  );

  const careerLane = firstNonBlank(
    row.careerLane,
    row.lane,
    row.jobFamily,
    row.functionalLane,
    "Unknown",
  );

  const discoveredBy = uniqueStrings(
    row.discoveredBy,
    row.sourceAI,
    row.aiSource,
    sourceName,
  );

  const salary = firstNonBlank(
    row.salary,
    row.salaryRange,
    row.compensation,
    row.payRange,
    "Unknown",
  );

  const synopsis = firstNonBlank(
    row.synopsis,
    row.fitRationale,
    row.whyMatch,
    row.summary,
    row.descriptionSummary,
  );

  const duties = firstNonBlank(
    joinText(row.duties),
    joinText(row.actualResponsibilities),
    joinText(row.responsibilities),
    joinText(row.primaryDuties),
  );

  const requirements = firstNonBlank(
    joinText(row.requirements),
    joinText(row.requiredQualifications),
    joinText(row.qualifications),
    "Unknown",
  );

  const gaps = firstNonBlank(
    joinText(row.gaps),
    joinText(row.majorGaps),
    joinText(row.concerns),
  );

  const pros = firstNonBlank(
    joinText(row.pros),
    joinText(row.whyMatch),
    joinText(row.strengths),
  );

  const cons = firstNonBlank(
    joinText(row.cons),
    joinText(row.majorGaps),
    joinText(row.concerns),
  );

  const notesParts = [
    clean(row.notes),
    row.lane && !clean(row.notes).includes("Career Lane")
      ? `Career Lane: ${clean(row.lane)}`
      : "",
    row.reviewStatus
      ? `External Review Status: ${clean(row.reviewStatus)}`
      : "",
    row.fitRationale && !synopsis
      ? `Fit rationale: ${clean(row.fitRationale)}`
      : "",
  ].filter(Boolean);

  const verificationStatus = normalizeVerificationStatus(
    row.verificationStatus,
    link,
  );

  const opportunity: ImportedOpportunity = {
    organization,
    position,

    firstSeen,
    lastReviewed: today(),
    postingDate,

    tier: normalizeTier(row.tier),
    status: "Review",
    rating: "Unrated",
    decision: "Unreviewed",

    passReasons: [],
    feedbackNotes: "",
    reviewedAt: "",

    jimScore: clampScore(row.jimScore),
    mission: clampScore(
      row.mission ?? row.missionScore ?? row.missionAlignment,
    ),
    roleFit: clampScore(
      row.roleFit ?? row.experienceScore ?? row.experienceMatch,
    ),
    competitiveness: clampScore(
      row.competitiveness ??
        row.shortlistScore ??
        row.shortlistProbability,
    ),
    lifestyle: clampScore(
      row.lifestyle ?? row.lifestyleScore ?? row.lifestyleFit,
    ),
    compensation: clampScore(
      row.compensation ??
        row.compensationScore ??
        row.compensationFit,
    ),

    location,
    remote,
    salary,
    travel: firstNonBlank(row.travel, row.travelRequirement, "Unknown"),

    link,
    source: firstNonBlank(row.source, sourceName),
    sourceJobId,

    discoveredBy,
    importBatch: firstNonBlank(row.importBatch, importBatch),
    canonicalKey: "",

    verificationStatus,
    verificationDate: firstNonBlank(
      row.verificationDate,
      row.verifiedAt,
      "",
    ),
    confidence: normalizeConfidence(
      row.confidence ?? row.recommendationConfidence,
    ),
    careerLane,

    recommendation: firstNonBlank(
      row.recommendation,
      row.action,
      "Review",
    ),
    synopsis,
    pros,
    cons,
    duties,
    requirements,
    gaps,
    notes: notesParts.join("\n"),

    resumeVersion: firstNonBlank(
      row.resumeVersion,
      row.recommendedResume,
      "Operations",
    ),
    coverLetter: firstNonBlank(
      row.coverLetter,
      row.coverLetterType,
      "General",
    ),
  };

  opportunity.canonicalKey = canonicalKeyFor(opportunity);

  return opportunity;
}

function normalizeOrganization(row: AnyRecord): ImportedOrganization {
  return {
    name: firstNonBlank(
      row.name,
      row.organization,
      row.company,
      row.employer,
    ),
    category: firstNonBlank(row.category, row.type, row.sector),
    mission: firstNonBlank(row.mission, row.missionSummary),
    watchPriority: clampScore(
      row.watchPriority ?? row.watch_priority,
      50,
    ),
    qualityScore: clampScore(
      row.qualityScore ?? row.quality_score,
      50,
    ),
    careerLanes: uniqueStrings(
      row.careerLanes,
      row.career_lanes,
      row.lanes,
    ),
    careerUrl: firstNonBlank(
      row.careerUrl,
      row.career_url,
      row.jobsUrl,
      row.url,
    ),
    lastSearched: firstNonBlank(
      row.lastSearched,
      row.last_searched,
      "",
    ),
    active: row.active !== false,
    notes: firstNonBlank(row.notes, ""),
  };
}

export function parseCareerImport(input: string): ImportSummary {
  const parsed = JSON.parse(input) as AnyRecord;

  const sourceName = inferSourceName(parsed);
  const reportDate = inferReportDate(parsed);
  const importBatch = inferImportBatch(
    parsed,
    sourceName,
    reportDate,
  );

  const rawOpportunityRows = flattenOpportunityRows(parsed);
  const rawOrganizationRows = flattenOrganizationRows(parsed);

  const rejectedRows: RejectedImportRow[] = [];

  const opportunities = rawOpportunityRows
    .map((row, index) => {
      try {
        const normalized = normalizeOpportunity(
          row,
          sourceName,
          importBatch,
          reportDate,
        );

        if (!normalized.organization) {
          rejectedRows.push({
            index,
            reason: "Missing organization",
            raw: row,
          });
          return null;
        }

        if (!normalized.position) {
          rejectedRows.push({
            index,
            reason: "Missing position",
            raw: row,
          });
          return null;
        }

        if (normalized.verificationStatus === "Closed") {
          rejectedRows.push({
            index,
            reason: "Listing marked closed",
            raw: row,
          });
          return null;
        }

        return normalized;
      } catch (error) {
        rejectedRows.push({
          index,
          reason:
            error instanceof Error
              ? error.message
              : "Unknown normalization error",
          raw: row,
        });
        return null;
      }
    })
    .filter(
      (row): row is ImportedOpportunity =>
        row !== null,
    );

  const organizations = rawOrganizationRows
    .map(normalizeOrganization)
    .filter((organization) => organization.name);

  return {
    sourceAI: sourceName,
    importBatch,
    reportDate,
    opportunities,
    organizations,
    rejectedRows,
  };
}

export function mergeImportedOpportunities(
  existing: ImportedOpportunity[],
  incoming: ImportedOpportunity[],
): ImportedOpportunity[] {
  const byKey = new Map<string, ImportedOpportunity>();

  for (const opportunity of existing) {
    byKey.set(
      opportunity.canonicalKey || canonicalKeyFor(opportunity),
      opportunity,
    );
  }

  for (const opportunity of incoming) {
    const key =
      opportunity.canonicalKey ||
      canonicalKeyFor(opportunity);

    const current = byKey.get(key);

    if (!current) {
      byKey.set(key, opportunity);
      continue;
    }

    byKey.set(key, {
      ...current,
      ...opportunity,

      firstSeen:
        current.firstSeen || opportunity.firstSeen,

      lastReviewed:
        opportunity.lastReviewed || current.lastReviewed,

      discoveredBy: uniqueStrings(
        current.discoveredBy,
        opportunity.discoveredBy,
      ),

      importBatch: uniqueStrings(
        current.importBatch,
        opportunity.importBatch,
      ).join(", "),

      notes: uniqueStrings(
        current.notes,
        opportunity.notes,
      ).join("\n"),

      passReasons: current.passReasons,
      feedbackNotes: current.feedbackNotes,
      reviewedAt: current.reviewedAt,
      decision: current.decision,
      status: current.status,
      rating: current.rating,

      canonicalKey: key,
    });
  }

  return Array.from(byKey.values());
}