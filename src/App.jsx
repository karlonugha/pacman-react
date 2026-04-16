import { useEffect } from 'react'
import { useGameStore } from './store/useGameStore'
import GameCanvas from './components/GameCanvas'
import HUD from './components/HUD'
import Overlay from './components/Overlay'
import { W } from './game/constants'

export default function App() {
  const { gameState, score, hiScores } = useGameStore()
  const topScore = hiScores[0]?.score ?? 0

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 p-4">
      {/* Title */}
      <h1
        className="pixel text-yellow-400 text-2xl tracking-[10px]"
        style={{ textShadow: '0 0 20px #FFD700, 0 0 40px rgba(255,215,0,0.4)' }}
      >
        PAC-MAN
      </h1>

      {/* Best score */}
      <div className="flex gap-8 text-[8px] pixel">
        <span className="text-gray-600">BEST <span className="text-yellow-400">{topScore.toString().padStart(6,'0')}</span></span>
        <span className="text-gray-600">CURRENT <span className="text-white">{score.toString().padStart(6,'0')}</span></span>
      </div>

      <HUD />

      {/* Game area */}
      <div className="relative scanlines" style={{ width: W }}>
        <GameCanvas />
        <Overlay />
      </div>

      <p className="text-gray-700 text-[7px] pixel tracking-widest">
        ↑ ↓ ← → or WASD · ESC = PAUSE
      </p>
    </div>
  )
}
