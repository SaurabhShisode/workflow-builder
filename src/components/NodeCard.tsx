import { useState, useRef, useEffect } from "react"
import type { Workflow, NodeType } from "../types/workflow"
import BranchContainer from "./BranchContainer"
import NodeMenu from "./NodeMenu"

interface Props {
  nodeId: string
  parentId: string | null
  workflow: Workflow
  addNode: (parentId: string, type: NodeType, branchIndex?: 0 | 1) => void
  deleteNode: (nodeId: string, parentId: string) => void
  updateLabel: (nodeId: string, label: string) => void
  reportGeometry: (nodeId: string, geometry: { id: string; x: number; y: number; width: number; height: number } | null) => void
  canvasRef: React.RefObject<HTMLDivElement>
}

const NODE_TYPE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  start: { bg: "bg-green-50", border: "border-green-300", text: "text-green-700" },
  action: { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-700" },
  branch: { bg: "bg-purple-50", border: "border-purple-300", text: "text-purple-700" },
  end: { bg: "bg-slate-100", border: "border-slate-300", text: "text-slate-700" }
}

export default function NodeCard({
  nodeId,
  parentId,
  workflow,
  addNode,
  deleteNode,
  updateLabel,
  reportGeometry,
  canvasRef
}: Props) {
  const node = workflow.nodes[nodeId]
  const [showMenu, setShowMenu] = useState(false)
  const [menuBranchIndex, setMenuBranchIndex] = useState<0 | 1 | undefined>(undefined)
  const [isEditing, setIsEditing] = useState(false)
  const nodeRef = useRef<HTMLDivElement>(null)
  const connectionPointRef = useRef<HTMLDivElement>(null)
  const addNextStepButtonRef = useRef<HTMLButtonElement>(null)
  const nodeCardRef = useRef<HTMLDivElement>(null)

  const colors = NODE_TYPE_COLORS[node.type] || NODE_TYPE_COLORS.action

  useEffect(() => {
    const updateGeometry = () => {
      if (nodeCardRef.current && canvasRef.current) {
        const nodeRect = nodeCardRef.current.getBoundingClientRect()
        const canvasRect = canvasRef.current.getBoundingClientRect()
        
        const x = nodeRect.left - canvasRect.left
        const y = nodeRect.top - canvasRect.top
        
        reportGeometry(nodeId, {
          id: nodeId,
          x,
          y,
          width: nodeRect.width,
          height: nodeRect.height
        })
      }
    }

    updateGeometry()

    if (nodeCardRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(updateGeometry)
      })
      resizeObserver.observe(nodeCardRef.current)

      window.addEventListener('resize', updateGeometry)
      window.addEventListener('scroll', updateGeometry, true)

      return () => {
        resizeObserver.disconnect()
        window.removeEventListener('resize', updateGeometry)
        window.removeEventListener('scroll', updateGeometry, true)
        reportGeometry(nodeId, null)
      }
    }

    return () => {
      reportGeometry(nodeId, null)
    }
  }, [nodeId, reportGeometry, workflow.nodes, canvasRef])

  function handleConnectionPointClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (node.type === "end") return
    
    setMenuBranchIndex(undefined)
    setShowMenu(true)
  }

  function handleAddToBranch(branchIndex: 0 | 1, e: React.MouseEvent) {
    e.stopPropagation()
    setMenuBranchIndex(branchIndex)
    setShowMenu(true)
  }

  return (
    <div
      ref={nodeRef}
      data-node
      className="relative mt-20 flex flex-col items-center"
    >
      <div
        ref={nodeCardRef}
        className={`${colors.bg} ${colors.border} border-2 rounded-xl shadow-lg w-80 p-5 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] relative`}
      >
        <div className="absolute -top-3 left-4">
          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${colors.bg} ${colors.border} border uppercase font-poppins tracking-wider`}>
            {node.type}
          </span>
        </div>

        <div className="mt-2">
          {isEditing ? (
            <input
              value={node.label}
              onChange={e => updateLabel(node.id, e.target.value)}
              onBlur={() => setIsEditing(false)}
              onKeyDown={e => {
                if (e.key === "Enter") setIsEditing(false)
              }}
              autoFocus
              className="w-full text-center font-semibold text-lg outline-none bg-transparent border-b-2 border-slate-300 focus:border-slate-500 font-inter"
            />
          ) : (
            <div
              onClick={() => setIsEditing(true)}
              className="w-full text-center font-semibold text-lg cursor-text hover:text-slate-600 transition font-inter"
            >
              {node.label || "Click to edit"}
            </div>
          )}
        </div>

        {node.type !== "end" && (
          <div className="mt-4 flex justify-center relative">
            <div
              ref={connectionPointRef}
              onClick={handleConnectionPointClick}
              className="relative group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-all">
                <div className="w-3 h-3 rounded-full bg-slate-400 group-hover:bg-blue-500 transition"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition">
                  +
                </span>
              </div>
            </div>
            {showMenu && menuBranchIndex === undefined && node.children[0] && (
              <NodeMenu
                nodeId={node.id}
                parentId={parentId}
                onAddNode={(type) => {
                  addNode(node.id, type)
                  setShowMenu(false)
                }}
                onDelete={() => {
                  if (parentId) {
                    deleteNode(node.id, parentId)
                  }
                  setShowMenu(false)
                }}
                onClose={() => setShowMenu(false)}
                buttonRef={connectionPointRef}
              />
            )}
          </div>
        )}

        {parentId && (
          <button
            onClick={() => deleteNode(node.id, parentId)}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center text-xs font-bold transition font-oswald"
            title="Delete node"
          >
            ×
          </button>
        )}

      </div>

      {node.type === "branch" && (
        <BranchContainer
          nodeId={node.id}
          parentId={parentId}
          workflow={workflow}
          addNode={addNode}
          deleteNode={deleteNode}
          updateLabel={updateLabel}
          reportGeometry={reportGeometry}
          canvasRef={canvasRef}
        />
      )}

      {node.type !== "branch" && node.children[0] && (
        <NodeCard
          nodeId={node.children[0]}
          parentId={node.id}
          workflow={workflow}
          addNode={addNode}
          deleteNode={deleteNode}
          updateLabel={updateLabel}
          reportGeometry={reportGeometry}
          canvasRef={canvasRef}
        />
      )}

      {node.type !== "branch" && !node.children[0] && node.type !== "end" && (
        <div className="mt-4 relative">
          <button
            ref={addNextStepButtonRef}
            onClick={handleConnectionPointClick}
            className="px-5 py-3 rounded-lg border-2 border-dashed border-slate-500 text-slate-300 hover:border-slate-400 hover:text-slate-200 hover:bg-slate-700/30 transition-all font-medium font-inter"
          >
            + Add next step
          </button>
          {showMenu && menuBranchIndex === undefined && (
            <NodeMenu
              nodeId={node.id}
              parentId={parentId}
              onAddNode={(type) => {
                addNode(node.id, type)
                setShowMenu(false)
              }}
              onDelete={() => {
                if (parentId) {
                  deleteNode(node.id, parentId)
                }
                setShowMenu(false)
              }}
              onClose={() => setShowMenu(false)}
              buttonRef={addNextStepButtonRef}
            />
          )}
        </div>
      )}
    </div>
  )
}
