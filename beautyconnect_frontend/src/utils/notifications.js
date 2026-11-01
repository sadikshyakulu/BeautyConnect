import { toast } from 'react-toastify'

const showToast = (type, message) => {
  if (!message) return

  const options = typeof message === 'string' ? { toastId: `${type}:${message}` } : {}
  toast[type](message, options)
}

export const notify = {
  success: (message) => showToast('success', message),
  error: (message) => showToast('error', message),
  warning: (message) => showToast('warning', message),
  info: (message) => showToast('info', message),
}
