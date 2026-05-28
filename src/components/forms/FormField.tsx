interface FormFieldProps {
  label: string
  children: React.ReactNode
  optional?: boolean
}

export function FormField({ label, children, optional }: FormFieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink dark:text-zinc-200">
        {label}
        {optional && (
          <span className="ml-1 font-normal text-ink-faint">(optional)</span>
        )}
      </span>
      {children}
    </label>
  )
}

export const inputClassName = 'field-input'

export const selectClassName = `${inputClassName} appearance-none pr-10`

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({ className = '', ...props }: SelectProps) {
  return (
    <div className="relative">
      <select {...props} className={`${selectClassName} ${className}`.trim()} />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 text-ink-faint"
      >
        <path
          fillRule="evenodd"
          d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  )
}

export const buttonPrimaryClassName = 'btn-primary w-full'

export const buttonSecondaryClassName = 'btn-secondary'
