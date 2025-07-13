"use client";

import { useEffect, useState } from "react";
import { useMonth } from "@/lib/MonthContext";
import { BadgeQuestionMark, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { API_ENDPOINTS } from "@/lib/api";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import AddSubscriptionDialog from "./AddSubscriptionDialog";
import { Subscription } from "@/lib/types";

interface CalendarDay {
  date: number;
  subscriptions: Subscription[];
}

export default function SubscriptionCalendar() {
  const { monthString } = useMonth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [calendar, setCalendar] = useState<CalendarDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  // Function to generate calendar days
  const generateCalendar = (
    year: number,
    month: number,
    subscriptions: Subscription[]
  ) => {
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();

    // Only current month days
    return Array.from({ length: daysInMonth }, (_, i) => ({
      date: i + 1,
      subscriptions: subscriptions.filter((sub) => {
        const subDate = new Date(sub.nextPayment);
        return subDate.getDate() === i + 1;
      }),
    }));
  };

  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);
      const [year, month] = monthString.split("-");
      const response = await fetch(
        `/api/subscriptions/month?year=${year}&month=${month}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch subscriptions");
      }

      const data = await response.json();
      setSubscriptions(data);
      setCalendar(generateCalendar(Number(year), Number(month), data));
    } catch (err) {
      console.error("Error fetching subscriptions:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [monthString]);

  const handleDeleteSubscription = async (id: string) => {
    try {
      const response = await fetch(`/api/subscriptions/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete subscription");
      }

      setSelectedSubscription(null);
      const [year, month] = monthString.split("-");
      await fetchSubscriptions();
      
      toast({
        title: "Success",
        description: "Subscription deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting subscription:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete subscription. Please try again.",
      });
    }
  };

  const handleEditClick = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setIsEditDialogOpen(true);
  };

  const handleSubscriptionUpdated = async () => {
    setIsEditDialogOpen(false);
    setSelectedSubscription(null);
    await fetchSubscriptions();
  };

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
      </div>
    );
  }

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const firstDayOfMonth = new Date(monthString + "-01").getDay(); // 0 = Sunday

  return (
    <div className="space-y-4">
      {/* Calendar Grid */}
      <div className="rounded-lg border bg-card overflow-hidden">
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-px border-b bg-muted">
          {weekDays.map((day) => (
            <div
              key={day}
              className="bg-background p-2 text-center text-xs font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-px bg-muted">
          {/* Empty cells for days before the first of the month */}
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`empty-start-${index}`} className="bg-background p-2 min-h-[80px]" />
          ))}
          
          {/* Current month days */}
          {calendar.map((day, index) => (
            <div
              key={index}
              className="min-h-[80px] bg-background p-2 relative"
            >
              <div className="font-medium text-xs mb-1 text-muted-foreground">{day.date}</div>
              <div className="flex flex-wrap gap-1">
                {day.subscriptions.map((subscription) => (
                  <Tooltip key={subscription.id}>
                    <TooltipTrigger asChild>
                      <div
                        role="button"
                        tabIndex={0}
                        className="w-6 h-6 rounded-md flex items-center justify-center cursor-pointer transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary"
                        style={{
                          backgroundColor: subscription.category.color,
                        }}
                        onClick={() => setSelectedSubscription(subscription)}
                      >
                        {subscription.logoUrl ? (
                          <Image
                            src={subscription.logoUrl}
                            alt={subscription.name}
                            width={16}
                            height={16}
                            className="rounded-sm"
                          />
                        ) : (
                          <BadgeQuestionMark className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="center">
                      <div className="space-y-1">
                        <div className="font-medium">{subscription.name}</div>
                        <div className="text-xs opacity-90">
                          ${Number(subscription.amount).toFixed(2)} • {subscription.recurrence.toLowerCase()}
                        </div>
                        <div className="text-xs opacity-90">
                          {subscription.category.name}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subscription Details Dialog */}
      <Dialog open={selectedSubscription !== null} onOpenChange={(open) => !open && setSelectedSubscription(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subscription Details</DialogTitle>
          </DialogHeader>
          {selectedSubscription && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: selectedSubscription.category.color }}
                >
                  {selectedSubscription.logoUrl ? (
                    <Image
                      src={selectedSubscription.logoUrl}
                      alt={selectedSubscription.name}
                      width={32}
                      height={32}
                      className="rounded-md"
                    />
                  ) : (
                    <BadgeQuestionMark className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-lg">{selectedSubscription.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedSubscription.category.name}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Amount</p>
                  <p className="font-medium">${Number(selectedSubscription.amount).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Recurrence</p>
                  <p className="font-medium">{selectedSubscription.recurrence.toLowerCase()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Start Date</p>
                  <p className="font-medium">
                    {new Date(selectedSubscription.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Next Payment</p>
                  <p className="font-medium">
                    {new Date(selectedSubscription.nextPayment).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => handleEditClick(selectedSubscription)}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteSubscription(selectedSubscription.id)}
                  data-delete="true"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Subscription Dialog */}
      <AddSubscriptionDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        editSubscription={selectedSubscription || undefined}
        onSubscriptionAdded={handleSubscriptionUpdated}
      />
    </div>
  );
}
