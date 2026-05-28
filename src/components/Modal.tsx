import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  decoration?: ReactNode
}

export function Modal({ open, onClose, title, children, decoration }: ModalProps) {
  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close modal"
        className="modal-backdrop"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg">
        {decoration && (
          <div className="pointer-events-none absolute -top-[7.25rem] left-1/2 z-20 -translate-x-1/2">
            {decoration}
          </div>
        )}
        <div className="panel p-6 shadow-[var(--shadow-elevated)]">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-ink dark:text-zinc-100">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-1.5 text-ink-faint transition-colors hover:bg-surface-muted hover:text-ink dark:hover:bg-dark-panel dark:hover:text-zinc-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}
