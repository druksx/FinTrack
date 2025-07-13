"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { format } from "date-fns";

interface MonthContextType {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  monthString: string;
}

const MonthContext = createContext<MonthContextType | undefined>(undefined);

export function MonthProvider({ children }: { children: ReactNode }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthString = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1
  ).padStart(2, "0")}`;

  return (
    <MonthContext.Provider
      value={{
        currentDate,
        setCurrentDate,
        monthString,
      }}
    >
      {children}
    </MonthContext.Provider>
  );
}

export function useMonth() {
  const context = useContext(MonthContext);
  if (context === undefined) {
    throw new Error("useMonth must be used within a MonthProvider");
  }
  return context;
}
