import { Activity, Clock, Fingerprint, RadioTower } from "lucide-react";
import type { Endpoint } from "../types";
import { formatCompact, healthScore, statusLabel, tokenSummary } from "../utils";

interface EndpointDetailProps {
  endpoint: Endpoint;
  pinned?: boolean;
}

function HealthBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="health-row">
      <span>{label}</span>
      <div className="health-track" aria-label={`${label} ${value}%`}>
        <i style={{ width: `${value}%` }} />
      </div>
      <strong>{value}%</strong>
    </div>
  );
}

export function EndpointDetail({ endpoint, pinned = false }: EndpointDetailProps) {
  return (
    <aside className={`detail-panel status-${endpoint.status}`} aria-label="Endpoint details">
      <div className="detail-kicker">
        <span>{pinned ? "Pinned endpoint" : "Live endpoint lens"}</span>
        <span className="status-dot" />
      </div>
      <div className="detail-title-row">
        <div>
          <h2>{endpoint.name}</h2>
          <p>{endpoint.path}</p>
        </div>
        <span className={`status-badge status-${endpoint.status}`}>{statusLabel[endpoint.status]}</span>
      </div>

      <div className="detail-grid">
        <div>
          <Fingerprint size={16} />
          <span>Version</span>
          <strong>{endpoint.version}</strong>
        </div>
        <div>
          <RadioTower size={16} />
          <span>Traces</span>
          <strong>{endpoint.traces}</strong>
        </div>
        <div>
          <Clock size={16} />
          <span>Latency</span>
          <strong>{endpoint.latency}ms</strong>
        </div>
        <div>
          <Activity size={16} />
          <span>Health</span>
          <strong>{healthScore(endpoint)}%</strong>
        </div>
      </div>

      <div className="detail-tokens">
        <span>Token mix</span>
        <strong>{tokenSummary(endpoint)}</strong>
        <small>{formatCompact(endpoint.tokens.glp + endpoint.tokens.vlp + endpoint.tokens.gf + endpoint.tokens.gfl)} total chips observed</small>
      </div>

      <div className="health-bars">
        <HealthBar label="Prefill" value={endpoint.prefillPct} />
        <HealthBar label="Decode" value={endpoint.decodePct} />
        <HealthBar label="LR" value={endpoint.lrPct} />
      </div>

      <p className="detail-notes">{endpoint.notes}</p>
    </aside>
  );
}
