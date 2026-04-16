import { useGameStore } from './store/useGameStore'
import GameCanvas from './components/GameCanvas'
import HUD from './components/HUD'
import Overlay from './components/Overlay'
import Leaderboard from './components/Leaderboard'
import SpaceBackground from './components/SpaceBackground'
import { W } from './game/constants'

export default function App() {
  const { gameState, score, hiScores } = useGameStore()
  const topScore = hiScores[0]?.score ?? 0

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">

      {/* Animated space background */}
      <SpaceBackground />

      <div className="relative z-10 flex flex-col items-center px-4 py-6 gap-6">

        {/* ── HEADER ── */}
        <header className="w-full max-w-5xl flex flex-col items-center gap-2">
          {/* Neon title */}
          <div className="relative">
            <h1
              className="pixel text-5xl md:text-6xl tracking-[12px] text-yellow-400 select-none"
              style={{
                textShadow: '0 0 10px #FFD700, 0 0 30px #FFD700, 0 0 60px rgba(255,215,0,0.5)',
                animation: 'titlePulse 3s ease-in-out infinite',
              }}
            >
              PAC-MAN
            </h1>
            {/* Ghost decorations */}
            <span className="absolute -left-12 top-1 text-3xl" style={{ filter: 'drop-shadow(0 0 8px #FF0000)' }}>👻</span>
            <span className="absolute -right-12 top-1 text-3xl" style={{ filter: 'drop-shadow(0 0 8px #FFB8FF)' }}>👻</span>
          </div>
          <p className="pixel text-[9px] text-indigo-400 tracking-[4px]">ARCADE EDITION</p>

          {/* Score strip */}
          <div className="flex gap-8 mt-2 bg-gray-900/60 border border-gray-800 rounded-xl px-8 py-3 backdrop-blur-sm">
            <div className="text-center">
              <p className="text-gray-600 text-[7px] pixel tracking-widest mb-1">1UP</p>
              <p className="text-white pixel text-sm">{score.toString().padStart(6, '0')}</p>
            </div>
            <div className="w-px bg-gray-800" />
            <div className="text-center">
              <p className="text-gray-600 text-[7px] pixel tracking-widest mb-1">HIGH SCORE</p>
              <p className="text-yellow-400 pixel text-sm">{topScore.toString().padStart(6, '0')}</p>
            </div>
          </div>
        </header>

        {/* ── MAIN LAYOUT ── */}
        <main className="w-full max-w-5xl flex flex-col lg:flex-row gap-6 items-start justify-center">

          {/* Left panel */}
          <aside className="hidden lg:flex flex-col gap-4 w-52 flex-shrink-0">
            {/* How to play */}
            <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-5 backdrop-blur-sm">
              <h3 className="pixel text-yellow-400 text-[9px] tracking-widest mb-4">HOW TO PLAY</h3>
              <ul className="space-y-3">
                {[
                  { icon: '🟡', text: 'Eat all pellets' },
                  { icon: '⚡', text: 'Power pellets scare ghosts' },
                  { icon: '👻', text: 'Eat scared ghosts' },
                  { icon: '❤️', text: 'Bonus life at 10,000 pts' },
                  { icon: '⏸️', text: 'ESC to pause' },
                ].map(({ icon, text }) => (
                  <li key={text} className="flex items-center gap-2">
                    <span className="text-base">{icon}</span>
                    <span className="text-gray-400 text-[8px] pixel leading-relaxed">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Controls */}
            <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-5 backdrop-blur-sm">
              <h3 className="pixel text-yellow-400 text-[9px] tracking-widest mb-4">CONTROLS</h3>
              <div className="flex flex-col items-center gap-1">
                <div className="flex justify-center">
                  <kbd className="kbd">↑</kbd>
                </div>
                <div className="flex gap-1">
                  <kbd className="kbd">←</kbd>
                  <kbd className="kbd">↓</kbd>
                  <kbd className="kbd">→</kbd>
                </div>
                <p className="text-gray-600 text-[7px] pixel mt-2">or WASD</p>
              </div>
            </div>

            {/* Ghost guide */}
            <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-5 backdrop-blur-sm">
              <h3 className="pixel text-yellow-400 text-[9px] tracking-widest mb-4">GHOSTS</h3>
              <ul className="space-y-2">
                {[
                  { color: '#FF0000', name: 'Blinky', trait: 'Chaser' },
                  { color: '#FFB8FF', name: 'Pinky',  trait: 'Ambusher' },
                  { color: '#00FFFF', name: 'Inky',   trait: 'Flanker' },
                  { color: '#FFB852', name: 'Clyde',  trait: 'Random' },
                ].map(({ color, name, trait }) => (
                  <li key={name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
                    <div>
                      <p className="text-white text-[8px] pixel">{name}</p>
                      <p className="text-gray-600 text-[7px] pixel">{trait}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* ── GAME AREA ── */}
          <div className="flex flex-col items-center gap-3 flex-shrink-0">
            <HUD />

            {/* Canvas with decorative border */}
            <div
              className="relative scanlines rounded-lg"
              style={{
                width: W,
                padding: '3px',
                background: 'linear-gradient(135deg, #1a1aff, #6600cc, #1a1aff)',
                boxShadow: '0 0 40px rgba(26,26,255,0.6), 0 0 80px rgba(26,26,255,0.2)',
              }}
            >
              <div className="rounded-md overflow-hidden">
                <GameCanvas />
              </div>
              <Overlay />
            </div>

            {/* Bottom controls hint */}
            <div className="flex gap-6 text-[7px] pixel text-gray-700">
              <span>↑↓←→ MOVE</span>
              <span>·</span>
              <span>ESC PAUSE</span>
              <span>·</span>
              <span>ENTER START</span>
            </div>
          </div>

          {/* Right panel */}
          <aside className="hidden lg:flex flex-col gap-4 w-52 flex-shrink-0">
            <Leaderboard />

            {/* Scoring guide */}
            <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-5 backdrop-blur-sm">
              <h3 className="pixel text-yellow-400 text-[9px] tracking-widest mb-4">SCORING</h3>
              <ul className="space-y-2">
                {[
                  { icon: '•',  label: 'Pellet',       pts: '10' },
                  { icon: '⚡', label: 'Power Pellet', pts: '50' },
                  { icon: '👻', label: 'Ghost',        pts: '200' },
                  { icon: '❤️', label: 'Bonus Life',   pts: '10K' },
                ].map(({ icon, label, pts }) => (
                  <li key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm w-5 text-center">{icon}</span>
                      <span className="text-gray-400 text-[8px] pixel">{label}</span>
                    </div>
                    <span className="text-yellow-400 text-[8px] pixel">{pts}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Fun fact */}
            <div className="bg-indigo-900/30 border border-indigo-800/40 rounded-2xl p-5 backdrop-blur-sm">
              <h3 className="pixel text-indigo-400 text-[9px] tracking-widest mb-3">DID YOU KNOW?</h3>
              <p className="text-gray-500 text-[8px] pixel leading-relaxed">
                Pac-Man was created by Toru Iwatani in 1980. The original name was "Puck-Man" in Japan.
              </p>
            </div>
          </aside>
        </main>

        {/* ── FOOTER ── */}
        <footer className="w-full max-w-5xl border-t border-gray-900 pt-4 flex justify-between items-center">
          <p className="pixel text-gray-700 text-[7px]">© 2025 KARL'S ARCADE</p>
          <div className="flex gap-4">
            {['🟡','👻','⚡','❤️'].map((e, i) => (
              <span key={i} className="text-sm opacity-40 hover:opacity-100 transition-opacity cursor-default">{e}</span>
            ))}
          </div>
          <p className="pixel text-gray-700 text-[7px]">BUILT WITH REACT</p>
        </footer>

      </div>

      <style>{`
        @keyframes titlePulse {
          0%, 100% { text-shadow: 0 0 10px #FFD700, 0 0 30px #FFD700, 0 0 60px rgba(255,215,0,0.5); }
          50% { text-shadow: 0 0 20px #FFD700, 0 0 50px #FFD700, 0 0 90px rgba(255,215,0,0.8), 0 0 120px rgba(255,215,0,0.3); }
        }
        .kbd {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: #1f1f1f;
          border: 1px solid #444;
          border-bottom: 3px solid #333;
          border-radius: 6px;
          color: #aaa;
          font-size: 11px;
          font-family: system-ui;
        }
      `}</style>
    </div>
  )
}
