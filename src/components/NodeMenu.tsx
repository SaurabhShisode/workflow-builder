import { useState, useRef, useEffect } from "react"
import type { NodeType } from "../types/workflow"

interface Props {
  parentId: string | null
  onAddNode: (type: NodeType) => void
  onDelete: () => void
  onClose: () => void
  buttonRef: React.RefObject<HTMLElement | null>
}

export default function NodeMenu({
  parentId,
  onAddNode,
  onDelete,
  onClose,
  buttonRef
}: Props) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose()
      }
    }

    const updatePosition = () => {
      if (buttonRef.current && menuRef.current) {
        const buttonRect = buttonRef.current.getBoundingClientRect()
        const viewportWidth = window.innerWidth
        const MENU_WIDTH = 160
        const PADDING = 10
        const GAP = 10

        const offsetParent = buttonRef.current.offsetParent as HTMLElement
        if (!offsetParent) return

        const parentRect = offsetParent.getBoundingClientRect()
        
        let x = buttonRect.right - parentRect.left + GAP
        let y = buttonRect.top - parentRect.top

        const absoluteX = buttonRect.right + GAP
        if (absoluteX + MENU_WIDTH > viewportWidth - PADDING) {
          x = buttonRect.left - parentRect.left - MENU_WIDTH - GAP
        }

        if (absoluteX < PADDING) {
          x = PADDING - (parentRect.left)
        }

        setPosition({ x, y })
      }
    }

    const timeoutId = setTimeout(updatePosition, 0)
    
    window.addEventListener("resize", updatePosition)

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)
    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener("resize", updatePosition)
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [onClose, buttonRef])

  return (
    <div
      ref={menuRef}
      className="absolute z-50 bg-white rounded-lg shadow-xl border border-slate-200 py-2 min-w-[160px] max-w-[160px]"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
      <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 border-b border-slate-100 font-inter uppercase tracking-wide">
        Add Node
      </div>
      <button
        onClick={() => {
          onAddNode("action")
          onClose()
        }}
        className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 text-blue-600 flex items-center gap-2 font-inter"
      >
        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
        Action
      </button>
      <button
        onClick={() => {
          onAddNode("branch")
          onClose()
        }}
        className="w-full text-left px-4 py-2 text-sm hover:bg-purple-50 text-purple-600 flex items-center gap-2 font-inter"
      >
        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
        Condition
      </button>
      <button
        onClick={() => {
          onAddNode("end")
          onClose()
        }}
        className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 text-slate-600 flex items-center gap-2 font-inter"
      >
        <span className="w-2 h-2 rounded-full bg-slate-400"></span>
        End
      </button>
      {parentId && (
        <>
          <div className="border-t border-slate-100 my-1"></div>
          <button
            onClick={() => {
              onDelete()
              onClose()
            }}
            className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2 font-inter"
          >
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            Delete
          </button>
        </>
      )}
    </div>
  )
}

