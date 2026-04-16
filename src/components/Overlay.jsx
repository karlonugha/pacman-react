import { useGameStore } from '../store/useGameStore'

export default function Overlay() {
  const { gameState, score, level, lives, hiScores, setGameState, resetGame } = useGameStore()

  if (gameState === 'playing' || gameState === 'paused' && false) return null

  const screens = {
    menu: {
      emoji: '🟡', title: 'PAC-MAN',
      sub: 'PRESS ENTER TO START',
      body: (
        <div className="text-center space-y-2 mt-2">
          <p className="text-gray-500 text-[8px]">ARROW KEYS or WASD to move</p>
          <p className="text-gray-500 text-[8px]">ESC to pause</p>
          {hiScores.length > 0 && (
            <div className="mt-4">
              <p className="text-yellow-400 text-[8px] mb-2 tracking-widest">HIGH SCORES</p>
              {hiScores.slice(0, 5).map((s, i) => (
                <div key={i} className="flex justify-between text-[8px] text-gray-400 px-8">
                  <span>{i + 1}. {s.score.toString().padStart(6,'0')}</span>
                  <span>LV{s.level}</span>
                  <span>{s.date}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
      action: () => resetGame(),
    },
    paused: {
      emoji: '⏸️', title: 'PAUSED',
      sub: 'PRESS ESC TO RESUME',
      body: null,
      action: () => setGameState('playing'),
    },
    dead: {
      emoji: '💀', title: 'OUCH!',
      sub: `${lives - 1} LIVES LEFT — PRESS ENTER`,
      body: null,
      action: () => setGameState('playing'),
    },
    levelup: {
      emoji: '🎉', title: `LEVEL ${level}!`,
      sub: 'PRESS ENTER TO CONTINUE',
      body: <p className="text-green-400 text-[8px] mt-2">+SPEED BOOST</p>,
      action: () => setGameState('playing'),
    },
    gameover: {
      emoji: '👾', title: 'GAME OVER',
      sub: 'PRESS ENTER TO RESTART',
      body: (
        <div className="text-center mt-3 space-y-1">
          <p className="text-yellow-400 text-[10px]">SCORE: {score.toString().padStart(6,'0')}</p>
          <p className="text-gray-500 text-[8px]">LEVEL REACHED: {level}</p>
          {hiScores.length > 0 && (
            <div className="mt-3">
              <p className="text-yellow-400 text-[8px] mb-2 tracking-widest">LEADERBOARD</p>
              {hiScores.slice(0, 5).map((s, i) => (
                <div key={i} className="flex justify-between text-[8px] px-8 gap-4"
                  style={{ color: i === 0 ? '#FFD700' : '#666' }}>
                  <span>{i + 1}. {s.score.toString().padStart(6,'0')}</span>
                  <span>LV{s.level}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
      action: () => resetGame(),
    },
  }

  const screen = screens[gameState]
  if (!screen) return null

  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') screen.action()
  }

  return (
    <div
      className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center rounded z-10 gap-3"
      onKeyDown={handleKey}
      tabIndex={0}
      ref={el => el?.focus()}
    >
      <div className="text-5xl">{screen.emoji}</div>
      <h2 className="text-yellow-400 text-xl pixel tracking-widest" style={{ textShadow: '0 0 20px #FFD700' }}>
        {screen.title}
      </h2>
      <p className="text-[9px] text-gray-400 tracking-widest animate-pulse">{screen.sub}</p>
      {screen.body}
      <button
        onClick={screen.action}
        className="mt-4 px-6 py-2 bg-yellow-400 text-black text-[9px] pixel rounded hover:bg-yellow-300 transition-colors"
      >
        {gameState === 'gameover' ? 'PLAY AGAIN' : gameState === 'menu' ? 'START GAME' : 'CONTINUE'}
      </button>
    </div>
  )
}
