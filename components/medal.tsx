"use client"

import { cn } from "@/lib/utils"

interface MedalProps {
  consumed: boolean
  index: number
  className?: string
}

export function Medal({ consumed, index, className }: MedalProps) {
  // Default (consumed=false): bright gold. After timer cycle (consumed=true): grayed out.
  return (
    <div
      className={cn(
        "relative flex items-center justify-center transition-all duration-700",
        className
      )}
    >
      {/* Medal ribbons */}
      <svg
        viewBox="0 0 120 140"
        className={cn(
          "w-full h-full transition-all duration-700",
          consumed ? "drop-shadow-none opacity-40" : "drop-shadow-lg"
        )}
        aria-hidden="true"
      >
        {/* Left ribbon */}
        <path
          d="M 40 65 L 25 130 L 45 115 L 55 135 L 55 75"
          className={cn(
            "transition-all duration-700",
            consumed ? "fill-muted-foreground/20" : "fill-[#dc2626]"
          )}
        />
        {/* Right ribbon */}
        <path
          d="M 80 65 L 95 130 L 75 115 L 65 135 L 65 75"
          className={cn(
            "transition-all duration-700",
            consumed ? "fill-muted-foreground/20" : "fill-[#dc2626]"
          )}
        />

        {/* Medal circle - outer ring */}
        <circle
          cx="60"
          cy="50"
          r="40"
          className={cn(
            "transition-all duration-700",
            consumed ? "fill-muted-foreground/15" : "fill-gold"
          )}
        />
        {/* Medal circle - inner ring */}
        <circle
          cx="60"
          cy="50"
          r="33"
          className={cn(
            "transition-all duration-700",
            consumed ? "fill-muted-foreground/10" : "fill-gold/80"
          )}
        />

        {/* Laurel wreath left */}
        <path
          d="M 35 50 C 35 35, 45 25, 50 30 C 42 30, 38 40, 38 50 M 37 55 C 33 42, 42 30, 48 33 C 40 35, 35 45, 37 55 M 40 60 C 34 50, 40 37, 47 38 C 40 42, 37 52, 40 60"
          fill="none"
          strokeWidth="1.5"
          className={cn(
            "transition-all duration-700",
            consumed ? "stroke-muted-foreground/15" : "stroke-gold-muted"
          )}
        />
        {/* Laurel wreath right */}
        <path
          d="M 85 50 C 85 35, 75 25, 70 30 C 78 30, 82 40, 82 50 M 83 55 C 87 42, 78 30, 72 33 C 80 35, 85 45, 83 55 M 80 60 C 86 50, 80 37, 73 38 C 80 42, 83 52, 80 60"
          fill="none"
          strokeWidth="1.5"
          className={cn(
            "transition-all duration-700",
            consumed ? "stroke-muted-foreground/15" : "stroke-gold-muted"
          )}
        />

        {/* Number */}
        <text
          x="60"
          y="58"
          textAnchor="middle"
          fontSize="28"
          fontWeight="bold"
          className={cn(
            "transition-all duration-700 font-sans",
            consumed ? "fill-muted-foreground/20" : "fill-gold-muted"
          )}
        >
          {index}
        </text>
      </svg>
    </div>
  )
}
