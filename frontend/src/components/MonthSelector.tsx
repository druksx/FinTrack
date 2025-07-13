'use client';

import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons"
import { format } from "date-fns"
import { useMonth } from "@/lib/MonthContext"

export default function MonthSelector() {
  const { currentDate, setCurrentDate } = useMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handlePrevMonth}
        className="rounded-md p-1 hover:bg-black hover:text-white transition-colors"
      >
        <ChevronLeftIcon className="h-5 w-5" />
        <span className="sr-only">Previous month</span>
      </button>

      <span className="text-sm font-medium min-w-24 text-center">
        {format(currentDate, "MMMM yyyy")}
      </span>

      <button
        onClick={handleNextMonth}
        className="rounded-md p-1 hover:bg-black hover:text-white transition-colors"
      >
        <ChevronRightIcon className="h-5 w-5" />
        <span className="sr-only">Next month</span>
      </button>
    </div>
  )
} 