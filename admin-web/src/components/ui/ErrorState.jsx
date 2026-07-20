export default function ErrorState({
  message = 'Unable to load this page. Please try again.',
  onRetry,
  title = 'Something went wrong',
}) {
  return (
    <section className="admin-error-state" role="alert">
      <strong>{title}</strong>
      <p>{message}</p>
      <button onClick={onRetry} type="button">
        Retry
      </button>
    </section>
  )
}
