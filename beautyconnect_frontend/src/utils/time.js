export function formatTime12Hour(time) {
  const match = /^(\d{1,2}):(\d{2})/.exec(time)
  if (!match) return time

  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours > 23 || minutes > 59) return time

  const period = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 || 12
  return `${hour12}:${String(minutes).padStart(2, '0')} ${period}`
}
