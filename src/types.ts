export type EndpointStatus = "ok" | "watch" | "anomaly" | "failed";

export type EndpointFamily = "Magi" | "LE" | "SJ" | "AIM" | "AIS" | "Core";

export interface Endpoint {
  id: string;
  name: string;
  path: string;
  family: EndpointFamily;
  version: string;
  status: EndpointStatus;
  tokens: {
    glp: number;
    vlp: number;
    gf: number;
    gfl: number;
  };
  traces: number;
  prefillPct: number;
  decodePct: number;
  lrPct: number;
  cell: string;
  platform: "GLP" | "VLP" | "GF" | "GFL" | "Mixed";
  lastRun: string;
  latency: number;
  notes: string;
}

export type ActiveTab = "constellation" | "list" | "trace";
