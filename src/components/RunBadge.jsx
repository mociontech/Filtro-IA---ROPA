export default function RunBadge({ color = '#111', size = 'md' }) {
  const big = size === 'lg'
  return (
    <div style={{ textAlign:'center', lineHeight:1 }}>
      <div style={{
        fontFamily:"'Bebas Neue','Arial Narrow',sans-serif",
        fontSize: big ? 36 : 22, letterSpacing: big ? 3 : 2,
        color, lineHeight:1.05,
      }}>
        RUN<br/>CDMX '26
      </div>
      <div style={{
        fontSize: big ? 11 : 9, letterSpacing:2,
        color: color==='#fff' ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.45)',
        marginTop:3, fontFamily:'Inter, system-ui', textTransform:'uppercase',
      }}>
        @ lululemon 10K
      </div>
    </div>
  )
}
