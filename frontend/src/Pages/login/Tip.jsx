import { cloneElement, useId } from 'react'

// Lightweight custom tooltip - shows instantly on hover AND keyboard focus,
// no JS state, hidden on touch devices (see Landing.css).
function Tip({ text, placement = 'top', block = false, children }) {
  const id = useId()
  return (
    <span className={`tl-tip ${block ? 'tl-tip-block' : ''}`}>
      {cloneElement(children, { 'aria-describedby': id })}
      <span id={id} role="tooltip" className={`tl-tip-bubble tl-tip-${placement}`}>
        {text}
      </span>
    </span>
  )
}

export default Tip
