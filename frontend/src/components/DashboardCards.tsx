"use client";

import { useEffect, useState, useCallback } from "react";
import { useMonth } from "@/lib/MonthContext";
import { apiClient, API_ENDPOINTS } from "@/lib/api";
import { useUser } from "@/lib/UserContext";
import { useRefresh } from "@/lib/RefreshContext";
import { ArrowDown, ArrowUp, BadgeQuestionMark, CircleDot } from "lucide-react";
import { CATEGORY_ICONS } from "@/lib/constants";
import ExpenseCharts from "./ExpenseCharts";

interface CategoryTotal {
  id: string;
  name: string;
  color: string;
  icon: string;
  total: string;
  percentage: number;
}

interface MonthComparison {
  currentMonth: string;
  previousMonth: string;
  percentageChange: number;
}

interface DashboardData {
  totalExpenses: string;
  topCategories: CategoryTotal[];
  monthComparison: MonthComparison;
  charts: ChartData;
}

interface DailyExpense {
  date: string;
  total: string;
}

interface WeekdayExpense {
  day: string;
  average: string;
}

interface ChartData {
  dailyExpenses: DailyExpense[];
  weekdayAverages: WeekdayExpense[];
}

export default function DashboardCards() {
  const { monthString } = useMonth();
  const { user, isLoading: userLoading } = useUser();
  const { dashboardRefreshKey } = useRefresh();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiClient.get(
        `${API_ENDPOINTS.EXPENSES}/dashboard?month=${monthString}`,
        user.id
      );
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [user, monthString]);

  useEffect(() => {
    if (!userLoading) {
      fetchDashboardData();
    }
  }, [userLoading, dashboardRefreshKey, fetchDashboardData]);

  if (userLoading || isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-xl border bg-card text-card-foreground shadow-sm animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-error">
        <BadgeQuestionMark className="h-8 w-8 mb-2" />
        <p className="text-center">{error}</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6 transition-opacity duration-300">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Total Expenses
          </h3>
          <div className="text-2xl font-bold mb-3">
            $
            {Number(data.totalExpenses).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <div className="flex items-center gap-2 text-sm">
            {data.monthComparison.percentageChange > 0 ? (
              <>
                <ArrowUp className="h-4 w-4 text-red-500" />
                <span className="text-red-500">
                  {data.monthComparison.percentageChange}% from last month
                </span>
              </>
            ) : data.monthComparison.percentageChange < 0 ? (
              <>
                <ArrowDown className="h-4 w-4 text-green-500" />
                <span className="text-green-500">
                  {Math.abs(data.monthComparison.percentageChange)}% from last
                  month
                </span>
              </>
            ) : (
              <span className="text-muted-foreground">
                No change from last month
              </span>
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Month Comparison
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Current Month</p>
              <p className="text-xl font-bold">
                $
                {Number(data.monthComparison.currentMonth).toLocaleString(
                  "en-US",
                  { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Previous Month</p>
              <p className="text-xl font-bold">
                $
                {Number(data.monthComparison.previousMonth).toLocaleString(
                  "en-US",
                  { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Top Category
          </h3>
          {data.topCategories[0] && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: data.topCategories[0].color }}
                >
                  {(() => {
                    const IconComponent =
                      CATEGORY_ICONS[data.topCategories[0].icon] || CircleDot;
                    return <IconComponent className="h-5 w-5 text-white" />;
                  })()}
                </div>
                <div>
                  <p className="font-medium">{data.topCategories[0].name}</p>
                  <p className="text-sm text-muted-foreground">
                    {data.topCategories[0].percentage}% of total
                  </p>
                </div>
              </div>
              <p className="text-xl font-bold">
                $
                {Number(data.topCategories[0].total).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          )}
        </div>
      </div>

      {data && <ExpenseCharts data={data} />}
    </div>
  );
}
