const LEVEL_COLOR = {
  info: '#6dd6ff',
  success: '#7dffaf',
  warn: '#ffd166',
  error: '#ff6b6b',
}

function formatDetail(detail) {
  if (!detail) return ''

  if (typeof detail === 'string') return detail

  try {
    return JSON.stringify(detail, null, 2)
  } catch {
    return String(detail)
  }
}

export default function DatahubLogPanel({ logs, visible }) {
  if (!visible) return null

  return (
    <section
      style={{
        position: 'absolute',
        inset: '18px 18px auto auto',
        zIndex: 50,
        width: 'min(520px, calc(100vw - 36px))',
        maxHeight: 'min(72vh, 620px)',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.18)',
        borderRadius: 8,
        background: 'rgba(12, 12, 14, 0.94)',
        color: '#fff',
        boxShadow: '0 20px 54px rgba(0,0,0,0.38)',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <div>
          <strong style={{ display: 'block', fontSize: 14, letterSpacing: 0.4 }}>
            Datahub log
          </strong>
          <span style={{ color: 'rgba(255,255,255,0.58)', fontSize: 11 }}>
            Presiona L para ocultar
          </span>
        </div>
        <span
          style={{
            minWidth: 28,
            height: 24,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 6,
            background: 'rgba(255,255,255,0.12)',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {logs.length}
        </span>
      </header>

      <div style={{ maxHeight: 'calc(min(72vh, 620px) - 62px)', overflowY: 'auto' }}>
        {logs.length === 0 ? (
          <p style={{ margin: 0, padding: 16, color: 'rgba(255,255,255,0.64)', fontSize: 13 }}>
            Sin logs todavia.
          </p>
        ) : (
          logs.map(log => (
            <article
              key={log.id}
              style={{
                padding: '12px 14px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                  marginBottom: 7,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: LEVEL_COLOR[log.level] || LEVEL_COLOR.info,
                    flexShrink: 0,
                  }}
                />
                <strong style={{ fontSize: 12, color: LEVEL_COLOR[log.level] || LEVEL_COLOR.info }}>
                  {log.level.toUpperCase()}
                </strong>
                <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.48)', fontSize: 11 }}>
                  {log.createdAt}
                </span>
              </div>
              <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.35 }}>
                {log.message}
              </p>
              {log.detail && (
                <pre
                  style={{
                    margin: 0,
                    padding: 10,
                    maxHeight: 220,
                    overflow: 'auto',
                    borderRadius: 6,
                    background: 'rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.86)',
                    fontSize: 11,
                    lineHeight: 1.4,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {formatDetail(log.detail)}
                </pre>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  )
}
