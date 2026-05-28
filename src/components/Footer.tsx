import type { Category } from '../types'
import { CategoryNav } from './CategoryNav'

interface FooterProps {
  activeCategory: Category
  onCategoryChange: (category: Category) => void
  showCompleted?: boolean
}

export function Footer({ activeCategory, onCategoryChange, showCompleted = false }: FooterProps) {
  return (
    <footer className={`chrome-bottom lg:hidden ${showCompleted ? 'chrome-completed' : ''}`}>
      <CategoryNav
        activeCategory={activeCategory}
        onCategoryChange={onCategoryChange}
        className="content-shell pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))]"
      />
    </footer>
  )
}
