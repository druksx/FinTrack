"use client";

import Image from "next/image";
import DarkSwitch from "@/components/DarkSwitch";
import ExpenseList from "@/components/ExpenseList";
import DashboardCards from "@/components/DashboardCards";
import ExportExpenses from "@/components/ExportExpenses";
import SubscriptionCalendar from "@/components/SubscriptionCalendar";
import AddSubscriptionDialog from "@/components/AddSubscriptionDialog";

export default function Home() {
  return (
    <div className="space-y-4">
      <div className="min-h-[calc(100vh-8rem)] grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column - Recent Expenses */}
        <div className="lg:col-span-4">
          <div className="rounded-xl border bg-secondary/10 shadow-sm flex flex-col max-h-[calc(100vh-9rem)]">
            <div className="p-4 pb-3 border-b bg-secondary/10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-primary">
                  Recent Expenses
                </h2>
                <ExportExpenses />
              </div>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              <ExpenseList />
            </div>
          </div>
        </div>

        {/* Right Column - Dashboard Cards and Calendar */}
        <div className="lg:col-span-8 space-y-4">
          {/* Dashboard Cards */}
          <div className="rounded-xl border bg-card shadow-sm p-4">
            <DashboardCards />
          </div>

          {/* Subscriptions Section */}
          <div className="rounded-xl border bg-card shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Subscriptions</h2>
              <AddSubscriptionDialog />
            </div>
            <SubscriptionCalendar />
          </div>
        </div>
      </div>
    </div>
  );
}
