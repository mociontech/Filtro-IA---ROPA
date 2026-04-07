// lululemon | LYNA&CO logo bar — used at top of every screen
export default function BrandLogo({ dark = false }) {
  const color = dark ? '#fff' : '#111'
  const border = dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)'
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 10, padding: '14px 20px',
      borderBottom: `0.5px solid ${border}`,
      flexShrink: 0,
    }}>
      {/* Lululemon A-frame icon */}
      <svg width="18" height="18" viewBox="0 0 24 24" fill={color}>
        <path d="M12 2L22 20H2L12 2ZM12 7L6.5 18H17.5L12 7Z"/>
      </svg>
      <span style={{
        fontSize: 12, fontWeight: 600, letterSpacing: 2,
        color, fontFamily: 'Inter, system-ui, sans-serif',
        textTransform: 'uppercase',
      }}>
        lululemon
      </span>
      <span style={{ color: dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)', fontSize: 12 }}>|</span>
      <span style={{
        fontSize: 12, fontWeight: 500, letterSpacing: 3,
        color, fontFamily: 'Inter, system-ui, sans-serif',
        textTransform: 'uppercase',
      }}>
        LYNA&amp;CO
      </span>
    </div>
  )
}
