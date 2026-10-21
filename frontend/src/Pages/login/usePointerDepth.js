import { useEffect } from 'react'

// Pointer-driven depth for the login page (desktop mouse only):
//  - elements with data-depth="N" drift up to N px (blobs / background layers)
//  - elements with data-tilt tilt a few degrees in 3D (the left 3D scene)
//  - the form card gets a very gentle tilt, paused while someone is typing
// Everything is written straight to element.style inside requestAnimationFrame,
// so React never re-renders. Skipped on touch screens and for reduced motion.
export function usePointerDepth(pageRef, cardRef) {
  useEffect(() => {
    const page = pageRef.current
    if (!page) return undefined

    const fineMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fineMouse || reduceMotion) return undefined

    const layers = Array.from(page.querySelectorAll('[data-depth]'))
    const tilts = Array.from(page.querySelectorAll('[data-tilt]'))
    const card = cardRef.current

    let frame = 0
    let nx = 0
    let ny = 0
    let cardX = 0
    let cardY = 0

    const paint = () => {
      frame = 0
      layers.forEach((el) => {
        const depth = Number(el.dataset.depth) || 0
        el.style.transform = `translate3d(${(nx * depth).toFixed(1)}px, ${(ny * depth).toFixed(1)}px, 0)`
      })
      tilts.forEach((el) => {
        el.style.transform = `perspective(1100px) rotateX(${(-ny * 7).toFixed(2)}deg) rotateY(${(nx * 10).toFixed(2)}deg)`
      })
      if (card) {
        card.style.transform = `rotateX(${(-cardY * 3).toFixed(2)}deg) rotateY(${(cardX * 3.5).toFixed(2)}deg)`
      }
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint)
    }

    const onMove = (e) => {
      nx = (e.clientX / window.innerWidth - 0.5) * 2
      ny = (e.clientY / window.innerHeight - 0.5) * 2

      if (card) {
        const typing = card.contains(document.activeElement) && document.activeElement.tagName === 'INPUT'
        if (typing) {
          cardX = 0
          cardY = 0
        } else {
          const rect = card.getBoundingClientRect()
          const inside =
            e.clientX >= rect.left - 40 && e.clientX <= rect.right + 40 &&
            e.clientY >= rect.top - 40 && e.clientY <= rect.bottom + 40
          cardX = inside ? (e.clientX - rect.left) / rect.width - 0.5 : 0
          cardY = inside ? (e.clientY - rect.top) / rect.height - 0.5 : 0
        }
      }
      schedule()
    }

    const onLeave = () => {
      nx = 0
      ny = 0
      cardX = 0
      cardY = 0
      schedule()
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)

    return () => {
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [pageRef, cardRef])
}
