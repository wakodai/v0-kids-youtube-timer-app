/** MM:SS にフォーマット (1時間以上は分が桁あふれする) */
export function formatTime(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

/** YYYY-MM-DD (UTC) — 日付変更検知用 */
export function getTodayString(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

export interface PersistedState {
  consumedMedals: number
  selectedDuration: number
  timeRemaining: number
  date: string
}

export const STORAGE_KEY = "focus-timer-state"
export const MAX_MEDALS = 3
export const DEFAULT_DURATION = 10 * 60

/**
 * 永続化された state を、現在時刻に対して正規化する。
 * - 同じ日なら全てそのまま復元
 * - 別日ならメダルだけリセット (duration の好みは残す)
 * - null / 壊れていたらデフォルト
 */
export function reconcilePersistedState(
  saved: PersistedState | null,
  today: string = getTodayString()
): { consumedMedals: number; selectedDuration: number; timeRemaining: number } {
  if (!saved) {
    return {
      consumedMedals: 0,
      selectedDuration: DEFAULT_DURATION,
      timeRemaining: DEFAULT_DURATION,
    }
  }
  if (saved.date === today) {
    return {
      consumedMedals: clamp(saved.consumedMedals, 0, MAX_MEDALS),
      selectedDuration: saved.selectedDuration,
      timeRemaining: saved.timeRemaining ?? saved.selectedDuration,
    }
  }
  return {
    consumedMedals: 0,
    selectedDuration: saved.selectedDuration,
    timeRemaining: saved.selectedDuration,
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function loadPersistedState(
  storage: Pick<Storage, "getItem"> | null = typeof window === "undefined"
    ? null
    : window.localStorage
): PersistedState | null {
  if (!storage) return null
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as PersistedState
  } catch {
    return null
  }
}

export function savePersistedState(
  state: PersistedState,
  storage: Pick<Storage, "setItem"> | null = typeof window === "undefined"
    ? null
    : window.localStorage
) {
  if (!storage) return
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}
