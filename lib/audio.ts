// Web Audio API based sound generation for iOS/iPadOS compatibility
// iOS requires sounds to be triggered from user interaction (touch/click)

let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  }
  // Resume context if suspended (iOS requirement)
  if (audioContext.state === 'suspended') {
    audioContext.resume()
  }
  return audioContext
}

export function playClickSound() {
  try {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(800, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.05)

    gainNode.gain.setValueAtTime(0.15, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.08)
  } catch {
    // Silently fail if audio isn't available
  }
}

export function playAlarmSound() {
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    // Play a pleasant three-tone chime
    const frequencies = [523.25, 659.25, 783.99] // C5, E5, G5
    
    frequencies.forEach((freq, i) => {
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(freq, now)

      const startTime = now + i * 0.2
      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05)
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6)

      oscillator.start(startTime)
      oscillator.stop(startTime + 0.6)
    })

    // Second round with slightly different timing for a richer sound
    setTimeout(() => {
      const ctx2 = getAudioContext()
      const now2 = ctx2.currentTime
      const frequencies2 = [659.25, 783.99, 1046.5] // E5, G5, C6

      frequencies2.forEach((freq, i) => {
        const oscillator = ctx2.createOscillator()
        const gainNode = ctx2.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(ctx2.destination)

        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(freq, now2)

        const startTime = now2 + i * 0.2
        gainNode.gain.setValueAtTime(0, startTime)
        gainNode.gain.linearRampToValueAtTime(0.25, startTime + 0.05)
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8)

        oscillator.start(startTime)
        oscillator.stop(startTime + 0.8)
      })
    }, 800)
  } catch {
    // Silently fail if audio isn't available
  }
}

export function playResetSound() {
  try {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(500, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.15)

    gainNode.gain.setValueAtTime(0.12, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.15)
  } catch {
    // Silently fail if audio isn't available
  }
}

// Initialize audio context on first user interaction (required for iOS)
export function initAudio() {
  try {
    getAudioContext()
  } catch {
    // Silently fail
  }
}
