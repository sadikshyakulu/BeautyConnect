export default function LoadingState({ label, className = '', variant = 'page' }) {
  return (
    <div className={`loading-state loading-state--${variant} ${className}`.trim()} role="status">
      {variant === 'inline' ? (
        <span className="loading-state-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      ) : (
        <div className="loading-state-cards" aria-hidden="true">
          {[0, 1, 2, 3].map((card) => (
            <div className="loading-state-card" key={card}>
              <span className="loading-state-placeholder loading-state-placeholder--heading" />
              <span className="loading-state-placeholder loading-state-placeholder--line" />
              <span className="loading-state-placeholder loading-state-placeholder--short" />
            </div>
          ))}
        </div>
      )}
      <span className="loading-state-label">{label}</span>
    </div>
  )
}
