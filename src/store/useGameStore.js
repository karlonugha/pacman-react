import { create } from 'zustand'

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
  gameState: 'menu', // menu | playing | paused | dead | levelup | gameover
  hiScores: getHiScores(),
  frightenTimer: 0,

  setGameState: (s) => set({ gameState: s }),
  setFrightenTimer: (t) => set({ frightenTimer: t }),

  addScore: (pts) => set((s) => ({ score: s.score + pts })),

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

  resetGame: () => set({ score: 0, lives: 3, level: 1, gameState: 'playing', frightenTimer: 0 }),

  tickFrighten: (dt) => set((s) => {
    const t = Math.max(0, s.frightenTimer - dt)
    return { frightenTimer: t }
  }),
}))
