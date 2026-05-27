import { createPortal } from 'react-dom'

interface ConfirmModalProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  confirmDisabled?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  confirmDisabled = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cancel"
        className="absolute inset-0 bg-ink/30"
        onClick={onCancel}
      />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-surface p-5 shadow-xl dark:bg-[#2a363e]">
        <h2 className="text-lg font-semibold text-ink dark:text-mint-50">
          {title}
        </h2>
        <p className="mt-2 text-sm text-ink-muted dark:text-mint-100">{message}</p>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-mint-50 dark:border-border-strong dark:text-mint-100 dark:hover:bg-[#243038]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirmDisabled}
            className="flex-1 rounded-xl bg-mint-400 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-mint-500 disabled:opacity-60 dark:bg-mint-500 dark:hover:bg-mint-600"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
