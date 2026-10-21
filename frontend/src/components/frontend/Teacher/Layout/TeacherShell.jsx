import { useEffect, useRef, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import TeacherSidebar from './TeacherSidebar.jsx'
import PortalAmbient from '../../shared/PortalAmbient.jsx'
import PortalRouteLoader from '../../shared/PortalRouteLoader.jsx'
import PortalTooltips from '../../shared/PortalTooltips.jsx'
import { usePortalTheme, usePortalTilt } from '../../shared/usePortalEffects.js'
import LoginLoader from '../../../../Pages/login/LoginLoader.jsx'
import { usePointerDepth } from '../../../../Pages/login/usePointerDepth.js'
import { useAuth } from '../../../../context/useAuth.js'
import '../Teacher.css'
import '../../shared/PortalPolish.css'
import '../../shared/PortalDock.css'

// How long the "Logging out" loader shows before the session is cleared.
const LOGOUT_LOADER_MS = 900

// Cards that tilt a few degrees in 3D under the mouse (desktop only).
const TILT_CARDS = '.teacher-stat-card, .teacher-course-card, .attendance-stat-box'

function TeacherShell() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [showLogout, setShowLogout] = useState(false)

  const shellRef = useRef(null)
  const noCardRef = useRef(null)
  const finishLogoutRef = useRef(null)

  // Soft parallax for the background blobs (mouse only, never for touch/reduced motion).
  usePointerDepth(shellRef, noCardRef)
  usePortalTilt(shellRef, TILT_CARDS)

  // Lets this panel's alerts and toasts (which render outside the shell, on
  // <body>) be styled without touching any other portal.
  usePortalTheme('tc-theme')

  useEffect(() => {
    finishLogoutRef.current = () => {
      logout()
      navigate('/')
    }
  })

  useEffect(() => {
    if (!showLogout) return undefined
    const timer = setTimeout(() => finishLogoutRef.current(), LOGOUT_LOADER_MS)
    return () => clearTimeout(timer)
  }, [showLogout])

  return (
    <div className="teacher-shell" ref={shellRef}>
      <TeacherSidebar onLogoutClick={() => setShowLogout(true)} />

      <main className="teacher-shell-main">
        <PortalAmbient prefix="tc" />
        <PortalRouteLoader prefix="tc" />
        <Outlet />
      </main>

      <PortalTooltips prefix="tc" role="teacher" />

      <LoginLoader show={showLogout} label="Logging you out…" progressMs={LOGOUT_LOADER_MS} />
    </div>
  )
}

export default TeacherShell
