import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-ink/30"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-surface p-5 shadow-xl dark:bg-[#2a363e]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink dark:text-mint-50">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-ink-faint hover:bg-mint-100 hover:text-ink dark:hover:bg-mint-600/20 dark:hover:text-mint-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}
