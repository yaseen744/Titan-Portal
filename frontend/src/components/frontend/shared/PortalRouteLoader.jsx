import { useLocation } from 'react-router-dom'
import Crest from '../../../Pages/login/Crest.jsx'

// A very quick (about 0.4s, mostly transparent) 3D "coin" flash every time a
// Student / Teacher page opens. Pure CSS: keying the element by the URL makes
// it remount - and so replay its animation - on every navigation. It never
// blocks clicks (pointer-events: none) and no state/effects are involved.
// `prefix` picks the portal's own classes ("st" = Student, "tc" = Teacher).
function PortalRouteLoader({ prefix }) {
  const { pathname } = useLocation()

  return (
    <div key={pathname} className={`${prefix}-route-loader`} aria-hidden="true">
      <div className={`${prefix}-coin-scene`}>
        <span className={`${prefix}-coin-orbit`} />
        <div className={`${prefix}-coin`}>
          <span className={`${prefix}-coin-face ${prefix}-coin-face-front`}>
            <Crest className={`${prefix}-coin-crest`} />
          </span>
          <span className={`${prefix}-coin-face ${prefix}-coin-face-back`}>
            <Crest className={`${prefix}-coin-crest`} />
          </span>
          <span className={`${prefix}-coin-rim`} />
        </div>
      </div>
    </div>
  )
}

export default PortalRouteLoader
