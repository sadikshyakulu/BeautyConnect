import { useId, useState } from 'react'
import './ExpandableText.css'

export default function ExpandableText({ text, lines = 3, className = '' }) {
  const [expanded, setExpanded] = useState(false)
  const contentId = useId()

  if (!text) return null

  const canExpand = text.length > 180
  const isCollapsed = canExpand && !expanded

  return (
    <div className={`expandable-text${className ? ` ${className}` : ''}`}>
      <p
        className={`expandable-text-content${isCollapsed ? '' : ' expandable-text-content--expanded'}`}
        id={contentId}
        style={{ '--expandable-text-lines': lines }}
      >
        {text}
      </p>
      {canExpand && (
        <button
          className="expandable-text-toggle"
          type="button"
          aria-expanded={expanded}
          aria-controls={contentId}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  )
}
