import type { ReactNode } from 'react'

interface IconButtonProps {
  label: string
  onClick: () => void
  variant?: 'default' | 'danger'
  stopPropagation?: boolean
  children: ReactNode
}

export function IconButton({
  label,
  onClick,
  variant = 'default',
  stopPropagation = false,
  children,
}: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        if (stopPropagation) e.stopPropagation()
        onClick()
      }}
      aria-label={label}
      className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
        variant === 'danger'
          ? 'text-ink-faint hover:bg-peach-50 hover:text-peach-400 dark:hover:bg-peach-400/10 dark:hover:text-peach-300'
          : 'text-ink-faint hover:bg-surface-muted hover:text-ink dark:hover:bg-dark-panel dark:hover:text-zinc-200'
      }`}
    >
      {children}
    </button>
  )
}

export function EditIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32l8.4-8.4z" />
      <path d="M5.25 5.25a3 3 0 00-3 3v10.5a3 3 0 003 3h10.5a3 3 0 003-3V13.5a.75.75 0 00-1.5 0v5.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V8.25a1.5 1.5 0 011.5-1.5h5.25a.75.75 0 000-1.5H5.25z" />
    </svg>
  )
}

export function DeleteIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path
        fillRule="evenodd"
        d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.368 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.368 0c.729 0 1.304.596 1.304 1.312v.227H8.06v-.227c0-.716.575-1.312 1.304-1.312zM9.75 8.25v8.25m3-8.25v8.25m3-8.25v8.25"
        clipRule="evenodd"
      />
    </svg>
  )
}
