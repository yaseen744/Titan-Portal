import { useEffect, useRef, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import SubAdminSidebar from './SubAdminSidebar.jsx'
import SubAdminTooltips from './SubAdminTooltips.jsx'
import SubAdminRouteLoader from './SubAdminRouteLoader.jsx'
import LoginLoader from '../../../../../Pages/login/LoginLoader.jsx'
import { usePointerDepth } from '../../../../../Pages/login/usePointerDepth.js'
import { useAuth } from '../../../../../context/useAuth.js'
import '../SubAdmin.css'
import '../../AdminPages.css'
import '../../../shared/PortalPolish.css'
import '../../../shared/PortalDock.css'

// How long the "Logging out" loader shows before the session is cleared.
const LOGOUT_LOADER_MS = 900

function SubAdminShell() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [showLogout, setShowLogout] = useState(false)

  const shellRef = useRef(null)
  const noCardRef = useRef(null)
  const finishLogoutRef = useRef(null)

  // Soft parallax for the background blobs (mouse only, never for touch/reduced motion).
  usePointerDepth(shellRef, noCardRef)

  // Lets the Sub Admin's popups, menus and alerts (which render outside the
  // shell, on <body>) be styled without touching any other portal.
  useEffect(() => {
    document.body.classList.add('sb-theme')
    return () => document.body.classList.remove('sb-theme')
  }, [])

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
    <div className="subadmin-shell" ref={shellRef}>
      <SubAdminSidebar onLogoutClick={() => setShowLogout(true)} />

      <main className="subadmin-shell-main">
        <div className="sb-ambient" aria-hidden="true">
          <div className="sb-blob-wrap" data-depth="26"><span className="sb-blob sb-blob-gold" /></div>
          <div className="sb-blob-wrap" data-depth="-20"><span className="sb-blob sb-blob-navy" /></div>
          <div className="sb-blob-wrap" data-depth="14"><span className="sb-blob sb-blob-sky" /></div>
          <span className="sb-grid" />
        </div>

        <SubAdminRouteLoader />
        <Outlet />
      </main>

      <SubAdminTooltips />

      <LoginLoader show={showLogout} label="Logging you out…" progressMs={LOGOUT_LOADER_MS} />
    </div>
  )
}

export default SubAdminShell
