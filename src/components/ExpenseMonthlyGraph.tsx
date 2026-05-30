import { MONTH_LABELS } from '../utils/expenseCalculations'

interface ExpenseMonthlyGraphProps {
  monthlyTotals: number[]
  selectedMonth: number
  onSelectMonth: (month: number) => void
}

const WIDTH = 320
const HEIGHT = 152
const PAD = { top: 16, right: 12, bottom: 30, left: 12 }

export function ExpenseMonthlyGraph({
  monthlyTotals,
  selectedMonth,
  onSelectMonth,
}: ExpenseMonthlyGraphProps) {
  const chartWidth = WIDTH - PAD.left - PAD.right
  const chartHeight = HEIGHT - PAD.top - PAD.bottom
  const maxTotal = Math.max(...monthlyTotals, 1)

  const points = monthlyTotals.map((total, index) => {
    const month = index + 1
    const x = PAD.left + (index / (monthlyTotals.length - 1)) * chartWidth
    const y = PAD.top + chartHeight - (total / maxTotal) * chartHeight
    return { month, total, x, y }
  })

  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')

  const areaPath = `${linePath} L ${points[points.length - 1]?.x ?? PAD.left} ${
    PAD.top + chartHeight
  } L ${points[0]?.x ?? PAD.left} ${PAD.top + chartHeight} Z`

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full"
        role="img"
        aria-label="Monthly expense totals for the selected year"
      >
        {[0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = PAD.top + chartHeight - ratio * chartHeight
          return (
            <line
              key={ratio}
              x1={PAD.left}
              y1={y}
              x2={WIDTH - PAD.right}
              y2={y}
              className="stroke-border/60 dark:stroke-dark-border/70"
              strokeWidth="1"
              strokeDasharray="3 4"
            />
          )
        })}

        <path
          d={areaPath}
          className="fill-mint-500/10 dark:fill-mint-400/10"
        />
        <path
          d={linePath}
          fill="none"
          className="stroke-mint-500 dark:stroke-mint-400"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((point) => {
          const isSelected = point.month === selectedMonth
          return (
            <g key={point.month}>
              <circle
                cx={point.x}
                cy={point.y}
                r={isSelected ? 7 : 4.5}
                className={`cursor-pointer ${
                  isSelected
                    ? 'fill-mint-600 stroke-surface stroke-[3] dark:fill-mint-400 dark:stroke-dark-elevated'
                    : 'fill-mint-400/90 hover:fill-mint-500 dark:fill-mint-500/80 dark:hover:fill-mint-400'
                }`}
                onClick={() => onSelectMonth(point.month)}
                role="button"
                tabIndex={0}
                aria-label={`${MONTH_LABELS[point.month - 1]}, ${point.total.toFixed(2)} pesos`}
                aria-pressed={isSelected}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onSelectMonth(point.month)
                  }
                }}
              />
              <text
                x={point.x}
                y={HEIGHT - 8}
                textAnchor="middle"
                className={`text-[10px] font-semibold ${
                  isSelected
                    ? 'fill-mint-600 dark:fill-mint-400'
                    : 'fill-ink-faint dark:fill-zinc-500'
                }`}
              >
                {MONTH_LABELS[point.month - 1]}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
