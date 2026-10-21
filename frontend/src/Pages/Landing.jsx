import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUserTie, faUserShield, faArrowLeft, faChevronRight,
  faGraduationCap, faChalkboardUser,
} from '@fortawesome/free-solid-svg-icons'

import ForgotPasswordPopup from '../components/frontend/Media/ForgotPasswordPopup.jsx'

import StudentLoginForm from '../components/frontend/Student/Auth/StudentLoginForm.jsx'
import StudentCreateForm from '../components/frontend/Student/Auth/StudentCreateForm.jsx'
import TeacherLoginForm from '../components/frontend/Teacher/Auth/TeacherLoginForm.jsx'
import SubAdminLoginForm from '../components/frontend/Admin/SubAdmin/Auth/SubAdminLoginForm.jsx'
import SuperAdminLoginForm from '../components/frontend/Admin/SuperAdmin/Auth/SuperAdminLoginForm.jsx'

import { api } from '../api/client.js'
import { useAuth } from '../context/useAuth.js'

import Crest from './login/Crest.jsx'
import Tip from './login/Tip.jsx'
import LoginScene from './login/LoginScene.jsx'
import LoginLoader from './login/LoginLoader.jsx'
import LoginAlert from './login/LoginAlert.jsx'
import { usePointerDepth } from './login/usePointerDepth.js'
import './Landing.css'

// How long the quick 3D loader shows when the page first opens, and how long
// the "signing you in" loader shows after a successful login.
const BOOT_LOADER_MS = 280
const BOOT_FADE_MS = 200
const LOGIN_TRANSITION_MS = 900

const ROLE_TABS = [
  { key: 'student', label: 'Student', icon: faGraduationCap, tip: 'Log in with your CNIC' },
  { key: 'teacher', label: 'Trainer', icon: faChalkboardUser, tip: 'Trainer login with email' },
  { key: 'admin', label: 'Admin', icon: faUserShield, tip: 'Sub Admin or Super Admin' },
]

function Landing() {
  const navigate = useNavigate()
  const { login } = useAuth()

  // 'student' | 'teacher' | 'admin'
  const [role, setRole] = useState('student')
  // 'login' or 'create' - only relevant while role === 'student'
  const [mode, setMode] = useState('login')
  // 'subadmin' | 'superadmin' | null (role picker shown when null)
  const [adminType, setAdminType] = useState(null)

  const [showWaiting, setShowWaiting] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotPasswordRole, setForgotPasswordRole] = useState('teacher')
  const [loginError, setLoginError] = useState('')
  const [pendingRedirect, setPendingRedirect] = useState(null)
  const [bootPhase, setBootPhase] = useState('show') // 'show' | 'leaving' | 'done'

  const pageRef = useRef(null)
  const cardRef = useRef(null)
  const redirectRef = useRef(null)

  usePointerDepth(pageRef, cardRef)

  // Quick page-entry 3D loader: visible for a blink, then fades away.
  useEffect(() => {
    const leave = setTimeout(() => setBootPhase('leaving'), BOOT_LOADER_MS)
    const done = setTimeout(() => setBootPhase('done'), BOOT_LOADER_MS + BOOT_FADE_MS)
    return () => {
      clearTimeout(leave)
      clearTimeout(done)
    }
  }, [])

  // After a successful login, show the loader briefly and then go to the portal.
  useEffect(() => {
    redirectRef.current = pendingRedirect
  }, [pendingRedirect])

  useEffect(() => {
    if (!showWaiting) return undefined
    const timer = setTimeout(() => {
      setShowWaiting(false)
      if (redirectRef.current) navigate(redirectRef.current)
    }, LOGIN_TRANSITION_MS)
    return () => clearTimeout(timer)
  }, [showWaiting, navigate])

  const isCreate = role === 'student' && mode === 'create'

  const roleIcon =
    role === 'teacher' ? faChalkboardUser :
    role === 'admin' ? faUserShield :
    faGraduationCap

  const heroTitle =
    isCreate ? 'Create your Student Portal password' :
    role === 'teacher' ? 'Log in to your Trainer Portal' :
    role === 'admin' && adminType === 'subadmin' ? 'Log in as a Sub Admin' :
    role === 'admin' && adminType === 'superadmin' ? 'Log in as a Super Admin' :
    role === 'admin' ? 'Log in to the Admin Panel' :
    'Log in to your Student Portal'

  const heroText =
    isCreate ? 'Use the CNIC and date of birth from your registration to set a password and get started.' :
    role === 'teacher' ? 'Mark attendance, manage courses, assignments and quizzes, and follow your students’ progress.' :
    role === 'admin' ? 'Manage students, trainers, attendance, courses and campuses from one place.' :
    'See your courses, attendance, assignments, quizzes and progress in one place.'

  // Called once a form's own client-side validation passes. Makes the real
  // login/create-account call, and only shows the waiting animation once
  // the backend has actually confirmed the credentials - a failed login
  // shows the error alert instead of a fake "logging in" animation.
  const handleFormSubmit = async (payload) => {
    setLoginError('')
    try {
      let response
      let redirectTo

      if (role === 'student' && mode === 'login') {
        response = await api.post('/auth/login/student', payload)
        redirectTo = '/student/landing'
      } else if (role === 'student' && mode === 'create') {
        response = await api.post('/auth/student/create-account', payload)
        redirectTo = '/student/landing'
      } else if (role === 'teacher') {
        response = await api.post('/auth/login/teacher', payload)
        redirectTo = '/teacher/dashboard'
      } else if (role === 'admin' && adminType === 'subadmin') {
        response = await api.post('/auth/login/subadmin', payload)
        redirectTo = '/admin/subadmin/dashboard'
      } else if (role === 'admin' && adminType === 'superadmin') {
        response = await api.post('/auth/login/superadmin', payload)
        redirectTo = '/admin/superadmin/dashboard'
      }

      login(response.token, response.role, response.user)
      setPendingRedirect(redirectTo)
      setShowWaiting(true)
    } catch (err) {
      setLoginError(err.message || 'Something went wrong. Please try again.')
    }
  }

  const switchToTeacher = () => {
    setRole('teacher')
    setMode('login')
    setAdminType(null)
    setLoginError('')
  }

  const switchToStudent = () => {
    setRole('student')
    setMode('login')
    setAdminType(null)
    setLoginError('')
  }

  const switchToAdmin = () => {
    setRole('admin')
    setAdminType(null)
    setLoginError('')
  }

  const roleSwitchers = {
    student: switchToStudent,
    teacher: switchToTeacher,
    admin: switchToAdmin,
  }
  const activeTab = Math.max(0, ROLE_TABS.findIndex((t) => t.key === role))

  const paneKey = `${role}-${mode}-${adminType || 'none'}`

  return (
    <div className="tl-page" ref={pageRef}>
      {/* ---------------- LEFT: brand + 3D scene ---------------- */}
      <section className="tl-hero">
        <div className="tl-blob-wrap" data-depth="26" aria-hidden="true">
          <span className="tl-blob tl-blob-navy" />
        </div>
        <div className="tl-blob-wrap" data-depth="-20" aria-hidden="true">
          <span className="tl-blob tl-blob-gold" />
        </div>
        <div className="tl-blob-wrap" data-depth="12" aria-hidden="true">
          <span className="tl-blob tl-blob-sky" />
        </div>
        <span className="tl-hero-grid" aria-hidden="true" />

        <div className="tl-brand">
          <span className="tl-brand-badge">
            <Crest className="tl-brand-crest" />
          </span>
          <span className="tl-brand-text">
            <span className="tl-brand-name">Titan <span className="tl-brand-accent">Portal</span></span>
            <span className="tl-brand-sub">Taj Institute of Technology &amp; Applied Networks</span>
          </span>
        </div>

        <div className="tl-hero-copy" key={paneKey}>
          <p className="tl-welcome">
            <span className="tl-welcome-dot" aria-hidden="true" />
            {isCreate ? 'Welcome to Titan' : 'Welcome back'}
          </p>
          <h1 className="tl-hero-title">{heroTitle}</h1>
          <p className="tl-hero-text">{heroText}</p>
        </div>

        <LoginScene roleIcon={roleIcon} roleKey={role} />
      </section>

      {/* ---------------- RIGHT: form card ---------------- */}
      <main className="tl-formside">
        <div className="tl-blob-wrap" data-depth="22" aria-hidden="true">
          <span className="tl-blob tl-blob-form-gold" />
        </div>
        <div className="tl-blob-wrap" data-depth="-16" aria-hidden="true">
          <span className="tl-blob tl-blob-form-navy" />
        </div>
        <span className="tl-form-grid" aria-hidden="true" />

        <div className="tl-card-wrap">
          <div className="tl-card" ref={cardRef}>
            <div className="tl-roles" role="group" aria-label="Choose how you log in">
              <span
                className={`tl-roles-thumb tl-roles-thumb-${activeTab}`}
                aria-hidden="true"
              />
              {ROLE_TABS.map((tab) => (
                <Tip key={tab.key} text={tab.tip} block>
                  <button
                    type="button"
                    aria-pressed={role === tab.key}
                    className={`tl-role ${role === tab.key ? 'tl-role-active' : ''}`}
                    onClick={roleSwitchers[tab.key]}
                  >
                    <FontAwesomeIcon icon={tab.icon} className="tl-role-icon" />
                    <span>{tab.label}</span>
                  </button>
                </Tip>
              ))}
            </div>

            <div className="tl-pane" key={paneKey}>
              {role === 'student' && mode === 'login' && (
                <StudentLoginForm onSubmit={handleFormSubmit} />
              )}

              {role === 'student' && mode === 'create' && (
                <StudentCreateForm onSubmit={handleFormSubmit} />
              )}

              {role === 'teacher' && (
                <TeacherLoginForm
                  onSubmit={handleFormSubmit}
                  onForgotPassword={() => { setForgotPasswordRole('teacher'); setShowForgotPassword(true) }}
                />
              )}

              {role === 'admin' && adminType === null && (
                <div className="tl-form">
                  <h2 className="tl-form-title">Choose Admin Type</h2>
                  <p className="tl-form-text">
                    Select which kind of admin account you'd like to log in with.
                  </p>

                  <div className="tl-admin-list">
                    <button
                      type="button"
                      className="tl-admin-card"
                      onClick={() => { setAdminType('subadmin'); setLoginError('') }}
                    >
                      <span className="tl-admin-icon">
                        <FontAwesomeIcon icon={faUserTie} />
                      </span>
                      <span className="tl-admin-text">
                        <span className="tl-admin-title">Sub Admin</span>
                        <span className="tl-admin-desc">Campus staff — students, attendance, trainers &amp; more</span>
                      </span>
                      <FontAwesomeIcon icon={faChevronRight} className="tl-admin-arrow" />
                    </button>

                    <button
                      type="button"
                      className="tl-admin-card"
                      onClick={() => { setAdminType('superadmin'); setLoginError('') }}
                    >
                      <span className="tl-admin-icon">
                        <FontAwesomeIcon icon={faUserShield} />
                      </span>
                      <span className="tl-admin-text">
                        <span className="tl-admin-title">Super Admin</span>
                        <span className="tl-admin-desc">Full control across every city &amp; campus</span>
                      </span>
                      <FontAwesomeIcon icon={faChevronRight} className="tl-admin-arrow" />
                    </button>
                  </div>

                  <button type="button" className="tl-link tl-link-back" onClick={switchToStudent}>
                    <FontAwesomeIcon icon={faArrowLeft} /> Back to Student Login
                  </button>
                </div>
              )}

              {role === 'admin' && adminType === 'subadmin' && (
                <>
                  <SubAdminLoginForm
                    onSubmit={handleFormSubmit}
                    onForgotPassword={() => { setForgotPasswordRole('subadmin'); setShowForgotPassword(true) }}
                  />
                  <button type="button" className="tl-link tl-link-back" onClick={() => setAdminType(null)}>
                    <FontAwesomeIcon icon={faArrowLeft} /> Back
                  </button>
                </>
              )}

              {role === 'admin' && adminType === 'superadmin' && (
                <>
                  <SuperAdminLoginForm
                    onSubmit={handleFormSubmit}
                    onForgotPassword={() => { setForgotPasswordRole('superadmin'); setShowForgotPassword(true) }}
                  />
                  <button type="button" className="tl-link tl-link-back" onClick={() => setAdminType(null)}>
                    <FontAwesomeIcon icon={faArrowLeft} /> Back
                  </button>
                </>
              )}
            </div>

            {role === 'student' && (
              <p className="tl-switch">
                {mode === 'login' ? 'First time here?' : 'Already have a password?'}{' '}
                <button
                  type="button"
                  className="tl-link tl-link-gold"
                  onClick={() => { setMode(mode === 'login' ? 'create' : 'login'); setLoginError('') }}
                >
                  {mode === 'login' ? 'Create your password' : 'Log in'}
                </button>
              </p>
            )}
          </div>
        </div>
      </main>

      <ForgotPasswordPopup
        show={showForgotPassword}
        role={forgotPasswordRole}
        onClose={() => setShowForgotPassword(false)}
      />

      <LoginAlert
        open={Boolean(loginError)}
        type="error"
        title={isCreate ? 'Could not create your password' : 'Login failed'}
        message={loginError}
        confirmText="Try again"
        onConfirm={() => setLoginError('')}
      />

      <LoginLoader
        show={bootPhase !== 'done'}
        leaving={bootPhase === 'leaving'}
        label="Loading Titan Portal"
      />

      <LoginLoader
        show={showWaiting}
        label={role === 'student' && mode === 'login' ? 'Signing you in…' : 'Logging you in…'}
        progressMs={LOGIN_TRANSITION_MS}
      />
    </div>
  )
}

export default Landing
