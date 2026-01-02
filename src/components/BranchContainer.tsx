import { useState, useRef } from "react"
import type { Workflow, NodeType } from "../types/workflow"
import NodeCard from "./NodeCard"
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

export default function BranchContainer({
  nodeId,
  parentId,
  workflow,
  addNode,
  deleteNode,
  updateLabel,
  reportGeometry,
  canvasRef
}: Props) {
  const leftButtonRef = useRef<HTMLButtonElement>(null)
  const rightButtonRef = useRef<HTMLButtonElement>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [menuBranchIndex, setMenuBranchIndex] = useState<0 | 1 | undefined>(undefined)

  const node = workflow.nodes[nodeId]
  const leftChild = node.children[0]
  const rightChild = node.children[1]

  return (
    <div className="relative mt-24 flex justify-between items-start gap-8">

      <div className="flex flex-col items-center flex-1">
        <div className="mb-4 px-3 py-1 rounded-full bg-slate-700/50 border border-slate-500">
          <span className="text-xs font-semibold text-slate-200 font-poppins tracking-wide">
            True
          </span>
        </div>

        {leftChild ? (
          <NodeCard
            nodeId={leftChild}
            parentId={nodeId}
            workflow={workflow}
            addNode={addNode}
            deleteNode={deleteNode}
            updateLabel={updateLabel}
            reportGeometry={reportGeometry}
            canvasRef={canvasRef}
          />
        ) : (
          <div className="relative">
            <button
              ref={leftButtonRef}
              onClick={(e) => {
                e.stopPropagation()
                setMenuBranchIndex(0)
                setShowMenu(true)
              }}
              className="px-5 py-3 rounded-lg border-2 border-dashed border-slate-500 text-slate-300 hover:border-slate-400 hover:text-slate-200 hover:bg-slate-700/30 transition-all font-medium font-inter"
            >
              + Add step to True
            </button>
            {showMenu && menuBranchIndex === 0 && (
              <NodeMenu
                nodeId={nodeId}
                parentId={parentId}
                onAddNode={(type) => {
                  addNode(nodeId, type, 0)
                  setShowMenu(false)
                }}
                onDelete={() => {
                  if (parentId) {
                    deleteNode(nodeId, parentId)
                  }
                  setShowMenu(false)
                }}
                onClose={() => setShowMenu(false)}
                buttonRef={leftButtonRef}
              />
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center flex-1">
        <div className="mb-4 px-3 py-1 rounded-full bg-slate-700/50 border border-slate-500">
          <span className="text-xs font-semibold text-slate-200 font-poppins tracking-wide">
            False
          </span>
        </div>

        {rightChild ? (
          <NodeCard
            nodeId={rightChild}
            parentId={nodeId}
            workflow={workflow}
            addNode={addNode}
            deleteNode={deleteNode}
            updateLabel={updateLabel}
            reportGeometry={reportGeometry}
            canvasRef={canvasRef}
          />
        ) : (
          <div className="relative">
            <button
              ref={rightButtonRef}
              onClick={(e) => {
                e.stopPropagation()
                setMenuBranchIndex(1)
                setShowMenu(true)
              }}
              className="px-5 py-3 rounded-lg border-2 border-dashed border-slate-500 text-slate-300 hover:border-slate-400 hover:text-slate-200 hover:bg-slate-700/30 transition-all font-medium font-inter"
            >
              + Add step to False
            </button>
            {showMenu && menuBranchIndex === 1 && (
              <NodeMenu
                nodeId={nodeId}
                parentId={parentId}
                onAddNode={(type) => {
                  addNode(nodeId, type, 1)
                  setShowMenu(false)
                }}
                onDelete={() => {
                  if (parentId) {
                    deleteNode(nodeId, parentId)
                  }
                  setShowMenu(false)
                }}
                onClose={() => setShowMenu(false)}
                buttonRef={rightButtonRef}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
