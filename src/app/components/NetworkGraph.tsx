"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const NODE_COUNT = 28;
const CONNECTION_COUNT = 38;
const GRAPH_SPREAD = 6;

interface NodeData {
  position: THREE.Vector3;
  baseIntensity: number;
  pulseSpeed: number;
  pulseOffset: number;
}

interface ConnectionData {
  start: number;
  end: number;
}

function generateNodes(): NodeData[] {
  const nodes: NodeData[] = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    nodes.push({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * GRAPH_SPREAD * 2,
        (Math.random() - 0.5) * GRAPH_SPREAD,
        (Math.random() - 0.5) * GRAPH_SPREAD * 0.5
      ),
      baseIntensity: 0.4 + Math.random() * 0.6,
      pulseSpeed: 0.3 + Math.random() * 0.7,
      pulseOffset: Math.random() * Math.PI * 2,
    });
  }
  return nodes;
}

function generateConnections(nodeCount: number): ConnectionData[] {
  const connections: ConnectionData[] = [];
  const usedPairs = new Set<string>();

  while (connections.length < CONNECTION_COUNT) {
    const start = Math.floor(Math.random() * nodeCount);
    const end = Math.floor(Math.random() * nodeCount);
    const pairKey = `${Math.min(start, end)}-${Math.max(start, end)}`;

    if (start !== end && !usedPairs.has(pairKey)) {
      usedPairs.add(pairKey);
      connections.push({ start, end });
    }
  }
  return connections;
}

function NetworkNodes({ nodes }: { nodes: NodeData[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummyObject = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const time = clock.getElapsedTime();

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]!;
      const pulse = Math.sin(time * node.pulseSpeed + node.pulseOffset) * 0.3 + 0.7;
      const scale = 0.03 + pulse * 0.02 * node.baseIntensity;

      dummyObject.position.copy(node.position);
      dummyObject.scale.setScalar(scale);
      dummyObject.updateMatrix();
      meshRef.current.setMatrixAt(i, dummyObject.matrix);

      const color = new THREE.Color();
      color.setHSL(0.55, 0.7, 0.4 + pulse * 0.3 * node.baseIntensity);
      meshRef.current.setColorAt(i, color);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, nodes.length]}>
      <sphereGeometry args={[1, 12, 12]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}

function NetworkConnections({ nodes, connections }: { nodes: NodeData[]; connections: ConnectionData[] }) {
  const linesRef = useRef<THREE.Group>(null);

  const lineObjects = useMemo(() => {
    return connections.map((conn) => {
      const points = [nodes[conn.start]!.position, nodes[conn.end]!.position];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: "#6366f1", transparent: true, opacity: 0.3 });
      return new THREE.Line(geometry, material);
    });
  }, [nodes, connections]);

  useFrame(({ clock }) => {
    if (!linesRef.current) return;
    const time = clock.getElapsedTime();

    linesRef.current.children.forEach((child, index) => {
      const lineMesh = child as THREE.Line;
      const material = lineMesh.material as THREE.LineBasicMaterial;
      const pulse = Math.sin(time * 0.5 + index * 0.3) * 0.3 + 0.5;
      material.opacity = pulse * 0.4;
    });
  });

  return (
    <group ref={linesRef}>
      {lineObjects.map((lineObj, index) => (
        <primitive key={index} object={lineObj} />
      ))}
    </group>
  );
}

function NetworkScene() {
  const groupRef = useRef<THREE.Group>(null);

  const { nodes, connections } = useMemo(() => ({
    nodes: generateNodes(),
    connections: generateConnections(NODE_COUNT),
  }), []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.05) * 0.1;
    groupRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.03) * 0.05;
  });

  return (
    <group ref={groupRef}>
      <NetworkNodes nodes={nodes} />
      <NetworkConnections nodes={nodes} connections={connections} />
    </group>
  );
}

export function NetworkGraph() {
  const [isPageVisible, setIsPageVisible] = useState(true);

  useEffect(() => {
    function handleVisibilityChange() {
      setIsPageVisible(document.visibilityState === "visible");
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        dpr={[1, 1.5]}
        frameloop={isPageVisible ? "always" : "never"}
        gl={{ antialias: false, powerPreference: "low-power" }}
      >
        <NetworkScene />
      </Canvas>
    </div>
  );
}
