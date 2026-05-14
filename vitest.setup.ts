import "@testing-library/jest-dom/vitest"
import { afterEach, vi } from "vitest"
import { cleanup } from "@testing-library/react"

afterEach(() => {
  cleanup()
})

// JSDOM は AudioContext を持たないので、軽量モックを globalThis に置く。
// テスト側で `new AudioContext()` できるようにし、state を "running" にしておく。
class MockOscillator {
  type = "sine"
  frequency = {
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  }
  connect = vi.fn()
  disconnect = vi.fn()
  start = vi.fn()
  stop = vi.fn()
}

class MockGain {
  gain = {
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  }
  connect = vi.fn()
  disconnect = vi.fn()
}

class MockAudioContext {
  state: "running" | "suspended" | "closed" = "running"
  currentTime = 0
  destination = {}
  createOscillator() {
    return new MockOscillator()
  }
  createGain() {
    return new MockGain()
  }
  resume() {
    this.state = "running"
    return Promise.resolve()
  }
  close() {
    this.state = "closed"
    return Promise.resolve()
  }
}

;(globalThis as unknown as { AudioContext: typeof AudioContext }).AudioContext =
  MockAudioContext as unknown as typeof AudioContext

// matchMedia は jsdom にないので最小スタブを置く (一部 shadcn が触る場合に備える)
if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}
