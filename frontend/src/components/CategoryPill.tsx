"use client";

import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";
import { BadgeQuestionMark, LucideIcon } from "lucide-react";

interface CategoryPillProps {
  name: string;
  color: string;
  icon: string;
  className?: string;
}

export default function CategoryPill({
  name,
  color,
  icon,
  className = "",
}: CategoryPillProps) {
  const Icon =
    (Icons as unknown as Record<string, LucideIcon>)[icon] || BadgeQuestionMark;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        className
      )}
      style={{ backgroundColor: `${color}15`, color }}
    >
      <Icon className="h-3.5 w-3.5" />
      {name}
    </div>
  );
}
