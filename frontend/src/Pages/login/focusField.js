// Moves keyboard focus to the first form field that failed validation.
export function focusField(id) {
  const el = document.getElementById(id)
  if (el) el.focus()
}
