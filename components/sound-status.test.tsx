import { describe, expect, it, beforeEach } from "vitest"
import { render, screen, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SoundStatus } from "./sound-status"
import { _resetAudioForTest } from "@/lib/audio"

describe("SoundStatus", () => {
  beforeEach(() => {
    _resetAudioForTest()
  })

  it("初期は『おとをONにする』ラベル", () => {
    render(<SoundStatus />)
    const btn = screen.getByRole("button")
    expect(btn).toHaveAttribute("data-audio-status", "uninitialized")
    expect(btn).toHaveTextContent("おとをONにする")
  })

  it("クリックすると AudioContext が running になり『おとOK』表示", async () => {
    const user = userEvent.setup()
    render(<SoundStatus />)
    const btn = screen.getByRole("button")
    await act(async () => {
      await user.click(btn)
    })
    expect(btn).toHaveAttribute("data-audio-status", "running")
    expect(btn).toHaveTextContent("おとOK")
  })

  it("AudioContext が未サポート環境では disabled", () => {
    const original = (globalThis as unknown as { AudioContext: unknown }).AudioContext
    const win = window as unknown as { AudioContext?: unknown; webkitAudioContext?: unknown }
    const originalWin = win.AudioContext
    const originalWinWebkit = win.webkitAudioContext
    ;(globalThis as unknown as { AudioContext: unknown }).AudioContext = undefined
    win.AudioContext = undefined
    win.webkitAudioContext = undefined
    try {
      render(<SoundStatus />)
      const btn = screen.getByRole("button")
      expect(btn).toBeDisabled()
      expect(btn).toHaveAttribute("data-audio-status", "unsupported")
    } finally {
      ;(globalThis as unknown as { AudioContext: unknown }).AudioContext = original
      win.AudioContext = originalWin
      win.webkitAudioContext = originalWinWebkit
    }
  })
})
