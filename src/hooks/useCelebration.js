import { useCallback, useRef } from 'react'

/**
 * useCelebration()
 * Returns: triggerCelebration(containerEl)
 *
 * Creates CSS-only confetti + camera flash directly on a DOM node.
 * Zero dependencies — no canvas, no libraries.
 */

const COLORS = ['#E31836', '#ffffff', '#000000', '#c01430', '#ff4d6d', '#f9fafb']
const SHAPES = ['circle', 'rect', 'line']

function randomBetween(a, b) {
  return a + Math.random() * (b - a)
}

function createParticle(container) {
  const el = document.createElement('div')
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)]
  const color = COLORS[Math.floor(Math.random() * COLORS.length)]
  const size  = randomBetween(5, 12)
  const startX = randomBetween(20, 80)   // % from left
  const angle  = randomBetween(-30, 30)
  const distance = randomBetween(120, 280)
  const duration = randomBetween(700, 1200)
  const delay    = randomBetween(0, 200)

  Object.assign(el.style, {
    position:     'absolute',
    pointerEvents:'none',
    zIndex:       '100',
    left:         `${startX}%`,
    bottom:       '40%',
    width:        shape === 'line' ? `${size * 0.4}px` : `${size}px`,
    height:       shape === 'line' ? `${size * 2}px`   : `${size}px`,
    borderRadius: shape === 'circle' ? '50%' : shape === 'rect' ? '2px' : '1px',
    background:   color,
    opacity:      '1',
    transition:   `transform ${duration}ms cubic-bezier(.17,.67,.45,.99) ${delay}ms,
                   opacity   ${duration * 0.6}ms ease-in ${delay + duration * 0.5}ms`,
    transform:    'translateY(0) rotate(0deg)',
    willChange:   'transform, opacity',
  })

  container.appendChild(el)

  // Trigger animation on next frame
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.style.transform = `translateY(-${distance}px) translateX(${randomBetween(-40,40)}px) rotate(${randomBetween(-360, 360)}deg)`
      el.style.opacity   = '0'
    })
  })

  setTimeout(() => el.remove(), duration + delay + 100)
}

function createFlash(container) {
  const flash = document.createElement('div')
  Object.assign(flash.style, {
    position:     'absolute',
    inset:        '0',
    background:   '#ffffff',
    opacity:      '0.85',
    zIndex:       '99',
    pointerEvents:'none',
    transition:   'opacity 300ms ease-out',
  })
  container.appendChild(flash)
  requestAnimationFrame(() => {
    requestAnimationFrame(() => { flash.style.opacity = '0' })
  })
  setTimeout(() => flash.remove(), 400)
}

export function useCelebration() {
  const celebratingRef = useRef(false)

  const trigger = useCallback((containerEl) => {
    if (celebratingRef.current || !containerEl) return
    celebratingRef.current = true

    // Camera flash
    createFlash(containerEl)

    // Confetti burst — 40 particles
    for (let i = 0; i < 40; i++) {
      createParticle(containerEl)
    }

    setTimeout(() => { celebratingRef.current = false }, 1400)
  }, [])

  return { trigger }
}