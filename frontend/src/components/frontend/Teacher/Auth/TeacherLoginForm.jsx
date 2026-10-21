import { useState } from 'react'
import { faEnvelope, faRightToBracket } from '@fortawesome/free-solid-svg-icons'
import { Field, PasswordField, SubmitButton } from '../../../../Pages/login/Controls.jsx'
import { focusField } from '../../../../Pages/login/focusField.js'

function TeacherLoginForm({ onSubmit, onForgotPassword }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const clearError = (key) => {
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!email.trim()) newErrors.email = 'Email is required'
    if (!password.trim()) newErrors.password = 'Password is required'
    setErrors(newErrors)

    if (newErrors.email) return focusField('teacher-email')
    if (newErrors.password) return focusField('teacher-password')

    setLoading(true)
    try {
      await onSubmit({ email, password })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="tl-form" onSubmit={handleSubmit} noValidate>
      <h2 className="tl-form-title">Login</h2>
      <p className="tl-form-text">
        Kindly provide the email and password used during SMIT course registration.
      </p>

      <Field
        id="teacher-email"
        label="Email"
        icon={faEnvelope}
        type="email"
        value={email}
        onChange={(e) => { setEmail(e.target.value); clearError('email') }}
        error={errors.email}
        placeholder="you@titan.edu.pk"
        autoComplete="email"
      />

      <PasswordField
        id="teacher-password"
        value={password}
        onChange={(e) => { setPassword(e.target.value); clearError('password') }}
        error={errors.password}
        placeholder="Enter your password"
      />

      <div className="tl-form-row">
        <button type="button" className="tl-link tl-link-gold" onClick={onForgotPassword}>
          Forgot Password?
        </button>
      </div>

      <SubmitButton loading={loading} loadingText="Checking details…" icon={faRightToBracket}>
        Login
      </SubmitButton>
    </form>
  )
}

export default TeacherLoginForm
