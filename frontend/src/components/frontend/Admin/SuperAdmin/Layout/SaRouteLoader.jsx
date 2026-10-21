import { useLocation } from 'react-router-dom'
import Crest from '../../../../../Pages/login/Crest.jsx'

// A very quick (about 0.4s, mostly transparent) 3D "coin" flash every time
// the Super Admin opens a page. Pure CSS: keying the element by the URL makes
// it remount - and so replay its animation - on every navigation. It never
// blocks clicks (pointer-events: none) and no state/effects are involved.
function SaRouteLoader() {
  const { pathname } = useLocation()

  return (
    <div key={pathname} className="sa-route-loader" aria-hidden="true">
      <div className="sa-coin-scene">
        <span className="sa-coin-orbit" />
        <div className="sa-coin">
          <span className="sa-coin-face sa-coin-face-front">
            <Crest className="sa-coin-crest" />
          </span>
          <span className="sa-coin-face sa-coin-face-back">
            <Crest className="sa-coin-crest" />
          </span>
          <span className="sa-coin-rim" />
        </div>
      </div>
    </div>
  )
}

export default SaRouteLoader
