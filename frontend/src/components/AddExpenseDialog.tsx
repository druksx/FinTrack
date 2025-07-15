"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import ExpenseForm from "./ExpenseForm";
import { useToast } from "@/hooks/use-toast";
import { apiClient, API_ENDPOINTS } from "@/lib/api";
import { useUser } from "@/lib/UserContext";
import { useRefresh } from "@/lib/RefreshContext";

interface Expense {
  id: string;
  amount: string;
  date: string;
  categoryId: string;
  note: string;
}

interface AddExpenseDialogProps {
  onExpenseAdded: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editExpense?: Expense;
}

export default function AddExpenseDialog({
  onExpenseAdded,
  isOpen,
  onOpenChange,
  editExpense,
}: AddExpenseDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();
  const { toast } = useToast();
  const { refreshAll } = useRefresh();

  const handleSubmit = async (values: any) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User not authenticated",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editExpense
        ? `${API_ENDPOINTS.EXPENSES}/${editExpense.id}`
        : API_ENDPOINTS.EXPENSES;

      const method = editExpense ? "PUT" : "POST";

      const response =
        method === "PUT"
          ? await apiClient.put(url, values, user.id)
          : await apiClient.post(url, values, user.id);

      if (!response.ok) {
        throw new Error(
          editExpense ? "Failed to update expense" : "Failed to add expense"
        );
      }

      onOpenChange(false);
      refreshAll();
      toast({
        title: editExpense ? "Expense updated" : "Expense added",
        description: editExpense
          ? `Successfully updated expense of $${Number(values.amount).toFixed(
              2
            )}`
          : `Successfully added expense of $${Number(values.amount).toFixed(
              2
            )}`,
      });
    } catch (error) {
      console.error(
        editExpense ? "Error updating expense:" : "Error adding expense:",
        error
      );
      toast({
        variant: "destructive",
        title: "Error",
        description: editExpense
          ? "Failed to update expense. Please try again."
          : "Failed to add expense. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full bg-black text-white hover:bg-black/90">
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {editExpense ? "Edit Expense" : "Add New Expense"}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <ExpenseForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            defaultValues={editExpense}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
