import { UserRoleBadge } from './UserBadges.jsx'

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function DetailRow({ label, value }) {
  return (
    <div className="user-drawer-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 20h4l11-11-4-4L4 16zM13.5 6.5l4 4"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  )
}

function KeyIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle
        cx="8"
        cy="15"
        fill="none"
        r="3"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="m10.2 12.8 6.8-6.8M16 6h3v3M14 8l2 2"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  )
}

function UserActionIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M15 20c0-2.2-1.8-4-4-4H7c-2.2 0-4 1.8-4 4"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <circle
        cx="9"
        cy="8"
        fill="none"
        r="4"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M18 9h4M20 7v4"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  )
}

export default function UserProfileDrawer({
  onClose,
  user,
}) {
  return (
    <div className="user-drawer-backdrop" role="presentation">
      <aside
        aria-labelledby="user-profile-title"
        aria-modal="true"
        className="user-profile-drawer"
        role="dialog"
      >
        <header className="user-drawer-header">
          <h2 id="user-profile-title">User Profile</h2>
          <button
            aria-label="Close user profile"
            className="user-drawer-close"
            onClick={onClose}
            type="button"
          >
            x
          </button>
        </header>

        <section className="user-drawer-identity">
          <span className="user-drawer-avatar">{getInitials(user.fullName)}</span>
          <strong>{user.fullName}</strong>
          <em>{user.email}</em>
          <div>
            <UserRoleBadge role={user.role} />
          </div>
        </section>

        <dl className="user-drawer-details">
          <DetailRow label="User ID" value={user.id} />
          <DetailRow label="Joined" value={user.joined} />
          <DetailRow label="Last Login" value={user.lastLogin} />
        </dl>

      </aside>
    </div>
  )
}
