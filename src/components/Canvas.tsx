import { useState, useRef, useCallback } from "react"
import type { Workflow, NodeType } from "../types/workflow"
import NodeCard from "./NodeCard"
import EdgesLayer from "./EdgesLayer"

interface Props {
  workflow: Workflow
  addNode: (parentId: string, type: NodeType, branchIndex?: 0 | 1) => void
  deleteNode: (nodeId: string, parentId: string) => void
  updateLabel: (nodeId: string, label: string) => void
}

export type NodeGeometry = {
  id: string
  x: number
  y: number
  width: number
  height: number
}

export default function Canvas({
  workflow,
  addNode,
  deleteNode,
  updateLabel
}: Props) {
  const [geometries, setGeometries] = useState<Map<string, NodeGeometry>>(new Map())
  const canvasRef = useRef<HTMLDivElement | null>(null)

  const reportGeometry = useCallback((nodeId: string, geometry: NodeGeometry | null) => {
    setGeometries(prev => {
      const next = new Map(prev)
      if (geometry) {
        next.set(nodeId, geometry)
      } else {
        next.delete(nodeId)
      }
      return next
    })
  }, [])

  return (
    <div ref={canvasRef} className="relative w-full h-full">
      <EdgesLayer workflow={workflow} geometries={geometries} />
      
      <div className="relative flex justify-center items-start min-w-max px-8">
        <NodeCard
          nodeId={workflow.rootId}
          parentId={null}
          workflow={workflow}
          addNode={addNode}
          deleteNode={deleteNode}
          updateLabel={updateLabel}
          reportGeometry={reportGeometry}
          canvasRef={canvasRef}
        />
      </div>
    </div>
  )
}
