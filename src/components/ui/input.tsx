import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (type === 'number' && ['-', 'e', 'E', '+'].includes(e.key)) {
      e.preventDefault();
    }
    props.onKeyDown?.(e);
  };

  return (
    <input
      type={type}
      min={type === 'number' ? props.min ?? 0 : props.min}
      onKeyDown={handleKeyDown}
      data-slot="input"
      className={cn(
        "flex h-12 w-full rounded-2xl border border-input bg-background/50 px-4 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-300 hover:bg-background/80",
        className
      )}
      {...props}
    />
  )
}

export { Input }
