import { create } from 'zustand'

const BONUS_LIFE_INTERVAL = 10000  // extra life every 10,000 points
const MAX_LIVES = 6                // cap so it doesn't get silly

const getHiScores = () => JSON.parse(localStorage.getItem('pacman_scores') || '[]')
const saveHiScore = (score, level) => {
  const scores = getHiScores()
  scores.push({ score, level, date: new Date().toLocaleDateString() })
  scores.sort((a, b) => b.score - a.score)
  localStorage.setItem('pacman_scores', JSON.stringify(scores.slice(0, 10)))
}

export const useGameStore = create((set, get) => ({
  score: 0,
  lives: 3,
  level: 1,
  gameState: 'menu',
  hiScores: getHiScores(),
  frightenTimer: 0,
  bonusLifeAt: BONUS_LIFE_INTERVAL,   // next score threshold for a bonus life
  bonusLifeFlash: false,              // triggers a brief UI flash

  setGameState: (s) => set({ gameState: s }),
  setFrightenTimer: (t) => set({ frightenTimer: t }),

  addScore: (pts) => {
    const { score, lives, bonusLifeAt } = get()
    const newScore = score + pts
    let newLives = lives
    let newBonusLifeAt = bonusLifeAt
    let gotBonusLife = false

    // Award a life for every threshold crossed
    while (newScore >= newBonusLifeAt) {
      if (newLives < MAX_LIVES) {
        newLives++
        gotBonusLife = true
      }
      newBonusLifeAt += BONUS_LIFE_INTERVAL
    }

    set({
      score: newScore,
      lives: newLives,
      bonusLifeAt: newBonusLifeAt,
      bonusLifeFlash: gotBonusLife,
    })

    // Clear flash after 2 seconds
    if (gotBonusLife) {
      setTimeout(() => set({ bonusLifeFlash: false }), 2000)
    }

    return gotBonusLife
  },

  loseLife: () => {
    const { lives, score, level } = get()
    if (lives - 1 <= 0) {
      saveHiScore(score, level)
      set({ lives: 0, gameState: 'gameover', hiScores: getHiScores() })
    } else {
      set({ lives: lives - 1, gameState: 'dead' })
    }
  },

  nextLevel: () => set((s) => ({ level: s.level + 1, gameState: 'levelup', frightenTimer: 0 })),

  resetGame: () => set({
    score: 0,
    lives: 3,
    level: 1,
    gameState: 'playing',
    frightenTimer: 0,
    bonusLifeAt: BONUS_LIFE_INTERVAL,
    bonusLifeFlash: false,
  }),

  tickFrighten: (dt) => set((s) => {
    const t = Math.max(0, s.frightenTimer - dt)
    return { frightenTimer: t }
  }),
}))
