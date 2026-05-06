import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { Endpoint, EndpointStatus } from "../types";

const statusColors: Record<EndpointStatus, number> = {
  ok: 0xb9d3ad,
  watch: 0xc7b89b,
  anomaly: 0xb7a6b7,
  failed: 0xd19aa1,
};

const ringByFamily: Record<string, { radius: number; height: number; speed: number }> = {
  AIS: { radius: 5.4, height: 0.15, speed: 0.18 },
  AIM: { radius: 4.4, height: -0.22, speed: -0.15 },
  Magi: { radius: 3.25, height: 0.32, speed: 0.2 },
  LE: { radius: 6.25, height: -0.35, speed: -0.11 },
  SJ: { radius: 5.0, height: 0.48, speed: 0.13 },
  Core: { radius: 2.35, height: 0.02, speed: -0.23 },
};

interface ConstellationSceneProps {
  endpoints: Endpoint[];
  selectedId?: string;
  onHover: (endpoint: Endpoint | null) => void;
  onSelect: (endpoint: Endpoint) => void;
}

interface NodeRecord {
  endpoint: Endpoint;
  mesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>;
  phase: number;
  radius: number;
  height: number;
  speed: number;
}

export function ConstellationScene({
  endpoints,
  selectedId,
  onHover,
  onSelect,
}: ConstellationSceneProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const selectedIdRef = useRef(selectedId);
  const onHoverRef = useRef(onHover);
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    onHoverRef.current = onHover;
    onSelectRef.current = onSelect;
  }, [onHover, onSelect]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const container = host;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0c10, 9, 22);

    const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 100);
    camera.position.set(0, 7.2, 12.4);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xb8ad9a, 1.2);
    scene.add(ambient);

    const key = new THREE.PointLight(0xb9d3ad, 58, 24);
    key.position.set(-3, 5, 5);
    scene.add(key);

    const mauve = new THREE.PointLight(0xb7a6b7, 35, 18);
    mauve.position.set(5, 2.5, -3);
    scene.add(mauve);

    const universe = new THREE.Group();
    universe.rotation.x = -0.34;
    scene.add(universe);

    const hubGeometry = new THREE.SphereGeometry(0.72, 48, 48);
    const hubMaterial = new THREE.MeshStandardMaterial({
      color: 0xeee7dc,
      emissive: 0x9ca795,
      emissiveIntensity: 1.25,
      metalness: 0.35,
      roughness: 0.28,
    });
    const hub = new THREE.Mesh(hubGeometry, hubMaterial);
    universe.add(hub);

    const hubShell = new THREE.Mesh(
      new THREE.SphereGeometry(1.08, 48, 48),
      new THREE.MeshBasicMaterial({
        color: 0x9ca795,
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending,
      }),
    );
    universe.add(hubShell);

    const radii = Array.from(new Set(Object.values(ringByFamily).map((value) => value.radius)));
    radii.forEach((radius, index) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(radius, 0.012, 8, 160),
        new THREE.MeshBasicMaterial({
          color: index % 2 === 0 ? 0xb8ad9a : 0x6f7f8d,
          transparent: true,
          opacity: 0.28,
        }),
      );
      ring.rotation.x = Math.PI / 2;
      universe.add(ring);
    });

    const nodeGeometry = new THREE.SphereGeometry(0.19, 24, 24);
    const glowGeometry = new THREE.SphereGeometry(0.34, 24, 24);
    const nodes: NodeRecord[] = endpoints.map((endpoint, index) => {
      const ring = ringByFamily[endpoint.family];
      const material = new THREE.MeshStandardMaterial({
        color: statusColors[endpoint.status],
        emissive: statusColors[endpoint.status],
        emissiveIntensity: endpoint.status === "failed" ? 1.2 : 0.72,
        metalness: 0.22,
        roughness: 0.38,
      });
      const mesh = new THREE.Mesh(nodeGeometry, material);
      mesh.userData.endpointId = endpoint.id;
      mesh.userData.endpoint = endpoint;

      const glow = new THREE.Mesh(
        glowGeometry,
        new THREE.MeshBasicMaterial({
          color: statusColors[endpoint.status],
          transparent: true,
          opacity: endpoint.status === "failed" ? 0.18 : 0.1,
          blending: THREE.AdditiveBlending,
        }),
      );
      mesh.add(glow);

      universe.add(mesh);
      return {
        endpoint,
        mesh,
        phase: (index / endpoints.length) * Math.PI * 2 + (index % 3) * 0.4,
        radius: ring.radius,
        height: ring.height,
        speed: ring.speed,
      };
    });

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xb8ad9a,
      transparent: true,
      opacity: 0.16,
    });
    const lines = nodes
      .filter((node, index) => index % 2 === 0 || node.endpoint.status !== "ok")
      .map(() => {
        const geometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(),
          new THREE.Vector3(),
        ]);
        const line = new THREE.Line(geometry, lineMaterial);
        universe.add(line);
        return line;
      });

    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(420 * 3);
    for (let i = 0; i < 420; i += 1) {
      starPositions[i * 3] = (Math.random() - 0.5) * 28;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 15;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 28;
    }
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({
        color: 0xded6c7,
        size: 0.018,
        transparent: true,
        opacity: 0.72,
      }),
    );
    scene.add(stars);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let hoveredId: string | null = null;
    let paused = false;
    let frame = 0;
    let orbitTime = 0;
    let universeRotation = 0;
    let bobTime = 0;
    const clock = new THREE.Clock();

    function resize() {
      const rect = container.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height, false);
      camera.aspect = rect.width / Math.max(rect.height, 1);
      camera.updateProjectionMatrix();
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    function setHovered(endpoint: Endpoint | null) {
      const nextId = endpoint?.id ?? null;
      if (nextId === hoveredId) return;
      hoveredId = nextId;
      paused = Boolean(endpoint);
      container.classList.toggle("is-hovering-node", Boolean(endpoint));
      onHoverRef.current(endpoint);
    }

    function handlePointerMove(event: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const intersections = raycaster.intersectObjects(nodes.map((node) => node.mesh), true);
      const hit = intersections.find((item) => item.object.userData.endpoint || item.object.parent?.userData.endpoint);
      const endpoint = (hit?.object.userData.endpoint ?? hit?.object.parent?.userData.endpoint ?? null) as Endpoint | null;
      setHovered(endpoint);
    }

    function handlePointerLeave() {
      setHovered(null);
    }

    function handleClick() {
      const endpoint = endpoints.find((item) => item.id === hoveredId);
      if (endpoint) onSelectRef.current(endpoint);
    }

    renderer.domElement.addEventListener("pointermove", handlePointerMove);
    renderer.domElement.addEventListener("pointerleave", handlePointerLeave);
    renderer.domElement.addEventListener("click", handleClick);

    function animate() {
      frame = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;
      if (!paused) {
        orbitTime += delta;
        universeRotation += delta * 0.045;
        bobTime += delta * 0.6;
      }
      universe.rotation.y = universeRotation;
      hub.rotation.y = elapsed * 0.22;
      stars.rotation.y = elapsed * 0.01;

      nodes.forEach((node, index) => {
        const angle = node.phase + orbitTime * node.speed;
        node.mesh.position.set(
          Math.cos(angle) * node.radius,
          node.height + Math.sin(bobTime + index) * 0.11,
          Math.sin(angle) * node.radius,
        );
        const isActive = node.endpoint.id === hoveredId || node.endpoint.id === selectedIdRef.current;
        const scalar = isActive ? 1.72 : node.endpoint.status === "failed" ? 1.24 : 1;
        node.mesh.scale.lerp(new THREE.Vector3(scalar, scalar, scalar), 0.12);
        node.mesh.material.emissiveIntensity = isActive ? 1.7 : node.endpoint.status === "failed" ? 1.2 : 0.72;
      });

      lines.forEach((line, index) => {
        const node = nodes[(index * 2) % nodes.length];
        const points = [new THREE.Vector3(0, 0, 0), node.mesh.position.clone()];
        line.geometry.setFromPoints(points);
      });

      renderer.render(scene, camera);
    }

    animate();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointermove", handlePointerMove);
      renderer.domElement.removeEventListener("pointerleave", handlePointerLeave);
      renderer.domElement.removeEventListener("click", handleClick);
      renderer.dispose();
      container.removeChild(renderer.domElement);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points || object instanceof THREE.Line) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, [endpoints]);

  return <div ref={hostRef} className="constellation-canvas" aria-label="3D endpoint constellation" />;
}
