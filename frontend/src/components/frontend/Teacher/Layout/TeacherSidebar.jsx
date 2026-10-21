import { useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faGaugeHigh, faCalendarDays, faCalendarCheck, faBars,
  faUserCircle, faRightFromBracket,
  faChalkboardUser,
} from '@fortawesome/free-solid-svg-icons'
import titanLogo from '../../Media/images/titan-logo.png'
import Avatar from '../../Media/Avatar.jsx'
import { useAuth } from '../../../../context/useAuth.js'
import { useActiveNavIntoView } from '../../shared/usePortalEffects.js'

const navItems = [
  { to: '/teacher/dashboard', label: 'Dashboard', icon: faGaugeHigh },
  { to: '/teacher/calendar', label: 'Calendar', icon: faCalendarDays },
  { to: '/teacher/attendance', label: 'Attendance', icon: faCalendarCheck },
]

function TeacherSidebar({ onLogoutClick }) {
  const { user } = useAuth()
  const location = useLocation()
  const navRef = useRef(null)
  // On phones the icon of the open page is kept in view inside the bottom dock.
  useActiveNavIntoView(navRef, location.pathname)
  const [collapsed, setCollapsed] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <aside className={`teacher-sidebar ${collapsed ? 'teacher-sidebar-collapsed' : ''}`}>
      <div className="teacher-sidebar-top">
        <button
          type="button"
          className="teacher-sidebar-fold-btn"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar"
          aria-expanded={!collapsed}
          title="Toggle menu"
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
        <div className="teacher-sidebar-logo-wrap">
          <img src={titanLogo} alt="Titan" className="teacher-sidebar-logo" />
          <span className="teacher-sidebar-role-badge" title="Teacher">
            <FontAwesomeIcon icon={faChalkboardUser} />
          </span>
        </div>
      </div>

      <nav ref={navRef} className="teacher-sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `teacher-sidebar-nav-item ${isActive ? 'teacher-sidebar-nav-item-active' : ''}`
            }
          >
            <FontAwesomeIcon icon={item.icon} className="teacher-sidebar-nav-icon" />
            <span className="teacher-sidebar-nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="teacher-sidebar-profile-wrap">
        <button type="button" className="teacher-sidebar-profile" onClick={() => setMenuOpen(!menuOpen)}>
          <Avatar name={user?.name} photoUrl={user?.photo} className="teacher-sidebar-avatar" />
          <span className="teacher-sidebar-name">{user?.name}</span>
        </button>

        {menuOpen && (
          <div className="teacher-sidebar-menu">
            <NavLink
              to="/teacher/profile"
              className="teacher-sidebar-menu-item"
              onClick={() => setMenuOpen(false)}
            >
              <FontAwesomeIcon icon={faUserCircle} /> Profile
            </NavLink>
            <button
              type="button"
              className="teacher-sidebar-menu-item"
              onClick={() => {
                setMenuOpen(false)
                onLogoutClick()
              }}
            >
              <FontAwesomeIcon icon={faRightFromBracket} /> Logout
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}

export default TeacherSidebar
