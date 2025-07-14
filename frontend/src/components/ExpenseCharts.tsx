"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "next-themes";

interface DailyExpense {
  date: string;
  total: string;
}

interface WeekdayExpense {
  day: string;
  average: string;
}

interface CategoryTotal {
  id: string;
  name: string;
  color: string;
  icon: string;
  total: string;
  percentage: number;
}

interface ChartData {
  dailyExpenses: DailyExpense[];
  weekdayAverages: WeekdayExpense[];
}

interface ExpenseChartsProps {
  data: {
    charts: ChartData;
    topCategories: CategoryTotal[];
  };
}

export default function ExpenseCharts({ data }: ExpenseChartsProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Theme-aware colors
  const textColor = isDark ? "#ffffff" : "#000000";
  const gridColor = isDark ? "#374151" : "#e5e7eb";
  const backgroundColor = isDark ? "#1f2937" : "#ffffff";

  // Process daily expenses data
  const dailyExpensesData = data.charts.dailyExpenses.map((day) => ({
    date: new Date(day.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    total: Number(day.total),
  }));

  // Process weekday data
  const weekdayData = data.charts.weekdayAverages.map((day) => ({
    day: day.day.slice(0, 3), // Get first 3 letters
    average: Number(day.average),
  }));

  // Process category data for pie chart
  const categoryData = data.topCategories.map((cat) => ({
    name: cat.name,
    value: Number(cat.total),
    color: cat.color,
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Daily Expenses Line Chart */}
      <div className="rounded-xl border bg-card p-4 shadow-sm md:col-span-2">
        <h3 className="text-sm font-semibold mb-2 text-foreground">Daily Expenses</h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyExpensesData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: textColor }}
                interval={"preserveStartEnd"}
                axisLine={{ stroke: gridColor }}
                tickLine={{ stroke: gridColor }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: textColor }}
                tickFormatter={(value) => `$${value}`}
                axisLine={{ stroke: gridColor }}
                tickLine={{ stroke: gridColor }}
              />
              <Tooltip
                formatter={(value: number) =>
                  `$${value.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                }
                contentStyle={{
                  backgroundColor: backgroundColor,
                  border: `1px solid ${gridColor}`,
                  borderRadius: "8px",
                  color: textColor,
                }}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke={isDark ? "#60a5fa" : "#3b82f6"}
                strokeWidth={2}
                dot={{ fill: isDark ? "#60a5fa" : "#3b82f6", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekday Averages Bar Chart */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <h3 className="text-sm font-semibold mb-2 text-foreground">Average by Day</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekdayData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fill: textColor }}
                axisLine={{ stroke: gridColor }}
                tickLine={{ stroke: gridColor }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: textColor }}
                tickFormatter={(value) => `$${value}`}
                axisLine={{ stroke: gridColor }}
                tickLine={{ stroke: gridColor }}
              />
              <Tooltip
                formatter={(value: number) =>
                  `$${value.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                }
                contentStyle={{
                  backgroundColor: backgroundColor,
                  border: `1px solid ${gridColor}`,
                  borderRadius: "8px",
                  color: textColor,
                }}
              />
              <Bar
                dataKey="average"
                fill={isDark ? "#34d399" : "#10b981"}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown Pie Chart */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <h3 className="text-sm font-semibold mb-2 text-foreground">Top Categories</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) =>
                  `$${value.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                }
                contentStyle={{
                  backgroundColor: backgroundColor,
                  border: `1px solid ${gridColor}`,
                  borderRadius: "8px",
                  color: textColor,
                }}
              />
              <Legend
                wrapperStyle={{
                  fontSize: "12px",
                  color: textColor,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
} 