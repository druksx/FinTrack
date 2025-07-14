"use client";

import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { useUser } from "@/lib/UserContext";
import { User } from "lucide-react";
import DarkSwitch from "./DarkSwitch";

export default function Navbar() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  const handleProfileClick = () => {
    if (user) {
      router.push("/profile");
    } else {
      router.push("/auth/signin");
    }
  };

  const handleHomeClick = () => {
    router.push("/");
  };

  // Don't show navbar while loading or if user is not authenticated
  if (isLoading || !user) {
    return null;
  }

  return (
    <nav className="flex items-center justify-between bg-card/50 backdrop-blur-sm border-b px-6 py-4">
      <div className="flex items-center gap-4">
        <button
          onClick={handleHomeClick}
          className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer"
        >
          FinTrack
        </button>
        <div className="hidden md:block text-sm text-muted-foreground">
          Personal Finance Manager
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          Welcome, {user.name || user.email}
        </span>
        <DarkSwitch />
        <Button
          variant="outline"
          size="sm"
          onClick={handleProfileClick}
          className="flex items-center gap-2"
        >
          <User className="h-4 w-4" />
          Profile
        </Button>
      </div>
    </nav>
  );
}
