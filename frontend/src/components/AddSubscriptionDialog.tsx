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
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SubscriptionForm from "./SubscriptionForm";
import { API_ENDPOINTS } from "@/lib/api";
import { Subscription } from "@/lib/types";

interface AddSubscriptionDialogProps {
  onSubscriptionAdded?: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  editSubscription?: Subscription;
}

export default function AddSubscriptionDialog({
  onSubscriptionAdded,
  isOpen,
  onOpenChange,
  editSubscription,
}: AddSubscriptionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      // Format the data for the API
      const formattedData = {
        ...data,
        // Convert amount to number and handle potential decimal places
        amount: Number(parseFloat(data.amount).toFixed(2)),
        // Ensure date is in the correct format
        startDate: new Date(data.startDate).toISOString().split('T')[0],
      };

      const response = await fetch(
        editSubscription
          ? `/api/subscriptions/${editSubscription.id}`
          : "/api/subscriptions",
        {
          method: editSubscription ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Failed to ${editSubscription ? "update" : "create"} subscription`
        );
      }

      toast({
        title: "Success",
        description: `Successfully ${
          editSubscription ? "updated" : "created"
        } subscription.`,
      });

      if (onSubscriptionAdded) {
        onSubscriptionAdded();
      }

      if (onOpenChange) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error submitting subscription:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${
          editSubscription ? "update" : "create"
        } subscription. Please try again.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const content = (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>
          {editSubscription ? "Edit Subscription" : "Add New Subscription"}
        </DialogTitle>
      </DialogHeader>
      <SubscriptionForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        defaultValues={editSubscription}
      />
    </DialogContent>
  );

  return isOpen !== undefined ? (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {content}
    </Dialog>
  ) : (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Subscription
        </Button>
      </DialogTrigger>
      {content}
    </Dialog>
  );
}
