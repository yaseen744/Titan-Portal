import { useId, useRef } from 'react'
import { useDialog } from './useDialog.js'

function AlertGlyph({ type }) {
  return (
    <svg className="tl-alert-svg" viewBox="0 0 72 72" fill="none" aria-hidden="true">
      <circle className="tl-alert-ring" cx="36" cy="36" r="30" />
      {type === 'success' && <path className="tl-alert-mark" d="M23 37.5l9.5 9.5L50 27" />}
      {type === 'error' && (
        <>
          <path className="tl-alert-mark" d="M27 27l18 18" />
          <path className="tl-alert-mark tl-alert-mark-late" d="M45 27L27 45" />
        </>
      )}
      {(type === 'warning' || type === 'info') && (
        <>
          <path className="tl-alert-mark" d="M36 22v17" />
          <circle className="tl-alert-dot" cx="36" cy="48.5" r="2.6" />
        </>
      )}
    </svg>
  )
}

/**
 * SweetAlert-style dialog for the login page.
 * type: 'success' | 'error' | 'warning' | 'info'
 * Pass `cancelText` + `onCancel` to make it a two-button confirm.
 */
function LoginAlert({
  open,
  type = 'info',
  title,
  message,
  confirmText = 'OK',
  cancelText,
  onConfirm,
  onCancel,
}) {
  const ref = useRef(null)
  const titleId = useId()
  const messageId = useId()

  useDialog(open, ref, cancelText ? onCancel : onConfirm)

  if (!open) return null

  return (
    <div
      className="tl-alert-overlay"
      onMouseDown={(e) => {
        if (e.target !== e.currentTarget) return
        if (cancelText && onCancel) onCancel()
      }}
    >
      <div
        ref={ref}
        className="tl-alert"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        tabIndex={-1}
      >
        <div className={`tl-alert-icon tl-alert-icon-${type}`}>
          <AlertGlyph type={type} />
        </div>
        <h3 id={titleId} className="tl-alert-title">{title}</h3>
        <p id={messageId} className="tl-alert-message">{message}</p>
        <div className="tl-alert-actions">
          {cancelText && (
            <button type="button" data-autofocus className="tl-alert-btn tl-alert-btn-ghost" onClick={onCancel}>
              {cancelText}
            </button>
          )}
          <button
            type="button"
            data-autofocus={cancelText ? undefined : ''}
            className={`tl-alert-btn tl-alert-btn-${type === 'error' ? 'danger' : 'solid'}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginAlert
