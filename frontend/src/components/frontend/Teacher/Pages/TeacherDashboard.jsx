import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChalkboardUser, faUserGroup, faFileLines, faCalendarDay,
  faIdBadge, faSchool, faCalendarDays, faUsers, faCalendarCheck, faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons'
import TeacherTopbar from '../Layout/TeacherTopbar.jsx'
import Crest from '../../../../Pages/login/Crest.jsx'
import { getCurrentWeekDates, dayName } from '../../Media/dateUtils.js'
import { api } from '../../../../api/client.js'
import { useAuth } from '../../../../context/useAuth.js'

const colorThemes = ['blue', 'purple', 'green', 'orange', 'teal']

// Welcome banner: today's date, a greeting and two quick links. Presentation only.
function DashboardHero({ firstName, activeCourses, enrolledStudents }) {
  const navigate = useNavigate()
  const [today] = useState(() => new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' }))

  return (
    <section className="tc-hero">
      <div className="tc-hero-copy">
        <p className="tc-hero-date">{today}</p>
        <h1 className="tc-hero-title">Welcome back{firstName ? `, ${firstName}` : ''}</h1>
        <p className="tc-hero-text">
          {activeCourses} active {activeCourses === 1 ? 'course' : 'courses'} and {enrolledStudents} enrolled {enrolledStudents === 1 ? 'student' : 'students'} are waiting for you.
        </p>
        <div className="tc-hero-actions">
          <button type="button" className="tc-hero-btn tc-hero-btn-primary" onClick={() => navigate('/teacher/attendance')}>
            <FontAwesomeIcon icon={faCalendarCheck} /> Take attendance
          </button>
          <button type="button" className="tc-hero-btn tc-hero-btn-ghost" onClick={() => navigate('/teacher/calendar')}>
            <FontAwesomeIcon icon={faCalendarDays} /> Open calendar
          </button>
        </div>
      </div>

      <div className="tc-hero-art" aria-hidden="true">
        <span className="tc-hero-orb" />
        <span className="tc-hero-plate tc-hero-plate-back" />
        <span className="tc-hero-plate tc-hero-plate-front">
          <Crest className="tc-hero-crest" />
        </span>
      </div>
    </section>
  )
}

function TeacherDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const firstName = (user?.name || '').trim().split(/\s+/)[0]
  const weekDates = getCurrentWeekDates()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/dashboard/teacher').then(setData).catch((err) => setError(err.message || 'Could not load dashboard.'))
  }, [])

  if (error) {
    return (
      <div className="teacher-page">
        <TeacherTopbar breadcrumb={['Home', 'Dashboard']} />
        <div className="tc-state" role="alert">
          <span className="tc-state-icon tc-state-icon-error"><FontAwesomeIcon icon={faTriangleExclamation} /></span>
          <h3 className="tc-state-title">Dashboard could not load</h3>
          <p className="tc-state-text">{error}</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="teacher-page">
        <TeacherTopbar breadcrumb={['Home', 'Dashboard']} />
        <div role="status" aria-label="Loading dashboard">
          <div className="tc-skeleton tc-skeleton-hero" />
          <div className="tc-skeleton-row">
            <div className="tc-skeleton tc-skeleton-card" />
            <div className="tc-skeleton tc-skeleton-card" />
            <div className="tc-skeleton tc-skeleton-card" />
            <div className="tc-skeleton tc-skeleton-card" />
          </div>
        </div>
      </div>
    )
  }

  // Union of every day-of-week the teacher has any class on, across all their slots.
  const activeWeekdays = new Set(data.slots.flatMap((s) => s.scheduleDays))

  return (
    <div className="teacher-page">
      <TeacherTopbar breadcrumb={['Home', 'Dashboard']} />

      <DashboardHero firstName={firstName} activeCourses={data.activeCourses} enrolledStudents={data.enrolledStudents} />

      <div className="teacher-stat-row">
        <div className="teacher-stat-card">
          <FontAwesomeIcon icon={faChalkboardUser} className="teacher-stat-icon" />
          <span className="teacher-stat-value">{data.activeCourses}</span>
          <span className="teacher-stat-label">Active Course</span>
        </div>
        <div className="teacher-stat-card">
          <FontAwesomeIcon icon={faUserGroup} className="teacher-stat-icon" />
          <span className="teacher-stat-value">{data.enrolledStudents}</span>
          <span className="teacher-stat-label">Enrolled Students</span>
        </div>
        <div className="teacher-stat-card">
          <FontAwesomeIcon icon={faFileLines} className="teacher-stat-icon" />
          <span className="teacher-stat-value">{data.totalAssignments}</span>
          <span className="teacher-stat-label">Total Assignments</span>
        </div>

        <div className="teacher-schedule-card">
          <span className="teacher-schedule-heading">
            <FontAwesomeIcon icon={faCalendarDay} /> Class Schedule
          </span>
          <div className="teacher-schedule-days">
            {weekDates.map((d) => {
              const dname = dayName(d)
              const isClassDay = activeWeekdays.has(d.getDay())
              return (
                <div key={d.toISOString()} className={`teacher-day-box ${isClassDay ? 'teacher-day-box-active' : ''}`}>
                  <span className="teacher-day-name">{dname}</span>
                  <span className="teacher-day-date">{d.getDate()}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <h3 className="teacher-section-heading">Active Courses</h3>

      <div className="teacher-course-grid">
        {data.slots.map((slot, idx) => {
          const totalTopics = (slot.course?.syllabus || []).reduce((s, m) => s + m.topics.length, 0)
          const progressPercent = totalTopics ? Math.round(((slot.completedTopics?.length || 0) / totalTopics) * 100) : 0
          const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
          return (
            <button
              key={slot._id}
              type="button"
              className={`teacher-course-card teacher-course-card-${colorThemes[idx % colorThemes.length]}`}
              onClick={() => navigate(`/teacher/course/${slot._id}`)}
            >
              <h4 className="teacher-course-title">{slot.course?.name}</h4>
              <div className="teacher-course-meta-row">
                <span className="teacher-course-lab">
                  <FontAwesomeIcon icon={faUsers} /> {slot.classType}
                </span>
                <span className="teacher-course-batch-badge">{slot.batchLabel}</span>
              </div>
              <p className="teacher-course-campus">
                <FontAwesomeIcon icon={faSchool} /> {slot.campus?.name}
              </p>

              <div className="teacher-course-progress-row">
                <span>Progress</span>
                <span>{progressPercent}% Complete</span>
              </div>
              <div className="teacher-course-progress-track">
                <div className="teacher-course-progress-fill" style={{ width: `${progressPercent}%` }}></div>
              </div>

              <p className="teacher-course-enrolled">
                <FontAwesomeIcon icon={faIdBadge} /> Enrolled: {slot.seatsUsed || 0} Students
              </p>
              <p className="teacher-course-schedule">
                <FontAwesomeIcon icon={faCalendarDays} /> {slot.scheduleDays.map((d) => WEEKDAY_LABELS[d]).join('/')} {slot.startTime}-{slot.endTime}
              </p>
              <p className="teacher-course-start">Start: {new Date(slot.startDate).toDateString()}</p>
            </button>
          )
        })}

        {data.slots.length === 0 && <p className="attendance-no-record">No courses assigned to you yet.</p>}
      </div>
    </div>
  )
}

export default TeacherDashboard
