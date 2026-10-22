import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAssetUrl } from '../api/assets'
import { uploadAvatar } from '../api/profileImage'
import {
  addService,
  getMyProfile,
  submitForVerification,
  updateMyProfile,
  updateService,
  uploadPortfolioImage,
  uploadServiceImage,
} from '../api/professionalProfile'
import { useAuth } from '../auth/useAuth'
import { notify } from '../utils/notifications'
import './DashboardPages.css'

const emptyService = {
  name: '',
  description: '',
  category: '',
  price: '',
  durationMinutes: '60',
}

const verificationStatus = (status) => typeof status === 'number'
  ? ['Pending', 'Approved', 'Rejected'][status] ?? 'Unknown'
  : status

export default function ProfessionalStudioPage() {
  const { user, updateProfile } = useAuth()
  const [profile, setProfile] = useState(null)
  const [profileDraft, setProfileDraft] = useState(null)
  const [serviceDraft, setServiceDraft] = useState(emptyService)
  const [editingServiceId, setEditingServiceId] = useState(null)
  const [showServiceForm, setShowServiceForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingService, setSavingService] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingServiceId, setUploadingServiceId] = useState(null)
  const [submittingVerification, setSubmittingVerification] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function loadProfile() {
    const result = await getMyProfile()
    setProfile(result)
    setProfileDraft({
      businessName: result.businessName ?? '',
      bio: result.bio ?? '',
      speciality: result.speciality ?? '',
      city: result.city ?? '',
      address: result.address ?? '',
      latitude: result.latitude ?? 0,
      longitude: result.longitude ?? 0,
      avatarUrl: result.avatarUrl ?? '',
      serviceCategories: (result.serviceCategories ?? []).join(', '),
    })
  }

  useEffect(() => {
    let active = true
    getMyProfile()
      .then((result) => {
        if (!active) return
        setProfile(result)
        setProfileDraft({
          businessName: result.businessName ?? '',
          bio: result.bio ?? '',
          speciality: result.speciality ?? '',
          city: result.city ?? '',
          address: result.address ?? '',
          latitude: result.latitude ?? 0,
          longitude: result.longitude ?? 0,
          avatarUrl: result.avatarUrl ?? '',
          serviceCategories: (result.serviceCategories ?? []).join(', '),
        })
      })
      .catch((error) => {
        if (active) setErrorMessage(error.response?.data?.message ?? 'Could not load your professional profile.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  function updateProfileField(event) {
    const { name, value } = event.target
    setProfileDraft((current) => ({ ...current, [name]: value }))
  }

  async function handleProfileSave(event) {
    event.preventDefault()
    if (!profileDraft) return
    setErrorMessage('')
    setSavingProfile(true)
    try {
      const updated = await updateMyProfile({
        ...profileDraft,
        latitude: Number(profileDraft.latitude),
        longitude: Number(profileDraft.longitude),
        avatarUrl: profileDraft.avatarUrl.trim() || null,
        serviceCategories: profileDraft.serviceCategories
          .split(',')
          .map((category) => category.trim())
          .filter(Boolean),
      })
      setProfile(updated)
      setProfileDraft({
        businessName: updated.businessName ?? '',
        bio: updated.bio ?? '',
        speciality: updated.speciality ?? '',
        city: updated.city ?? '',
        address: updated.address ?? '',
        latitude: updated.latitude ?? 0,
        longitude: updated.longitude ?? 0,
        avatarUrl: updated.avatarUrl ?? '',
        serviceCategories: (updated.serviceCategories ?? []).join(', '),
      })
      notify.success('Your studio profile has been saved.')
    } catch (error) {
      notify.error(error.response?.data?.message ?? 'Could not save your studio profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  function startServiceEdit(service) {
    setEditingServiceId(service.id)
    setShowServiceForm(true)
    setServiceDraft({
      name: service.name ?? '',
      description: service.description ?? '',
      category: service.category ?? '',
      price: String(service.price ?? ''),
      durationMinutes: String(service.durationMinutes ?? 60),
    })
  }

  function resetServiceForm() {
    setEditingServiceId(null)
    setServiceDraft(emptyService)
    setShowServiceForm(false)
  }

  async function handleServiceSave(event) {
    event.preventDefault()
    setErrorMessage('')
    setSavingService(true)
    const service = {
      ...serviceDraft,
      price: Number(serviceDraft.price),
      durationMinutes: Number(serviceDraft.durationMinutes),
    }
    try {
      if (editingServiceId !== null) {
        await updateService(editingServiceId, service)
      } else {
        await addService(service)
      }
      await loadProfile()
      notify.success(editingServiceId !== null ? 'Service details updated.' : 'Service added to your profile.')
      resetServiceForm()
    } catch (error) {
      notify.error(error.response?.data?.message ?? 'Could not save this service.')
    } finally {
      setSavingService(false)
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

    setErrorMessage('')
    setUploading(true)
    try {
      const result = await uploadAvatar(image)
      setProfile((current) => ({ ...current, avatarUrl: result.avatarUrl }))
      setProfileDraft((current) => ({ ...current, avatarUrl: result.avatarUrl }))
      updateProfile({ avatarUrl: result.avatarUrl })
      notify.success('Your studio profile photo has been updated.')
    } catch (error) {
      notify.error(error.response?.data?.message ?? 'Could not upload your profile photo.')
    } finally {
      setUploading(false)
    }
  }

  async function handleImageUpload(event) {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (!files.length) return

    const invalidFile = files.find((file) =>
      !['image/jpeg', 'image/png'].includes(file.type) || file.size > 5 * 1024 * 1024 || file.size === 0,
    )
    if (invalidFile) {
      notify.error('Choose JPEG or PNG images smaller than 5 MB each.')
      return
    }

    setErrorMessage('')
    setUploading(true)
    let uploadedCount = 0
    let uploadError = ''
    try {
      for (const file of files) {
        try {
          await uploadPortfolioImage(file)
          uploadedCount += 1
        } catch (error) {
          uploadError = error.response?.data?.message ?? `Could not upload ${file.name}.`
          break
        }
      }
      if (uploadedCount > 0) {
        await loadProfile()
        notify.success(`${uploadedCount} portfolio photo${uploadedCount === 1 ? '' : 's'} uploaded.`)
      }
      if (uploadError) {
        notify[uploadedCount ? 'warning' : 'error'](
          uploadedCount ? `${uploadError} ${uploadedCount} photo${uploadedCount === 1 ? '' : 's'} uploaded successfully.` : uploadError,
        )
      }
    } catch (error) {
      notify.error(error.response?.data?.message ?? 'Your portfolio was updated, but the latest photos could not be loaded.')
    } finally {
      setUploading(false)
    }
  }

  async function handleServiceImagesUpload(service, event) {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (!files.length) return

    const validFiles = files.every((file) =>
      ['image/jpeg', 'image/png'].includes(file.type)
      && file.size > 0
      && file.size <= 5 * 1024 * 1024,
    )
    if (!validFiles) {
      notify.error('Choose JPEG or PNG images smaller than 5 MB each.')
      return
    }
    if (files.length + (service.images?.length ?? 0) > 10) {
      notify.error('A service can have up to 10 photos.')
      return
    }

    setUploadingServiceId(service.id)
    let uploadedCount = 0
    let uploadError = ''
    try {
      for (const file of files) {
        try {
          await uploadServiceImage(service.id, file)
          uploadedCount += 1
        } catch (error) {
          uploadError = error.response?.data?.message ?? `Could not upload ${file.name}.`
          break
        }
      }
      if (uploadedCount > 0) {
        await loadProfile()
        notify.success(`${uploadedCount} photo${uploadedCount === 1 ? '' : 's'} added to ${service.name}.`)
      }
      if (uploadError) {
        notify[uploadedCount ? 'warning' : 'error'](
          uploadedCount ? `${uploadError} ${uploadedCount} photo${uploadedCount === 1 ? '' : 's'} uploaded successfully.` : uploadError,
        )
      }
    } catch (error) {
      notify.error(error.response?.data?.message ?? `Could not refresh photos for ${service.name}.`)
    } finally {
      setUploadingServiceId(null)
    }
  }

  async function handleVerificationSubmit() {
    setErrorMessage('')
    setSubmittingVerification(true)
    try {
      await submitForVerification()
      await loadProfile()
      notify.success('Your profile has been submitted for verification.')
    } catch (error) {
      notify.error(error.response?.data?.message ?? 'Could not submit your profile for verification.')
    } finally {
      setSubmittingVerification(false)
    }
  }

  if (loading) return <div className="dashboard-page" role="status">Loading your studio…</div>

  const services = profile?.services ?? []
  const portfolioImages = profile?.portfolioImages ?? []

  return (
    <div className="dashboard-page dashboard-studio-page">
      <header className="dashboard-hero dashboard-studio-hero">
        <div className="dashboard-hero-copy">
          <span className="dashboard-eyebrow">YOUR PROFESSIONAL SPACE</span>
          <h1 className="font-headline">Build your studio profile</h1>
          <p>Tell clients what makes your work special. Add your services, pricing and portfolio photos.</p>
          <div className="studio-hero-actions">
            {profile && <Link className="btn btn-light" to={`/artist/${profile.id}`}>Preview public profile</Link>}
            <span className="studio-status-pill">
              {profile ? verificationStatus(profile.verificationStatus) : 'Profile unavailable'}
            </span>
          </div>
        </div>
        <div className="dashboard-hero-decoration dashboard-hero-decoration--studio" aria-hidden="true">✳</div>
      </header>

      {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}
      {!profile || !profileDraft ? (
        <div className="dashboard-panel">
          <h2 className="h5">Studio profile not available</h2>
          <p className="mb-0">We couldn’t find a professional profile for {user?.email ?? 'this account'}.</p>
        </div>
      ) : (
        <>
          <section className="dashboard-panel mb-4" aria-labelledby="studio-profile-heading">
            <div className="dashboard-section-title">
              <div>
                <span className="dashboard-eyebrow">MAKE IT YOURS</span>
                <h2 id="studio-profile-heading">Studio profile</h2>
                <p>Your business details appear on your public profile.</p>
              </div>
              <span className="material-symbols-outlined dashboard-section-icon" aria-hidden="true">storefront</span>
            </div>
            <form onSubmit={handleProfileSave}>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="studio-business-name">Business name</label>
                  <input className="form-control" id="studio-business-name" name="businessName" maxLength="150" required value={profileDraft.businessName} onChange={updateProfileField} />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="studio-speciality">Speciality</label>
                  <input className="form-control" id="studio-speciality" name="speciality" maxLength="150" value={profileDraft.speciality} onChange={updateProfileField} placeholder="e.g. Bridal makeup artist" />
                </div>
                <div className="col-12">
                  <label className="form-label" htmlFor="studio-bio">About your studio</label>
                  <textarea className="form-control" id="studio-bio" name="bio" rows="2" maxLength="2000" value={profileDraft.bio} onChange={updateProfileField} placeholder="Share your experience, approach and what clients can expect." />
                  <div className="form-text text-end">{profileDraft.bio.length}/2000</div>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="studio-city">City</label>
                  <input className="form-control" id="studio-city" name="city" maxLength="100" value={profileDraft.city} onChange={updateProfileField} />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="studio-address">Studio address</label>
                  <input className="form-control" id="studio-address" name="address" maxLength="300" value={profileDraft.address} onChange={updateProfileField} />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="studio-categories">Service categories</label>
                  <input className="form-control" id="studio-categories" name="serviceCategories" maxLength="1200" value={profileDraft.serviceCategories} onChange={updateProfileField} placeholder="Makeup, Hair, Bridal" />
                  <div className="form-text">Separate categories with commas.</div>
                </div>
                <div className="col-12">
                  <label className="form-label d-block" htmlFor="studio-avatar-upload">Studio profile photo</label>
                  <div className="studio-avatar-uploader">
                    {profile.avatarUrl ? (
                      <img className="studio-avatar-preview" src={getAssetUrl(profile.avatarUrl)} alt={`${profile.businessName} profile`} />
                    ) : (
                      <span className="studio-avatar-placeholder material-symbols-outlined" aria-hidden="true">storefront</span>
                    )}
                    <div>
                      <strong>Make your studio recognizable</strong>
                      <p className="small text-on-surface-variant mb-2">JPEG or PNG, up to 5 MB. This photo appears with your public profile.</p>
                      <label className="btn btn-sm btn-outline-primary mb-0" htmlFor="studio-avatar-upload">
                        <span className="material-symbols-outlined align-middle" aria-hidden="true">upload</span>
                        {uploading ? 'Uploading…' : profile.avatarUrl ? 'Replace photo' : 'Upload photo'}
                      </label>
                      <input id="studio-avatar-upload" className="visually-hidden" type="file" accept="image/jpeg,image/png" disabled={uploading} onChange={handleAvatarUpload} />
                    </div>
                  </div>
                </div>
              </div>
              <button className="btn btn-primary mt-4" type="submit" disabled={savingProfile}>
                {savingProfile ? 'Saving profile…' : 'Save studio profile'}
              </button>
            </form>
          </section>

          <section className="dashboard-panel mb-4" aria-labelledby="studio-services-heading">
            <div className="dashboard-section-title">
              <div>
                <span className="dashboard-eyebrow">YOUR OFFERINGS</span>
                <h2 id="studio-services-heading">Services &amp; pricing</h2>
                <p>Give every service clear details and up to 10 photos so clients know what to expect.</p>
              </div>
              <div className="studio-services-heading-actions">
                <button
                  className="btn btn-sm btn-primary"
                  type="button"
                  onClick={() => {
                    if (showServiceForm) resetServiceForm()
                    else setShowServiceForm(true)
                  }}
                >
                  <span className="material-symbols-outlined align-middle" aria-hidden="true">{showServiceForm ? 'close' : 'add'}</span>
                  {showServiceForm ? 'Close form' : 'Add a service'}
                </button>
                <span className="material-symbols-outlined dashboard-section-icon" aria-hidden="true">spa</span>
              </div>
            </div>
            {services.length === 0 ? (
              <div className="studio-empty-state">
                <span className="material-symbols-outlined" aria-hidden="true">inventory_2</span>
                <p className="mb-0">Your services will appear here. Add your first service below.</p>
              </div>
            ) : (
              <div className="studio-service-list">
                {services.map((service) => (
                  <article className="studio-service-card" key={service.id}>
                    <div className="studio-service-icon"><span className="material-symbols-outlined" aria-hidden="true">auto_awesome</span></div>
                    <div className="studio-service-info">
                      <div className="d-flex flex-wrap align-items-center gap-2">
                        <h3>{service.name}</h3>
                        <span className="studio-category-tag">{service.category}</span>
                      </div>
                      <p>{service.description || 'Add a description to help clients understand what this service includes.'}</p>
                      <strong>{service.price} <span>· {service.durationMinutes} minutes</span></strong>
                      {service.images?.length > 0 && (
                        <div className="studio-service-gallery">
                          {service.images.map((image, index) => (
                            <img key={`${image}-${index}`} src={getAssetUrl(image)} alt={`${service.name} example ${index + 1}`} />
                          ))}
                        </div>
                      )}
                      <div className="studio-service-photo-actions">
                        <label className="btn btn-sm btn-outline-primary studio-service-photo-button">
                          <span className="material-symbols-outlined" aria-hidden="true">add_photo_alternate</span>
                          {uploadingServiceId === service.id ? 'Uploading…' : 'Add photos'}
                          <input
                            className="visually-hidden"
                            type="file"
                            accept="image/jpeg,image/png"
                            multiple
                            disabled={uploadingServiceId !== null || (service.images?.length ?? 0) >= 10}
                            onChange={(event) => handleServiceImagesUpload(service, event)}
                          />
                        </label>
                        <span className="studio-service-photo-count">{service.images?.length ?? 0}/10</span>
                      </div>
                    </div>
                    <button className="btn btn-sm btn-outline-primary align-self-start" type="button" onClick={() => startServiceEdit(service)}>Edit</button>
                  </article>
                ))}
              </div>
            )}

            {showServiceForm && (
              <form className="studio-service-form" onSubmit={handleServiceSave}>
                <div className="studio-service-form-heading">
                  <h3>{editingServiceId !== null ? 'Edit service' : 'New service'}</h3>
                  <span>Name, price and appointment length are shown to clients.</span>
                </div>
                <div className="row g-2">
                  <div className="col-12 col-md-6 col-xl-3">
                    <label className="form-label" htmlFor="service-name">Service name</label>
                    <input className="form-control" id="service-name" maxLength="150" required value={serviceDraft.name} onChange={(event) => setServiceDraft((current) => ({ ...current, name: event.target.value }))} />
                  </div>
                  <div className="col-12 col-md-6 col-xl-3">
                    <label className="form-label" htmlFor="service-category">Category</label>
                    <input className="form-control" id="service-category" maxLength="100" required value={serviceDraft.category} onChange={(event) => setServiceDraft((current) => ({ ...current, category: event.target.value }))} />
                  </div>
                  <div className="col-6 col-md-3 col-xl-2">
                    <label className="form-label" htmlFor="service-price">Price</label>
                    <input className="form-control" id="service-price" type="number" min="0.01" max="99999999.99" step="0.01" required value={serviceDraft.price} onChange={(event) => setServiceDraft((current) => ({ ...current, price: event.target.value }))} />
                  </div>
                  <div className="col-6 col-md-3 col-xl-2">
                    <label className="form-label" htmlFor="service-duration">Duration (minutes)</label>
                    <input className="form-control" id="service-duration" type="number" min="1" max="1439" required value={serviceDraft.durationMinutes} onChange={(event) => setServiceDraft((current) => ({ ...current, durationMinutes: event.target.value }))} />
                  </div>
                  <div className="col-12 col-xl-2 studio-service-form-submit">
                    <button className="btn btn-primary" type="submit" disabled={savingService}>
                      {savingService ? 'Saving…' : editingServiceId !== null ? 'Save changes' : 'Add service'}
                    </button>
                    <button className="btn btn-outline-secondary" type="button" onClick={resetServiceForm}>Cancel</button>
                  </div>
                  <div className="col-12">
                    <label className="form-label" htmlFor="service-description">Service details <span className="text-on-surface-variant fw-normal">(optional)</span></label>
                    <textarea className="form-control" id="service-description" rows="2" maxLength="2000" value={serviceDraft.description} onChange={(event) => setServiceDraft((current) => ({ ...current, description: event.target.value }))} placeholder="Describe what clients can expect." />
                  </div>
                </div>
              </form>
            )}
          </section>

          <section className="dashboard-panel" aria-labelledby="studio-portfolio-heading">
            <div className="dashboard-section-title">
              <div>
                <span className="dashboard-eyebrow">SHOW YOUR WORK</span>
                <h2 id="studio-portfolio-heading">Portfolio photos</h2>
                <p>Upload JPEG or PNG examples of your work (up to 5 MB each).</p>
              </div>
              <span className="material-symbols-outlined dashboard-section-icon" aria-hidden="true">photo_library</span>
            </div>
            <label className="studio-upload-dropzone" htmlFor="studio-portfolio-upload">
              <span className="material-symbols-outlined" aria-hidden="true">add_photo_alternate</span>
              <strong>{uploading ? 'Uploading…' : 'Add portfolio photos'}</strong>
              <span>JPEG or PNG · up to 5 MB each</span>
              <input id="studio-portfolio-upload" className="visually-hidden" type="file" accept="image/jpeg,image/png" multiple disabled={uploading} onChange={handleImageUpload} />
            </label>
            {portfolioImages.length === 0 ? (
              <div className="studio-gallery-empty">Your uploaded photos will be displayed on your public profile.</div>
            ) : (
              <div className="studio-gallery-grid">
                {portfolioImages.map((image, index) => (
                  <figure className="studio-gallery-image" key={`${image}-${index}`}>
                    <img src={getAssetUrl(image)} alt={`${profile.businessName} portfolio example ${index + 1}`} />
                  </figure>
                ))}
              </div>
            )}
            {verificationStatus(profile.verificationStatus) !== 'Approved' && (
              <div className="studio-verification-note">
                <div>
                  <strong>Ready to be discovered?</strong>
                  <p className="mb-0">Submit your completed profile for review. It becomes publicly visible after approval.</p>
                </div>
                <button className="btn btn-outline-primary text-nowrap" type="button" onClick={handleVerificationSubmit} disabled={submittingVerification}>
                  {submittingVerification ? 'Submitting…' : 'Submit for verification'}
                </button>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
