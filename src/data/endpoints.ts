import type { Endpoint, EndpointFamily, EndpointStatus } from "../types";

const names = [
  ["aist-snowball-sc", "AIST Snowball SC", "/aistudio/gemini-v4p1m-rev24-snowball-sc", "AIS"],
  ["aims-prod-sc-100", "AIMS Prod SC 100", "/search/aim-s-prod-sc-100", "AIM"],
  ["ais-fierce-falcon", "AIS Fierce Falcon", "/aistudio/gemini-v4s-rev23-fiercefalcon-sc", "AIS"],
  ["aims-prod-tc-100", "AIM S Prod TC 100", "/search/aim-s-prod-tc-100", "AIM"],
  ["magi-search", "Magi Search", "/magi/search", "Magi"],
  ["le-cobalt", "LE Cobalt", "/aistudio/le-cobalt", "LE"],
  ["sj-other", "SJ Other", "/xprof/sj/other", "SJ"],
  ["core-router", "Core Router", "/pipeline/core-router", "Core"],
  ["magi-voyager", "Magi Voyager", "/magi/voyager", "Magi"],
  ["le-orchid", "LE Orchid", "/aistudio/le-orchid", "LE"],
  ["sj-meridian", "SJ Meridian", "/xprof/sj/meridian", "SJ"],
  ["ais-raven", "AIS Raven", "/aistudio/raven-sc", "AIS"],
  ["aims-aurora", "AIMS Aurora", "/search/aims-aurora", "AIM"],
  ["magi-pulse", "Magi Pulse", "/magi/pulse", "Magi"],
  ["le-summit", "LE Summit", "/aistudio/le-summit", "LE"],
  ["sj-horizon", "SJ Horizon", "/xprof/sj/horizon", "SJ"],
  ["core-ledger", "Core Ledger", "/pipeline/core-ledger", "Core"],
  ["ais-cascade", "AIS Cascade", "/aistudio/cascade-sc", "AIS"],
  ["aims-cinder", "AIMS Cinder", "/search/aims-cinder", "AIM"],
  ["magi-prism", "Magi Prism", "/magi/prism", "Magi"],
  ["le-atlas", "LE Atlas", "/aistudio/le-atlas", "LE"],
  ["sj-lumen", "SJ Lumen", "/xprof/sj/lumen", "SJ"],
  ["core-sentinel", "Core Sentinel", "/pipeline/core-sentinel", "Core"],
  ["ais-glacier", "AIS Glacier", "/aistudio/glacier-sc", "AIS"],
  ["aims-vector", "AIMS Vector", "/search/aims-vector", "AIM"],
  ["magi-drift", "Magi Drift", "/magi/drift", "Magi"],
] as const;

const statusByIndex: EndpointStatus[] = [
  "ok",
  "ok",
  "watch",
  "ok",
  "ok",
  "ok",
  "anomaly",
  "ok",
  "ok",
  "ok",
  "watch",
  "ok",
  "ok",
  "ok",
  "ok",
  "anomaly",
  "ok",
  "ok",
  "ok",
  "ok",
  "ok",
  "watch",
  "ok",
  "ok",
  "ok",
  "failed",
];

const cells = [
  "yucbflq",
  "yucbfrl",
  "qpsx72a",
  "cobalt19",
  "merid44",
  "atlas81",
  "lumen02",
  "drift90",
];

function makeEndpoint(
  row: (typeof names)[number],
  index: number,
): Endpoint {
  const [, name, path, family] = row;
  const status = statusByIndex[index];
  const platform = (["GLP", "VLP", "GF", "GFL", "Mixed"] as const)[index % 5];
  const base = 72000 - index * 1900;
  const penalty = status === "failed" ? 42 : status === "anomaly" ? 18 : status === "watch" ? 9 : 0;

  return {
    id: row[0],
    name,
    path,
    family: family as EndpointFamily,
    version: `v20260${3 + (index % 2)}${String(3100 + index * 37).slice(0, 4)}`,
    status,
    tokens: {
      glp: Math.max(6100, base),
      vlp: Math.max(0, index % 3 === 0 ? Math.round(base * 0.32) : Math.round(base * 0.08)),
      gf: Math.max(0, index % 4 === 0 ? Math.round(base * 0.16) : Math.round(base * 0.03)),
      gfl: Math.max(0, index % 5 === 0 ? Math.round(base * 0.05) : Math.round(base * 0.01)),
    },
    traces: 2 + (index % 5),
    prefillPct: Math.max(21, 98 - penalty - (index % 8)),
    decodePct: Math.max(12, 94 - penalty - (index % 11)),
    lrPct: Math.max(8, 96 - penalty - (index % 9)),
    cell: cells[index % cells.length],
    platform,
    lastRun: `${18 - (index % 4)}:${String(41 - (index % 6) * 4).padStart(2, "0")}`,
    latency: 90 + index * 7 + (status === "failed" ? 240 : status === "anomaly" ? 130 : status === "watch" ? 55 : 0),
    notes:
      status === "failed"
        ? "Trace collector missed the decode envelope during the latest run."
        : status === "anomaly"
          ? "Latency and LR variance are above the normal constellation band."
          : status === "watch"
            ? "Health is acceptable, but the orbit has visible drift versus baseline."
            : "Stable token flow with clean trace collection and healthy LR confidence.",
  };
}

export const endpoints: Endpoint[] = names.map(makeEndpoint);

export const families: EndpointFamily[] = ["AIS", "AIM", "Magi", "LE", "SJ", "Core"];
