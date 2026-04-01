"use client"

import * as React from "react"
import { Label as Root } from "radix-ui"

import { cn } from "@/lib/utils"

function Label({
  className,
  ...props
}: React.ComponentProps<typeof Root>) {
  return (
    <Root
      data-slot="label"
      className={cn(
        "text-sm font-medium leading-none select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }
