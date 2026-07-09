export function UserRoleBadge({ role }) {
  const className = role.toLowerCase().replaceAll(' ', '-')

  return <span className={`user-role-badge user-role-${className}`}>{role}</span>
}

export function UserStatusBadge({ status }) {
  return (
    <span className={`user-status-badge user-status-${status.toLowerCase()}`}>
      {status}
    </span>
  )
}
