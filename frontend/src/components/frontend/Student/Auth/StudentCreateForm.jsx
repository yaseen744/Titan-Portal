import { useState } from 'react'
import { faIdCard, faCalendarDays, faUserPlus } from '@fortawesome/free-solid-svg-icons'
import { Field, PasswordField, SubmitButton } from '../../../../Pages/login/Controls.jsx'
import { focusField } from '../../../../Pages/login/focusField.js'

function StudentCreateForm({ onSubmit }) {
  const [cnic, setCnic] = useState('')
  const [dob, setDob] = useState('')
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
    if (!dob.trim()) newErrors.dob = 'Date of birth is required'
    if (!password.trim()) newErrors.password = 'Password is required'
    setErrors(newErrors)

    if (newErrors.cnic) return focusField('create-cnic')
    if (newErrors.dob) return focusField('create-dob')
    if (newErrors.password) return focusField('create-password')

    setLoading(true)
    try {
      await onSubmit({ cnic, dob, password })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="tl-form" onSubmit={handleSubmit} noValidate>
      <h2 className="tl-form-title">Create a Password</h2>
      <p className="tl-form-text">
        Kindly provide the CNIC number and password used during SMIT course registration.
      </p>

      <Field
        id="create-cnic"
        label="CNIC"
        icon={faIdCard}
        value={cnic}
        onChange={(e) => { setCnic(e.target.value); clearError('cnic') }}
        error={errors.cnic}
        placeholder="42101-1234567-1"
        autoComplete="username"
      />

      <Field
        id="create-dob"
        label="Date of Birth"
        icon={faCalendarDays}
        type="date"
        staticLabel
        value={dob}
        onChange={(e) => { setDob(e.target.value); clearError('dob') }}
        error={errors.dob}
        autoComplete="bday"
      />

      <PasswordField
        id="create-password"
        value={password}
        onChange={(e) => { setPassword(e.target.value); clearError('password') }}
        error={errors.password}
        placeholder="Create a password"
        autoComplete="new-password"
      />

      <SubmitButton loading={loading} loadingText="Creating account…" icon={faUserPlus}>
        Submit
      </SubmitButton>
    </form>
  )
}

export default StudentCreateForm
