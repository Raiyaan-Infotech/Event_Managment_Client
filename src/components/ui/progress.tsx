"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * `indicatorColor` was added for the Analytics screen, where each bar carries
 * its own channel colour. A Tailwind class cannot do it — the colours come from
 * a data map at runtime, and Tailwind only ships classes it can see at build
 * time, so `bg-[${hex}]` would compile to nothing. `indicatorClassName` stays
 * for the cases where a static class IS enough.
 */
function Progress({
  className,
  value,
  indicatorClassName,
  indicatorColor,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
  indicatorClassName?: string
  indicatorColor?: string
}) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          // Only fall back to the primary token when no explicit colour is
          // given, or the class would win over the inline style in some builds.
          "h-full w-full flex-1 transition-all",
          !indicatorColor && "bg-primary",
          indicatorClassName
        )}
        style={{
          transform: `translateX(-${100 - (value || 0)}%)`,
          ...(indicatorColor ? { backgroundColor: indicatorColor } : {}),
        }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
