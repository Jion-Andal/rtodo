import { EVENT_COLORS, EVENT_COLOR_LABELS, type EventColor } from '../../types'
import { getEventColorSwatchClass } from '../../utils/eventColors'

interface EventColorPickerProps {
  value: EventColor
  onChange: (color: EventColor) => void
}

export function EventColorPicker({ value, onChange }: EventColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Event color">
      {EVENT_COLORS.map((color) => {
        const isSelected = value === color
        return (
          <button
            key={color}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={EVENT_COLOR_LABELS[color]}
            title={EVENT_COLOR_LABELS[color]}
            onClick={() => onChange(color)}
            className={`relative h-8 w-8 rounded-xl transition-all duration-150 active:scale-95 ${getEventColorSwatchClass(color)} ${
              isSelected
                ? 'ring-2 ring-ink ring-offset-2 ring-offset-surface dark:ring-zinc-100 dark:ring-offset-dark-elevated'
                : 'opacity-90 hover:scale-105 hover:opacity-100'
            }`}
          >
            {isSelected && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow-sm"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        )
      })}
    </div>
  )
}
