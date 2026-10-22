import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAssetUrl } from '../api/assets'
import {
  addService,
  getMyProfile,
  submitForVerification,
  updateMyProfile,
  updateService,
  uploadPortfolioImage,
} from '../api/professionalProfile'
import { useAuth } from '../auth/useAuth'
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
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [profileDraft, setProfileDraft] = useState(null)
  const [serviceDraft, setServiceDraft] = useState(emptyService)
  const [editingServiceId, setEditingServiceId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingService, setSavingService] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [submittingVerification, setSubmittingVerification] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [notice, setNotice] = useState('')

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
    setNotice('')
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
      setNotice('Your studio profile has been saved.')
    } catch (error) {
      setErrorMessage(error.response?.data?.message ?? 'Could not save your studio profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  function startServiceEdit(service) {
    setEditingServiceId(service.id)
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
  }

  async function handleServiceSave(event) {
    event.preventDefault()
    setErrorMessage('')
    setNotice('')
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
      setNotice(editingServiceId !== null ? 'Service details updated.' : 'Service added to your profile.')
      resetServiceForm()
    } catch (error) {
      setErrorMessage(error.response?.data?.message ?? 'Could not save this service.')
    } finally {
      setSavingService(false)
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
      setErrorMessage('Choose JPEG or PNG images smaller than 5 MB each.')
      return
    }

    setErrorMessage('')
    setNotice('')
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
        setNotice(`${uploadedCount} portfolio photo${uploadedCount === 1 ? '' : 's'} uploaded.`)
      }
      if (uploadError) {
        setErrorMessage(uploadedCount ? `${uploadError} ${uploadedCount} photo${uploadedCount === 1 ? '' : 's'} uploaded successfully.` : uploadError)
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message ?? 'Your portfolio was updated, but the latest photos could not be loaded.')
    } finally {
      setUploading(false)
    }
  }

  async function handleVerificationSubmit() {
    setErrorMessage('')
    setNotice('')
    setSubmittingVerification(true)
    try {
      await submitForVerification()
      await loadProfile()
      setNotice('Your profile has been submitted for verification.')
    } catch (error) {
      setErrorMessage(error.response?.data?.message ?? 'Could not submit your profile for verification.')
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
      {notice && <div className="alert alert-success" role="status">{notice}</div>}
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
                  <textarea className="form-control" id="studio-bio" name="bio" rows="4" maxLength="2000" value={profileDraft.bio} onChange={updateProfileField} placeholder="Share your experience, approach and what clients can expect." />
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
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="studio-avatar-url">Profile image URL</label>
                  <input className="form-control" id="studio-avatar-url" name="avatarUrl" type="url" maxLength="500" value={profileDraft.avatarUrl} onChange={updateProfileField} placeholder="https://…" />
                  <div className="form-text">Use a direct image URL. Upload gallery photos below.</div>
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
                <p>Give every service a clear description so clients know what to expect.</p>
              </div>
              <span className="material-symbols-outlined dashboard-section-icon" aria-hidden="true">spa</span>
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
                    </div>
                    <button className="btn btn-sm btn-outline-primary align-self-start" type="button" onClick={() => startServiceEdit(service)}>Edit</button>
                  </article>
                ))}
              </div>
            )}

            <form className="studio-service-form" onSubmit={handleServiceSave}>
              <h3>{editingServiceId !== null ? 'Edit service' : 'Add a service'}</h3>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="service-name">Service name</label>
                  <input className="form-control" id="service-name" maxLength="150" required value={serviceDraft.name} onChange={(event) => setServiceDraft((current) => ({ ...current, name: event.target.value }))} />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="service-category">Category</label>
                  <input className="form-control" id="service-category" maxLength="100" required value={serviceDraft.category} onChange={(event) => setServiceDraft((current) => ({ ...current, category: event.target.value }))} />
                </div>
                <div className="col-12">
                  <label className="form-label" htmlFor="service-description">Full service details</label>
                  <textarea className="form-control" id="service-description" rows="3" maxLength="2000" value={serviceDraft.description} onChange={(event) => setServiceDraft((current) => ({ ...current, description: event.target.value }))} placeholder="Describe the steps, products, preparation and results clients can expect." />
                </div>
                <div className="col-6 col-md-4">
                  <label className="form-label" htmlFor="service-price">Price</label>
                  <input className="form-control" id="service-price" type="number" min="0.01" max="99999999.99" step="0.01" required value={serviceDraft.price} onChange={(event) => setServiceDraft((current) => ({ ...current, price: event.target.value }))} />
                </div>
                <div className="col-6 col-md-4">
                  <label className="form-label" htmlFor="service-duration">Duration (minutes)</label>
                  <input className="form-control" id="service-duration" type="number" min="1" max="1439" required value={serviceDraft.durationMinutes} onChange={(event) => setServiceDraft((current) => ({ ...current, durationMinutes: event.target.value }))} />
                </div>
              </div>
              <div className="d-flex flex-wrap gap-2 mt-3">
                <button className="btn btn-primary" type="submit" disabled={savingService}>
                  {savingService ? 'Saving service…' : editingServiceId !== null ? 'Save service changes' : 'Add service'}
                </button>
                {editingServiceId !== null && <button className="btn btn-outline-secondary" type="button" onClick={resetServiceForm}>Cancel</button>}
              </div>
            </form>
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
              <strong>{uploading ? 'Uploading your photos…' : 'Choose portfolio photos'}</strong>
              <span>Multiple images welcome · JPEG or PNG</span>
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
