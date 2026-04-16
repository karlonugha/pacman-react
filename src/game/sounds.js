// All sounds generated via Web Audio API — no audio files needed

let ctx = null

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  return ctx
}

function resume() {
  const c = getCtx()
  if (c.state === 'suspended') c.resume()
  return c
}

// --- Helpers ---
function playTone(freq, type, duration, volume = 0.3, startTime = 0) {
  const c = resume()
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.connect(gain)
  gain.connect(c.destination)
  osc.type = type
  osc.frequency.setValueAtTime(freq, c.currentTime + startTime)
  gain.gain.setValueAtTime(volume, c.currentTime + startTime)
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + startTime + duration)
  osc.start(c.currentTime + startTime)
  osc.stop(c.currentTime + startTime + duration)
}

function playFreqRamp(freqStart, freqEnd, type, duration, volume = 0.3) {
  const c = resume()
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.connect(gain)
  gain.connect(c.destination)
  osc.type = type
  osc.frequency.setValueAtTime(freqStart, c.currentTime)
  osc.frequency.linearRampToValueAtTime(freqEnd, c.currentTime + duration)
  gain.gain.setValueAtTime(volume, c.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration)
  osc.start(c.currentTime)
  osc.stop(c.currentTime + duration)
}

// --- Sound effects ---

export function playEatPellet() {
  playTone(440, 'square', 0.05, 0.08)
}

export function playEatPowerPellet() {
  const c = resume()
  ;[0, 0.06, 0.12].forEach((t, i) => {
    playTone(300 + i * 150, 'square', 0.08, 0.15, t)
  })
}

export function playEatGhost() {
  playFreqRamp(800, 200, 'sawtooth', 0.3, 0.4)
  playTone(1000, 'square', 0.1, 0.3, 0.05)
}

export function playDeath() {
  const c = resume()
  // Descending wail
  const freqs = [494, 466, 440, 415, 392, 370, 349, 330, 311, 294, 277, 261]
  freqs.forEach((f, i) => {
    playTone(f, 'sawtooth', 0.1, 0.25, i * 0.07)
  })
}

export function playLevelUp() {
  const c = resume()
  const melody = [
    { f: 523, t: 0 },
    { f: 659, t: 0.1 },
    { f: 784, t: 0.2 },
    { f: 1047, t: 0.3 },
    { f: 784, t: 0.45 },
    { f: 1047, t: 0.55 },
  ]
  melody.forEach(({ f, t }) => playTone(f, 'square', 0.12, 0.25, t))
}

export function playGameOver() {
  const c = resume()
  const notes = [
    { f: 392, t: 0 },
    { f: 349, t: 0.2 },
    { f: 330, t: 0.4 },
    { f: 294, t: 0.6 },
    { f: 261, t: 0.9 },
  ]
  notes.forEach(({ f, t }) => playTone(f, 'sawtooth', 0.25, 0.3, t))
}

export function playStart() {
  const c = resume()
  // Classic pac-man intro feel
  const notes = [
    { f: 494, t: 0    },
    { f: 494, t: 0.1  },
    { f: 494, t: 0.2  },
    { f: 392, t: 0.3  },
    { f: 494, t: 0.4  },
    { f: 587, t: 0.55 },
    { f: 294, t: 0.85 },
  ]
  notes.forEach(({ f, t }) => playTone(f, 'square', 0.12, 0.2, t))
}

// --- Background siren (looping) ---
let sirenOsc = null
let sirenGain = null
let sirenInterval = null

export function startSiren(level = 1) {
  stopSiren()
  const c = resume()
  const baseFreq = Math.min(180 + level * 15, 280)

  sirenGain = c.createGain()
  sirenGain.gain.setValueAtTime(0.06, c.currentTime)
  sirenGain.connect(c.destination)

  let up = true
  let freq = baseFreq

  sirenOsc = c.createOscillator()
  sirenOsc.type = 'sawtooth'
  sirenOsc.frequency.setValueAtTime(freq, c.currentTime)
  sirenOsc.connect(sirenGain)
  sirenOsc.start()

  sirenInterval = setInterval(() => {
    if (!sirenOsc) return
    freq += up ? 4 : -4
    if (freq >= baseFreq + 40) up = false
    if (freq <= baseFreq) up = true
    try { sirenOsc.frequency.setValueAtTime(freq, c.currentTime) } catch {}
  }, 60)
}

export function stopSiren() {
  if (sirenInterval) { clearInterval(sirenInterval); sirenInterval = null }
  if (sirenOsc) {
    try { sirenOsc.stop(); sirenOsc.disconnect() } catch {}
    sirenOsc = null
  }
  if (sirenGain) {
    try { sirenGain.disconnect() } catch {}
    sirenGain = null
  }
}

// --- Scared ghost wail ---
let scaredOsc = null
let scaredGain = null

export function startScaredMusic() {
  stopScaredMusic()
  const c = resume()
  scaredGain = c.createGain()
  scaredGain.gain.setValueAtTime(0.05, c.currentTime)
  scaredGain.connect(c.destination)

  scaredOsc = c.createOscillator()
  scaredOsc.type = 'square'
  scaredOsc.frequency.setValueAtTime(150, c.currentTime)
  scaredOsc.connect(scaredGain)
  scaredOsc.start()

  // Rapid wobble
  let t = 0
  const wobble = setInterval(() => {
    if (!scaredOsc) { clearInterval(wobble); return }
    t += 0.1
    try { scaredOsc.frequency.setValueAtTime(150 + Math.sin(t * 8) * 30, c.currentTime) } catch {}
  }, 50)

  scaredOsc._wobble = wobble
}

export function stopScaredMusic() {
  if (scaredOsc) {
    if (scaredOsc._wobble) clearInterval(scaredOsc._wobble)
    try { scaredOsc.stop(); scaredOsc.disconnect() } catch {}
    scaredOsc = null
  }
  if (scaredGain) {
    try { scaredGain.disconnect() } catch {}
    scaredGain = null
  }
}
