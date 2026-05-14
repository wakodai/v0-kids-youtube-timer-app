"use client"

import { useEffect, useState } from "react"
import { Volume2, VolumeX, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  type AudioStatus,
  getAudioStatus,
  playTestSound,
  subscribeAudioStatus,
} from "@/lib/audio"

interface SoundStatusProps {
  className?: string
}

function statusLabel(status: AudioStatus): string {
  switch (status) {
    case "running":
      return "おとOK"
    case "suspended":
      return "おとをONにする"
    case "uninitialized":
      return "おとをONにする"
    case "unsupported":
      return "おとが つかえません"
  }
}

function statusColor(status: AudioStatus): string {
  switch (status) {
    case "running":
      return "bg-emerald-100 text-emerald-900 border-emerald-400"
    case "suspended":
    case "uninitialized":
      return "bg-amber-100 text-amber-900 border-amber-400"
    case "unsupported":
      return "bg-red-100 text-red-900 border-red-400"
  }
}

export function SoundStatus({ className }: SoundStatusProps) {
  const [status, setStatus] = useState<AudioStatus>("uninitialized")

  useEffect(() => {
    setStatus(getAudioStatus())
    const unsub = subscribeAudioStatus(setStatus)
    return () => {
      unsub()
    }
  }, [])

  const handleClick = () => {
    const next = playTestSound()
    setStatus(next)
  }

  const Icon =
    status === "running" ? Volume2 : status === "unsupported" ? AlertTriangle : VolumeX

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={status === "unsupported"}
      aria-label={statusLabel(status)}
      data-audio-status={status}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 text-base sm:text-lg font-bold transition-colors active:scale-95",
        statusColor(status),
        status === "unsupported" && "cursor-not-allowed opacity-70",
        className
      )}
    >
      <Icon className="size-5 sm:size-6" aria-hidden="true" />
      <span>{statusLabel(status)}</span>
    </button>
  )
}
