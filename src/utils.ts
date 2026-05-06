import type { Endpoint, EndpointStatus } from "./types";

export const statusLabel: Record<EndpointStatus, string> = {
  ok: "OK",
  watch: "WATCH",
  anomaly: "ANOMALY",
  failed: "FAILED",
};

export const statusRank: Record<EndpointStatus, number> = {
  failed: 0,
  anomaly: 1,
  watch: 2,
  ok: 3,
};

export function formatCompact(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return String(value);
}

export function tokenSummary(endpoint: Endpoint): string {
  const parts = [
    [endpoint.tokens.glp, "GLP"],
    [endpoint.tokens.vlp, "VLP"],
    [endpoint.tokens.gf, "GF"],
    [endpoint.tokens.gfl, "GFL"],
  ]
    .filter(([value]) => Number(value) > 0)
    .map(([value, label]) => `${formatCompact(Number(value))} ${label}`);

  return parts.join(" + ");
}

export function healthScore(endpoint: Endpoint): number {
  return Math.round((endpoint.prefillPct + endpoint.decodePct + endpoint.lrPct) / 3);
}

export function aggregateTokens(endpoints: Endpoint[]) {
  return endpoints.reduce(
    (acc, endpoint) => {
      acc.glp += endpoint.tokens.glp;
      acc.vlp += endpoint.tokens.vlp;
      acc.gf += endpoint.tokens.gf;
      acc.gfl += endpoint.tokens.gfl;
      return acc;
    },
    { glp: 0, vlp: 0, gf: 0, gfl: 0 },
  );
}
