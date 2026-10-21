import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBookOpen, faClipboardCheck, faChartLine, faShieldHalved,
} from '@fortawesome/free-solid-svg-icons'
import Crest from './Crest.jsx'

/**
 * Left-side 3D illustration: a stack of floating glass "sheets" with the Titan
 * crest hovering above and small icon tiles orbiting at different depths.
 * The glass sheets use real CSS 3D transforms and tilt on pointer move
 * (see usePointerDepth.js). The crest and icon tiles sit OUTSIDE the 3D stage
 * and drift with a light 2D parallax instead - that keeps them razor sharp
 * and avoids compositing artifacts. The big tile changes with the role.
 */
function LoginScene({ roleIcon, roleKey }) {
  return (
    <div className="tl-scene" aria-hidden="true">
      <div className="tl-scene-shadow" />

      <div className="tl-stage" data-tilt="1">
        <div className="tl-stack">
          <div className="tl-slab tl-slab-base" />
          <div className="tl-slab tl-slab-mid" />
          <div className="tl-slab tl-slab-top">
            <span className="tl-slab-line tl-slab-line-a" />
            <span className="tl-slab-line tl-slab-line-b" />
            <span className="tl-slab-line tl-slab-line-c" />
          </div>
        </div>
      </div>

      <div className="tl-crest-float" data-depth="16">
        <div className="tl-crest-plate">
          <Crest className="tl-crest-scene" />
        </div>
      </div>

      <div className="tl-chip tl-chip-role" data-depth="30" key={roleKey}>
        <FontAwesomeIcon icon={roleIcon} />
      </div>
      <div className="tl-chip tl-chip-book" data-depth="22">
        <FontAwesomeIcon icon={faBookOpen} />
      </div>
      <div className="tl-chip tl-chip-check" data-depth="12">
        <FontAwesomeIcon icon={faClipboardCheck} />
      </div>
      <div className="tl-chip tl-chip-chart" data-depth="34">
        <FontAwesomeIcon icon={faChartLine} />
      </div>
      <div className="tl-chip tl-chip-lock" data-depth="42">
        <FontAwesomeIcon icon={faShieldHalved} />
      </div>

      <span className="tl-dot tl-dot-a" data-depth="20" />
      <span className="tl-dot tl-dot-b" data-depth="38" />
      <span className="tl-dot tl-dot-c" data-depth="10" />
    </div>
  )
}

export default LoginScene
