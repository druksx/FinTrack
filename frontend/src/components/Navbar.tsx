'use client';

import MonthSelector from "./MonthSelector"

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-primary">FinTrack</h1>
        <MonthSelector />
      </div>
    </nav>
  )
} 