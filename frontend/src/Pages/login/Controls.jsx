import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faEye, faEyeSlash, faLock, faCircleExclamation, faArrowRight, faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons'
import Tip from './Tip.jsx'

/**
 * Floating-label input used by every form on the login page.
 * `staticLabel` keeps the label raised (needed for type="date").
 */
export function Field({
  id, label, icon, type = 'text', value, onChange, error, hint, placeholder,
  autoComplete, staticLabel = false, trailing = null, onKeyUp, onBlur, required = true,
  autoFocus = false, inputMode, maxLength, inputClass = '',
}) {
  const messageId = `${id}-message`
  const hasMessage = Boolean(error || hint)

  return (
    <div className="tl-field">
      <div
        className={
          'tl-input-wrap' +
          (error ? ' tl-input-wrap-error' : '') +
          (staticLabel ? ' tl-input-wrap-static' : '') +
          (trailing ? ' tl-input-wrap-trailing' : '')
        }
      >
        <FontAwesomeIcon icon={icon} className="tl-input-icon" />
        <input
          id={id}
          className={`tl-input ${inputClass}`}
          type={type}
          value={value}
          onChange={onChange}
          onKeyUp={onKeyUp}
          onBlur={onBlur}
          placeholder={placeholder || ' '}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          inputMode={inputMode}
          maxLength={maxLength}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={hasMessage ? messageId : undefined}
          data-autofocus={autoFocus ? '' : undefined}
        />
        <label className="tl-input-label" htmlFor={id}>
          {label}
          {required && <span className="tl-required" aria-hidden="true"> *</span>}
        </label>
        {trailing}
      </div>

      {error && (
        <p id={messageId} className="tl-field-message tl-field-message-error" role="alert">
          <FontAwesomeIcon icon={faCircleExclamation} /> {error}
        </p>
      )}
      {!error && hint && (
        <p id={messageId} className="tl-field-message tl-field-message-hint" role="status">
          <FontAwesomeIcon icon={faTriangleExclamation} /> {hint}
        </p>
      )}
    </div>
  )
}

// Password input with a show/hide toggle and a Caps Lock warning.
export function PasswordField({
  id, label = 'Password', value, onChange, error, placeholder, autoComplete = 'current-password',
}) {
  const [show, setShow] = useState(false)
  const [capsOn, setCapsOn] = useState(false)

  return (
    <Field
      id={id}
      label={label}
      icon={faLock}
      type={show ? 'text' : 'password'}
      value={value}
      onChange={onChange}
      error={error}
      hint={capsOn ? 'Caps Lock is on' : ''}
      placeholder={placeholder}
      autoComplete={autoComplete}
      onKeyUp={(e) => setCapsOn(Boolean(e.getModifierState && e.getModifierState('CapsLock')))}
      onBlur={() => setCapsOn(false)}
      trailing={
        <span className="tl-trailing">
          <Tip text={show ? 'Hide password' : 'Show password'}>
            <button
              type="button"
              className="tl-eye"
              aria-label={show ? 'Hide password' : 'Show password'}
              aria-pressed={show}
              onClick={() => setShow((s) => !s)}
            >
              <FontAwesomeIcon icon={show ? faEyeSlash : faEye} />
            </button>
          </Tip>
        </span>
      }
    />
  )
}

// Primary 3D "keycap" button with loading state.
export function SubmitButton({ children, loading = false, loadingText = 'Please wait…', icon = faArrowRight }) {
  return (
    <button type="submit" className="tl-btn tl-btn-primary" disabled={loading} aria-busy={loading}>
      <span className="tl-btn-sheen" aria-hidden="true" />
      {loading ? (
        <span className="tl-btn-content">
          <span className="tl-btn-spinner" aria-hidden="true" />
          {loadingText}
        </span>
      ) : (
        <span className="tl-btn-content">
          {children}
          <span className="tl-btn-chip" aria-hidden="true">
            <FontAwesomeIcon icon={icon} />
          </span>
        </span>
      )}
    </button>
  )
}
