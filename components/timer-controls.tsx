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
  selectedDuration: number // in seconds
  onTogglePlay: () => void
  onReset: () => void
  onSelectDuration: (seconds: number) => void
  disabled?: boolean
}

// Duration options: 1 second (for testing) + 1-30 minutes
const DURATION_OPTIONS: { label: string; value: number }[] = [
  { label: "1 sec", value: 1 },
  ...Array.from({ length: 30 }, (_, i) => ({
    label: `${i + 1} min`,
    value: (i + 1) * 60,
  })),
]

export function TimerControls({
  isRunning,
  selectedDuration,
  onTogglePlay,
  onReset,
  onSelectDuration,
  disabled,
}: TimerControlsProps) {

  return (
    <div className="flex items-center justify-center gap-4 sm:gap-6">
      {/* Duration selector */}
      <Select
        value={String(selectedDuration)}
        onValueChange={(val) => {
          playClickSound()
          onSelectDuration(Number(val))
        }}
        disabled={isRunning}
      >
        <SelectTrigger
          className="w-36 sm:w-44 h-16 sm:h-20 text-2xl sm:text-3xl font-bold bg-card text-card-foreground border-2 border-border rounded-2xl"
          aria-label="Select timer duration"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-72 text-xl">
          {DURATION_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={String(opt.value)} className="text-xl py-3">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Play/Pause button */}
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

      {/* Reset button */}
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
  )
}
