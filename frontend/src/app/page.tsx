import Image from "next/image";
import DarkSwitch from "@/components/DarkSwitch";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-text">
      <div className="absolute top-4 right-4">
        <DarkSwitch />
      </div>

      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-5xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          FinTrack Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature Card 1 */}
          <div className="bg-primary/5 backdrop-blur-sm p-6 rounded-2xl border border-primary/20 hover:border-secondary transition-all duration-300">
            <div className="h-12 w-12 bg-secondary rounded-xl mb-4 flex items-center justify-center text-background text-xl">
              💰
            </div>
            <h2 className="text-xl font-semibold mb-2 text-primary dark:text-secondary">Expenses</h2>
            <p className="text-text/80">Track your daily expenses and categorize your spending habits.</p>
          </div>

          {/* Feature Card 2 */}
          <div className="bg-secondary/5 backdrop-blur-sm p-6 rounded-2xl border border-secondary/20 hover:border-primary transition-all duration-300">
            <div className="h-12 w-12 bg-primary rounded-xl mb-4 flex items-center justify-center text-background text-xl">
              📊
            </div>
            <h2 className="text-xl font-semibold mb-2 text-secondary dark:text-primary">Analytics</h2>
            <p className="text-text/80">Visualize your financial data with interactive charts and graphs.</p>
          </div>

          {/* Feature Card 3 */}
          <div className="bg-accent/5 backdrop-blur-sm p-6 rounded-2xl border border-accent/20 hover:border-secondary transition-all duration-300">
            <div className="h-12 w-12 bg-secondary rounded-xl mb-4 flex items-center justify-center text-background text-xl">
              🎯
            </div>
            <h2 className="text-xl font-semibold mb-2 text-primary dark:text-secondary">Goals</h2>
            <p className="text-text/80">Set and track your financial goals with smart notifications.</p>
          </div>

          {/* Stats Section */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-primary text-background p-8 rounded-2xl flex flex-col items-center justify-center">
              <h3 className="text-2xl font-bold mb-4">Monthly Overview</h3>
              <div className="w-full grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-secondary text-3xl font-bold">$2,450</p>
                  <p className="text-background/80">Income</p>
                </div>
                <div className="text-center">
                  <p className="text-secondary text-3xl font-bold">$1,850</p>
                  <p className="text-background/80">Expenses</p>
                </div>
              </div>
            </div>

            <div className="bg-secondary text-background p-8 rounded-2xl flex flex-col items-center justify-center">
              <h3 className="text-2xl font-bold mb-4">Savings Goal</h3>
              <div className="w-full">
                <div className="flex justify-between mb-2">
                  <span>Progress</span>
                  <span>75%</span>
                </div>
                <div className="w-full bg-background/20 rounded-full h-4">
                  <div className="bg-primary h-4 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-3 flex flex-wrap gap-4 justify-center mt-6">
            <button className="px-6 py-3 bg-primary text-background rounded-xl hover:bg-primary/90 transition-colors">
              Add Transaction
            </button>
            <button className="px-6 py-3 bg-secondary text-background rounded-xl hover:bg-secondary/90 transition-colors">
              View Reports
            </button>
            <button className="px-6 py-3 border border-accent/20 rounded-xl hover:bg-accent/5 transition-colors">
              Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
