import { useId, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faKey, faXmark, faEnvelope, faShieldHalved, faUserGroup, faPaperPlane,
  faCircleExclamation, faArrowLeft, faCheck,
} from '@fortawesome/free-solid-svg-icons'
import { api } from '../../../api/client.js'
import { Field, PasswordField, SubmitButton } from '../../../Pages/login/Controls.jsx'
import LoginAlert from '../../../Pages/login/LoginAlert.jsx'
import Tip from '../../../Pages/login/Tip.jsx'
import { useDialog } from '../../../Pages/login/useDialog.js'

const STEP_LABELS = ['Email', 'Verify', 'Done']

// Used for Teacher / Sub Admin / Super Admin only - Students don't get a
// forgot-password option per the spec, so `role` is always one of those three.
//
// Popup layers (nested on purpose):
//   1. this reset popup
//   2. a confirm alert if someone closes it half-way through the verify step
//   3. a success alert once the password has been changed
function ForgotPasswordPopup({ show, onClose, role }) {
  const [step, setStep] = useState('request') // 'request' | 'need-id' | 'verify' | 'done'
  const [email, setEmail] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [idLabel, setIdLabel] = useState('ID')
  const [accountsFound, setAccountsFound] = useState(0)
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [maskedEmail, setMaskedEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmingClose, setConfirmingClose] = useState(false)

  const ref = useRef(null)
  const titleId = useId()

  const reset = () => {
    setStep('request')
    setEmail('')
    setEmployeeId('')
    setIdLabel('ID')
    setAccountsFound(0)
    setOtp('')
    setNewPassword('')
    setConfirmPassword('')
    setMaskedEmail('')
    setError('')
    setLoading(false)
    setConfirmingClose(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  // Closing in the middle of the verify step would throw away a code the
  // person already received, so ask first (nested confirm popup).
  const requestClose = () => {
    if (step === 'verify' && (otp || newPassword || confirmPassword)) {
      setConfirmingClose(true)
      return
    }
    handleClose()
  }

  useDialog(show && step !== 'done', ref, requestClose)

  if (!show) return null

  // Fires the actual OTP request to the backend - shared by both the plain
  // email step and the "which account is yours?" step below, since the
  // second one is really just a retry of the same call with employeeId added.
  const requestOtp = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/forgot-password/request', {
        email: email.trim(),
        role,
        ...(employeeId.trim() ? { employeeId: employeeId.trim() } : {}),
      })
      setMaskedEmail(res.maskedEmail || '')
      setStep('verify')
    } catch (err) {
      if (err.code === 'NEED_EMPLOYEE_ID') {
        setIdLabel(err.idLabel || 'ID')
        setAccountsFound(err.accountsFound || 0)
        setStep('need-id')
        return
      }
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRequestOtp = (e) => {
    e.preventDefault()
    if (!email.trim()) return setError('Please enter your registered email.')
    requestOtp()
  }

  const handleConfirmId = (e) => {
    e.preventDefault()
    setError('')
    if (!employeeId.trim()) return setError(`Please enter your ${idLabel}.`)
    requestOtp()
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setError('')
    if (!otp.trim()) return setError('Please enter the 6-digit code.')
    if (newPassword.length < 6) return setError('New password must be at least 6 characters.')
    if (newPassword !== confirmPassword) return setError('Passwords do not match.')
    setLoading(true)
    try {
      await api.post('/auth/forgot-password/verify', {
        email: email.trim(),
        role,
        otp: otp.trim(),
        newPassword,
        ...(employeeId.trim() ? { employeeId: employeeId.trim() } : {}),
      })
      setStep('done')
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const stepNumber = step === 'verify' ? 1 : step === 'done' ? 2 : 0
  const stepIcon = step === 'need-id' ? faUserGroup : step === 'verify' ? faShieldHalved : faKey
  const stepTitle =
    step === 'need-id' ? `We Found ${accountsFound || 'Multiple'} Accounts` :
    step === 'verify' ? 'Enter Verification Code' :
    'Forgot Password'

  return (
    <div
      className="tl-modal-overlay"
      onMouseDown={(e) => { if (e.target === e.currentTarget && step !== 'done') requestClose() }}
    >
      {step !== 'done' && (
        <div
          ref={ref}
          className="tl-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
        >
          <span className="tl-modal-close-wrap">
            <Tip text="Close" placement="left">
              <button type="button" className="tl-modal-close" onClick={requestClose} aria-label="Close">
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </Tip>
          </span>

          <ol className="tl-steps" aria-label="Progress">
            {STEP_LABELS.map((label, index) => (
              <li
                key={label}
                className={
                  'tl-step' +
                  (index < stepNumber ? ' tl-step-done' : '') +
                  (index === stepNumber ? ' tl-step-current' : '')
                }
                aria-current={index === stepNumber ? 'step' : undefined}
              >
                <span className="tl-step-dot">
                  {index < stepNumber ? <FontAwesomeIcon icon={faCheck} /> : index + 1}
                </span>
                <span className="tl-step-label">{label}</span>
              </li>
            ))}
          </ol>

          <div className="tl-modal-body" key={step}>
            <div className="tl-modal-icon">
              <FontAwesomeIcon icon={stepIcon} />
            </div>
            <h3 id={titleId} className="tl-modal-title">{stepTitle}</h3>

            {step === 'request' && (
              <p className="tl-modal-text">
                Enter your registered email. We'll send a 6-digit verification code to that
                email address so you can securely reset your password.
              </p>
            )}
            {step === 'need-id' && (
              <p className="tl-modal-text">
                <strong>{email}</strong> is used by {accountsFound} different accounts. To make sure the
                reset code goes to the right one, please enter your <strong>{idLabel}</strong>.
              </p>
            )}
            {step === 'verify' && (
              <p className="tl-modal-text">
                A 6-digit code was sent to {maskedEmail || 'the email on file'}. It expires in 5 minutes.
              </p>
            )}

            {error && (
              <div className="tl-banner tl-banner-error" role="alert">
                <FontAwesomeIcon icon={faCircleExclamation} />
                <span>{error}</span>
              </div>
            )}

            {step === 'request' && (
              <form className="tl-modal-form" onSubmit={handleRequestOtp} noValidate>
                <Field
                  id="fp-email"
                  label="Email"
                  icon={faEnvelope}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required={false}
                  autoFocus
                />
                <SubmitButton loading={loading} loadingText="Sending…" icon={faPaperPlane}>
                  Send Code
                </SubmitButton>
              </form>
            )}

            {step === 'need-id' && (
              <form className="tl-modal-form" onSubmit={handleConfirmId} noValidate>
                <Field
                  id="fp-employee-id"
                  label={idLabel}
                  icon={faKey}
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder={role === 'teacher' ? 'e.g. TR-001' : role === 'subadmin' ? 'e.g. SA-001' : 'Your ID'}
                  required={false}
                  autoFocus
                />
                <SubmitButton loading={loading} loadingText="Checking…">
                  Continue
                </SubmitButton>
                <button
                  type="button"
                  className="tl-btn tl-btn-ghost"
                  onClick={() => { setStep('request'); setEmployeeId(''); setError('') }}
                >
                  <FontAwesomeIcon icon={faArrowLeft} /> Use a different email
                </button>
              </form>
            )}

            {step === 'verify' && (
              <form className="tl-modal-form" onSubmit={handleVerify} noValidate>
                <Field
                  id="fp-otp"
                  label="6-digit code"
                  icon={faShieldHalved}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="one-time-code"
                  inputClass="tl-input-code"
                  required={false}
                  autoFocus
                />
                <PasswordField
                  id="fp-new-password"
                  label="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                />
                <PasswordField
                  id="fp-confirm-password"
                  label="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                />
                <SubmitButton loading={loading} loadingText="Updating…">
                  Update Password
                </SubmitButton>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Layer 2: confirm before throwing away a half-finished reset */}
      <LoginAlert
        open={confirmingClose}
        type="warning"
        title="Leave password reset?"
        message="Your verification code and new password will be cleared. You'd need to request a new code."
        confirmText="Yes, leave"
        cancelText="Keep going"
        onConfirm={handleClose}
        onCancel={() => setConfirmingClose(false)}
      />

      {/* Layer 2: success once the password is changed */}
      <LoginAlert
        open={step === 'done'}
        type="success"
        title="Password updated"
        message="Your password has been changed successfully. You can now log in with your new password."
        confirmText="Back to Login"
        onConfirm={handleClose}
      />
    </div>
  )
}

export default ForgotPasswordPopup
