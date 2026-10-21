import { useEffect, useRef } from 'react'

// Shared behaviour for every popup on the login page (forgot-password popup,
// sweet alerts, nested confirms):
//  - Esc closes only the TOP-most dialog (so a nested alert closes first)
//  - Tab / Shift+Tab stay inside the top-most dialog
//  - background page scroll is locked while any dialog is open
//  - focus moves into the dialog on open and returns to the trigger on close
const stack = []
let lockCount = 0

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

export function useDialog(open, containerRef, onClose) {
  const closeRef = useRef(onClose)

  useEffect(() => {
    closeRef.current = onClose
  })

  useEffect(() => {
    if (!open) return undefined

    const token = {}
    stack.push(token)
    const previouslyFocused = document.activeElement

    lockCount += 1
    if (lockCount === 1) document.documentElement.style.overflow = 'hidden'

    const raf = requestAnimationFrame(() => {
      const node = containerRef.current
      if (!node) return
      const target = node.querySelector('[data-autofocus]') || node.querySelector(FOCUSABLE) || node
      target.focus({ preventScroll: true })
    })

    const onKeyDown = (e) => {
      if (stack[stack.length - 1] !== token) return

      if (e.key === 'Escape') {
        e.stopPropagation()
        if (closeRef.current) closeRef.current()
        return
      }

      if (e.key !== 'Tab') return
      const node = containerRef.current
      if (!node) return
      const items = Array.from(node.querySelectorAll(FOCUSABLE))
      if (items.length === 0) {
        e.preventDefault()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('keydown', onKeyDown)
      const index = stack.indexOf(token)
      if (index !== -1) stack.splice(index, 1)
      lockCount -= 1
      if (lockCount <= 0) {
        lockCount = 0
        document.documentElement.style.overflow = ''
      }
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus({ preventScroll: true })
      }
    }
  }, [open, containerRef])
}
