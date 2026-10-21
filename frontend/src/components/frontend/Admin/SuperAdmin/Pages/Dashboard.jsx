import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUserGraduate, faUserCheck, faBookOpen, faSchool, faChalkboardUser,
  faLayerGroup, faLockOpen, faUserShield, faArrowUpWideShort, faArrowDownWideShort,
  faChevronLeft, faChevronRight, faUserPlus, faArrowRight, faRotateRight,
  faTriangleExclamation, faChartColumn,
} from '@fortawesome/free-solid-svg-icons'
import SuperAdminTopbar from '../Layout/SuperAdminTopbar.jsx'
import Crest from '../../../../../Pages/login/Crest.jsx'
import { api } from '../../../../../api/client.js'
import { useAuth } from '../../../../../context/useAuth.js'

const CHART_PAGE_SIZE = 5
const COUNT_UP_MS = 700

// Numbers glide up from 0 on first show. Anything that isn't a number (or
// when the person prefers reduced motion) is simply shown as it is.
function CountUp({ value }) {
  const [shown, setShown] = useState(0)

  useEffect(() => {
    if (typeof value !== 'number') return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const id = requestAnimationFrame(() => setShown(value))
      return () => cancelAnimationFrame(id)
    }
    let frame = 0
    const startedAt = performance.now()
    const tick = (now) => {
      const progress = Math.min(1, (now - startedAt) / COUNT_UP_MS)
      const eased = 1 - Math.pow(1 - progress, 3)
      setShown(Math.round(value * eased))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value])

  if (typeof value !== 'number') return <>{value}</>
  return <>{shown}</>
}

// Stat tile with a gentle 3D tilt that follows the mouse (desktop only).
function StatCard({ stat }) {
  const ref = useRef(null)

  const onMove = (e) => {
    if (e.pointerType !== 'mouse' || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    ref.current.style.transform = `perspective(800px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg) translateY(-4px)`
  }

  const onLeave = () => {
    if (ref.current) ref.current.style.transform = ''
  }

  return (
    <div ref={ref} className="superadmin-stat-card" onPointerMove={onMove} onPointerLeave={onLeave}>
      <FontAwesomeIcon icon={stat.icon} className="superadmin-stat-icon" />
      <span className="superadmin-stat-value"><CountUp value={stat.value} /></span>
      <span className="superadmin-stat-label">{stat.label}</span>
    </div>
  )
}

function SortableBarChart({ title, data }) {
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(1)

  const sorted = useMemo(() => {
    const copy = [...data]
    copy.sort((a, b) => (sortDir === 'desc' ? b.count - a.count : a.count - b.count))
    return copy
  }, [data, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / CHART_PAGE_SIZE))
  const start = (page - 1) * CHART_PAGE_SIZE
  const pageData = sorted.slice(start, start + CHART_PAGE_SIZE)
  const gradientId = `saBar-${title.replace(/[^a-zA-Z0-9]/g, '')}`

  return (
    <div className="superadmin-chart-box">
      <div className="superadmin-chart-header">
        <h4 className="superadmin-chart-title">{title}</h4>
        <button
          type="button"
          className="superadmin-sort-btn"
          onClick={() => setSortDir(sortDir === 'desc' ? 'asc' : 'desc')}
        >
          <FontAwesomeIcon icon={sortDir === 'desc' ? faArrowDownWideShort : faArrowUpWideShort} />
          {sortDir === 'desc' ? 'High to Low' : 'Low to High'}
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="sa-empty">
          <span className="sa-empty-icon"><FontAwesomeIcon icon={faChartColumn} /></span>
          <p className="sa-empty-title">Nothing to chart yet</p>
          <p className="sa-empty-text">Numbers will appear here as soon as students are enrolled.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={pageData} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E8C468" />
                <stop offset="100%" stopColor="#B38B14" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(27,42,77,0.08)" />
            <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} height={60} tick={{ fontSize: 11, fill: '#6B7280' }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
            <Tooltip
              cursor={{ fill: 'rgba(27,42,77,0.05)' }}
              contentStyle={{
                borderRadius: 12,
                border: '1px solid rgba(201,162,39,0.35)',
                boxShadow: '0 14px 30px -12px rgba(15,24,48,0.35)',
                fontSize: 12,
                fontWeight: 600,
              }}
            />
            <Bar dataKey="count" fill={`url(#${gradientId})`} radius={[8, 8, 0, 0]} animationDuration={450} />
          </BarChart>
        </ResponsiveContainer>
      )}

      <div className="assignment-pagination-row">
        <span className="assignment-pagination-text">
          {sorted.length === 0 ? 'Showing 0 of 0' : `Showing ${start + 1}-${Math.min(start + CHART_PAGE_SIZE, sorted.length)} of ${sorted.length}`}
        </span>
        <div className="assignment-pagination-btns">
          <button type="button" className="assignment-page-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>
            <FontAwesomeIcon icon={faChevronLeft} /> Previous
          </button>
          <button type="button" className="assignment-page-btn" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
            Next <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      </div>
    </div>
  )
}

function DashboardHero({ firstName }) {
  const navigate = useNavigate()
  const [today] = useState(() => new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' }))

  return (
    <section className="sa-hero">
      <div className="sa-hero-copy">
        <p className="sa-hero-date">{today}</p>
        <h1 className="sa-hero-title">Welcome back{firstName ? `, ${firstName}` : ''}</h1>
        <p className="sa-hero-text">Here is how every Titan campus is doing right now.</p>
        <div className="sa-hero-actions">
          <button type="button" className="sa-hero-btn sa-hero-btn-primary" onClick={() => navigate('/admin/superadmin/students/add')}>
            <FontAwesomeIcon icon={faUserPlus} /> Add Student
          </button>
          <button type="button" className="sa-hero-btn sa-hero-btn-ghost" onClick={() => navigate('/admin/superadmin/campuses')}>
            Manage Campuses <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
      </div>

      <div className="sa-hero-art" aria-hidden="true">
        <span className="sa-hero-orb" />
        <span className="sa-hero-plate sa-hero-plate-back" />
        <span className="sa-hero-plate sa-hero-plate-front">
          <Crest className="sa-hero-crest" />
        </span>
      </div>
    </section>
  )
}

function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    api.get('/dashboard/superadmin')
      .then(setData)
      .catch((err) => setError(err.message || 'Could not load dashboard stats.'))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const retry = () => {
    setError('')
    load()
  }

  const firstName = user?.name ? user.name.trim().split(' ')[0] : ''

  if (error) {
    return (
      <div className="superadmin-page">
        <SuperAdminTopbar breadcrumb={['Home', 'Dashboard']} />
        <div className="sa-state">
          <span className="sa-state-icon sa-state-icon-error"><FontAwesomeIcon icon={faTriangleExclamation} /></span>
          <h3 className="sa-state-title">Dashboard could not load</h3>
          <p className="sa-state-text">{error}</p>
          <button type="button" className="sa-hero-btn sa-hero-btn-primary" onClick={retry}>
            <FontAwesomeIcon icon={faRotateRight} /> Try again
          </button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="superadmin-page" aria-busy="true">
        <SuperAdminTopbar breadcrumb={['Home', 'Dashboard']} />
        <div className="sa-skeleton sa-skeleton-hero" />
        <div className="superadmin-stat-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="sa-skeleton sa-skeleton-card" />
          ))}
        </div>
        <div className="superadmin-charts-row">
          <div className="sa-skeleton sa-skeleton-chart" />
          <div className="sa-skeleton sa-skeleton-chart" />
        </div>
      </div>
    )
  }

  const stats = [
    { label: 'Total Students', value: data.students, icon: faUserGraduate },
    { label: 'Enrolled Students', value: data.enrolledStudents, icon: faUserCheck },
    { label: 'Courses Offered', value: data.coursesOffered, icon: faBookOpen },
    { label: 'Campuses', value: data.campuses, icon: faSchool },
    { label: 'Trainers', value: data.trainers, icon: faChalkboardUser },
    { label: 'Active Slots', value: data.activeSlots, icon: faLayerGroup },
    { label: 'Registration Open', value: data.registrationOpen, icon: faLockOpen },
    { label: 'Sub Admins', value: data.subAdmins, icon: faUserShield },
  ]

  const perCampusChartData = data.studentsPerCampus.map((row) => ({ name: `${row.campus} (${row.city})`, count: row.count }))
  const perCourseChartData = data.studentsPerCourse.map((row) => ({ name: row.course, count: row.count }))

  return (
    <div className="superadmin-page">
      <SuperAdminTopbar breadcrumb={['Home', 'Dashboard']} />

      <DashboardHero firstName={firstName} />

      <div className="superadmin-stat-grid">
        {stats.map((s) => (
          <StatCard key={s.label} stat={s} />
        ))}
      </div>

      <div className="superadmin-charts-row">
        <SortableBarChart title="Students per Campus (Org-wide)" data={perCampusChartData} />
        <SortableBarChart title="Students per Course (Org-wide)" data={perCourseChartData} />
      </div>
    </div>
  )
}

export default Dashboard
