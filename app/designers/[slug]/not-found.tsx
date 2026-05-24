import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      padding: '40px 20px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '48px' }}>🔍</div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
        Designer not found
      </h1>
      <p style={{ color: 'var(--ink-light)', maxWidth: '380px', margin: 0, lineHeight: 1.6 }}>
        This designer profile doesn&apos;t exist or may have been removed.
      </p>
      <Link
        href="/designers"
        style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}
      >
        ← Browse all designers
      </Link>
    </div>
  )
}
