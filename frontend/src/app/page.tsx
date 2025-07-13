import Image from "next/image";
import DarkSwitch from "@/components/DarkSwitch";
import ExpenseList from "@/components/ExpenseList"

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 rounded-xl border bg-secondary/10 p-6 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4 text-primary">Recent Expenses</h2>
          <ExpenseList />
        </div>
        <div className="rounded-xl border bg-primary/5 p-6 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4 text-secondary">Monthly Summary</h2>
          <p className="text-primary/60">Your monthly stats will appear here</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="rounded-xl border bg-secondary/10 p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-primary">Top Categories</h2>
          <p className="text-primary/60">Category breakdown will appear here</p>
        </div>
        <div className="rounded-xl border bg-primary/5 p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-secondary">Spending Trends</h2>
          <p className="text-primary/60">Trend chart will appear here</p>
        </div>
        <div className="rounded-xl border bg-secondary/10 p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-primary">Budget Status</h2>
          <p className="text-primary/60">Budget progress will appear here</p>
        </div>
      </div>
    </div>
  )
}
