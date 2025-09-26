"use client"

import React from "react"
import { Toaster } from "sonner"

type ToasterProps = React.ComponentProps<typeof Toaster>

export function Sonner({ ...props }: ToasterProps) {
  return (
    <Toaster
      closeButton={true}
      expand={true}
      position="top-right"
      toastOptions={{
        closeButton: true,
        classNames: {
          title: [
            "text-left text-sm text-primary",
          ].join(" "),
          description: [
            "text-left text-sm text-muted-foreground",
          ].join(" "),

        },
      }}
      {...props}
    />
  )
}
