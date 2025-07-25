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
import { apiClient, API_ENDPOINTS } from "@/lib/api";
import { Subscription } from "@/lib/types";
import { useUser } from "@/lib/UserContext";
import { useRefresh } from "@/lib/RefreshContext";

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
  const [internalOpen, setInternalOpen] = useState(false);
  const { user } = useUser();
  const { toast } = useToast();
  const { refreshAll } = useRefresh();

  const handleSubmit = async (data: any) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User not authenticated",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const formattedData = {
        ...data,
        amount: Number(parseFloat(data.amount).toFixed(2)),
        startDate: new Date(data.startDate).toISOString().split("T")[0],
      };

      const response = editSubscription
        ? await apiClient.put(
            `${API_ENDPOINTS.SUBSCRIPTIONS}/${editSubscription.id}`,
            formattedData,
            user.id
          )
        : await apiClient.post(
            API_ENDPOINTS.SUBSCRIPTIONS,
            formattedData,
            user.id
          );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Failed to ${editSubscription ? "update" : "create"} subscription`
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

      refreshAll();
    } catch (error) {
      console.error("Error submitting subscription:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : `Failed to ${
                editSubscription ? "update" : "create"
              } subscription. Please try again.`,
      });
    } finally {
      setIsSubmitting(false);
      if (onOpenChange) {
        onOpenChange(false);
      } else {
        setInternalOpen(false);
      }
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
    <Dialog open={internalOpen} onOpenChange={setInternalOpen}>
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
