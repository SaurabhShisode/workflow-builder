export function generateId() {
  return Math.random().toString(36).slice(2, 9)
}

export function getDefaultLabel(type: string) {
  if (type === "action") return "Action"
  if (type === "branch") return "Condition"
  if (type === "end") return "End"
  return "Start"
}
