import LoginLoader from '../../../Pages/login/LoginLoader.jsx'

/**
 * WaitingPopup
 * Shows the premium 3D loader with a progress line that fills over
 * `durationMs`. When the line has filled, `onComplete` fires (e.g. to log out
 * or navigate).
 *
 * Props:
 *  - show: boolean - whether the loader is visible
 *  - label: string - text shown under the coin (e.g. "Logging out...")
 *  - durationMs: number - how long the progress line takes to fill
 *  - onComplete: function - called once the line finishes filling
 */
function WaitingPopup({ show, label = 'Please wait...', durationMs = 900, onComplete }) {
  return <LoginLoader show={show} label={label} progressMs={durationMs} onComplete={onComplete} />
}

export default WaitingPopup
