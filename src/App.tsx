import { Activity, BrainCircuit, CircleDotDashed, DatabaseZap, ListFilter, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { ConstellationView } from "./components/ConstellationView";
import { EndpointListView } from "./components/EndpointListView";
import { NeuralTraceView } from "./components/NeuralTraceView";
import { endpoints } from "./data/endpoints";
import type { ActiveTab, Endpoint } from "./types";
import { aggregateTokens, formatCompact } from "./utils";

const tabs: Array<{ id: ActiveTab; label: string; icon: typeof CircleDotDashed }> = [
  { id: "constellation", label: "Constellation", icon: CircleDotDashed },
  { id: "list", label: "Endpoint List", icon: ListFilter },
  { id: "trace", label: "Neural Trace", icon: BrainCircuit },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("constellation");
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint>(endpoints[0]);
  const [hoveredEndpoint, setHoveredEndpoint] = useState<Endpoint | null>(null);

  const summary = useMemo(() => {
    const tokens = aggregateTokens(endpoints);
    return {
      total: endpoints.length,
      ok: endpoints.filter((endpoint) => endpoint.status === "ok").length,
      failed: endpoints.filter((endpoint) => endpoint.status === "failed").length,
      traces: endpoints.reduce((sum, endpoint) => sum + endpoint.traces, 0),
      tokens,
    };
  }, []);

  return (
    <main className="app-shell">
      <section className="hero-band">
        <header className="top-nav">
          <div className="brand-block">
            <div className="brand-mark" aria-hidden="true">
              <DatabaseZap size={22} />
            </div>
            <div>
              <span className="eyebrow">Investor demo</span>
              <h1>Endpoint Constellation</h1>
            </div>
          </div>
          <div className="live-strip">
            <span className="live-dot" />
            <span>live - 31s</span>
            <span>Pipeline: 2026-05-06 01:41 UTC</span>
            <button className="icon-button" aria-label="Refresh demo data">
              <RefreshCw size={16} />
            </button>
          </div>
        </header>

        <div className="summary-grid" aria-label="Endpoint summary">
          <article>
            <span>Endpoints</span>
            <strong>{summary.total}</strong>
          </article>
          <article className="wide">
            <span>Total chips</span>
            <strong>
              {formatCompact(summary.tokens.glp)} GLP + {formatCompact(summary.tokens.vlp)} VLP +{" "}
              {formatCompact(summary.tokens.gf)} GF + {formatCompact(summary.tokens.gfl)} GFL
            </strong>
          </article>
          <article>
            <span>Traces</span>
            <strong>{summary.traces}</strong>
          </article>
          <article className="success">
            <span>Successful</span>
            <strong>{summary.ok}</strong>
          </article>
          <article className="danger">
            <span>Failed</span>
            <strong>{summary.failed}</strong>
          </article>
        </div>

        <nav className="tab-rail" aria-label="Endpoint views">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={activeTab === tab.id ? "active" : ""}
                onClick={() => {
                  setActiveTab(tab.id);
                  setHoveredEndpoint(null);
                }}
              >
                <Icon size={17} />
                {tab.label}
              </button>
            );
          })}
          <div className="tab-context">
            <Activity size={16} />
            <span>{selectedEndpoint.name}</span>
          </div>
        </nav>
      </section>

      {activeTab === "constellation" && (
        <ConstellationView
          endpoints={endpoints}
          selected={selectedEndpoint}
          hovered={hoveredEndpoint}
          onHover={setHoveredEndpoint}
          onSelect={(endpoint) => {
            setSelectedEndpoint(endpoint);
            setHoveredEndpoint(null);
          }}
        />
      )}
      {activeTab === "list" && (
        <EndpointListView endpoints={endpoints} selected={selectedEndpoint} onSelect={setSelectedEndpoint} />
      )}
      {activeTab === "trace" && (
        <NeuralTraceView endpoints={endpoints} selected={selectedEndpoint} onSelect={setSelectedEndpoint} />
      )}
    </main>
  );
}
