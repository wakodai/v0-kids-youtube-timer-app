import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { render, screen, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { TimerApp } from "./timer-app"
import { _resetAudioForTest } from "@/lib/audio"
import { STORAGE_KEY } from "@/lib/timer-utils"

// next/image を素の img に置き換え
vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    ...rest
  }: {
    src: string
    alt: string
    [key: string]: unknown
  }) => {
    // フィルタリング: Next.js 専用 props は <img> に流さない
    const passthrough: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(rest)) {
      if (["fill", "priority", "unoptimized", "loader", "placeholder", "blurDataURL"].includes(k)) continue
      passthrough[k] = v
    }
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...passthrough} />
  },
}))

describe("TimerApp", () => {
  beforeEach(() => {
    _resetAudioForTest()
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("初期表示: デフォルトは 10:00 (10分)", async () => {
    render(<TimerApp />)
    expect(await screen.findByText("10:00")).toBeInTheDocument()
  })

  it("初期表示: 3 つのメダルが全て gold (未消費)", async () => {
    const { container } = render(<TimerApp />)
    await screen.findByText("10:00")
    const svgs = container.querySelectorAll("svg")
    // SoundStatus アイコンも SVG なので 3 個以上見つかるはず
    const medalSvgs = Array.from(svgs).filter((s) => s.getAttribute("viewBox") === "0 0 120 140")
    expect(medalSvgs).toHaveLength(3)
    medalSvgs.forEach((s) => {
      expect(s.className.baseVal).toContain("drop-shadow-lg")
      expect(s.className.baseVal).not.toContain("opacity-40")
    })
  })

  it("セッション残り 3/3 と表示される", async () => {
    render(<TimerApp />)
    expect(await screen.findByTestId("session-status")).toHaveTextContent(
      "3 of 3 sessions remaining today"
    )
  })

  it("Play ボタンを押すと Pause に切り替わる", async () => {
    const user = userEvent.setup()
    render(<TimerApp />)
    await screen.findByText("10:00")
    await act(async () => {
      await user.click(screen.getByLabelText("Start timer"))
    })
    expect(screen.getByLabelText("Pause timer")).toBeInTheDocument()
  })

  it("localStorage に同日付の state があれば復元する", async () => {
    const today = new Date().toISOString().slice(0, 10)
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        consumedMedals: 2,
        selectedDuration: 5 * 60,
        timeRemaining: 33,
        date: today,
      })
    )
    render(<TimerApp />)
    expect(await screen.findByText("00:33")).toBeInTheDocument()
    expect(screen.getByTestId("session-status")).toHaveTextContent(
      "1 of 3 sessions remaining today"
    )
  })

  it("別の日の state は consumedMedals がリセットされ、duration の選好は残る", async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        consumedMedals: 3,
        selectedDuration: 5 * 60,
        timeRemaining: 10,
        date: "1999-01-01",
      })
    )
    render(<TimerApp />)
    expect(await screen.findByText("05:00")).toBeInTheDocument()
    expect(screen.getByTestId("session-status")).toHaveTextContent(
      "3 of 3 sessions remaining today"
    )
  })

  it("メダル全消費後は『All sessions used』を表示し、Play は disabled", async () => {
    const today = new Date().toISOString().slice(0, 10)
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        consumedMedals: 3,
        selectedDuration: 5 * 60,
        timeRemaining: 0,
        date: today,
      })
    )
    render(<TimerApp />)
    expect(await screen.findByTestId("session-status")).toHaveTextContent(
      "All sessions used for today. See you tomorrow!"
    )
    expect(screen.getByLabelText("Start timer")).toBeDisabled()
  })

  it("SoundStatus ボタンが画面上にある", async () => {
    render(<TimerApp />)
    await screen.findByText("10:00")
    expect(screen.getByText(/おと/)).toBeInTheDocument()
  })
})
