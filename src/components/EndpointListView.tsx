import { ChevronDown, ChevronRight, Filter, Search, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { families } from "../data/endpoints";
import type { Endpoint, EndpointFamily, EndpointStatus } from "../types";
import { formatCompact, healthScore, statusLabel, tokenSummary } from "../utils";
import { EndpointDetail } from "./EndpointDetail";

interface EndpointListViewProps {
  endpoints: Endpoint[];
  selected: Endpoint;
  onSelect: (endpoint: Endpoint) => void;
}

const allStatuses: Array<EndpointStatus | "all"> = ["all", "ok", "watch", "anomaly", "failed"];
const allFamilies: Array<EndpointFamily | "all"> = ["all", ...families];

export function EndpointListView({ endpoints, selected, onSelect }: EndpointListViewProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<EndpointStatus | "all">("all");
  const [family, setFamily] = useState<EndpointFamily | "all">("all");
  const [expandedId, setExpandedId] = useState(selected.id);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return endpoints.filter((endpoint) => {
      const matchesQuery =
        !normalized ||
        endpoint.name.toLowerCase().includes(normalized) ||
        endpoint.path.toLowerCase().includes(normalized) ||
        endpoint.cell.toLowerCase().includes(normalized);
      const matchesStatus = status === "all" || endpoint.status === status;
      const matchesFamily = family === "all" || endpoint.family === family;
      return matchesQuery && matchesStatus && matchesFamily;
    });
  }, [endpoints, family, query, status]);

  function selectEndpoint(endpoint: Endpoint) {
    setExpandedId((current) => (current === endpoint.id ? "" : endpoint.id));
    onSelect(endpoint);
  }

  return (
    <section className="list-view">
      <div className="list-main">
        <div className="list-controls">
          <label className="search-box">
            <Search size={17} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search endpoint, path, or cell"
            />
          </label>
          <label className="select-box">
            <Filter size={16} />
            <select value={status} onChange={(event) => setStatus(event.target.value as EndpointStatus | "all")}>
              {allStatuses.map((item) => (
                <option value={item} key={item}>
                  {item === "all" ? "All status" : statusLabel[item]}
                </option>
              ))}
            </select>
          </label>
          <label className="select-box">
            <Filter size={16} />
            <select value={family} onChange={(event) => setFamily(event.target.value as EndpointFamily | "all")}>
              {allFamilies.map((item) => (
                <option value={item} key={item}>
                  {item === "all" ? "All families" : item}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="endpoint-table" role="table" aria-label="Endpoint list">
          <div className="endpoint-table-head" role="row">
            <span>Endpoint</span>
            <span>Version</span>
            <span>Platform</span>
            <span>Health</span>
            <span>Traces</span>
            <span>Status</span>
          </div>
          {filtered.map((endpoint) => {
            const expanded = expandedId === endpoint.id;
            return (
              <article
                className={`endpoint-card ${expanded ? "expanded" : ""} status-${endpoint.status}`}
                key={endpoint.id}
              >
                <button className="endpoint-summary" onClick={() => selectEndpoint(endpoint)}>
                  <span className="expand-icon">{expanded ? <ChevronDown size={17} /> : <ChevronRight size={17} />}</span>
                  <span>
                    <strong>{endpoint.name}</strong>
                    <small>{endpoint.path}</small>
                  </span>
                  <span className="chip">{endpoint.version}</span>
                  <span className="chip muted">{endpoint.platform}</span>
                  <span className="health-mini">
                    <i style={{ width: `${healthScore(endpoint)}%` }} />
                    <b>{healthScore(endpoint)}%</b>
                  </span>
                  <span>{endpoint.traces}</span>
                  <span className={`status-badge status-${endpoint.status}`}>{statusLabel[endpoint.status]}</span>
                </button>
                {expanded && (
                  <div className="endpoint-expanded">
                    <div>
                      <span>Token mix</span>
                      <strong>{tokenSummary(endpoint)}</strong>
                    </div>
                    <div>
                      <span>Cell</span>
                      <strong>{endpoint.cell}</strong>
                    </div>
                    <div>
                      <span>Last run</span>
                      <strong>{endpoint.lastRun}</strong>
                    </div>
                    <button className="collect-button">
                      <Zap size={15} />
                      Collect
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
      <EndpointDetail endpoint={selected} pinned />
      <div className="list-count">{formatCompact(filtered.length)} visible endpoints</div>
    </section>
  );
}
