"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { TimerControls } from "@/components/timer-controls"
import { TimerProgress } from "@/components/timer-progress"
import { Medal } from "@/components/medal"
import { SoundStatus } from "@/components/sound-status"
import { playAlarmSound, playClickSound, initAudio } from "@/lib/audio"
import {
  DEFAULT_DURATION,
  MAX_MEDALS,
  getTodayString,
  loadPersistedState,
  reconcilePersistedState,
  savePersistedState,
} from "@/lib/timer-utils"
import Image from "next/image"

export function TimerApp() {
  const [selectedDuration, setSelectedDuration] = useState(DEFAULT_DURATION)
  const [timeRemaining, setTimeRemaining] = useState(DEFAULT_DURATION)
  const [isRunning, setIsRunning] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [consumedMedals, setConsumedMedals] = useState(0)
  const [audioInitialized, setAudioInitialized] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const midnightRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const totalSeconds = selectedDuration
  const percentage = (timeRemaining / totalSeconds) * 100
  const allMedalsConsumed = consumedMedals >= MAX_MEDALS

  // Hydrate from localStorage on mount
  useEffect(() => {
    const saved = loadPersistedState()
    const reconciled = reconcilePersistedState(saved)
    setConsumedMedals(reconciled.consumedMedals)
    setSelectedDuration(reconciled.selectedDuration)
    setTimeRemaining(reconciled.timeRemaining)
    setHydrated(true)
  }, [])

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    if (!hydrated) return
    savePersistedState({
      consumedMedals,
      selectedDuration,
      timeRemaining,
      date: getTodayString(),
    })
  }, [consumedMedals, selectedDuration, timeRemaining, hydrated])

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
        setIsRunning(false)
        setIsComplete(false)
        setConsumedMedals(0)
        setTimeRemaining(selectedDuration)
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        scheduleMidnightReset()
      }, msUntilMidnight)
    }

    scheduleMidnightReset()

    return () => {
      if (midnightRef.current) {
        clearTimeout(midnightRef.current)
      }
    }
  }, [selectedDuration])

  // Timer countdown logic
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
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

  // Handle timer completion separately to avoid double-firing
  useEffect(() => {
    if (isRunning && timeRemaining === 0) {
      setIsRunning(false)
      setIsComplete(true)
      setConsumedMedals((c) => Math.min(c + 1, MAX_MEDALS))
      playAlarmSound()
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRunning, timeRemaining])

  const handleTogglePlay = useCallback(() => {
    handleFirstInteraction()
    if (isComplete || allMedalsConsumed) return
    setIsRunning((prev) => !prev)
  }, [isComplete, allMedalsConsumed, handleFirstInteraction])

  const handleReset = useCallback(() => {
    handleFirstInteraction()
    setIsRunning(false)
    setIsComplete(false)
    setTimeRemaining(selectedDuration)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [selectedDuration, handleFirstInteraction])

  const handleSelectDuration = useCallback(
    (seconds: number) => {
      handleFirstInteraction()
      if (allMedalsConsumed) return
      setSelectedDuration(seconds)
      setTimeRemaining(seconds)
      setIsRunning(false)
      setIsComplete(false)
    },
    [handleFirstInteraction, allMedalsConsumed]
  )

  const handleSecretReset = useCallback(() => {
    playClickSound()
    setIsRunning(false)
    setIsComplete(false)
    setConsumedMedals(0)
    setSelectedDuration(DEFAULT_DURATION)
    setTimeRemaining(DEFAULT_DURATION)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  if (!hydrated) {
    return (
      <div
        className="min-h-dvh flex items-center justify-center bg-background"
        data-testid="timer-app-loading"
      >
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div
      className="relative min-h-dvh flex flex-col items-center justify-center bg-background px-4 py-8 sm:px-6"
      onTouchStart={handleFirstInteraction}
      data-testid="timer-app"
    >
      <main className="w-full max-w-xl sm:max-w-2xl flex flex-col items-center gap-6 sm:gap-8">
        <SoundStatus />

        <div className="w-32 h-32 sm:w-40 sm:h-40 relative">
          <Image
            src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/construction-vehicle.jpg`}
            alt="Cute construction vehicle"
            fill
            className="object-contain rounded-2xl"
            priority
            unoptimized
          />
        </div>

        <TimerControls
          isRunning={isRunning}
          selectedDuration={selectedDuration}
          onTogglePlay={handleTogglePlay}
          onReset={handleReset}
          onSelectDuration={handleSelectDuration}
          disabled={isComplete || allMedalsConsumed}
        />

        <TimerProgress
          percentage={percentage}
          timeRemaining={timeRemaining}
          isRunning={isRunning}
          isComplete={isComplete}
        />

        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center gap-1 sm:gap-3">
            {Array.from({ length: MAX_MEDALS }, (_, i) => (
              <Medal
                key={i}
                index={i + 1}
                consumed={i < consumedMedals}
                className="w-36 h-40 sm:w-52 sm:h-56 md:w-60 md:h-64"
              />
            ))}
          </div>
          <p
            className="text-base sm:text-lg font-medium text-muted-foreground text-center"
            data-testid="session-status"
          >
            {allMedalsConsumed
              ? "All sessions used for today. See you tomorrow!"
              : isComplete
                ? `Session complete! ${MAX_MEDALS - consumedMedals} remaining today.`
                : `${MAX_MEDALS - consumedMedals} of ${MAX_MEDALS} sessions remaining today`}
          </p>
        </div>
      </main>

      <button
        onClick={handleSecretReset}
        className="fixed bottom-2 right-2 w-8 h-8 opacity-[0.02] hover:opacity-10 transition-opacity bg-transparent border-none cursor-default focus:outline-none"
        aria-label="Full reset"
        tabIndex={-1}
      />
    </div>
  )
}
