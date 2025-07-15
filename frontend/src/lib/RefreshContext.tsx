"use client";

import { createContext, useContext, useCallback, useState } from "react";

interface RefreshContextType {
  refreshDashboard: () => void;
  refreshExpenses: () => void;
  refreshSubscriptions: () => void;
  refreshAll: () => void;
  refreshExpenseData: () => void;
  refreshSubscriptionData: () => void;
  dashboardRefreshKey: number;
  expensesRefreshKey: number;
  subscriptionsRefreshKey: number;
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

export function RefreshProvider({ children }: { children: React.ReactNode }) {
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);
  const [expensesRefreshKey, setExpensesRefreshKey] = useState(0);
  const [subscriptionsRefreshKey, setSubscriptionsRefreshKey] = useState(0);

  const refreshDashboard = useCallback(() => {
    setDashboardRefreshKey((prev) => prev + 1);
  }, []);

  const refreshExpenses = useCallback(() => {
    setExpensesRefreshKey((prev) => prev + 1);
  }, []);

  const refreshSubscriptions = useCallback(() => {
    setSubscriptionsRefreshKey((prev) => prev + 1);
  }, []);

  const refreshExpenseData = useCallback(() => {
    setDashboardRefreshKey((prev) => prev + 1);
    setTimeout(() => setExpensesRefreshKey((prev) => prev + 1), 250);
  }, []);

  const refreshSubscriptionData = useCallback(() => {
    setDashboardRefreshKey((prev) => prev + 1);
    setTimeout(() => setSubscriptionsRefreshKey((prev) => prev + 1), 250);
  }, []);

  const refreshAll = useCallback(() => {
    setDashboardRefreshKey((prev) => prev + 1);
    setTimeout(() => setExpensesRefreshKey((prev) => prev + 1), 300);
    setTimeout(() => setSubscriptionsRefreshKey((prev) => prev + 1), 600);
  }, []);

  return (
    <RefreshContext.Provider
      value={{
        refreshDashboard,
        refreshExpenses,
        refreshSubscriptions,
        refreshAll,
        refreshExpenseData,
        refreshSubscriptionData,
        dashboardRefreshKey,
        expensesRefreshKey,
        subscriptionsRefreshKey,
      }}
    >
      {children}
    </RefreshContext.Provider>
  );
}

export function useRefresh() {
  const context = useContext(RefreshContext);
  if (context === undefined) {
    throw new Error("useRefresh must be used within a RefreshProvider");
  }
  return context;
}
