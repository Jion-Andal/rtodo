import type { AppView } from '../types'
import { MobileFooterNav } from './DashboardNavButton'

interface FooterProps {
  activeView: AppView
  onViewChange: (view: AppView) => void
  onDashboardEasterEgg?: () => void
  showCompleted?: boolean
}

export function Footer({
  activeView,
  onViewChange,
  onDashboardEasterEgg,
  showCompleted = false,
}: FooterProps) {
  return (
    <footer className={`chrome-bottom lg:hidden ${showCompleted ? 'chrome-completed' : ''}`}>
      <MobileFooterNav
        activeView={activeView}
        onViewChange={onViewChange}
        onDashboardEasterEgg={onDashboardEasterEgg}
      />
    </footer>
  )
}
