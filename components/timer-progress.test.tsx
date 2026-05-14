import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { TimerProgress } from "./timer-progress"

describe("TimerProgress", () => {
  it("残り時間を MM:SS で表示する", () => {
    render(
      <TimerProgress percentage={50} timeRemaining={75} isRunning={false} isComplete={false} />
    )
    expect(screen.getByText("01:15")).toBeInTheDocument()
  })

  it("aria-valuenow に percentage を round して入れる", () => {
    render(
      <TimerProgress percentage={42.7} timeRemaining={60} isRunning={true} isComplete={false} />
    )
    const bar = screen.getByRole("progressbar")
    expect(bar).toHaveAttribute("aria-valuenow", "43")
    expect(bar).toHaveAttribute("aria-valuemax", "100")
    expect(bar).toHaveAttribute("aria-valuemin", "0")
  })

  it("isRunning だと text-primary, isComplete だと text-accent", () => {
    const { rerender, container } = render(
      <TimerProgress percentage={100} timeRemaining={0} isRunning={false} isComplete={true} />
    )
    let span = container.querySelector("[aria-live='polite']")
    expect(span?.className).toContain("text-accent")

    rerender(
      <TimerProgress percentage={50} timeRemaining={30} isRunning={true} isComplete={false} />
    )
    span = container.querySelector("[aria-live='polite']")
    expect(span?.className).toContain("text-primary")
  })
})
