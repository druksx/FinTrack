import { Download } from "lucide-react";
import { Button } from "./ui/button";
import { useMonth } from "@/lib/MonthContext";
import { useToast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Add the type augmentation for jsPDF
declare module "jspdf" {
  interface jsPDF {
    autoTable: typeof autoTable;
    lastAutoTable: { finalY: number };
  }
}

export default function ExportExpenses() {
  const { monthString } = useMonth();
  const { toast } = useToast();

  const fetchExpenses = async () => {
    try {
      const response = await fetch(`/api/expenses/export?month=${monthString}`);
      if (!response.ok) {
        throw new Error("Failed to fetch expenses");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch expenses for export",
      });
      return null;
    }
  };

  const downloadCSV = async () => {
    const expenses = await fetchExpenses();
    if (!expenses) return;

    const headers = ["Date", "Amount ($)", "Category", "Note", "Type"];
    const csvContent = [
      headers.join(","),
      ...expenses.map((expense: any) =>
        [
          expense.date,
          expense.amount,
          `"${expense.category}"`,
          `"${expense.note.replace(/"/g, '""')}"`,
          `"${expense.type}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `expenses-${monthString}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Success",
      description: "CSV file has been downloaded",
    });
  };

  const downloadPDF = async () => {
    const expenses = await fetchExpenses();
    if (!expenses) return;

    // Initialize PDF with A4 format
    const doc = new jsPDF("p", "mm", "a4");
    const monthDate = new Date(monthString + "-01");
    const monthName = monthDate.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    // Add title
    doc.setFontSize(16);
    doc.text(`Expenses for ${monthName}`, 14, 20);

    // Calculate totals by type
    const totals = expenses.reduce(
      (acc: { manual: number; subscription: number }, expense: any) => {
        if (expense.type === "Manual Expense") {
          acc.manual += Number(expense.amount);
        } else {
          acc.subscription += Number(expense.amount);
        }
        return acc;
      },
      { manual: 0, subscription: 0 }
    );

    // Add table
    autoTable(doc, {
      startY: 30,
      head: [["Date", "Amount ($)", "Category", "Note", "Type"]],
      body: expenses.map((expense: any) => [
        expense.date,
        expense.amount,
        expense.category,
        expense.note,
        expense.type,
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [23, 23, 23] },
    });

    // Add summary
    const finalY = doc.lastAutoTable.finalY || 30;
    doc.setFontSize(12);
    doc.text("Summary:", 14, finalY + 10);
    doc.text(`Manual Expenses: $${totals.manual.toFixed(2)}`, 14, finalY + 20);
    doc.text(
      `Subscriptions: $${totals.subscription.toFixed(2)}`,
      14,
      finalY + 30
    );
    doc.text(
      `Total: $${(totals.manual + totals.subscription).toFixed(2)}`,
      14,
      finalY + 40
    );

    // Save the PDF
    doc.save(`expenses-${monthString}.pdf`);

    toast({
      title: "Success",
      description: "PDF file has been downloaded",
    });
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={downloadCSV}
      >
        <Download className="h-4 w-4" />
        CSV
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={downloadPDF}
      >
        <Download className="h-4 w-4" />
        PDF
      </Button>
    </div>
  );
}
