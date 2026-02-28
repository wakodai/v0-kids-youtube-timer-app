"use client"

import { cn } from "@/lib/utils"

interface TimerProgressProps {
  percentage: number
  timeRemaining: number
  isRunning: boolean
  isComplete: boolean
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

export function TimerProgress({
  percentage,
  timeRemaining,
  isRunning,
  isComplete,
}: TimerProgressProps) {
  return (
    <div className="w-full space-y-3">
      {/* Time display */}
      <div className="text-center">
        <span
          className={cn(
            "text-5xl sm:text-6xl md:text-7xl font-light tracking-tight tabular-nums transition-colors duration-300",
            isComplete
              ? "text-accent"
              : isRunning
                ? "text-primary"
                : "text-foreground"
          )}
          aria-live="polite"
          aria-label={`${formatTime(timeRemaining)} remaining`}
        >
          {formatTime(timeRemaining)}
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="relative w-full h-4 sm:h-5 rounded-full bg-secondary overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Timer progress"
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-linear",
            isComplete
              ? "bg-accent"
              : "bg-primary"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
