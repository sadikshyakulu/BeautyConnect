import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCustomerBookings } from '../api/booking'
import { getAssetUrl } from '../api/assets'
import { updateCustomerProfile } from '../api/auth'
import { uploadAvatar } from '../api/profileImage'
import { useAuth } from '../auth/useAuth'
import LoadingState from '../components/LoadingState'
import { notify } from '../utils/notifications'
import { withNepalPhonePrefix } from '../utils/phone'
import './DashboardPages.css'

const statusName = (status) => typeof status === 'number'
  ? ['Pending', 'Confirmed', 'Completed', 'Cancelled'][status] ?? 'Unknown'
  : status

export default function CustomerProfilePage() {
  const { user, updateProfile } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [nameDraft, setNameDraft] = useState(user?.profile?.fullName ?? '')
  const [phoneDraft, setPhoneDraft] = useState(withNepalPhonePrefix(user?.profile?.phoneNumber))
  const avatarUrl = user?.profile?.avatarUrl
  const displayName = user?.profile?.fullName?.trim()
    || user?.fullName?.trim()
    || user?.email?.split('@')[0]
    || 'BeautyConnect member'
  const initials = displayName.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toLocaleUpperCase()

  useEffect(() => {
    let active = true
    getCustomerBookings()
      .then((result) => {
        if (active) setBookings(result ?? [])
      })
      .catch((error) => {
        if (active) notify.error(error.response?.data?.message ?? 'Your appointment summary could not be loaded.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const completedCount = bookings.filter((booking) => statusName(booking.status) === 'Completed').length
  const upcomingCount = bookings.filter((booking) => ['Pending', 'Confirmed'].includes(statusName(booking.status))).length

  async function handleProfileSave(event) {
    event.preventDefault()
    const phoneNumber = phoneDraft.trim()
    const phoneDigits = phoneNumber.replace(/\D/g, '').length
    if (phoneNumber.length > 30 || phoneDigits < 7 || phoneDigits > 15 || !/^[\d+\s-]+$/.test(phoneNumber)) {
      notify.error('Enter a phone number using digits, spaces, + or - with 7 to 15 digits.')
      return
    }

    setSavingProfile(true)
    try {
      const updated = await updateCustomerProfile({
        fullName: nameDraft.trim(),
        phoneNumber,
      })
      updateProfile(updated.profile)
      notify.success('Your profile details have been saved.')
    } catch (error) {
      notify.error(error.response?.data?.message ?? 'Could not save your profile details.')
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleAvatarUpload(event) {
    const image = event.target.files?.[0]
    event.target.value = ''
    if (!image) return
    if (!['image/jpeg', 'image/png'].includes(image.type) || image.size <= 0 || image.size > 5 * 1024 * 1024) {
      notify.error('Choose a JPEG or PNG image smaller than 5 MB.')
      return
    }

    setUploading(true)
    try {
      const result = await uploadAvatar(image)
      updateProfile({ avatarUrl: result.avatarUrl })
      notify.success('Your profile photo has been updated.')
    } catch (error) {
      notify.error(error.response?.data?.message ?? 'Could not upload your profile photo.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="dashboard-page dashboard-profile-page">
      <header className="dashboard-hero dashboard-profile-hero">
        <div className="dashboard-hero-copy">
          <span className="dashboard-eyebrow">YOUR BEAUTYCONNECT ACCOUNT</span>
          <h1 className="font-headline">Your profile</h1>
          <p>Your account details and appointment activity, together in one place.</p>
        </div>
        <div className="profile-avatar-wrap">
          {avatarUrl ? (
            <img className="profile-avatar-large profile-avatar-large--image" src={getAssetUrl(avatarUrl)} alt={`${displayName} profile`} />
          ) : (
            <div className="profile-avatar-large" aria-label={`${displayName} profile`}>
              {initials || 'BC'}
            </div>
          )}
          <label className="profile-avatar-upload" htmlFor="customer-avatar-upload">
            <span className="material-symbols-outlined" aria-hidden="true">{uploading ? 'progress_activity' : 'photo_camera'}</span>
            <span>{uploading ? 'Uploading…' : 'Change photo'}</span>
            <input id="customer-avatar-upload" className="visually-hidden" type="file" accept="image/jpeg,image/png" disabled={uploading} onChange={handleAvatarUpload} />
          </label>
        </div>
        <div className="dashboard-hero-decoration" aria-hidden="true">✳</div>
      </header>

      <div className="row g-4">
        <section className="col-12 col-lg-7">
          <article className="dashboard-panel h-100">
            <div className="dashboard-panel-heading">
              <span className="material-symbols-outlined" aria-hidden="true">account_circle</span>
              <div>
                <h2>Account details</h2>
                <p>Information attached to your signed-in account.</p>
              </div>
            </div>
            <form onSubmit={handleProfileSave}>
              <dl className="profile-detail-list">
                <div>
                  <dt><label htmlFor="customer-profile-name">Full name</label></dt>
                  <dd>
                    <input
                      id="customer-profile-name"
                      className="form-control"
                      value={nameDraft}
                      onChange={(event) => setNameDraft(event.target.value)}
                      minLength={2}
                      maxLength={100}
                      required
                      autoComplete="name"
                    />
                  </dd>
                </div>
                <div>
                  <dt>Email address</dt>
                  <dd>{user?.email ?? 'Not available'}</dd>
                </div>
                <div>
                  <dt><label htmlFor="customer-profile-phone">Phone number</label></dt>
                  <dd>
                    <input
                      id="customer-profile-phone"
                      className="form-control"
                      type="tel"
                      value={phoneDraft}
                      onChange={(event) => setPhoneDraft(withNepalPhonePrefix(event.target.value))}
                      maxLength={30}
                      pattern="[0-9+ -]+"
                      required
                      autoComplete="tel"
                    />
                    <small className="form-text">Use digits, spaces, + or - and include 7 to 15 digits.</small>
                  </dd>
                </div>
                <div>
                  <dt>Account type</dt>
                  <dd>Customer</dd>
                </div>
              </dl>
              <button className="btn btn-primary w-100 mt-3" type="submit" disabled={savingProfile}>
                <span className="material-symbols-outlined align-middle me-1" aria-hidden="true">
                  {savingProfile ? 'progress_activity' : 'save'}
                </span>
                {savingProfile ? 'Saving profile…' : 'Save profile'}
              </button>
            </form>
          </article>
        </section>

        <section className="col-12 col-lg-5">
          <article className="dashboard-panel h-100">
            <div className="dashboard-panel-heading">
              <span className="material-symbols-outlined" aria-hidden="true">event_available</span>
              <div>
                <h2>Appointment snapshot</h2>
                <p>A quick look at your BeautyConnect visits.</p>
              </div>
            </div>
            {loading ? (
              <LoadingState className="justify-content-start" variant="inline" label="Loading your appointments…" />
            ) : (
              <div className="profile-stat-grid">
                <div><strong>{upcomingCount}</strong><span>Upcoming</span></div>
                <div><strong>{completedCount}</strong><span>Completed</span></div>
              </div>
            )}
            <Link to="/dashboard/customer" className="btn btn-outline-primary w-100 mt-4">View my appointments</Link>
          </article>
        </section>
      </div>
    </div>
  )
}
