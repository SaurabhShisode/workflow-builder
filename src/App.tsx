import { useState, useCallback, useEffect } from "react"
import type { Workflow, WorkflowNode, NodeType } from "./types/workflow"
import { generateId, getDefaultLabel } from "./utils/helpers"
import Canvas from "./components/Canvas"
import ZoomableCanvas from "./components/ZoomableCanvas"

const initialWorkflow: Workflow = {
  rootId: "start",
  nodes: {
    start: {
      id: "start",
      type: "start",
      label: "Start",
      children: []
    }
  }
}

export default function App() {
  const [workflow, setWorkflow] = useState<Workflow>(initialWorkflow)
  const [history, setHistory] = useState<Workflow[]>([initialWorkflow])
  const [historyIndex, setHistoryIndex] = useState(0)

  const addToHistory = useCallback((newWorkflow: Workflow) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push(JSON.parse(JSON.stringify(newWorkflow)))
      return newHistory
    })
    setHistoryIndex(prev => prev + 1)
  }, [historyIndex])

  function addNode(
    parentId: string,
    type: NodeType,
    branchIndex?: 0 | 1
  ) {
    const id = generateId()

    setWorkflow(prev => {
      const parent = prev.nodes[parentId]
      const updatedParent = { ...parent }

      const newNode: WorkflowNode = {
        id,
        type,
        label: getDefaultLabel(type),
        children: type === "branch" ? [null, null] : []
      }

      if (parent.type === "branch" && branchIndex !== undefined) {
        updatedParent.children = [...parent.children]
        const existingChild = parent.children[branchIndex]
        
        if (existingChild) {
          newNode.children = [existingChild]
        }
        updatedParent.children[branchIndex] = id
      } else {
        const existingChild = parent.children[0]
        
        if (existingChild) {
          newNode.children = [existingChild]
        }
        updatedParent.children = [id]
      }

      const newWorkflow = {
        ...prev,
        nodes: {
          ...prev.nodes,
          [id]: newNode,
          [parentId]: updatedParent
        }
      }

      addToHistory(newWorkflow)
      return newWorkflow
    })
  }

  function deleteNode(nodeId: string, parentId: string) {
    setWorkflow(prev => {
      const parent = prev.nodes[parentId]
      const node = prev.nodes[nodeId]

      if (!node || !parent) return prev

      const newNodes = { ...prev.nodes }
      delete newNodes[nodeId]

      let updatedParent = { ...parent }

      if (parent.type === "branch") {
        const branchIndex = parent.children.findIndex(child => child === nodeId)
        if (branchIndex !== -1) {
          const deletedNodeChildren = node.children
          updatedParent.children = [...parent.children]
          
          if (deletedNodeChildren.length > 0 && deletedNodeChildren[0]) {
            updatedParent.children[branchIndex] = deletedNodeChildren[0]
          } else {
            updatedParent.children[branchIndex] = null
          }
        }
      } else {
        if (node.children.length > 0 && node.children[0]) {
          updatedParent.children = [node.children[0]]
        } else {
          updatedParent.children = []
        }
      }

      const newWorkflow = {
        ...prev,
        nodes: {
          ...newNodes,
          [parentId]: updatedParent
        }
      }

      addToHistory(newWorkflow)
      return newWorkflow
    })
  }

  function updateLabel(nodeId: string, label: string) {
    setWorkflow(prev => ({
      ...prev,
      nodes: {
        ...prev.nodes,
        [nodeId]: { ...prev.nodes[nodeId], label }
      }
    }))
  }

  function undo() {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setWorkflow(JSON.parse(JSON.stringify(history[newIndex])))
    }
  }

  function redo() {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setWorkflow(JSON.parse(JSON.stringify(history[newIndex])))
    }
  }

  function saveWorkflow() {
    console.log(JSON.stringify(workflow, null, 2))
    alert("Workflow saved! Check the console for the JSON output.")
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1
          setHistoryIndex(newIndex)
          setWorkflow(JSON.parse(JSON.stringify(history[newIndex])))
        }
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault()
        if (historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1
          setHistoryIndex(newIndex)
          setWorkflow(JSON.parse(JSON.stringify(history[newIndex])))
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [historyIndex, history])

  return (
    <div className="h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 flex flex-col overflow-hidden">
      <div className="flex-shrink-0 px-8 py-6 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-white font-grotesk tracking-tight">
              Workflow Builder
            </h1>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-700/50 rounded-lg p-1">
                <button
                  onClick={undo}
                  disabled={historyIndex === 0}
                  className="px-4 py-2 rounded-md bg-slate-600 text-white font-medium hover:bg-slate-500 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-inter"
                  title="Undo (Ctrl+Z)"
                >
                  ↶ Undo
                </button>
                <button
                  onClick={redo}
                  disabled={historyIndex === history.length - 1}
                  className="px-4 py-2 rounded-md bg-slate-600 text-white font-medium hover:bg-slate-500 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-inter"
                  title="Redo (Ctrl+Y)"
                >
                  ↷ Redo
                </button>
              </div>
              <button
                onClick={saveWorkflow}
                className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 font-inter"
              >
                Save Workflow
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ZoomableCanvas>
          <div className="min-w-full min-h-full py-8">
            <Canvas
              workflow={workflow}
              addNode={addNode}
              deleteNode={deleteNode}
              updateLabel={updateLabel}
            />
          </div>
        </ZoomableCanvas>
      </div>
    </div>
  )
}
