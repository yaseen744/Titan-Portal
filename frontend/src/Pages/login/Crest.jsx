import titanLogo from '../../components/frontend/Media/images/titan-logo.png'

// The Titan logo file has a lot of empty padding around the shield, so this
// crops it (with CSS only - the original image is not touched) to just the
// shield + laurels. Size it from the outside with width/height classes.
function Crest({ className = '' }) {
  return (
    <span className={`tl-crest ${className}`}>
      <img src={titanLogo} alt="" draggable="false" decoding="async" />
    </span>
  )
}

export default Crest
