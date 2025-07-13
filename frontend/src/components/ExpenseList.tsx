"use client";

import { useEffect, useState } from "react";
import { BadgeQuestionMark, Pencil, Trash2 } from "lucide-react";
import CategoryPill from "./CategoryPill";
import AddExpenseDialog from "./AddExpenseDialog";
import { useMonth } from "@/lib/MonthContext";
import { CATEGORY_ICONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface Expense {
  id: string;
  date: string;
  note: string;
  amount: string;
  categoryId: string; // Added this field
  category: Category;
}

export default function ExpenseList() {
  const { monthString } = useMonth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(
    undefined
  );
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const { toast } = useToast();

  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/expenses?month=${monthString}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message ||
            `Failed to fetch expenses: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      setExpenses(data);
    } catch (err) {
      console.error("Error fetching expenses:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete expense");
      }

      await fetchExpenses();
      toast({
        title: "Expense deleted",
        description: "Successfully deleted the expense.",
      });
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete expense. Please try again.",
      });
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsAddExpenseOpen(true);
  };

  useEffect(() => {
    fetchExpenses();
  }, [monthString]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-error">
        <BadgeQuestionMark className="h-8 w-8 mb-2" />
        <p className="text-center">{error}</p>
        <p className="text-sm text-muted mt-2">
          Make sure the backend server is running on port 3333
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AddExpenseDialog
        onExpenseAdded={fetchExpenses}
        isOpen={isAddExpenseOpen}
        onOpenChange={setIsAddExpenseOpen}
        editExpense={editingExpense}
      />

      {expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted">
          <BadgeQuestionMark className="h-8 w-8 mb-2" />
          <p>No expenses found for this month</p>
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => {
            const Icon =
              CATEGORY_ICONS[expense.category.icon] || BadgeQuestionMark;

            return (
              <div
                key={expense.id}
                className="flex items-center gap-4 rounded-xl border border-secondary p-4 hover:bg-secondary/5 transition-colors group"
              >
                <div className="flex min-w-[60px] items-center justify-center text-sm text-muted tabular-nums">
                  {new Date(expense.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </div>

                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: `${expense.category.color}15`,
                    color: expense.category.color,
                  }}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <div className="flex-1">
                  <div className="font-medium text-primary">{expense.note}</div>
                  <CategoryPill
                    name={expense.category.name}
                    color={expense.category.color}
                    icon={expense.category.icon}
                    className="mt-1"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <div className="min-w-[100px] text-right font-medium text-primary tabular-nums">
                    ${Number(expense.amount).toFixed(2)}
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="px-2 text-muted-foreground hover:text-blue-500 hover:bg-blue-50"
                      onClick={() => handleEditExpense(expense)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="px-2 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                      onClick={() => handleDeleteExpense(expense.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
