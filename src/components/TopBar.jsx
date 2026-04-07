// Shared top bar — lululemon | LYNA&CO
// variant: 'light' (dark text on white) | 'dark' (white text on red/dark)
export default function TopBar({ variant = 'light', onBack, step, totalSteps }) {
  const isDark = variant === 'dark'
  const c = isDark ? '#fff' : '#111'
  const border = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)'

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 20px',
      borderBottom: `0.5px solid ${border}`,
      flexShrink: 0,
    }}>
      {/* Back button */}
      {onBack
        ? <button onClick={onBack} style={{
            background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.06)',
            border: 'none', borderRadius: '50%',
            width: 34, height: 34,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, color: c, cursor: 'pointer',
          }}>←</button>
        : <div style={{ width: 34 }} />
      }

      {/* Center — brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill={c}>
          <path d="M12 2L22 21H2L12 2ZM12 7L6 19H18L12 7Z"/>
        </svg>
        <span style={{
          fontSize: 11, fontWeight: 600, letterSpacing: 2.5,
          color: c, fontFamily: 'Inter, system-ui',
          textTransform: 'uppercase',
        }}>lululemon</span>
        <span style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.25)', fontSize: 11 }}>|</span>
        <span style={{
          fontSize: 11, fontWeight: 500, letterSpacing: 3,
          color: c, fontFamily: 'Inter, system-ui',
          textTransform: 'uppercase',
        }}>LYNA&CO</span>
      </div>

      {/* Step indicator */}
      {step
        ? <span style={{ fontSize: 10, color: isDark ? 'rgba(255,255,255,0.5)' : '#bbb', letterSpacing: 1 }}>
            {step}/{totalSteps}
          </span>
        : <div style={{ width: 34 }} />
      }
    </div>
  )
}
