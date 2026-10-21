import { useEffect } from 'react'

// Puts a class on <body> while a portal is open. Alerts, toasts and menus are
// rendered straight under <body> (outside the portal's own wrapper), so this
// is what lets them wear the portal's premium look without leaking anywhere else.
export function usePortalTheme(className) {
  useEffect(() => {
    document.body.classList.add(className)
    return () => document.body.classList.remove(className)
  }, [className])
}

// Gentle 3D tilt for stat tiles / course cards that follows the mouse.
// One listener on the portal wrapper (event delegation) - the cards themselves
// are never edited. Desktop mouse only; skipped on touch and for reduced motion.
export function usePortalTilt(wrapRef, selector) {
  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return undefined

    const fineMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fineMouse || reduceMotion) return undefined

    let current = null

    const reset = () => {
      if (current) current.style.transform = ''
      current = null
    }

    const onMove = (e) => {
      if (e.pointerType !== 'mouse') return
      const card = e.target instanceof Element ? e.target.closest(selector) : null
      if (card !== current) {
        reset()
        current = card
      }
      if (!card) return
      const rect = card.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      card.style.transform = `perspective(800px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg) translateY(-4px)`
    }

    wrap.addEventListener('pointermove', onMove, { passive: true })
    wrap.addEventListener('pointerleave', reset)

    return () => {
      wrap.removeEventListener('pointermove', onMove)
      wrap.removeEventListener('pointerleave', reset)
      reset()
    }
  }, [wrapRef, selector])
}

// Phone bottom dock: scrolls the icon of the page that is open into the middle
// of the dock (the admin dock has many icons and scrolls sideways).
export function useActiveNavIntoView(navRef, activeKey) {
  useEffect(() => {
    const nav = navRef.current
    if (!nav || !window.matchMedia('(max-width: 768px)').matches) return
    const active = nav.querySelector('[aria-current="page"]')
    if (!active) return
    const left = active.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2
    nav.scrollTo({ left: Math.max(0, left), behavior: 'smooth' })
  }, [navRef, activeKey])
}
