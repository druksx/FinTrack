'use client';

import { useTheme } from "next-themes"
import { MoonIcon, SunIcon } from "@radix-ui/react-icons"

export default function DarkSwitch() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="rounded-md p-2 hover:bg-accent dark:hover:bg-accent"
    >
      {theme === "dark" ? (
        <SunIcon className="h-5 w-5 text-background" />
      ) : (
        <MoonIcon className="h-5 w-5 text-primary" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}