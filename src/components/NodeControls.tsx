import type { WorkflowNode } from "../types/workflow"


interface Props {
  node: WorkflowNode
  parentId: string | null
  addNode: any
  deleteNode: any
}

export default function NodeControls({ node, parentId, addNode, deleteNode }: Props) {
  return (
    <div className="flex gap-2 mt-3 flex-wrap">
      {node.type !== "end" && (
        <>
          <button onClick={() => addNode(node.id, "action")} className="text-sm text-blue-600">
            + Action
          </button>
          <button onClick={() => addNode(node.id, "branch")} className="text-sm text-blue-600">
            + Branch
          </button>
          <button onClick={() => addNode(node.id, "end")} className="text-sm text-blue-600">
            + End
          </button>
        </>
      )}

      {parentId && (
        <button
          onClick={() => deleteNode(node.id, parentId)}
          className="text-sm text-red-600"
        >
          Delete
        </button>
      )}
    </div>
  )
}
