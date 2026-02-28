"use client"

import { Play, Pause, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { playClickSound, playResetSound } from "@/lib/audio"

interface TimerControlsProps {
  isRunning: boolean
  selectedMinutes: number
  onTogglePlay: () => void
  onReset: () => void
  onSelectMinutes: (minutes: number) => void
  disabled?: boolean
}

export function TimerControls({
  isRunning,
  selectedMinutes,
  onTogglePlay,
  onReset,
  onSelectMinutes,
  disabled,
}: TimerControlsProps) {
  const minuteOptions = Array.from({ length: 30 }, (_, i) => i + 1)

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4">
      {/* Duration selector */}
      <Select
        value={String(selectedMinutes)}
        onValueChange={(val) => {
          playClickSound()
          onSelectMinutes(Number(val))
        }}
        disabled={isRunning}
      >
        <SelectTrigger
          className="w-24 sm:w-28 h-12 sm:h-14 text-base sm:text-lg font-medium bg-card text-card-foreground border-border"
          aria-label="Select timer duration in minutes"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {minuteOptions.map((min) => (
            <SelectItem key={min} value={String(min)}>
              {min} min
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Play/Pause button */}
      <Button
        variant="default"
        size="icon-lg"
        className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-transform"
        onClick={() => {
          playClickSound()
          onTogglePlay()
        }}
        disabled={disabled}
        aria-label={isRunning ? "Pause timer" : "Start timer"}
      >
        {isRunning ? (
          <Pause className="size-5 sm:size-6" />
        ) : (
          <Play className="size-5 sm:size-6 ml-0.5" />
        )}
      </Button>

      {/* Reset button */}
      <Button
        variant="outline"
        size="icon-lg"
        className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-card text-foreground border-border hover:bg-secondary active:scale-95 transition-transform"
        onClick={() => {
          playResetSound()
          onReset()
        }}
        aria-label="Reset timer"
      >
        <RotateCcw className="size-5 sm:size-6" />
      </Button>
    </div>
  )
}
