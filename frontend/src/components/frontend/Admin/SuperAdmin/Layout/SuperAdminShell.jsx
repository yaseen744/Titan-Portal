import { useEffect, useRef, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import SuperAdminSidebar from './SuperAdminSidebar.jsx'
import SaTooltips from './SaTooltips.jsx'
import SaRouteLoader from './SaRouteLoader.jsx'
import LoginLoader from '../../../../../Pages/login/LoginLoader.jsx'
import { usePointerDepth } from '../../../../../Pages/login/usePointerDepth.js'
import { useAuth } from '../../../../../context/useAuth.js'
import '../SuperAdmin.css'
import '../../AdminPages.css'
import '../../../shared/PortalPolish.css'
import '../../../shared/PortalDock.css'

// How long the "Logging out" loader shows before the session is cleared.
const LOGOUT_LOADER_MS = 900

function SuperAdminShell() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [showLogout, setShowLogout] = useState(false)

  const shellRef = useRef(null)
  const noCardRef = useRef(null)
  const finishLogoutRef = useRef(null)

  // Soft parallax for the background blobs (mouse only, never for touch/reduced motion).
  usePointerDepth(shellRef, noCardRef)

  // Lets the Super Admin's popups, menus and alerts (which render outside the
  // shell, on <body>) be styled without touching any other portal.
  useEffect(() => {
    document.body.classList.add('sa-theme')
    return () => document.body.classList.remove('sa-theme')
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
    <div className="superadmin-shell" ref={shellRef}>
      <SuperAdminSidebar onLogoutClick={() => setShowLogout(true)} />

      <main className="superadmin-shell-main">
        <div className="sa-ambient" aria-hidden="true">
          <div className="sa-blob-wrap" data-depth="26"><span className="sa-blob sa-blob-gold" /></div>
          <div className="sa-blob-wrap" data-depth="-20"><span className="sa-blob sa-blob-navy" /></div>
          <div className="sa-blob-wrap" data-depth="14"><span className="sa-blob sa-blob-sky" /></div>
          <span className="sa-grid" />
        </div>

        <SaRouteLoader />
        <Outlet />
      </main>

      <SaTooltips />

      <LoginLoader show={showLogout} label="Logging you out…" progressMs={LOGOUT_LOADER_MS} />
    </div>
  )
}

export default SuperAdminShell
