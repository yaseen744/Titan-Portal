import { useState } from 'react'
import { faIdCard, faRightToBracket } from '@fortawesome/free-solid-svg-icons'
import { Field, PasswordField, SubmitButton } from '../../../../Pages/login/Controls.jsx'
import { focusField } from '../../../../Pages/login/focusField.js'

function StudentLoginForm({ onSubmit }) {
  const [cnic, setCnic] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const clearError = (key) => {
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!cnic.trim()) newErrors.cnic = 'CNIC is required'
    if (!password.trim()) newErrors.password = 'Password is required'
    setErrors(newErrors)

    if (newErrors.cnic) return focusField('student-cnic')
    if (newErrors.password) return focusField('student-password')

    setLoading(true)
    try {
      await onSubmit({ cnic, password })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="tl-form" onSubmit={handleSubmit} noValidate>
      <h2 className="tl-form-title">Login</h2>
      <p className="tl-form-text">
        Kindly provide the CNIC number and password used during SMIT course registration.
      </p>

      <Field
        id="student-cnic"
        label="CNIC"
        icon={faIdCard}
        value={cnic}
        onChange={(e) => { setCnic(e.target.value); clearError('cnic') }}
        error={errors.cnic}
        placeholder="42101-1234567-1"
        autoComplete="username"
      />

      <PasswordField
        id="student-password"
        value={password}
        onChange={(e) => { setPassword(e.target.value); clearError('password') }}
        error={errors.password}
        placeholder="Enter your password"
      />

      <SubmitButton loading={loading} loadingText="Checking details…" icon={faRightToBracket}>
        Login
      </SubmitButton>
    </form>
  )
}

export default StudentLoginForm
