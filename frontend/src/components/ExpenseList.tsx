"use client";

import { useEffect, useState } from "react";
import { BadgeQuestionMark, Pencil, Trash2 } from "lucide-react";
import CategoryPill from "./CategoryPill";
import AddExpenseDialog from "./AddExpenseDialog";
import { useMonth } from "@/lib/MonthContext";
import { CATEGORY_ICONS } from "@/lib/constants";
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
      <div className="flex flex-col gap-3">
          {expenses.map((expense) => {
          const IconComponent = CATEGORY_ICONS[expense.category.icon] || BadgeQuestionMark;
            return (
              <div
                key={expense.id}
              className="flex items-center gap-3 rounded-lg border bg-card p-3 pr-4"
              >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md"
                style={{ backgroundColor: expense.category.color }}
              >
                <IconComponent className="h-5 w-5 text-white" />
                </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate">
                    <p className="font-medium truncate">{expense.note}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(expense.date).toLocaleDateString()}
                    </p>
                    <div className="mt-1">
                  <CategoryPill
                    name={expense.category.name}
                    color={expense.category.color}
                    icon={expense.category.icon}
                  />
                </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-medium whitespace-nowrap">
                      ${Number(expense.amount).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditExpense(expense)}
                        className="rounded-md p-1 hover:bg-black hover:text-white transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="rounded-md p-1 hover:bg-red-600 hover:text-white transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      <AddExpenseDialog
        onExpenseAdded={fetchExpenses}
        isOpen={isAddExpenseOpen}
        onOpenChange={setIsAddExpenseOpen}
        editExpense={editingExpense}
      />
    </div>
  );
}
