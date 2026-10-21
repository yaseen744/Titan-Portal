import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCommentDots } from '@fortawesome/free-solid-svg-icons'
import titanLogo from '../../Media/images/titan-logo.png'
import FeedbackPopup from '../Popups/FeedbackPopup.jsx'
import CourseSummaryCard from './CourseSummaryCard.jsx'
import PortalAmbient from '../../shared/PortalAmbient.jsx'
import { usePortalTheme } from '../../shared/usePortalEffects.js'
import LoginLoader from '../../../../Pages/login/LoginLoader.jsx'
import { usePointerDepth } from '../../../../Pages/login/usePointerDepth.js'
import { api } from '../../../../api/client.js'
import '../Student.css'
import '../../shared/PortalPolish.css'

// How long the "Opening your course" loader shows before the dashboard opens.
const CONNECT_LOADER_MS = 1200

function CourseLanding() {
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [connecting, setConnecting] = useState(false)

  const pageRef = useRef(null)
  const noCardRef = useRef(null)
  const goDashboardRef = useRef(null)

  // Soft parallax for the background blobs (mouse only, never for touch/reduced motion).
  usePointerDepth(pageRef, noCardRef)

  // Lets this page's alerts and toasts (rendered on <body>) wear the Student look.
  usePortalTheme('st-theme')

  useEffect(() => {
    api.get('/students/me/profile').then(setStudent).catch(() => {})
  }, [])

  useEffect(() => {
    goDashboardRef.current = () => navigate('/student/dashboard')
  })

  useEffect(() => {
    if (!connecting) return undefined
    const timer = setTimeout(() => goDashboardRef.current(), CONNECT_LOADER_MS)
    return () => clearTimeout(timer)
  }, [connecting])

  return (
    <div className="course-landing-page" ref={pageRef}>
      <PortalAmbient prefix="st" />

      <div className="course-landing-topbar">
        <img src={titanLogo} alt="Titan" className="course-landing-logo" />

        <div className="course-landing-brand">
          <span className="course-landing-brand-name">Titan Portal</span>
          <span className="course-landing-brand-sub">Student</span>
        </div>

        <button type="button" className="course-landing-feedback-btn" onClick={() => setShowFeedback(true)}>
          <FontAwesomeIcon icon={faCommentDots} /> Feedback
        </button>
      </div>

      <div className="course-landing-body">
        <CourseSummaryCard student={student} onViewDetail={() => setConnecting(true)} />
      </div>

      <FeedbackPopup show={showFeedback} onClose={() => setShowFeedback(false)} />

      <LoginLoader show={connecting} label="Opening your course…" progressMs={CONNECT_LOADER_MS} />
    </div>
  )
}

export default CourseLanding
