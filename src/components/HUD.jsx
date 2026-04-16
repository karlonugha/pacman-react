import { useGameStore } from '../store/useGameStore'
import { FRIGHTEN_MS } from '../game/constants'

const BONUS_LIFE_INTERVAL = 10000

export default function HUD() {
  const { score, lives, level, frightenTimer, bonusLifeAt, bonusLifeFlash } = useGameStore()
  const pct = (frightenTimer / FRIGHTEN_MS) * 100

  // Progress toward next bonus life (0–100%)
  const prevThreshold = bonusLifeAt - BONUS_LIFE_INTERVAL
  const bonusPct = Math.min(100, ((score - prevThreshold) / BONUS_LIFE_INTERVAL) * 100)

  return (
    <div className="w-full max-w-[462px] px-1">
      {/* Top row */}
      <div className="flex justify-between items-center mb-2">
        <div className="text-center">
          <p className="text-gray-500 text-[8px] tracking-widest mb-1">SCORE</p>
          <p className="text-yellow-400 text-lg font-bold pixel">{score.toString().padStart(6, '0')}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-500 text-[8px] tracking-widest mb-1">LEVEL</p>
          <p className="text-indigo-400 text-lg font-bold pixel">{level.toString().padStart(2, '0')}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-500 text-[8px] tracking-widest mb-1">LIVES</p>
          <p className={`text-base pixel transition-all duration-300 ${bonusLifeFlash ? 'text-yellow-300 scale-125' : 'text-red-400'}`}>
            {'❤️'.repeat(Math.max(0, lives))}
          </p>
        </div>
      </div>

      {/* Bonus life flash banner */}
      {bonusLifeFlash && (
        <div className="text-center mb-1 animate-bounce">
          <span className="text-yellow-400 text-[9px] pixel tracking-widest">
            ❤️ BONUS LIFE!
          </span>
        </div>
      )}

      {/* Bonus life progress bar */}
      <div className="mb-1">
        <div className="flex justify-between text-[7px] text-gray-600 mb-0.5">
          <span>BONUS LIFE</span>
          <span>{bonusLifeAt.toLocaleString()} pts</span>
        </div>
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-pink-500 transition-all duration-200"
            style={{ width: `${bonusPct}%` }}
          />
        </div>
      </div>

      {/* Scared bar */}
      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden mb-1">
        <div
          className={`h-full rounded-full transition-all duration-100 ${
            frightenTimer < 2000 ? 'bg-red-500' : 'bg-blue-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {frightenTimer > 0 && (
        <p className="text-[8px] text-blue-400 text-center tracking-widest animate-pulse">
          👻 GHOSTS SCARED
        </p>
      )}
    </div>
  )
}
