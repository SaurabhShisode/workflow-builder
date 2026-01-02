import { useMemo } from "react"
import type { Workflow } from "../types/workflow"
import type { NodeGeometry } from "./Canvas"

interface Props {
  workflow: Workflow
  geometries: Map<string, NodeGeometry>
}

function computeRightAnglePath(
  startX: number,
  startY: number,
  endX: number,
  endY: number
): string {
  const VERTICAL_GAP = 40

  const midY = startY + VERTICAL_GAP
  const midX = endX

  return `M ${startX} ${startY} L ${startX} ${midY} L ${midX} ${midY} L ${midX} ${endY}`
}

function computeBranchPath(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  isLeftBranch: boolean
): string {
  const VERTICAL_GAP = 40
  const horizontalDistance = Math.abs(endX - startX)
  const HORIZONTAL_SPREAD = Math.max(horizontalDistance * 0.3, 80)
  const HORIZONTAL_OFFSET = isLeftBranch ? -HORIZONTAL_SPREAD : HORIZONTAL_SPREAD

  const midY = startY + VERTICAL_GAP
  const branchX = startX + HORIZONTAL_OFFSET
  const finalX = endX
  const finalY = endY - 20

  return `M ${startX} ${startY} L ${startX} ${midY} L ${branchX} ${midY} L ${branchX} ${finalY} L ${finalX} ${finalY} L ${finalX} ${endY}`
}

interface Edge {
  from: NodeGeometry
  to: NodeGeometry
  branchIndex?: 0 | 1
}

export default function EdgesLayer({ workflow, geometries }: Props) {
  const edges = useMemo(() => {
    const newEdges: Edge[] = []

    Object.values(workflow.nodes).forEach(node => {
      const fromGeometry = geometries.get(node.id)
      if (!fromGeometry) return

      if (node.type === "branch") {
        node.children.forEach((childId, index) => {
          if (childId) {
            const toGeometry = geometries.get(childId)
            if (toGeometry) {
              newEdges.push({
                from: fromGeometry,
                to: toGeometry,
                branchIndex: index as 0 | 1
              })
            }
          }
        })
      } else {
        if (node.children[0]) {
          const toGeometry = geometries.get(node.children[0])
          if (toGeometry) {
            newEdges.push({
              from: fromGeometry,
              to: toGeometry
            })
          }
        }
      }
    })

    return newEdges
  }, [workflow, geometries])

  const viewBox = useMemo(() => {
    if (geometries.size === 0) {
      return "0 0 1000 1000"
    }

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    geometries.forEach(geom => {
      minX = Math.min(minX, geom.x)
      minY = Math.min(minY, geom.y)
      maxX = Math.max(maxX, geom.x + geom.width)
      maxY = Math.max(maxY, geom.y + geom.height)
    })

    const padding = 200
    return `${minX - padding} ${minY - padding} ${maxX - minX + padding * 2} ${maxY - minY + padding * 2}`
  }, [geometries])

  if (edges.length === 0) return null

  return (
    <svg
      className="absolute inset-0 pointer-events-none w-full h-full"
      viewBox={viewBox}
      preserveAspectRatio="none"
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="5"
          refY="5"
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
        </marker>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
      </defs>

      {edges.map((edge) => {
        const from = edge.from
        const to = edge.to

        const startX = from.x + from.width / 2
        const startY = from.y + from.height

        const endX = to.x + to.width / 2
        const endY = to.y

        const path = edge.branchIndex !== undefined
          ? computeBranchPath(startX, startY, endX, endY, edge.branchIndex === 0)
          : computeRightAnglePath(startX, startY, endX, endY)

        return (
          <path
            key={`${edge.from.id}-${edge.to.id}-${edge.branchIndex ?? 'single'}`}
            d={path}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="2.5"
            markerEnd="url(#arrowhead)"
            className="drop-shadow-sm"
          />
        )
      })}
    </svg>
  )
}

