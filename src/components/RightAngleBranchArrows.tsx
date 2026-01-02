interface Props {
  leftOffset: number
  rightOffset: number
}

export default function RightAngleBranchArrows({
  leftOffset,
  rightOffset
}: Props) {
  const startY = 0
  const midY = 60
  const endY = 140

  const svgWidth = leftOffset + rightOffset
  const centerX = svgWidth / 2

  return (
    <svg
      width={svgWidth}
      height="160"
      className="absolute pointer-events-none"
      style={{
        left: `calc(50% - ${svgWidth / 2}px)`,
        top: '-160px'
      }}
    >
      <defs>
        <marker
          id="arrow-left"
          markerWidth="10"
          markerHeight="10"
          refX="5"
          refY="5"
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
        </marker>
        <marker
          id="arrow-right"
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

      <polyline
        points={`${centerX},${startY}
                 ${centerX},${midY}
                 ${centerX - leftOffset},${midY}
                 ${centerX - leftOffset},${endY}`}
        fill="none"
        stroke="url(#lineGradient)"
        strokeWidth="2.5"
        markerEnd="url(#arrow-left)"
        className="drop-shadow-sm"
      />

      <polyline
        points={`${centerX},${startY}
                 ${centerX},${midY}
                 ${centerX + rightOffset},${midY}
                 ${centerX + rightOffset},${endY}`}
        fill="none"
        stroke="url(#lineGradient)"
        strokeWidth="2.5"
        markerEnd="url(#arrow-right)"
        className="drop-shadow-sm"
      />
    </svg>
  )
}
