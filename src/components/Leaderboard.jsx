import { useGameStore } from '../store/useGameStore'

export default function Leaderboard() {
  const { hiScores } = useGameStore()

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-5 backdrop-blur-sm">
      <h3 className="pixel text-yellow-400 text-[9px] tracking-widest mb-4">LEADERBOARD</h3>

      {hiScores.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-4xl mb-2">🏆</p>
          <p className="text-gray-600 text-[8px] pixel">No scores yet.</p>
          <p className="text-gray-700 text-[7px] pixel mt-1">Play to set a record!</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {hiScores.slice(0, 7).map((s, i) => (
            <li
              key={i}
              className={`flex items-center justify-between rounded-lg px-2 py-1.5 ${
                i === 0 ? 'bg-yellow-400/10 border border-yellow-400/20' : 'bg-gray-800/40'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm w-5 text-center">
                  {medals[i] || <span className="text-gray-600 pixel text-[8px]">{i + 1}</span>}
                </span>
                <div>
                  <p className={`pixel text-[8px] ${i === 0 ? 'text-yellow-400' : 'text-gray-300'}`}>
                    {s.score.toString().padStart(6, '0')}
                  </p>
                  <p className="text-gray-600 text-[7px] pixel">LV{s.level} · {s.date}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
