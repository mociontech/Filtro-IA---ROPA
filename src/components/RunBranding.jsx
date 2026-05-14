// RUN CDMX '26 @ lululemon 10K — bottom badge
export default function RunBranding({ dark = false }) {
  const color = dark ? '#fff' : '#111'
  return (
    <div style={{
      textAlign: 'center',
      paddingBottom: 4,
    }}>
      <div style={{
        fontFamily: "'Bebas Neue', 'Arial Narrow', sans-serif",
        fontSize: 28, letterSpacing: 3,
        color, lineHeight: 1,
      }}>
        RUN<br/>CDMX '26
      </div>
      <div style={{
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 10, letterSpacing: 2,
        color: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)',
        marginTop: 3, textTransform: 'uppercase',
      }}>
        @ lululemon 10K
      </div>
    </div>
  )
}
