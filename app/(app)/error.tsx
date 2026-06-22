'use client'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h2 style={{ color: 'red', marginBottom: '1rem' }}>Server Error</h2>
      <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px', whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '13px' }}>
        {error.message}
        {'\n\n'}
        {error.stack}
        {'\n\nDigest: '}
        {error.digest}
      </pre>
      <button onClick={reset} style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>
        Try Again
      </button>
    </div>
  )
}
