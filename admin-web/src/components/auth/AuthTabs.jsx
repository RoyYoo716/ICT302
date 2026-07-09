export default function AuthTabs({ activeTab, onChange }) {
  return (
    <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
      <button
        type="button"
        className={activeTab === 'signin' ? 'auth-tab is-active' : 'auth-tab'}
        role="tab"
        aria-selected={activeTab === 'signin'}
        onClick={() => onChange('signin')}
      >
        Sign In
      </button>
      <button
        type="button"
        className={activeTab === 'register' ? 'auth-tab is-active' : 'auth-tab'}
        role="tab"
        aria-selected={activeTab === 'register'}
        onClick={() => onChange('register')}
      >
        Register
      </button>
    </div>
  )
}
