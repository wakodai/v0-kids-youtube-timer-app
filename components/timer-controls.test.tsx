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

  it("duration セレクタは現在値を表示する (10 min)", () => {
    render(
      <TimerControls
        isRunning={false}
        selectedDuration={600}
        onTogglePlay={vi.fn()}
        onReset={vi.fn()}
        onSelectDuration={vi.fn()}
      />
    )
    expect(screen.getByLabelText("Select timer duration")).toHaveTextContent("10 min")
  })
})
