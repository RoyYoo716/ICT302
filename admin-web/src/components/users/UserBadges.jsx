export function UserRoleBadge({ role }) {
  const className = role.toLowerCase().replaceAll(' ', '-')

  return <span className={`user-role-badge user-role-${className}`}>{role}</span>
}
