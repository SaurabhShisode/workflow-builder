import { useState, useRef, useCallback, useEffect } from "react"

interface Props {
  children: React.ReactNode
}

const MIN_ZOOM = 0.25
const MAX_ZOOM = 3
const ZOOM_SENSITIVITY = 0.001
const DEFAULT_ZOOM = 1

export default function ZoomableCanvas({ children }: Props) {
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const zoomDelta = -e.deltaY * ZOOM_SENSITIVITY
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom + zoomDelta))

    if (newZoom === zoom) return

    const canvasX = (mouseX - pan.x) / zoom
    const canvasY = (mouseY - pan.y) / zoom

    const newPanX = mouseX - canvasX * newZoom
    const newPanY = mouseY - canvasY * newZoom

    setZoom(newZoom)
    setPan({ x: newPanX, y: newPanY })
  }, [zoom, pan])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || e.button === 2 || (e.button === 0 && e.shiftKey)) {
      e.preventDefault()
      setIsPanning(true)
      setPanStart({
        x: e.clientX - pan.x,
        y: e.clientY - pan.y
      })
    } else if (e.button === 0) {
      const target = e.target as HTMLElement
      if (target === containerRef.current || 
          (target.classList.contains('canvas-background') && 
           !target.closest('[data-node]'))) {
        setIsPanning(true)
        setPanStart({
          x: e.clientX - pan.x,
          y: e.clientY - pan.y
        })
      }
    }
  }, [pan])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isPanning) return

    setPan({
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y
    })
  }, [isPanning, panStart])

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
  }, [])

  const touchStartRef = useRef<{ x: number; y: number; distance: number } | null>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0]
      touchStartRef.current = {
        x: touch.clientX - pan.x,
        y: touch.clientY - pan.y,
        distance: 0
      }
      setIsPanning(true)
    } else if (e.touches.length === 2) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )
      touchStartRef.current = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2,
        distance
      }
    }
  }, [pan])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    
    if (e.touches.length === 1 && touchStartRef.current) {
      const touch = e.touches[0]
      setPan({
        x: touch.clientX - touchStartRef.current.x,
        y: touch.clientY - touchStartRef.current.y
      })
    } else if (e.touches.length === 2 && touchStartRef.current) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )
      
      const scale = distance / touchStartRef.current.distance
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom * scale))
      
      if (newZoom !== zoom) {
        const rect = containerRef.current?.getBoundingClientRect()
        if (rect) {
          const centerX = (touch1.clientX + touch2.clientX) / 2 - rect.left
          const centerY = (touch1.clientY + touch2.clientY) / 2 - rect.top
          
          const canvasX = (centerX - pan.x) / zoom
          const canvasY = (centerY - pan.y) / zoom
          
          setZoom(newZoom)
          setPan({
            x: centerX - canvasX * newZoom,
            y: centerY - canvasY * newZoom
          })
        }
      }
    }
  }, [zoom, pan])

  const handleTouchEnd = useCallback(() => {
    setIsPanning(false)
    touchStartRef.current = null
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      container.removeEventListener('wheel', handleWheel)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleWheel, handleMouseMove, handleMouseUp])

  const resetView = useCallback(() => {
    setZoom(DEFAULT_ZOOM)
    setPan({ x: 0, y: 0 })
  }, [])

  const zoomIn = useCallback(() => {
    setZoom(prev => Math.min(MAX_ZOOM, prev * 1.2))
  }, [])

  const zoomOut = useCallback(() => {
    setZoom(prev => {
      const newZoom = prev / 1.2
      if (newZoom < MIN_ZOOM) {
        setPan({ x: 0, y: 0 })
        return MIN_ZOOM
      }
      return newZoom
    })
  }, [])

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-900">
      <div className="absolute top-4 right-4 z-50 flex flex-col gap-2 bg-slate-800/90 rounded-lg p-2 shadow-lg border border-slate-700">
        <button
          onClick={zoomIn}
          disabled={zoom >= MAX_ZOOM}
          className="px-3 py-2 rounded-md bg-slate-700 hover:bg-slate-600 text-white font-inter text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          title="Zoom In"
        >
          +
        </button>
        <div className="px-3 py-1 text-xs text-slate-300 font-inter text-center border-t border-slate-700">
          {Math.round(zoom * 100)}%
        </div>
        <button
          onClick={zoomOut}
          disabled={zoom <= MIN_ZOOM}
          className="px-3 py-2 rounded-md bg-slate-700 hover:bg-slate-600 text-white font-inter text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          title="Zoom Out"
        >
          −
        </button>
        <div className="border-t border-slate-700 my-1"></div>
        <button
          onClick={resetView}
          className="px-3 py-2 rounded-md bg-slate-700 hover:bg-slate-600 text-white font-inter text-xs font-medium transition"
          title="Reset View"
        >
          Reset
        </button>
      </div>

      <div
        ref={containerRef}
        className="w-full h-full canvas-background"
        onMouseDown={handleMouseDown}
        onContextMenu={(e) => e.preventDefault()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          cursor: isPanning ? 'grabbing' : 'default',
          userSelect: 'none'
        }}
      >
        <div
          ref={canvasRef}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            width: '100%',
            height: '100%',
            transition: isPanning ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          {children}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-50 bg-slate-800/90 rounded-lg p-3 shadow-lg border border-slate-700 text-xs text-slate-300 font-inter">
        <div className="font-semibold text-slate-200 mb-1">Controls:</div>
        <div>• Scroll to zoom</div>
        <div>• Drag to pan</div>
        <div>• Shift + Drag to pan</div>
      </div>
    </div>
  )
}

