interface Props {
  direction: "left" | "right"
}

export default function CurvedArrow({ direction }: Props) {
  const centerX = 180
  const endX = direction === "left" ? 20 : 340

  const startY = 0
  const midY = 60
  const endY = 140

  const points = `
    ${centerX},${startY}
    ${centerX},${midY}
    ${endX},${midY}
    ${endX},${endY}
  `

  return (
    <svg
      width="360"
      height="160"
      className="absolute top-16 left-1/2 -translate-x-1/2 pointer-events-none"
    >
      <defs>
        <marker
          id={`arrow-${direction}`}
          markerWidth="10"
          markerHeight="10"
          refX="5"
          refY="5"
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#CBD5E1" />
        </marker>
      </defs>

      <polyline
        points={points}
        fill="none"
        stroke="#CBD5E1"
        strokeWidth="2"
        markerEnd={`url(#arrow-${direction})`}
      />
    </svg>
  )
}
