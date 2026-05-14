import { QRCodeSVG } from 'qrcode.react'
import useTotemStore from '../../store/useTotemStore'

export default function GoodbyeScreen() {
  const { capturedPhotoURL, reset } = useTotemStore()

  return (
    <div style={{ height:'100%', background:'#000' }}>
      <div style={{ position:'relative', height:'100%', overflow:'hidden', background:'#000' }}>
        <img
          src="/AGRADECIMIENTO.png"
          alt="Agradecimiento"
          style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
        />

        <div
          style={{
            position:'absolute',
            left:'50%',
            bottom:'20%',
            transform:'translateX(-50%)',
            width:'min(72vw, 340px)',
            minWidth:260,
            aspectRatio:'1 / 1',
            padding:16,
            borderRadius:26,
            background:'rgba(255,255,255,0.96)',
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            boxShadow:'0 20px 52px rgba(0,0,0,0.42)',
            pointerEvents:'all',
          }}
        >
          {capturedPhotoURL ? (
            <QRCodeSVG
              value={capturedPhotoURL}
              size={256}
              level="H"
              includeMargin
              style={{ width:'100%', height:'100%' }}
            />
          ) : (
            <div
              style={{
                width:'100%',
                height:'100%',
                borderRadius:12,
                background:'rgba(10, 10, 10, 0.08)',
                color:'#1b1b1b',
                display:'flex',
                alignItems:'center',
                justifyContent:'center',
                textAlign:'center',
                fontSize:'clamp(11px, 2.2vw, 14px)',
                fontWeight:600,
                padding:'0 12px',
              }}
            >
              Generando QR...
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={reset}
          aria-label="Finalizar"
          style={{
            position:'absolute',
            left:'50%',
            bottom:'9%',
            transform:'translateX(-50%)',
            background:'transparent',
            padding:0,
            pointerEvents:'all',
          }}
        >
          <img
            src="/Boton_Finalizar.png"
            alt="Boton finalizar"
            style={{
              width:'min(58vw, 235px)',
              height:'auto',
              display:'block',
            }}
          />
        </button>
      </div>
    </div>
  )
}
