import './RatingStars.css'

export default function RatingStars({ rating, className = '' }) {
  const numericRating = Number(rating)
  const normalizedRating = Number.isFinite(numericRating)
    ? Math.min(5, Math.max(0, numericRating))
    : 0
  const filledStars = Math.round(normalizedRating)

  return (
    <span className={`rating-stars ${className}`.trim()} role="img" aria-label={`${normalizedRating.toFixed(1)} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span className={index < filledStars ? 'rating-star rating-star--filled' : 'rating-star rating-star--empty'} key={index}>
          ★
        </span>
      ))}
    </span>
  )
}
