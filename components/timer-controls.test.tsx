import { describe, expect, it, vi, beforeEach } from "vitest"
import { render, screen, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { TimerControls } from "./timer-controls"
import { _resetAudioForTest } from "@/lib/audio"

describe("TimerControls", () => {
  beforeEach(() => {
    _resetAudioForTest()
  })

  it("Play 押下で onTogglePlay が呼ばれる", async () => {
    const onTogglePlay = vi.fn()
    const user = userEvent.setup()
    render(
      <TimerControls
        isRunning={false}
        selectedDuration={600}
        onTogglePlay={onTogglePlay}
        onReset={vi.fn()}
        onSelectDuration={vi.fn()}
      />
    )
    await act(async () => {
      await user.click(screen.getByLabelText("Start timer"))
    })
    expect(onTogglePlay).toHaveBeenCalledTimes(1)
  })

  it("isRunning=true の時は Pause ボタンが表示される", () => {
    render(
      <TimerControls
        isRunning={true}
        selectedDuration={600}
        onTogglePlay={vi.fn()}
        onReset={vi.fn()}
        onSelectDuration={vi.fn()}
      />
    )
    expect(screen.getByLabelText("Pause timer")).toBeInTheDocument()
  })

  it("Reset 押下で onReset が呼ばれる", async () => {
    const onReset = vi.fn()
    const user = userEvent.setup()
    render(
      <TimerControls
        isRunning={false}
        selectedDuration={600}
        onTogglePlay={vi.fn()}
        onReset={onReset}
        onSelectDuration={vi.fn()}
      />
    )
    await act(async () => {
      await user.click(screen.getByLabelText("Reset timer"))
    })
    expect(onReset).toHaveBeenCalledTimes(1)
  })

  it("disabled の時は Play がクリックできない", async () => {
    const onTogglePlay = vi.fn()
    const user = userEvent.setup()
    render(
      <TimerControls
        isRunning={false}
        selectedDuration={600}
        onTogglePlay={onTogglePlay}
        onReset={vi.fn()}
        onSelectDuration={vi.fn()}
        disabled
      />
    )
    const btn = screen.getByLabelText("Start timer")
    expect(btn).toBeDisabled()
    await act(async () => {
      await user.click(btn)
    })
    expect(onTogglePlay).not.toHaveBeenCalled()
  })

  it("プリセットボタン押下で onSelectDuration が呼ばれる (15分 = 900秒)", async () => {
    const onSelectDuration = vi.fn()
    const user = userEvent.setup()
    render(
      <TimerControls
        isRunning={false}
        selectedDuration={600}
        onTogglePlay={vi.fn()}
        onReset={vi.fn()}
        onSelectDuration={onSelectDuration}
      />
    )
    await act(async () => {
      await user.click(screen.getByLabelText("Set timer to 15分"))
    })
    expect(onSelectDuration).toHaveBeenCalledWith(900)
  })

  it("現在の duration に一致するプリセットは aria-pressed=true になる", () => {
    render(
      <TimerControls
        isRunning={false}
        selectedDuration={600}
        onTogglePlay={vi.fn()}
        onReset={vi.fn()}
        onSelectDuration={vi.fn()}
      />
    )
    expect(screen.getByLabelText("Set timer to 10分")).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByLabelText("Set timer to 15分")).toHaveAttribute("aria-pressed", "false")
  })

  it("+1分 ボタンで現在値+60秒、-1分 ボタンで現在値-60秒が渡る", async () => {
    const onSelectDuration = vi.fn()
    const user = userEvent.setup()
    render(
      <TimerControls
        isRunning={false}
        selectedDuration={600}
        onTogglePlay={vi.fn()}
        onReset={vi.fn()}
        onSelectDuration={onSelectDuration}
      />
    )
    await act(async () => {
      await user.click(screen.getByLabelText("Increase timer by 1 minute"))
    })
    expect(onSelectDuration).toHaveBeenLastCalledWith(660)
    await act(async () => {
      await user.click(screen.getByLabelText("Decrease timer by 1 minute"))
    })
    expect(onSelectDuration).toHaveBeenLastCalledWith(540)
  })

  it("isRunning=true の時はプリセット・微調整ボタンが無効化される", () => {
    render(
      <TimerControls
        isRunning={true}
        selectedDuration={600}
        onTogglePlay={vi.fn()}
        onReset={vi.fn()}
        onSelectDuration={vi.fn()}
      />
    )
    expect(screen.getByLabelText("Set timer to 10分")).toBeDisabled()
    expect(screen.getByLabelText("Increase timer by 1 minute")).toBeDisabled()
    expect(screen.getByLabelText("Decrease timer by 1 minute")).toBeDisabled()
  })
})
