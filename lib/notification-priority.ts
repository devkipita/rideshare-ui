export type NoticeSeverity = "info" | "warning" | "critical";

const CRITICAL_PATTERNS = [
  /\baccident\b/i,
  /\bcrash\b/i,
  /\bfatal\b/i,
  /\binjur(?:y|ed|ies)\b/i,
  /\bfire\b/i,
  /\bflood(?:ed|ing)?\b/i,
  /\bclosed\b/i,
  /\bclosure\b/i,
  /\bblocked\b/i,
  /\boverturned\b/i,
  /\bunsafe\b/i,
  /\battack\b/i,
  /\brobbery\b/i,
  /\briot(?:s)?\b/i,
  /\bprotest(?:s)?\b/i,
  /\bemergency\b/i,
];

const WARNING_PATTERNS = [
  /\btraffic\b/i,
  /\bjam\b/i,
  /\bdelay(?:ed|s)?\b/i,
  /\bslow\b/i,
  /\broad\s*works?\b/i,
  /\bconstruction\b/i,
  /\bdiversion\b/i,
  /\bdetour\b/i,
  /\bbreakdown\b/i,
  /\bpothole(?:s)?\b/i,
  /\brain\b/i,
  /\bfog\b/i,
  /\bpolice\b/i,
];

export function classifyRoadUpdate(message: string): NoticeSeverity {
  const text = message.trim();
  if (!text) return "info";
  if (CRITICAL_PATTERNS.some((pattern) => pattern.test(text))) {
    return "critical";
  }
  if (WARNING_PATTERNS.some((pattern) => pattern.test(text))) {
    return "warning";
  }
  return "info";
}

export function roadUpdateTitle(severity: NoticeSeverity) {
  if (severity === "critical") return "Critical road alert";
  if (severity === "warning") return "Road warning";
  return "Road update";
}
