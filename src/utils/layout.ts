import type { Workflow } from "../types/workflow"

const NODE_WIDTH = 320
const HORIZONTAL_GAP = 120

export function getSubtreeWidth(
  nodeId: string,
  workflow: Workflow
): number {
  const node = workflow.nodes[nodeId]

  if (!node) return NODE_WIDTH

  if (node.type !== "branch") {
    return node.children[0]
      ? getSubtreeWidth(node.children[0], workflow)
      : NODE_WIDTH
  }

  const left = node.children[0]
    ? getSubtreeWidth(node.children[0], workflow)
    : NODE_WIDTH

  const right = node.children[1]
    ? getSubtreeWidth(node.children[1], workflow)
    : NODE_WIDTH

  return left + right + HORIZONTAL_GAP
}
