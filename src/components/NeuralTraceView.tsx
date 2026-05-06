import type { Endpoint } from "../types";
import { statusLabel } from "../utils";
import { EndpointDetail } from "./EndpointDetail";

interface NeuralTraceViewProps {
  endpoints: Endpoint[];
  selected: Endpoint;
  onSelect: (endpoint: Endpoint) => void;
}

export function NeuralTraceView({ endpoints, selected, onSelect }: NeuralTraceViewProps) {
  const centerX = 50;
  const centerY = 50;

  return (
    <section className="trace-view">
      <div className="trace-map" aria-label="Neural trace map">
        <svg viewBox="0 0 100 100" role="img" aria-label="Endpoint neural trace graph">
          <defs>
            <radialGradient id="nodeGlow">
              <stop offset="0%" stopColor="#eee7dc" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#eee7dc" stopOpacity="0" />
            </radialGradient>
          </defs>
          {endpoints.map((endpoint, index) => {
            const angle = (index / endpoints.length) * Math.PI * 2;
            const radius = 26 + (index % 4) * 4.2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius * 0.68;
            const strong = endpoint.status !== "ok" || endpoint.id === selected.id;
            return (
              <line
                key={`${endpoint.id}-edge`}
                x1={centerX}
                y1={centerY}
                x2={x}
                y2={y}
                className={strong ? "trace-edge strong" : "trace-edge"}
              />
            );
          })}
          <circle cx={centerX} cy={centerY} r="6.8" className="trace-core" />
          <circle cx={centerX} cy={centerY} r="13" fill="url(#nodeGlow)" />
          {endpoints.map((endpoint, index) => {
            const angle = (index / endpoints.length) * Math.PI * 2;
            const radius = 26 + (index % 4) * 4.2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius * 0.68;
            return (
              <g
                key={endpoint.id}
                className={`trace-node status-${endpoint.status} ${selected.id === endpoint.id ? "selected" : ""}`}
                onClick={() => onSelect(endpoint)}
                tabIndex={0}
                role="button"
                aria-label={`Select ${endpoint.name}`}
              >
                <circle cx={x} cy={y} r={selected.id === endpoint.id ? 2.65 : 2.15} />
                <text x={x} y={y - 3.5}>
                  {endpoint.family}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="trace-overlay">
          <span className="eyebrow">Neural trace mode</span>
          <h1>Trace topology</h1>
          <p>Edges pulse from the intelligence core to each endpoint. Anomalies remain muted but visibly warmer than stable traffic.</p>
          <div className="trace-legend">
            <span><i className="legend-ok" /> {statusLabel.ok}</span>
            <span><i className="legend-watch" /> {statusLabel.watch}</span>
            <span><i className="legend-anomaly" /> {statusLabel.anomaly}</span>
            <span><i className="legend-failed" /> {statusLabel.failed}</span>
          </div>
        </div>
      </div>
      <EndpointDetail endpoint={selected} pinned />
    </section>
  );
}
