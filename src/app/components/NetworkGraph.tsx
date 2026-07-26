"use client";

import { useRef, useMemo, useEffect, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const SCAN_SPEED = 0.3;
const SCAN_RANGE = 2.5;
const ROTATION_SPEED = 0.08;
const PARALLAX_INTENSITY = 0.06;

function ScannerShape() {
  const meshRef = useRef<THREE.Mesh>(null);
  const scanLineRef = useRef<THREE.Mesh>(null);
  const mousePosition = useRef({ x: 0, y: 0 });
  const { size } = useThree();

  const icosahedronGeometry = useMemo(() => new THREE.IcosahedronGeometry(1.8, 1), []);

  const wireframeMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#6366f1",
        wireframe: true,
        transparent: true,
        opacity: 0.7,
      }),
    []
  );

  const scanPlaneMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#818cf8",
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide,
      }),
    []
  );

  useEffect(() => {
    function handleMouseMove(event: MouseEvent) {
      mousePosition.current.x = (event.clientX / size.width - 0.5) * 2;
      mousePosition.current.y = -(event.clientY / size.height - 0.5) * 2;
    }
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [size]);

  useFrame(({ clock }) => {
    if (!meshRef.current || !scanLineRef.current) return;
    const time = clock.getElapsedTime();

    const baseRotY = time * ROTATION_SPEED;
    const targetRotY = baseRotY + mousePosition.current.x * PARALLAX_INTENSITY;
    const targetRotX = mousePosition.current.y * PARALLAX_INTENSITY * 0.5;

    meshRef.current.rotation.y += (targetRotY - meshRef.current.rotation.y) * 0.03;
    meshRef.current.rotation.x += (targetRotX - meshRef.current.rotation.x) * 0.03;

    const scanPosition = Math.sin(time * SCAN_SPEED) * SCAN_RANGE;
    scanLineRef.current.position.y = scanPosition;

    const scanProximity = 1 - Math.abs(scanPosition) / SCAN_RANGE;
    scanPlaneMaterial.opacity = 0.08 + scanProximity * 0.12;
  });

  return (
    <group>
      <mesh ref={meshRef} geometry={icosahedronGeometry} material={wireframeMaterial} />
      <mesh ref={scanLineRef} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5, 0.02]} />
        <meshBasicMaterial color="#a5b4fc" transparent opacity={0.6} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <ringGeometry args={[1.9, 2.4, 32]} />
        {scanPlaneMaterial && <primitive object={scanPlaneMaterial} attach="material" />}
      </mesh>
    </group>
  );
}

export function NetworkGraph() {
  const [isPageVisible, setIsPageVisible] = useState(true);

  const handleVisibilityChange = useCallback(() => {
    setIsPageVisible(document.visibilityState === "visible");
  }, []);

  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [handleVisibilityChange]);

  return (
    <div className="absolute inset-0" style={{ zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 1.5]}
        frameloop={isPageVisible ? "always" : "never"}
        gl={{ antialias: true, powerPreference: "default", alpha: true }}
        style={{ background: "transparent" }}
      >
        <ScannerShape />
      </Canvas>
    </div>
  );
}
