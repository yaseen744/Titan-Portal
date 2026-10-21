import { useEffect, useRef, useState } from 'react'

// One shared, premium tooltip for the whole Sub Admin panel.
//
// It automatically upgrades every existing `title="..."` hint (plain HTML
// elements AND FontAwesome icons, which render the title as an <svg><title>)
// so no page needs to be edited. It also shows the label of a sidebar item
// when the sidebar is folded to icons only.
// Shows instantly on hover and on keyboard focus; ignored on touch screens.
// It lives only while the Sub Admin shell is mounted.
function readTip(target) {
  if (!(target instanceof Element)) return null

  const stored = target.closest('[data-sb-tip]')
  if (stored) return { el: stored, text: stored.getAttribute('data-sb-tip'), placement: 'top' }

  const withTitle = target.closest('[title]')
  if (withTitle && withTitle.getAttribute('title').trim()) {
    const text = withTitle.getAttribute('title').trim()
    withTitle.setAttribute('data-sb-tip', text)
    withTitle.removeAttribute('title') // stop the browser's own plain tooltip
    if (!withTitle.getAttribute('aria-label') && !withTitle.textContent.trim()) {
      withTitle.setAttribute('aria-label', text)
    }
    return { el: withTitle, text, placement: 'top' }
  }

  const svg = target.closest('svg')
  if (svg) {
    const titleNode = svg.querySelector(':scope > title')
    if (titleNode && titleNode.textContent.trim()) {
      const text = titleNode.textContent.trim()
      svg.setAttribute('data-sb-tip', text)
      svg.setAttribute('aria-label', text)
      titleNode.textContent = '' // stop the browser's own plain tooltip
      return { el: svg, text, placement: 'top' }
    }
  }

  const navItem = target.closest('.subadmin-sidebar-collapsed .subadmin-nav-item')
  if (navItem) {
    const label = navItem.querySelector('.subadmin-nav-label')
    const text = label ? label.textContent.trim() : ''
    if (text) return { el: navItem, text, placement: 'right' }
  }

  return null
}

function SubAdminTooltips() {
  const [tip, setTip] = useState(null)
  const hostRef = useRef(null)

  useEffect(() => {
    const show = (target) => {
      if (hostRef.current && hostRef.current.contains(target)) return // already showing for this element
      const found = readTip(target)
      if (!found) return
      hostRef.current = found.el
      const rect = found.el.getBoundingClientRect()
      if (rect.width === 0 && rect.height === 0) return
      const margin = 90
      const left = Math.min(Math.max(rect.left + rect.width / 2, margin), window.innerWidth - margin)
      if (found.placement === 'right') {
        setTip({ text: found.text, placement: 'right', left: rect.right + 12, top: rect.top + rect.height / 2 })
      } else if (rect.top < 56) {
        setTip({ text: found.text, placement: 'bottom', left, top: rect.bottom + 10 })
      } else {
        setTip({ text: found.text, placement: 'top', left, top: rect.top - 10 })
      }
    }

    const hide = () => {
      hostRef.current = null
      setTip(null)
    }

    const onOver = (e) => {
      if (e.pointerType === 'touch') return
      show(e.target)
    }
    const onOut = (e) => {
      if (hostRef.current && e.relatedTarget instanceof Node && hostRef.current.contains(e.relatedTarget)) return
      hide()
    }
    const onFocus = (e) => show(e.target)
    const onKey = (e) => {
      if (e.key === 'Escape') hide()
    }

    document.addEventListener('pointerover', onOver)
    document.addEventListener('pointerout', onOut)
    document.addEventListener('pointerdown', hide)
    document.addEventListener('focusin', onFocus)
    document.addEventListener('focusout', hide)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', hide, true)

    return () => {
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointerout', onOut)
      document.removeEventListener('pointerdown', hide)
      document.removeEventListener('focusin', onFocus)
      document.removeEventListener('focusout', hide)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', hide, true)
    }
  }, [])

  if (!tip) return null

  return (
    <div
      className={`sb-tooltip sb-tooltip-${tip.placement}`}
      style={{ left: tip.left, top: tip.top }}
      role="tooltip"
    >
      {tip.text}
    </div>
  )
}

export default SubAdminTooltips
