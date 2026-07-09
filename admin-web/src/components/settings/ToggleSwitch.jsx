export default function ToggleSwitch({ checked, label, onChange }) {
  return (
    <button
      aria-checked={checked}
      aria-label={label}
      className={checked ? 'settings-toggle is-on' : 'settings-toggle'}
      onClick={() => onChange(!checked)}
      role="switch"
      type="button"
    >
      <span />
    </button>
  )
}
