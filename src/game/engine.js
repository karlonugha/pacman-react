import { COLS, ROWS, WALL, GHOST_HOUSE, PELLET, POWER, EMPTY, GHOST_COLORS, FRIGHTEN_MS, BASE_MAP } from './constants'

export function deepCopy(m) { return m.map(r => [...r]) }

export function countPellets(m) {
  let c = 0
  m.forEach(r => r.forEach(v => { if (v === PELLET || v === POWER) c++ }))
  return c
}

export function wrap(x, y) {
  if (x < 0) x = COLS - 1
  if (x >= COLS) x = 0
  if (y < 0) y = ROWS - 1
  if (y >= ROWS) y = 0
  return { x, y }
}

export function canMove(map, x, y, dx, dy) {
  const nx = x + dx, ny = y + dy
  if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) return true
  return map[ny][nx] !== WALL
}

// Pac-Man specific — also blocked by ghost house
export function canPacmanMove(map, x, y, dx, dy) {
  const nx = x + dx, ny = y + dy
  if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) return true
  const cell = map[ny][nx]
  return cell !== WALL && cell !== GHOST_HOUSE
}

export function makePacman() {
  return { x: 10, y: 16, dx: 0, dy: 0, nextDx: 0, nextDy: 0, mouth: 0.25, mouthDir: 1 }
}

export function makeGhosts() {
  return [
    { x: 9,  y: 9,  dx: 1,  dy: 0, color: GHOST_COLORS[0], name: 'Blinky', scared: false, eaten: false, homeX: 9,  homeY: 9,  exitTimer: 0   },
    { x: 10, y: 9,  dx: 0,  dy: 1, color: GHOST_COLORS[1], name: 'Pinky',  scared: false, eaten: false, homeX: 10, homeY: 9,  exitTimer: 80  },
    { x: 11, y: 9,  dx: 0,  dy: 1, color: GHOST_COLORS[2], name: 'Inky',   scared: false, eaten: false, homeX: 11, homeY: 9,  exitTimer: 160 },
    { x: 10, y: 10, dx: -1, dy: 0, color: GHOST_COLORS[3], name: 'Clyde',  scared: false, eaten: false, homeX: 10, homeY: 10, exitTimer: 240 },
  ]
}

export function stepGhost(ghost, map, pacman, frightenTimer) {
  const g = { ...ghost }
  if (g.exitTimer > 0) { g.exitTimer -= 1; return g }

  const dirs = [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }]
  const possible = dirs.filter(d => {
    if (d.dx === -g.dx && d.dy === -g.dy) return false
    return canMove(map, g.x, g.y, d.dx, d.dy)
  })

  let chosen
  if (possible.length === 0) {
    chosen = dirs.find(d => canMove(map, g.x, g.y, d.dx, d.dy)) || { dx: 0, dy: 0 }
  } else if (possible.length === 1) {
    chosen = possible[0]
  } else if (g.scared) {
    // Scared but not eaten — run away randomly
    chosen = possible[Math.floor(Math.random() * possible.length)]
  } else if (g.eaten) {
    // Eaten — head straight back home
    const tx = g.homeX, ty = g.homeY
    chosen = possible.reduce((a, b) =>
      Math.hypot(g.x + a.dx - tx, g.y + a.dy - ty) <
      Math.hypot(g.x + b.dx - tx, g.y + b.dy - ty) ? a : b
    )
  } else {
    // Normal — chase Pac-Man
    chosen = possible.reduce((a, b) =>
      Math.hypot(g.x + a.dx - pacman.x, g.y + a.dy - pacman.y) <
      Math.hypot(g.x + b.dx - pacman.x, g.y + b.dy - pacman.y) ? a : b
    )
  }

  g.dx = chosen.dx
  g.dy = chosen.dy
  const w = wrap(g.x + g.dx, g.y + g.dy)
  g.x = w.x; g.y = w.y

  // Eaten ghost reached home — fully restore
  if (g.eaten && g.x === g.homeX && g.y === g.homeY) {
    g.eaten = false
    g.scared = false
  }
  return g
}
