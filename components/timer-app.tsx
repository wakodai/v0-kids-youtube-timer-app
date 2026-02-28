"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { TimerControls } from "@/components/timer-controls"
import { TimerProgress } from "@/components/timer-progress"
import { Medal } from "@/components/medal"
import { playAlarmSound, playClickSound, initAudio } from "@/lib/audio"

export function TimerApp() {
  const [selectedMinutes, setSelectedMinutes] = useState(15)
  const [timeRemaining, setTimeRemaining] = useState(15 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [hasEarned, setHasEarned] = useState(false)
  const [audioInitialized, setAudioInitialized] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const midnightRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const totalSeconds = selectedMinutes * 60
  const percentage = (timeRemaining / totalSeconds) * 100

  // Initialize audio on first user interaction (iOS requirement)
  const handleFirstInteraction = useCallback(() => {
    if (!audioInitialized) {
      initAudio()
      setAudioInitialized(true)
    }
  }, [audioInitialized])

  // Set up midnight auto-reset
  useEffect(() => {
    function scheduleMidnightReset() {
      const now = new Date()
      const midnight = new Date(now)
      midnight.setHours(24, 0, 0, 0)
      const msUntilMidnight = midnight.getTime() - now.getTime()

      midnightRef.current = setTimeout(() => {
        // Reset everything at midnight
        setIsRunning(false)
        setIsComplete(false)
        setHasEarned(false)
        setTimeRemaining(selectedMinutes * 60)
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        // Schedule next midnight
        scheduleMidnightReset()
      }, msUntilMidnight)
    }

    scheduleMidnightReset()

    return () => {
      if (midnightRef.current) {
        clearTimeout(midnightRef.current)
      }
    }
  }, [selectedMinutes])

  // Timer countdown logic
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false)
            setIsComplete(true)
            setHasEarned(true)
            playAlarmSound()
            if (intervalRef.current) {
              clearInterval(intervalRef.current)
              intervalRef.current = null
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRunning, timeRemaining])

  const handleTogglePlay = useCallback(() => {
    handleFirstInteraction()
    if (isComplete) return
    setIsRunning((prev) => !prev)
  }, [isComplete, handleFirstInteraction])

  const handleReset = useCallback(() => {
    handleFirstInteraction()
    setIsRunning(false)
    setIsComplete(false)
    setTimeRemaining(selectedMinutes * 60)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [selectedMinutes, handleFirstInteraction])

  const handleSelectMinutes = useCallback(
    (minutes: number) => {
      handleFirstInteraction()
      setSelectedMinutes(minutes)
      setTimeRemaining(minutes * 60)
      setIsRunning(false)
      setIsComplete(false)
    },
    [handleFirstInteraction]
  )

  const handleSecretReset = useCallback(() => {
    playClickSound()
    setIsRunning(false)
    setIsComplete(false)
    setHasEarned(false)
    setSelectedMinutes(15)
    setTimeRemaining(15 * 60)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  return (
    <div
      className="relative min-h-dvh flex flex-col items-center justify-center bg-background px-4 py-8 sm:px-6"
      onTouchStart={handleFirstInteraction}
    >
      <main className="w-full max-w-md sm:max-w-lg flex flex-col items-center gap-8 sm:gap-10">
        {/* App title */}
        <h1 className="text-lg sm:text-xl font-medium text-muted-foreground tracking-wide uppercase text-balance text-center">
          Focus Timer
        </h1>

        {/* Controls */}
        <TimerControls
          isRunning={isRunning}
          selectedMinutes={selectedMinutes}
          onTogglePlay={handleTogglePlay}
          onReset={handleReset}
          onSelectMinutes={handleSelectMinutes}
          disabled={isComplete}
        />

        {/* Progress bar + time display */}
        <TimerProgress
          percentage={percentage}
          timeRemaining={timeRemaining}
          isRunning={isRunning}
          isComplete={isComplete}
        />

        {/* Medal display */}
        <div className="flex flex-col items-center gap-3">
          <Medal earned={hasEarned} className="w-28 h-32 sm:w-32 sm:h-36" />
          <p className="text-sm text-muted-foreground text-center">
            {hasEarned
              ? "Session complete!"
              : "Complete a session to earn your medal"}
          </p>
        </div>
      </main>

      {/* Secret reset button - bottom right corner, nearly invisible */}
      <button
        onClick={handleSecretReset}
        className="fixed bottom-2 right-2 w-8 h-8 opacity-[0.02] hover:opacity-10 transition-opacity bg-transparent border-none cursor-default focus:outline-none"
        aria-label="Full reset"
        tabIndex={-1}
      />
    </div>
  )
}
