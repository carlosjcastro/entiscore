"use client";

import { useRef, useMemo, useEffect, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface NodeDefinition {
  position: [number, number, number];
  size: number;
  pulseSpeed: number;
  pulsePhase: number;
}

interface EdgeDefinition {
  from: number;
  to: number;
}

const PRIMARY_NODES: NodeDefinition[] = [
  { position: [-2.5, 1.2, 0], size: 0.12, pulseSpeed: 0.4, pulsePhase: 0 },
  { position: [2.3, 1.0, -0.3], size: 0.11, pulseSpeed: 0.35, pulsePhase: 1.2 },
  { position: [-1.8, -1.4, 0.2], size: 0.1, pulseSpeed: 0.45, pulsePhase: 2.4 },
  { position: [2.0, -1.3, -0.1], size: 0.11, pulseSpeed: 0.38, pulsePhase: 3.6 },
];

const SECONDARY_NODES: NodeDefinition[] = [
  { position: [-3.8, 2.0, -0.4], size: 0.05, pulseSpeed: 0.6, pulsePhase: 0.5 },
  { position: [-1.5, 2.5, 0.3], size: 0.04, pulseSpeed: 0.55, pulsePhase: 1.0 },
  { position: [-4.0, 0.5, 0.2], size: 0.045, pulseSpeed: 0.5, pulsePhase: 1.5 },
  { position: [3.5, 2.2, -0.2], size: 0.04, pulseSpeed: 0.65, pulsePhase: 2.0 },
  { position: [1.0, 2.0, 0.1], size: 0.05, pulseSpeed: 0.5, pulsePhase: 2.5 },
  { position: [3.8, 0.3, 0.3], size: 0.04, pulseSpeed: 0.6, pulsePhase: 3.0 },
  { position: [-3.2, -2.2, -0.3], size: 0.045, pulseSpeed: 0.55, pulsePhase: 3.5 },
  { position: [-0.5, -2.5, 0.2], size: 0.04, pulseSpeed: 0.5, pulsePhase: 4.0 },
  { position: [3.2, -2.4, -0.1], size: 0.05, pulseSpeed: 0.6, pulsePhase: 4.5 },
  { position: [0.8, -2.0, 0.3], size: 0.04, pulseSpeed: 0.55, pulsePhase: 5.0 },
  { position: [0.0, 0.3, 0.4], size: 0.06, pulseSpeed: 0.45, pulsePhase: 5.5 },
  { position: [-0.8, 0.8, -0.2], size: 0.04, pulseSpeed: 0.5, pulsePhase: 0.3 },
];

const ALL_NODES: NodeDefinition[] = [...PRIMARY_NODES, ...SECONDARY_NODES];

const EDGES: EdgeDefinition[] = [
  { from: 0, to: 4 }, { from: 0, to: 5 }, { from: 0, to: 6 },
  { from: 1, to: 7 }, { from: 1, to: 8 }, { from: 1, to: 9 },
  { from: 2, to: 10 }, { from: 2, to: 11 }, { from: 2, to: 14 },
  { from: 3, to: 12 }, { from: 3, to: 13 },
  { from: 0, to: 14 }, { from: 1, to: 14 },
  { from: 2, to: 15 }, { from: 3, to: 15 },
  { from: 0, to: 1 }, { from: 2, to: 3 },
  { from: 14, to: 15 },
  { from: 0, to: 2 }, { from: 1, to: 3 },
];

const INDIGO_COLOR = new THREE.Color("#6366f1");
const INDIGO_DIM = new THREE.Color("#4338ca");

function GraphNodes() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const time = clock.getElapsedTime();

    for (let i = 0; i < ALL_NODES.length; i++) {
      const node = ALL_NODES[i]!;
      const pulse = Math.sin(time * node.pulseSpeed + node.pulsePhase) * 0.15 + 1.0;
      const currentSize = node.size * pulse;

      tempObject.position.set(...node.position);
      tempObject.scale.setScalar(currentSize);
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);

      const brightness = 0.5 + Math.sin(time * node.pulseSpeed + node.pulsePhase) * 0.2;
      tempColor.copy(INDIGO_COLOR).multiplyScalar(brightness);
      meshRef.current.setColorAt(i, tempColor);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, ALL_NODES.length]}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}

function GraphEdges() {
  const groupRef = useRef<THREE.Group>(null);

  const lineObjects = useMemo(() => {
    return EDGES.map((edge) => {
      const fromNode = ALL_NODES[edge.from]!;
      const toNode = ALL_NODES[edge.to]!;
      const points = [
        new THREE.Vector3(...fromNode.position),
        new THREE.Vector3(...toNode.position),
      ];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: INDIGO_DIM,
        transparent: true,
        opacity: 0.25,
      });
      return new THREE.Line(geometry, material);
    });
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const time = clock.getElapsedTime();

    groupRef.current.children.forEach((child, index) => {
      const material = (child as THREE.Line).material as THREE.LineBasicMaterial;
      const pulse = Math.sin(time * 0.3 + index * 0.5) * 0.1 + 0.2;
      material.opacity = pulse;
    });
  });

  return (
    <group ref={groupRef}>
      {lineObjects.map((obj, i) => (
        <primitive key={i} object={obj} />
      ))}
    </group>
  );
}

function ParallaxContainer({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);
  const mousePosition = useRef({ x: 0, y: 0 });
  const { size } = useThree();

  useEffect(() => {
    function handleMouseMove(event: MouseEvent) {
      mousePosition.current.x = (event.clientX / size.width - 0.5) * 2;
      mousePosition.current.y = -(event.clientY / size.height - 0.5) * 2;
    }
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [size]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const slowRotation = clock.getElapsedTime() * 0.02;
    const targetRotY = slowRotation + mousePosition.current.x * 0.08;
    const targetRotX = mousePosition.current.y * 0.05;

    groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.02;
    groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.02;
  });

  return <group ref={groupRef}>{children}</group>;
}

function GraphScene() {
  return (
    <ParallaxContainer>
      <GraphNodes />
      <GraphEdges />
    </ParallaxContainer>
  );
}

export function NetworkGraph() {
  const [isPageVisible, setIsPageVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleVisibilityChange = useCallback(() => {
    setIsPageVisible(document.visibilityState === "visible");
  }, []);

  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [handleVisibilityChange]);

  return (
    <div ref={containerRef} className="absolute inset-0" style={{ zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 7], fov: 45 }}
        dpr={[1, 1.5]}
        frameloop={isPageVisible ? "always" : "never"}
        gl={{ antialias: true, powerPreference: "default", alpha: true }}
        style={{ background: "transparent" }}
      >
        <GraphScene />
      </Canvas>
    </div>
  );
}
