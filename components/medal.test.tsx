import { describe, expect, it } from "vitest"
import { render } from "@testing-library/react"
import { Medal } from "./medal"

describe("Medal", () => {
  it("consumed=false なら gold スタイル (drop-shadow-lg)", () => {
    const { container } = render(<Medal consumed={false} index={1} />)
    const svg = container.querySelector("svg")
    expect(svg).not.toBeNull()
    expect(svg?.className.baseVal).toContain("drop-shadow-lg")
    expect(svg?.className.baseVal).not.toContain("opacity-40")
  })

  it("consumed=true なら薄く (opacity-40)", () => {
    const { container } = render(<Medal consumed={true} index={2} />)
    const svg = container.querySelector("svg")
    expect(svg?.className.baseVal).toContain("opacity-40")
  })

  it("index は SVG text として描画される", () => {
    const { container } = render(<Medal consumed={false} index={3} />)
    const text = container.querySelector("text")
    expect(text?.textContent).toBe("3")
  })
})
