"use client";

import { useState, useMemo } from "react";
import { HiChevronDown, HiGlobeAlt } from "react-icons/hi2";
import type { AuditResponse } from "@/types";

interface EntityGraphProps {
  report: AuditResponse;
}

interface GraphNode {
  id: string;
  label: string;
  category: "center" | "schema" | "profile" | "authority";
}

interface GraphEdge {
  from: string;
  to: string;
}

const CATEGORY_COLORS: Record<GraphNode["category"], string> = {
  center: "#4f46e5",
  schema: "#4f46e5",
  profile: "#6366f1",
  authority: "#818cf8",
};

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function buildGraphFromReport(report: AuditResponse): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  const centerId = "site";
  nodes.push({ id: centerId, label: extractDomain(report.url), category: "center" });

  const structuredFindings = report.axes.structuredData.findings;
  for (const finding of structuredFindings) {
    if (finding.type === "positive" && finding.title.includes("Schema de tipo")) {
      const typeMatch = finding.title.match(/Schema de tipo (\w+)/);
      if (typeMatch?.[1]) {
        const nodeId = `schema-${typeMatch[1]}`;
        nodes.push({ id: nodeId, label: typeMatch[1], category: "schema" });
        edges.push({ from: centerId, to: nodeId });
      }
    }
  }

  const identityFindings = report.axes.identityConsistency.findings;
  for (const finding of identityFindings) {
    if (finding.type === "positive" && finding.title.includes("accesible")) {
      const domainMatch = finding.title.match(/Perfil en (.+?) accesible/);
      if (domainMatch?.[1]) {
        const nodeId = `profile-${domainMatch[1]}`;
        nodes.push({ id: nodeId, label: domainMatch[1], category: "profile" });
        edges.push({ from: centerId, to: nodeId });
      }
    }
  }

  const authorityFindings = report.axes.authoritySignals.findings;
  for (const finding of authorityFindings) {
    if (finding.type === "positive" && finding.title.includes("plataforma")) {
      const descMatch = finding.description.match(/enlaces a: (.+?)\./);
      if (descMatch?.[1]) {
        const platforms = descMatch[1].split(", ");
        for (const platform of platforms) {
          const existsAsProfile = nodes.some((n) => n.id === `profile-${platform}`);
          if (!existsAsProfile) {
            const nodeId = `authority-${platform}`;
            nodes.push({ id: nodeId, label: platform, category: "authority" });
            edges.push({ from: centerId, to: nodeId });
          }
        }
      }
    }
  }

  return { nodes, edges };
}

function calculateNodePositions(nodes: GraphNode[]): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const centerX = 250;
  const centerY = 180;
  const radius = 120;

  const centerNode = nodes.find((n) => n.category === "center");
  if (centerNode) {
    positions.set(centerNode.id, { x: centerX, y: centerY });
  }

  const peripheralNodes = nodes.filter((n) => n.category !== "center");
  const angleStep = (2 * Math.PI) / Math.max(peripheralNodes.length, 1);

  peripheralNodes.forEach((node, index) => {
    const angle = angleStep * index - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    positions.set(node.id, { x, y });
  });

  return positions;
}

export function EntityGraph({ report }: EntityGraphProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { nodes, edges } = useMemo(() => buildGraphFromReport(report), [report]);
  const positions = useMemo(() => calculateNodePositions(nodes), [nodes]);

  const hasConnections = nodes.length > 1;

  if (!hasConnections) return null;

  return (
    <div className="border-t border-zinc-200 dark:border-zinc-700 pt-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 w-full text-left"
      >
        <HiGlobeAlt className="h-5 w-5 text-indigo-500" />
        <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">
          Grafo de entidad digital
        </h3>
        <HiChevronDown
          className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ml-auto ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>

      <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] mt-4" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="flex justify-center">
            <svg viewBox="0 0 500 360" className="w-full max-w-lg h-auto">
              {edges.map((edge) => {
                const fromPos = positions.get(edge.from);
                const toPos = positions.get(edge.to);
                if (!fromPos || !toPos) return null;
                return (
                  <line
                    key={`${edge.from}-${edge.to}`}
                    x1={fromPos.x}
                    y1={fromPos.y}
                    x2={toPos.x}
                    y2={toPos.y}
                    stroke="#a5b4fc"
                    strokeWidth="1"
                    opacity="0.5"
                  />
                );
              })}

              {nodes.map((node) => {
                const pos = positions.get(node.id);
                if (!pos) return null;
                const isCenter = node.category === "center";
                const nodeRadius = isCenter ? 28 : 20;
                const color = CATEGORY_COLORS[node.category];

                return (
                  <g key={node.id}>
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={nodeRadius}
                      fill="none"
                      stroke={color}
                      strokeWidth={isCenter ? 2 : 1.5}
                      opacity={isCenter ? 1 : 0.8}
                    />
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={nodeRadius - 3}
                      fill={color}
                      opacity={0.1}
                    />
                    <text
                      x={pos.x}
                      y={pos.y + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-zinc-700 dark:fill-zinc-300"
                      fontSize={isCenter ? 10 : 8}
                      fontWeight={isCenter ? 600 : 500}
                    >
                      {node.label.length > 14 ? `${node.label.slice(0, 12)}...` : node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="flex items-center justify-center gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full border border-indigo-600 bg-indigo-600/10" />
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Schema</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full border border-indigo-500 bg-indigo-500/10" />
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Perfiles</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full border border-indigo-400 bg-indigo-400/10" />
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Autoridad</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
