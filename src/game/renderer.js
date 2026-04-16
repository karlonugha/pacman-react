import { CELL, COLS, ROWS, WALL, PELLET, POWER, GHOST_HOUSE } from './constants'

export function drawMaze(ctx, map) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = c * CELL, y = r * CELL
      const cell = map[r][c]
      if (cell === WALL) {
        ctx.fillStyle = '#1a1aff'
        ctx.fillRect(x, y, CELL, CELL)
        // Inner highlight
        ctx.strokeStyle = 'rgba(100,100,255,0.4)'
        ctx.lineWidth = 1
        ctx.strokeRect(x + 2, y + 2, CELL - 4, CELL - 4)
      } else if (cell === GHOST_HOUSE) {
        // Ghost house floor — dark pink tint, no pellets
        ctx.fillStyle = '#1a0a1a'
        ctx.fillRect(x, y, CELL, CELL)
        // Subtle grid lines to show it's a special zone
        ctx.strokeStyle = 'rgba(180,0,180,0.15)'
        ctx.lineWidth = 0.5
        ctx.strokeRect(x, y, CELL, CELL)
      } else {
        ctx.fillStyle = '#000'
        ctx.fillRect(x, y, CELL, CELL)
        if (cell === PELLET) {
          ctx.fillStyle = '#FFD700'
          ctx.shadowColor = '#FFD700'
          ctx.shadowBlur = 4
          ctx.beginPath()
          ctx.arc(x + CELL / 2, y + CELL / 2, 2.5, 0, Math.PI * 2)
          ctx.fill()
          ctx.shadowBlur = 0
        } else if (cell === POWER) {
          const pulse = 0.6 + 0.4 * Math.sin(Date.now() / 180)
          ctx.fillStyle = `rgba(255,215,0,${pulse})`
          ctx.shadowColor = '#FFD700'
          ctx.shadowBlur = 12 * pulse
          ctx.beginPath()
          ctx.arc(x + CELL / 2, y + CELL / 2, 6, 0, Math.PI * 2)
          ctx.fill()
          ctx.shadowBlur = 0
        }
      }
    }
  }
}

export function drawPacman(ctx, pacman) {
  const px = pacman.x * CELL + CELL / 2
  const py = pacman.y * CELL + CELL / 2
  const angle = Math.atan2(pacman.dy, pacman.dx || 1)
  const mouth = pacman.mouth * Math.PI

  ctx.fillStyle = '#FFD700'
  ctx.shadowColor = '#FFD700'
  ctx.shadowBlur = 12
  ctx.beginPath()
  ctx.moveTo(px, py)
  ctx.arc(px, py, CELL / 2 - 1, angle + mouth, angle + Math.PI * 2 - mouth)
  ctx.closePath()
  ctx.fill()
  ctx.shadowBlur = 0

  // Eye
  const eyeX = px + Math.cos(angle - 0.8) * 5
  const eyeY = py + Math.sin(angle - 0.8) * 5
  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.arc(eyeX, eyeY, 1.8, 0, Math.PI * 2)
  ctx.fill()
}

export function drawGhost(ctx, g, frightenTimer) {
  const gx = g.x * CELL + CELL / 2
  const gy = g.y * CELL + CELL / 2
  const r = CELL / 2 - 1

  if (g.eaten) {
    ctx.fillStyle = '#fff'
    ctx.beginPath(); ctx.arc(gx - 3, gy - 2, 3, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(gx + 3, gy - 2, 3, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#00f'
    ctx.beginPath(); ctx.arc(gx - 3, gy - 2, 1.5, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(gx + 3, gy - 2, 1.5, 0, Math.PI * 2); ctx.fill()
    return
  }

  const flash = frightenTimer < 2000 && frightenTimer > 0 && Math.floor(Date.now() / 200) % 2 === 0
  const bodyColor = g.scared ? (flash ? '#fff' : '#2121de') : g.color

  ctx.fillStyle = bodyColor
  ctx.shadowColor = g.scared ? '#2121de' : g.color
  ctx.shadowBlur = 8

  // Body
  ctx.beginPath()
  ctx.arc(gx, gy - 2, r, Math.PI, 0)
  ctx.lineTo(gx + r, gy + r)
  for (let i = 3; i >= 0; i--) {
    const wx = gx - r + (i * 2 * r / 3)
    const wy = gy + r - (i % 2 === 0 ? 5 : 0)
    ctx.lineTo(wx, wy)
  }
  ctx.closePath()
  ctx.fill()
  ctx.shadowBlur = 0

  // Eyes
  if (!g.scared) {
    ctx.fillStyle = '#fff'
    ctx.beginPath(); ctx.arc(gx - 3, gy - 4, 3.5, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(gx + 3, gy - 4, 3.5, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#00f'
    ctx.beginPath(); ctx.arc(gx - 3 + g.dx, gy - 4 + g.dy, 2, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(gx + 3 + g.dx, gy - 4 + g.dy, 2, 0, Math.PI * 2); ctx.fill()
  } else {
    ctx.fillStyle = flash ? '#f00' : '#fff'
    ctx.beginPath(); ctx.arc(gx - 3, gy - 3, 2, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(gx + 3, gy - 3, 2, 0, Math.PI * 2); ctx.fill()
  }
}

export function drawScorePopup(ctx, popups) {
  popups.forEach(p => {
    ctx.globalAlpha = p.alpha
    ctx.fillStyle = '#FFD700'
    ctx.font = 'bold 12px "Press Start 2P", monospace'
    ctx.textAlign = 'center'
    ctx.fillText(`+${p.score}`, p.x * CELL + CELL / 2, p.y * CELL - p.offset)
    ctx.globalAlpha = 1
  })
}
