// Web Audio API based sound generation for iOS/iPadOS compatibility.
// iOS requires AudioContext to be created/resumed inside a user gesture.

let audioContext: AudioContext | null = null

export type AudioStatus =
  | "uninitialized" // まだユーザー操作されていない
  | "running" // 音は鳴らせる
  | "suspended" // ブラウザによりサスペンド中 (タップで復帰要)
  | "unsupported" // Web Audio 自体が使えない

function getCtor(): typeof AudioContext | null {
  if (typeof window === "undefined") return null
  const w = window as unknown as {
    AudioContext?: typeof AudioContext
    webkitAudioContext?: typeof AudioContext
  }
  return w.AudioContext ?? w.webkitAudioContext ?? null
}

function getAudioContext(): AudioContext {
  const Ctor = getCtor()
  if (!Ctor) {
    throw new Error("AudioContext is not supported")
  }
  if (!audioContext) {
    audioContext = new Ctor()
  }
  if (audioContext.state === "suspended") {
    void audioContext.resume()
  }
  return audioContext
}

/**
 * 現在の AudioContext の状態を返す。
 * UI に「音が鳴るか」を表示するために使う。
 */
export function getAudioStatus(): AudioStatus {
  if (!getCtor()) return "unsupported"
  if (!audioContext) return "uninitialized"
  if (audioContext.state === "running") return "running"
  if (audioContext.state === "suspended") return "suspended"
  return "uninitialized"
}

/** 状態購読 (UI に再描画させたい場合用) */
type Listener = (status: AudioStatus) => void
const listeners = new Set<Listener>()

export function subscribeAudioStatus(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function emitStatus() {
  const status = getAudioStatus()
  listeners.forEach((l) => l(status))
}

export function playClickSound() {
  try {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.type = "sine"
    oscillator.frequency.setValueAtTime(800, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.05)

    gainNode.gain.setValueAtTime(0.15, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.08)
  } catch {
    // Silently fail
  } finally {
    emitStatus()
  }
}

export function playAlarmSound() {
  try {
    for (let round = 0; round < 3; round++) {
      setTimeout(() => {
        try {
          const ctx = getAudioContext()
          const now = ctx.currentTime

          const frequencies = [523.25, 659.25, 783.99]
          frequencies.forEach((freq, i) => {
            const oscillator = ctx.createOscillator()
            const gainNode = ctx.createGain()
            oscillator.connect(gainNode)
            gainNode.connect(ctx.destination)
            oscillator.type = "sine"
            oscillator.frequency.setValueAtTime(freq, now)
            const startTime = now + i * 0.2
            gainNode.gain.setValueAtTime(0, startTime)
            gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05)
            gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6)
            oscillator.start(startTime)
            oscillator.stop(startTime + 0.6)
          })

          const later = now + 0.7
          const frequencies2 = [659.25, 783.99, 1046.5]
          frequencies2.forEach((freq, i) => {
            const oscillator = ctx.createOscillator()
            const gainNode = ctx.createGain()
            oscillator.connect(gainNode)
            gainNode.connect(ctx.destination)
            oscillator.type = "sine"
            oscillator.frequency.setValueAtTime(freq, later)
            const startTime = later + i * 0.2
            gainNode.gain.setValueAtTime(0, startTime)
            gainNode.gain.linearRampToValueAtTime(0.25, startTime + 0.05)
            gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8)
            oscillator.start(startTime)
            oscillator.stop(startTime + 0.8)
          })
        } catch {
          // Silently fail
        } finally {
          emitStatus()
        }
      }, round * 2000)
    }
  } catch {
    // Silently fail
  }
}

export function playResetSound() {
  try {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.type = "sine"
    oscillator.frequency.setValueAtTime(500, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.15)

    gainNode.gain.setValueAtTime(0.12, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.15)
  } catch {
    // Silently fail
  } finally {
    emitStatus()
  }
}

/**
 * 音テスト用の短いビープ。
 * 「音が鳴るかどうか」を確認するために UI から呼ぶ。
 * 戻り値で AudioContext の現在状態を返す。
 */
export function playTestSound(): AudioStatus {
  try {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.type = "sine"
    oscillator.frequency.setValueAtTime(880, ctx.currentTime)

    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.4)
  } catch {
    // Silently fail
  } finally {
    emitStatus()
  }
  return getAudioStatus()
}

/**
 * ユーザー操作内で呼ばれる前提の初期化。
 * iOS では AudioContext がユーザー操作内で作成/resume されないと音が出ない。
 */
export function initAudio(): AudioStatus {
  try {
    const ctx = getAudioContext()
    if (ctx.state === "suspended") {
      void ctx.resume().finally(emitStatus)
    }
  } catch {
    // Silently fail
  }
  const status = getAudioStatus()
  emitStatus()
  return status
}

/** テストやリセット用に内部状態をクリア */
export function _resetAudioForTest() {
  try {
    audioContext?.close()
  } catch {
    // ignore
  }
  audioContext = null
  listeners.clear()
}
