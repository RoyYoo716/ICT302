import { useEffect, useState } from 'react'
import { UserRoleBadge, UserStatusBadge } from '../users/UserBadges.jsx'

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validateProfile(form) {
  const errors = {}
  const fullName = form.fullName.trim()
  const email = form.email.trim()
  const phone = form.phone.trim()

  if (!fullName) {
    errors.fullName = 'Full Name is required.'
  } else if (!/^[A-Za-z .'-]+$/.test(fullName)) {
    errors.fullName = 'Use letters, spaces, dots, hyphens, or apostrophes only.'
  }

  if (!email) {
    errors.email = 'Email Address is required.'
  } else if (!isValidEmail(email)) {
    errors.email = 'Enter a valid email address.'
  }

  if (!phone) {
    errors.phone = 'Phone Number is required.'
  } else if (!/^[+\d ]{7,20}$/.test(phone)) {
    errors.phone = 'Use +, digits, and spaces only, 7 to 20 characters.'
  }

  return errors
}

function FieldDisplay({ label, value }) {
  return (
    <div className="settings-display-field">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

export default function AccountProfileCard({ message, onSave, profile }) {
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState(profile)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setForm(profile)
  }, [profile])

  function updateField(field, value) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }))
    setErrors((currentErrors) => ({ ...currentErrors, [field]: '' }))
  }

  function handleCancel() {
    setForm(profile)
    setErrors({})
    setIsEditing(false)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = validateProfile(form)

    if (Object.values(nextErrors).some(Boolean)) {
      setErrors(nextErrors)
      return
    }

    await onSave({
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
    })
    setIsEditing(false)
  }

  return (
    <section className="settings-card account-profile-card">
      <header className="settings-card-header">
        <div>
          <h2>Account Profile</h2>
          <p>Your admin login information</p>
        </div>
        <button
          className="settings-outline-button"
          onClick={isEditing ? handleCancel : () => setIsEditing(true)}
          type="button"
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </header>

      <div className="settings-profile-identity">
        <span className="settings-profile-avatar">{getInitials(profile.fullName)}</span>
        <div>
          <strong>{profile.fullName}</strong>
          <em>{profile.email}</em>
          <span>
            <UserRoleBadge role={profile.role} />
            <UserStatusBadge status={profile.status} />
          </span>
        </div>
      </div>

      {message ? <p className="settings-success-message">{message}</p> : null}

      {isEditing ? (
        <form className="settings-profile-form" onSubmit={handleSubmit}>
          <label>
            <span>Full Name</span>
            <input
              onChange={(event) => updateField('fullName', event.target.value)}
              type="text"
              value={form.fullName}
            />
            {errors.fullName ? <small>{errors.fullName}</small> : null}
          </label>

          <label>
            <span>Email Address</span>
            <input
              onChange={(event) => updateField('email', event.target.value)}
              type="email"
              value={form.email}
            />
            {errors.email ? <small>{errors.email}</small> : null}
          </label>

          <label>
            <span>Phone Number</span>
            <input
              onChange={(event) => updateField('phone', event.target.value)}
              type="text"
              value={form.phone}
            />
            {errors.phone ? <small>{errors.phone}</small> : null}
          </label>

          <button className="settings-primary-button" type="submit">
            Save Changes
          </button>
        </form>
      ) : (
        <div className="settings-profile-fields">
          <FieldDisplay label="Full Name" value={profile.fullName} />
          <FieldDisplay label="Email Address" value={profile.email} />
          <FieldDisplay label="Phone Number" value={profile.phone} />
        </div>
      )}
    </section>
  )
}
