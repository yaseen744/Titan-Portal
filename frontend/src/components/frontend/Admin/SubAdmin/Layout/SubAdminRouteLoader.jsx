import { useLocation } from 'react-router-dom'
import Crest from '../../../../../Pages/login/Crest.jsx'

// A very quick (about 0.4s, mostly transparent) 3D "coin" flash every time
// the Sub Admin opens a page. Pure CSS: keying the element by the URL makes
// it remount - and so replay its animation - on every navigation. It never
// blocks clicks (pointer-events: none) and no state/effects are involved.
function SubAdminRouteLoader() {
  const { pathname } = useLocation()

  return (
    <div key={pathname} className="sb-route-loader" aria-hidden="true">
      <div className="sb-coin-scene">
        <span className="sb-coin-orbit" />
        <div className="sb-coin">
          <span className="sb-coin-face sb-coin-face-front">
            <Crest className="sb-coin-crest" />
          </span>
          <span className="sb-coin-face sb-coin-face-back">
            <Crest className="sb-coin-crest" />
          </span>
          <span className="sb-coin-rim" />
        </div>
      </div>
    </div>
  )
}

export default SubAdminRouteLoader
