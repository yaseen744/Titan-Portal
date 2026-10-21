// Soft floating blobs + a perspective floor grid behind the page content.
// Purely decorative (aria-hidden, pointer-events: none). The `data-depth`
// layers drift gently with the mouse via usePointerDepth (desktop only).
// `prefix` picks the portal's own classes ("st" = Student, "tc" = Teacher).
function PortalAmbient({ prefix }) {
  return (
    <div className={`${prefix}-ambient`} aria-hidden="true">
      <div className={`${prefix}-blob-wrap`} data-depth="26"><span className={`${prefix}-blob ${prefix}-blob-gold`} /></div>
      <div className={`${prefix}-blob-wrap`} data-depth="-20"><span className={`${prefix}-blob ${prefix}-blob-navy`} /></div>
      <div className={`${prefix}-blob-wrap`} data-depth="14"><span className={`${prefix}-blob ${prefix}-blob-sky`} /></div>
      <span className={`${prefix}-grid`} />
    </div>
  )
}

export default PortalAmbient
