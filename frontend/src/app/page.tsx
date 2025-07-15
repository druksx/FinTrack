"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ExpenseList from "@/components/ExpenseList";
import DashboardCards from "@/components/DashboardCards";
import ExportExpenses from "@/components/ExportExpenses";
import SubscriptionCalendar from "@/components/SubscriptionCalendar";
import AddSubscriptionDialog from "@/components/AddSubscriptionDialog";
import MonthSelector from "@/components/MonthSelector";
import { useUser } from "@/lib/UserContext";

export default function Home() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Redirect to signin if user is not authenticated and loading is complete
    if (!isLoading && !user) {
      router.push("/auth/signin");
    }
  }, [user, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render anything if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header with Month Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Track your expenses and subscriptions</p>
        </div>
        <MonthSelector />
      </div>

      <div className="min-h-[calc(100vh-12rem)] grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Recent Expenses and Subscriptions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Recent Expenses */}
          <div className="rounded-xl border bg-card shadow-sm flex flex-col max-h-[calc(50vh-7rem)]">
            <div className="p-6 pb-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">
                  Recent Expenses
                </h2>
                <ExportExpenses />
              </div>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              <ExpenseList />
            </div>
          </div>

          {/* Subscriptions Section */}
          <div className="rounded-xl border bg-card shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Subscriptions</h2>
              <div className="flex items-center gap-2">
                <AddSubscriptionDialog />
              </div>
            </div>
            <SubscriptionCalendar />
          </div>
        </div>

        {/* Right Column - Dashboard Cards */}
        <div className="lg:col-span-8">
          {/* Dashboard Cards */}
          <div className="rounded-xl border bg-card shadow-sm p-6">
            <DashboardCards />
          </div>
        </div>
      </div>
    </div>
  );
}
