import Crest from './Crest.jsx'

const COIN_SLICES = [-3, -2, -1, 0, 1, 2, 3]

/**
 * Fast premium 3D loader: a spinning Titan crest "coin" inside a glowing gold
 * orbit on a deep-navy stage. Pure CSS transforms (GPU) - no JS animation.
 *  - `leaving` fades it out (used for the quick page-entry loader)
 *  - `progressMs` shows a thin progress line that fills over that time
 *  - `onComplete` (optional) is called once that progress line has filled
 */
function LoginLoader({ show, label = 'Loading', leaving = false, progressMs = 0, onComplete }) {
  if (!show) return null

  return (
    <div
      className={`tl-loader ${leaving ? 'tl-loader-leaving' : ''}`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <span className="tl-loader-glow" aria-hidden="true" />
      <div className="tl-loader-scene" aria-hidden="true">
        <span className="tl-loader-sparks" />
        <span className="tl-loader-ring" />
        <span className="tl-loader-orbit tl-loader-orbit-a" />
        <span className="tl-loader-orbit tl-loader-orbit-b" />
        <div className="tl-loader-coin">
          {COIN_SLICES.map((z) => (
            <span key={z} className="tl-loader-slice" style={{ transform: `translateZ(${z}px)` }} />
          ))}
          <span className="tl-loader-face tl-loader-face-front">
            <Crest className="tl-loader-crest" />
          </span>
          <span className="tl-loader-face tl-loader-face-back">
            <Crest className="tl-loader-crest" />
          </span>
        </div>
      </div>
      <p className="tl-loader-label">{label}</p>
      {progressMs > 0 && (
        <span className="tl-loader-track" aria-hidden="true">
          <span
            className="tl-loader-fill"
            style={{ animationDuration: `${progressMs}ms` }}
            onAnimationEnd={(e) => {
              if (onComplete && e.target === e.currentTarget && e.animationName === 'tlFill') onComplete()
            }}
          />
        </span>
      )}
    </div>
  )
}

export default LoginLoader
