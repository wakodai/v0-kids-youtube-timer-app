import { describe, expect, it, beforeEach } from "vitest"
import {
  _resetAudioForTest,
  getAudioStatus,
  initAudio,
  playAlarmSound,
  playClickSound,
  playResetSound,
  playTestSound,
  subscribeAudioStatus,
} from "./audio"

describe("audio", () => {
  beforeEach(() => {
    _resetAudioForTest()
  })

  it("初期状態は uninitialized", () => {
    expect(getAudioStatus()).toBe("uninitialized")
  })

  it("initAudio を呼ぶと running になる (Mock AudioContext)", () => {
    initAudio()
    expect(getAudioStatus()).toBe("running")
  })

  it("playTestSound は AudioContext を初期化して running を返す", () => {
    const status = playTestSound()
    expect(status).toBe("running")
    expect(getAudioStatus()).toBe("running")
  })

  it("playClickSound / playResetSound / playAlarmSound は例外を投げない", () => {
    expect(() => playClickSound()).not.toThrow()
    expect(() => playResetSound()).not.toThrow()
    expect(() => playAlarmSound()).not.toThrow()
  })

  it("subscribeAudioStatus はステータスを通知する", () => {
    const events: string[] = []
    const unsub = subscribeAudioStatus((s) => events.push(s))
    initAudio()
    playTestSound()
    expect(events.length).toBeGreaterThanOrEqual(1)
    expect(events[events.length - 1]).toBe("running")
    unsub()
  })

  it("AudioContext がサポートされない場合は unsupported", () => {
    const original = (globalThis as unknown as { AudioContext: unknown }).AudioContext
    const win = window as unknown as { AudioContext?: unknown; webkitAudioContext?: unknown }
    const originalWin = win.AudioContext
    const originalWinWebkit = win.webkitAudioContext
    ;(globalThis as unknown as { AudioContext: unknown }).AudioContext = undefined
    win.AudioContext = undefined
    win.webkitAudioContext = undefined
    try {
      expect(getAudioStatus()).toBe("unsupported")
    } finally {
      ;(globalThis as unknown as { AudioContext: unknown }).AudioContext = original
      win.AudioContext = originalWin
      win.webkitAudioContext = originalWinWebkit
    }
  })
})
