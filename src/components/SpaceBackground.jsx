import { useEffect, useRef } from 'react'

export default function SpaceBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let rafId
    let W = window.innerWidth
    let H = window.innerHeight

    canvas.width = W
    canvas.height = H

    const resize = () => {
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = W
      canvas.height = H
      initStars()
    }
    window.addEventListener('resize', resize)

    // ── Stars ──
    const NUM_STARS = 180
    let stars = []

    function initStars() {
      stars = Array.from({ length: NUM_STARS }, () => makestar())
    }

    function makestar() {
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.8 + 0.4,
        alpha: Math.random() * 0.6 + 0.4,
        twinkleSpeed: 0.008 + Math.random() * 0.015,
        twinkleDir: Math.random() > 0.5 ? 1 : -1,
        color: pickStarColor(),
      }
    }

    function pickStarColor() {
      const colors = ['255,255,255', '200,220,255', '255,240,200', '180,180,255', '255,200,200']
      return colors[Math.floor(Math.random() * colors.length)]
    }

    // ── Comets ──
    const MAX_COMETS = 4
    let comets = []

    function makeComet() {
      const angle = (Math.random() * 40 + 10) * (Math.PI / 180) // 10–50 deg downward
      const speed = 6 + Math.random() * 8
      return {
        x: Math.random() * W * 1.2 - W * 0.1,
        y: -20 - Math.random() * 100,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        len: 120 + Math.random() * 180,
        width: 1.5 + Math.random() * 2,
        alpha: 0.9 + Math.random() * 0.1,
        color: pickCometColor(),
        trail: [],
        maxTrail: 28,
        dead: false,
      }
    }

    function pickCometColor() {
      const colors = [
        '255,255,255',
        '180,200,255',
        '255,220,100',
        '200,255,255',
        '255,180,255',
      ]
      return colors[Math.floor(Math.random() * colors.length)]
    }

    // Spawn first comets staggered
    setTimeout(() => comets.push(makeComet()), 500)
    setTimeout(() => comets.push(makeComet()), 2000)
    setTimeout(() => comets.push(makeComet()), 4000)

    // ── Nebula blobs (static, drawn once) ──
    const nebulas = Array.from({ length: 5 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 80 + Math.random() * 160,
      color: pickNebulaColor(),
      alpha: 0.03 + Math.random() * 0.04,
    }))

    function pickNebulaColor() {
      const colors = ['26,26,180', '100,0,180', '0,80,180', '180,0,100', '0,120,100']
      return colors[Math.floor(Math.random() * colors.length)]
    }

    // ── Draw ──
    function draw(ts) {
      ctx.clearRect(0, 0, W, H)

      // Background gradient
      const bg = ctx.createRadialGradient(W / 2, 0, 0, W / 2, H / 2, H)
      bg.addColorStop(0, '#0d0d2e')
      bg.addColorStop(1, '#000005')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      // Nebulas
      nebulas.forEach(n => {
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r)
        g.addColorStop(0, `rgba(${n.color},${n.alpha})`)
        g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fill()
      })

      // Stars
      stars.forEach(s => {
        s.alpha += s.twinkleSpeed * s.twinkleDir
        if (s.alpha >= 1)   { s.alpha = 1;   s.twinkleDir = -1 }
        if (s.alpha <= 0.2) { s.alpha = 0.2; s.twinkleDir = 1  }

        // Glow
        const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4)
        glow.addColorStop(0, `rgba(${s.color},${s.alpha})`)
        glow.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2)
        ctx.fill()

        // Core
        ctx.fillStyle = `rgba(${s.color},${Math.min(1, s.alpha + 0.3)})`
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
      })

      // Comets
      comets.forEach(c => {
        // Move
        c.x += c.vx
        c.y += c.vy
        c.trail.unshift({ x: c.x, y: c.y })
        if (c.trail.length > c.maxTrail) c.trail.pop()

        // Draw trail
        for (let i = 1; i < c.trail.length; i++) {
          const t = 1 - i / c.trail.length
          const w = c.width * t
          ctx.beginPath()
          ctx.moveTo(c.trail[i - 1].x, c.trail[i - 1].y)
          ctx.lineTo(c.trail[i].x, c.trail[i].y)
          ctx.strokeStyle = `rgba(${c.color},${t * c.alpha * 0.9})`
          ctx.lineWidth = w
          ctx.lineCap = 'round'
          ctx.stroke()
        }

        // Draw head glow
        const headGlow = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.width * 5)
        headGlow.addColorStop(0, `rgba(${c.color},0.9)`)
        headGlow.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = headGlow
        ctx.beginPath()
        ctx.arc(c.x, c.y, c.width * 5, 0, Math.PI * 2)
        ctx.fill()

        // Sparkle particles at head
        if (Math.random() > 0.5) {
          for (let p = 0; p < 2; p++) {
            const px = c.x + (Math.random() - 0.5) * 8
            const py = c.y + (Math.random() - 0.5) * 8
            ctx.fillStyle = `rgba(${c.color},${Math.random() * 0.6})`
            ctx.beginPath()
            ctx.arc(px, py, Math.random() * 1.5, 0, Math.PI * 2)
            ctx.fill()
          }
        }

        // Mark dead if off screen
        if (c.x > W + 200 || c.y > H + 200) c.dead = true
      })

      // Remove dead comets and spawn new ones
      comets = comets.filter(c => !c.dead)
      if (comets.length < MAX_COMETS && Math.random() < 0.004) {
        comets.push(makeComet())
      }

      rafId = requestAnimationFrame(draw)
    }

    initStars()
    rafId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    />
  )
}
