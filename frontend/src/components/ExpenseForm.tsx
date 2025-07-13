"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, CircleDot, Trash2, Pencil } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import CategoryDialog from "./AddCategoryDialog";
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
  amount: string;
  date: string;
  categoryId: string;
  note: string;
}

const formSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
  date: z.string().min(1, "Date is required"),
  categoryId: z.string().min(1, "Category is required"),
  note: z.string().min(1, "Note is required").max(500, "Note is too long"),
});

interface ExpenseFormProps {
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>;
  isSubmitting?: boolean;
  defaultValues?: Expense;
}

export default function ExpenseForm({
  onSubmit,
  isSubmitting = false,
  defaultValues,
}: ExpenseFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(
    undefined
  );
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      amount: "",
      date: new Date().toISOString().split("T")[0],
      categoryId: "",
      note: "",
    },
  });

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (response.status === 409) {
          toast({
            variant: "destructive",
            title: "Cannot delete category",
            description:
              "Please delete all expenses in this category first before deleting it.",
          });
          return;
        }
        throw new Error(errorData?.message || "Failed to delete category");
      }

      await fetchCategories();
      if (form.getValues("categoryId") === id) {
        form.setValue("categoryId", "");
      }
      toast({
        title: "Category deleted",
        description: `Category "${name}" has been deleted successfully.`,
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete category. Please try again.",
      });
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsAddCategoryOpen(true);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        placeholder="0.00"
                        {...field}
                        type="number"
                        step="0.01"
                        min="0"
                        className="pl-7"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category">
                        {field.value &&
                          categories.find((c) => c.id === field.value) && (
                            <div className="flex items-center gap-2 py-1">
                              <div
                                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                                style={{
                                  backgroundColor: categories.find(
                                    (c) => c.id === field.value
                                  )?.color,
                                }}
                              >
                                {(() => {
                                  const category = categories.find(
                                    (c) => c.id === field.value
                                  );
                                  const IconComponent = category
                                    ? CATEGORY_ICONS[category.icon]
                                    : CircleDot;
                                  return IconComponent ? (
                                    <IconComponent className="h-4 w-4 text-white" />
                                  ) : (
                                    <CircleDot className="h-4 w-4 text-white" />
                                  );
                                })()}
                              </div>
                              <span className="flex-1 truncate">
                                {
                                  categories.find((c) => c.id === field.value)
                                    ?.name
                                }
                              </span>
                            </div>
                          )}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <div className="grid grid-cols-1 gap-2 p-2">
                      {categories.length === 0 ? (
                        <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                          No categories yet. Create one to get started!
                        </div>
                      ) : (
                        categories.map((category) => {
                          const IconComponent =
                            CATEGORY_ICONS[category.icon] || CircleDot;
                          return (
                            <div
                              key={category.id}
                              className="flex items-center"
                            >
                              <div className="flex-1 flex items-center">
                                <SelectItem
                                  value={category.id}
                                  className="flex-1 transition-colors duration-200 data-[state=checked]:bg-black data-[state=checked]:text-white hover:bg-black hover:text-white cursor-pointer"
                                >
                                  <div className="flex items-center gap-2 py-1">
                                    <div
                                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                                      style={{
                                        backgroundColor: category.color,
                                      }}
                                    >
                                      <IconComponent className="h-4 w-4 text-white" />
                                    </div>
                                    <span className="flex-1 truncate font-medium">
                                      {category.name}
                                    </span>
                                  </div>
                                </SelectItem>
                                <div className="flex gap-1">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="ml-2 px-2 text-muted-foreground hover:text-blue-500 hover:bg-blue-50"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleEditCategory(category);
                                    }}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="px-2 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleDeleteCategory(
                                        category.id,
                                        category.name
                                      );
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <button
                          type="button"
                          className="flex-1 flex items-center gap-2 rounded-lg p-2 text-muted-foreground transition-colors duration-200 hover:bg-black hover:text-white cursor-pointer"
                          onClick={() => {
                            setEditingCategory(undefined);
                            setIsAddCategoryOpen(true);
                          }}
                        >
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted">
                            <Plus className="h-4 w-4" />
                          </div>
                          <span className="flex-1 truncate font-medium">
                            Add New Category
                          </span>
                        </button>
                      </div>
                    </div>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Note</FormLabel>
                <FormControl>
                  <Input placeholder="What's this expense for?" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[120px] bg-black text-white hover:bg-black/90"
            >
              {isSubmitting ? "Adding..." : "Add Expense"}
            </Button>
          </div>
        </form>
      </Form>

      <CategoryDialog
        isOpen={isAddCategoryOpen}
        onClose={() => {
          setIsAddCategoryOpen(false);
          setEditingCategory(undefined);
        }}
        onCategoryAdded={fetchCategories}
        editCategory={editingCategory}
      />
    </>
  );
}
