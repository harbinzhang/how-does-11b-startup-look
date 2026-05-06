import { Lock, MousePointer2, Orbit, Sparkles } from "lucide-react";
import type { Endpoint } from "../types";
import { EndpointDetail } from "./EndpointDetail";
import { ConstellationScene } from "./ConstellationScene";

interface ConstellationViewProps {
  endpoints: Endpoint[];
  selected: Endpoint;
  hovered: Endpoint | null;
  onHover: (endpoint: Endpoint | null) => void;
  onSelect: (endpoint: Endpoint) => void;
}

export function ConstellationView({
  endpoints,
  selected,
  hovered,
  onHover,
  onSelect,
}: ConstellationViewProps) {
  const detailEndpoint = hovered ?? selected;

  return (
    <section className="constellation-view">
      <div className="scene-shell">
        <div className="scene-toolbar">
          <div>
            <span className="eyebrow">Default mode</span>
            <h1>Endpoint Constellation</h1>
          </div>
          <div className="scene-actions" aria-label="Constellation controls">
            <span><Orbit size={16} /> Slow orbit</span>
            <span><MousePointer2 size={16} /> Hover to pause</span>
            <span><Lock size={16} /> Click to pin</span>
          </div>
        </div>
        <ConstellationScene
          endpoints={endpoints}
          selectedId={selected.id}
          onHover={onHover}
          onSelect={onSelect}
        />
        <div className="scene-caption">
          <Sparkles size={16} />
          <span>26 live endpoints distributed across orbit layers by family, colored by collection health.</span>
        </div>
      </div>
      <EndpointDetail endpoint={detailEndpoint} pinned={!hovered} />
    </section>
  );
}
