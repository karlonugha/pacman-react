import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/useGameStore'
import { BASE_MAP, W, H, PELLET, POWER, FRIGHTEN_MS } from '../game/constants'
import { deepCopy, countPellets, wrap, canMove, canPacmanMove, makePacman, makeGhosts, stepGhost } from '../game/engine'
import { drawMaze, drawPacman, drawGhost, drawScorePopup } from '../game/renderer'
import {
  playEatPellet, playEatPowerPellet, playEatGhost,
  playDeath, playLevelUp, playStart,
  startSiren, stopSiren, startScaredMusic, stopScaredMusic
} from '../game/sounds'

export default function GameCanvas() {
  const canvasRef = useRef(null)

  // All mutable game state lives here — never stale in the loop
  const stateRef = useRef({
    map: deepCopy(BASE_MAP),
    pacman: makePacman(),
    ghosts: makeGhosts(),
    pellets: countPellets(BASE_MAP),
    pacAcc: 0,
    ghostAcc: 0,
    popups: [],
    lastTime: 0,
    frightenTimer: 0,   // ← owned here, not in Zustand
  })

  const { gameState, level, setGameState, addScore, loseLife, nextLevel, setFrightenTimer } = useGameStore()

  const gameStateRef = useRef(gameState)
  const prevGameStateRef = useRef(gameState)
  const levelRef = useRef(level)
  const prevLevelRef = useRef(level)

  useEffect(() => { gameStateRef.current = gameState }, [gameState])
  useEffect(() => { levelRef.current = level }, [level])

  // Handle state transitions
  useEffect(() => {
    const prev = prevGameStateRef.current
    const curr = gameState
    prevGameStateRef.current = curr
    const s = stateRef.current

    if (curr === 'playing') {
      const levelChanged = level !== prevLevelRef.current
      prevLevelRef.current = level

      if (prev === 'menu' || prev === 'gameover') {
        // Full reset
        s.map = deepCopy(BASE_MAP)
        s.pacman = makePacman()
        s.ghosts = makeGhosts()
        s.pellets = countPellets(BASE_MAP)
        s.pacAcc = 0; s.ghostAcc = 0; s.popups = []
        s.frightenTimer = 0
        setFrightenTimer(0)
        playStart()
        setTimeout(() => startSiren(level), 1000)
      } else if (prev === 'levelup' || levelChanged) {
        // New level
        s.map = deepCopy(BASE_MAP)
        s.pacman = makePacman()
        s.ghosts = makeGhosts()
        s.pellets = countPellets(BASE_MAP)
        s.pacAcc = 0; s.ghostAcc = 0; s.popups = []
        s.frightenTimer = 0
        setFrightenTimer(0)
        playLevelUp()
        setTimeout(() => startSiren(level), 800)
      } else if (prev === 'dead') {
        // Respawn only — map stays intact
        s.pacman = makePacman()
        s.ghosts = makeGhosts()
        s.pacAcc = 0; s.ghostAcc = 0; s.popups = []
        s.frightenTimer = 0
        setFrightenTimer(0)
        startSiren(level)
      } else if (prev === 'paused') {
        startSiren(level)
      }
    } else if (curr === 'paused') {
      stopSiren()
      stopScaredMusic()
    } else if (curr === 'gameover') {
      stopSiren()
      stopScaredMusic()
    }
  }, [gameState, level])

  // Keyboard input
  useEffect(() => {
    const dirs = {
      ArrowUp:    { dx: 0,  dy: -1 }, ArrowDown:  { dx: 0, dy: 1 },
      ArrowLeft:  { dx: -1, dy: 0  }, ArrowRight: { dx: 1, dy: 0 },
      w: { dx: 0, dy: -1 }, s: { dx: 0, dy: 1 },
      a: { dx: -1, dy: 0 }, d: { dx: 1, dy: 0 },
    }
    const handler = (e) => {
      const dir = dirs[e.key] || dirs[e.key.toLowerCase()]
      if (dir) {
        e.preventDefault()
        stateRef.current.pacman.nextDx = dir.dx
        stateRef.current.pacman.nextDy = dir.dy
      }
      if (e.key === 'Escape') {
        const gs = gameStateRef.current
        if (gs === 'playing') useGameStore.getState().setGameState('paused')
        else if (gs === 'paused') useGameStore.getState().setGameState('playing')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let rafId

    const loop = (ts) => {
      const s = stateRef.current
      const dt = Math.min(ts - s.lastTime, 50)
      s.lastTime = ts

      ctx.clearRect(0, 0, W, H)
      drawMaze(ctx, s.map)

      if (gameStateRef.current === 'playing') {
        const lv = levelRef.current

        // Mouth animation
        s.pacman.mouth += 0.06 * s.pacman.mouthDir
        if (s.pacman.mouth >= 0.28) s.pacman.mouthDir = -1
        if (s.pacman.mouth <= 0.02) s.pacman.mouthDir = 1

        // Move Pac-Man
        s.pacAcc += dt
        const pacInterval = Math.max(55, 115 - lv * 5)
        if (s.pacAcc >= pacInterval) {
          s.pacAcc = 0
          const p = s.pacman
          if (canPacmanMove(s.map, p.x, p.y, p.nextDx, p.nextDy)) { p.dx = p.nextDx; p.dy = p.nextDy }
          if (canPacmanMove(s.map, p.x, p.y, p.dx, p.dy)) {
            const w = wrap(p.x + p.dx, p.y + p.dy)
            p.x = w.x; p.y = w.y
          }

          // Eat pellet
          const cell = s.map[p.y][p.x]
          if (cell === PELLET) {
            s.map[p.y][p.x] = 0; s.pellets--
            addScore(10)
            playEatPellet()
            s.popups.push({ x: p.x, y: p.y, score: 10, offset: 0, alpha: 1 })
          } else if (cell === POWER) {
            s.map[p.y][p.x] = 0; s.pellets--
            addScore(50)
            playEatPowerPellet()
            stopSiren()
            startScaredMusic()
            // Set frighten timer directly in stateRef — no async lag
            s.frightenTimer = FRIGHTEN_MS
            setFrightenTimer(FRIGHTEN_MS) // sync to HUD
            s.ghosts = s.ghosts.map(g => g.eaten ? g : { ...g, scared: true })
            s.popups.push({ x: p.x, y: p.y, score: 50, offset: 0, alpha: 1 })
          }

          if (s.pellets <= 0) { stopSiren(); stopScaredMusic(); nextLevel(); rafId = requestAnimationFrame(loop); return }
        }

        // Move ghosts
        s.ghostAcc += dt
        const ghostInterval = Math.max(75, 150 - lv * 8)
        if (s.ghostAcc >= ghostInterval) {
          s.ghostAcc = 0
          s.ghosts = s.ghosts.map(g => stepGhost(g, s.map, s.pacman, s.frightenTimer))
        }

        // Tick frighten timer directly in stateRef
        if (s.frightenTimer > 0) {
          s.frightenTimer = Math.max(0, s.frightenTimer - dt)
          setFrightenTimer(s.frightenTimer) // sync to HUD bar
          if (s.frightenTimer <= 0) {
            // Timer expired — all scared ghosts revert to normal
            s.ghosts = s.ghosts.map(g => ({ ...g, scared: false }))
            stopScaredMusic()
            startSiren(levelRef.current)
          }
        }

        // Collision
        let died = false
        s.ghosts = s.ghosts.map(g => {
          if (g.x === s.pacman.x && g.y === s.pacman.y) {
            if (g.scared && !g.eaten) {
              addScore(200)
              playEatGhost()
              s.popups.push({ x: g.x, y: g.y, score: 200, offset: 0, alpha: 1 })
              return { ...g, eaten: true, scared: false }
            } else if (!g.eaten && !died) {
              died = true
            }
          }
          return g
        })
        if (died) {
          stopSiren()
          stopScaredMusic()
          playDeath()
          loseLife()
          rafId = requestAnimationFrame(loop)
          return
        }

        // Animate popups
        s.popups = s.popups
          .map(p => ({ ...p, offset: p.offset + 0.5, alpha: p.alpha - 0.02 }))
          .filter(p => p.alpha > 0)
      }

      // Draw everything
      s.ghosts.forEach(g => drawGhost(ctx, g, s.frightenTimer))
      drawPacman(ctx, s.pacman)
      drawScorePopup(ctx, s.popups)

      rafId = requestAnimationFrame(loop)
    }

    rafId = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(rafId); stopSiren(); stopScaredMusic() }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      className="game-canvas rounded border-2 border-blue-700"
    />
  )
}
