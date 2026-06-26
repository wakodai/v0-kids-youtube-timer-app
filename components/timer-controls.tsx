"use client"

import { Play, Pause, RotateCcw, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { playClickSound, playResetSound } from "@/lib/audio"

interface TimerControlsProps {
  isRunning: boolean
  selectedDuration: number // in seconds
  onTogglePlay: () => void
  onReset: () => void
  onSelectDuration: (seconds: number) => void
  disabled?: boolean
}

// プリセットボタン（大きめ）で時間をセットする
const PRESETS: { label: string; value: number }[] = [
  { label: "10分", value: 10 * 60 },
  { label: "15分", value: 15 * 60 },
  { label: "1秒", value: 1 },
]

// +1/-1 分の微調整で取りうる範囲
const MIN_DURATION = 1
const MAX_DURATION = 60 * 60
const STEP = 60

function clampDuration(seconds: number): number {
  return Math.min(Math.max(seconds, MIN_DURATION), MAX_DURATION)
}

export function TimerControls({
  isRunning,
  selectedDuration,
  onTogglePlay,
  onReset,
  onSelectDuration,
  disabled,
}: TimerControlsProps) {
  const durationLocked = isRunning

  const setDuration = (seconds: number) => {
    playClickSound()
    onSelectDuration(clampDuration(seconds))
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-6">
      {/* Preset duration buttons */}
      <div className="flex items-center justify-center gap-3 sm:gap-4">
        {PRESETS.map((preset) => {
          const active = selectedDuration === preset.value
          return (
            <Button
              key={preset.value}
              variant={active ? "default" : "outline"}
              className={`h-16 sm:h-20 px-5 sm:px-7 text-2xl sm:text-3xl font-bold rounded-2xl border-2 active:scale-95 transition-transform ${
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-card-foreground border-border hover:bg-secondary"
              }`}
              onClick={() => setDuration(preset.value)}
              disabled={durationLocked}
              aria-label={`Set timer to ${preset.label}`}
              aria-pressed={active}
            >
              {preset.label}
            </Button>
          )
        })}
      </div>

      {/* Fine adjustment buttons (±1 min) */}
      <div className="flex items-center justify-center gap-3 sm:gap-4">
        <Button
          variant="outline"
          className="h-14 sm:h-16 px-4 sm:px-6 text-xl sm:text-2xl font-bold rounded-2xl border-2 bg-card text-card-foreground border-border hover:bg-secondary active:scale-95 transition-transform"
          onClick={() => setDuration(selectedDuration - STEP)}
          disabled={durationLocked || selectedDuration <= MIN_DURATION}
          aria-label="Decrease timer by 1 minute"
        >
          <Minus className="size-6 sm:size-7" />
          <span>1分</span>
        </Button>
        <Button
          variant="outline"
          className="h-14 sm:h-16 px-4 sm:px-6 text-xl sm:text-2xl font-bold rounded-2xl border-2 bg-card text-card-foreground border-border hover:bg-secondary active:scale-95 transition-transform"
          onClick={() => setDuration(selectedDuration + STEP)}
          disabled={durationLocked || selectedDuration >= MAX_DURATION}
          aria-label="Increase timer by 1 minute"
        >
          <Plus className="size-6 sm:size-7" />
          <span>1分</span>
        </Button>
      </div>

      {/* Play/Pause + Reset buttons */}
      <div className="flex items-center justify-center gap-4 sm:gap-6">
        <Button
          variant="default"
          size="icon-lg"
          className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-transform"
          onClick={() => {
            playClickSound()
            onTogglePlay()
          }}
          disabled={disabled}
          aria-label={isRunning ? "Pause timer" : "Start timer"}
        >
          {isRunning ? (
            <Pause className="size-9 sm:size-10" />
          ) : (
            <Play className="size-9 sm:size-10 ml-1" />
          )}
        </Button>

        <Button
          variant="outline"
          size="icon-lg"
          className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-card text-foreground border-2 border-border hover:bg-secondary active:scale-95 transition-transform"
          onClick={() => {
            playResetSound()
            onReset()
          }}
          aria-label="Reset timer"
        >
          <RotateCcw className="size-9 sm:size-10" />
        </Button>
      </div>
    </div>
  )
}
