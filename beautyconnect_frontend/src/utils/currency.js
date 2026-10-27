const nprNumberFormatter = new Intl.NumberFormat('en-NP', {
  maximumFractionDigits: 2,
})

export function formatNpr(value) {
  if (value == null || value === '') return '—'
  const amount = Number(value)
  return Number.isFinite(amount) ? `NPR ${nprNumberFormatter.format(amount)}` : '—'
}
