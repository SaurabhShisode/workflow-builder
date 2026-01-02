export type NodeType = "start" | "action" | "branch" | "end"

export interface WorkflowNode {
  id: string
  type: NodeType
  label: string
  children: (string | null)[]
}

export interface Workflow {
  rootId: string
  nodes: Record<string, WorkflowNode>
}
