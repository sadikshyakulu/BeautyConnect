import { toast } from 'react-toastify'

const showToast = (type, message) => {
  if (!message) return

  toast[type](message, {
    toastId: `${type}:${message}`,
  })
}

export const notify = {
  success: (message) => showToast('success', message),
  error: (message) => showToast('error', message),
  warning: (message) => showToast('warning', message),
  info: (message) => showToast('info', message),
}
