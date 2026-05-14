import { describe, expect, it, beforeEach } from "vitest"
import {
  DEFAULT_DURATION,
  MAX_MEDALS,
  STORAGE_KEY,
  formatTime,
  getTodayString,
  loadPersistedState,
  reconcilePersistedState,
  savePersistedState,
} from "./timer-utils"

describe("formatTime", () => {
  it("0 秒は 00:00", () => {
    expect(formatTime(0)).toBe("00:00")
  })

  it("59 秒は 00:59", () => {
    expect(formatTime(59)).toBe("00:59")
  })

  it("60 秒は 01:00", () => {
    expect(formatTime(60)).toBe("01:00")
  })

  it("デフォルト値 10 分は 10:00", () => {
    expect(formatTime(DEFAULT_DURATION)).toBe("10:00")
  })

  it("負の値は 00:00 にクランプする", () => {
    expect(formatTime(-5)).toBe("00:00")
  })

  it("小数は切り下げる", () => {
    expect(formatTime(65.7)).toBe("01:05")
  })

  it("分が二桁を超えても表示できる (10 分 5 秒)", () => {
    expect(formatTime(10 * 60 + 5)).toBe("10:05")
  })
})

describe("getTodayString", () => {
  it("YYYY-MM-DD 形式を返す", () => {
    const result = getTodayString(new Date("2026-05-14T03:24:00.000Z"))
    expect(result).toBe("2026-05-14")
  })

  it("日付指定なしでも 10 文字 (YYYY-MM-DD) を返す", () => {
    const result = getTodayString()
    expect(result).toHaveLength(10)
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe("reconcilePersistedState", () => {
  it("saved が null の場合はデフォルトを返す", () => {
    const result = reconcilePersistedState(null, "2026-05-14")
    expect(result).toEqual({
      consumedMedals: 0,
      selectedDuration: DEFAULT_DURATION,
      timeRemaining: DEFAULT_DURATION,
    })
  })

  it("同じ日なら全て復元する", () => {
    const result = reconcilePersistedState(
      {
        consumedMedals: 2,
        selectedDuration: 5 * 60,
        timeRemaining: 90,
        date: "2026-05-14",
      },
      "2026-05-14"
    )
    expect(result).toEqual({
      consumedMedals: 2,
      selectedDuration: 5 * 60,
      timeRemaining: 90,
    })
  })

  it("別の日ならメダルはリセット、duration の選好だけ残す", () => {
    const result = reconcilePersistedState(
      {
        consumedMedals: 3,
        selectedDuration: 5 * 60,
        timeRemaining: 12,
        date: "2026-05-13",
      },
      "2026-05-14"
    )
    expect(result).toEqual({
      consumedMedals: 0,
      selectedDuration: 5 * 60,
      timeRemaining: 5 * 60,
    })
  })

  it("consumedMedals は 0..MAX_MEDALS にクランプされる", () => {
    const result = reconcilePersistedState(
      {
        consumedMedals: 99,
        selectedDuration: 60,
        timeRemaining: 60,
        date: "2026-05-14",
      },
      "2026-05-14"
    )
    expect(result.consumedMedals).toBe(MAX_MEDALS)
  })
})

describe("localStorage 永続化", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("save → load で同じ値が取れる", () => {
    savePersistedState({
      consumedMedals: 1,
      selectedDuration: 5 * 60,
      timeRemaining: 100,
      date: "2026-05-14",
    })
    const loaded = loadPersistedState()
    expect(loaded).toEqual({
      consumedMedals: 1,
      selectedDuration: 5 * 60,
      timeRemaining: 100,
      date: "2026-05-14",
    })
  })

  it("未保存なら null を返す", () => {
    expect(loadPersistedState()).toBeNull()
  })

  it("壊れた JSON でも例外を投げず null を返す", () => {
    localStorage.setItem(STORAGE_KEY, "{not-json")
    expect(loadPersistedState()).toBeNull()
  })

  it("ストレージが null の場合も安全に動く", () => {
    expect(loadPersistedState(null)).toBeNull()
    expect(() =>
      savePersistedState(
        {
          consumedMedals: 0,
          selectedDuration: 60,
          timeRemaining: 60,
          date: "2026-05-14",
        },
        null
      )
    ).not.toThrow()
  })
})
