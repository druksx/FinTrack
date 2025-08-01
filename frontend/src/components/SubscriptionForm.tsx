"use client";

import { useEffect, useState, useCallback } from "react";
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
import { Search, CircleDot } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CATEGORY_ICONS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { apiClient, API_ENDPOINTS } from "@/lib/api";
import { Subscription, Category } from "@/lib/types";
import { useUser } from "@/lib/UserContext";

interface SubscriptionFormProps {
  onSubmit: (data: any) => Promise<void>;
  isSubmitting?: boolean;
  defaultValues?: Subscription;
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.string().min(1, "Amount is required"),
  logoUrl: z.string().optional(),
  recurrence: z.enum(["MONTHLY", "ANNUALLY"]),
  startDate: z.string(),
  categoryId: z.string().min(1, "Category is required"),
});

export default function SubscriptionForm({
  onSubmit,
  isSubmitting = false,
  defaultValues,
}: SubscriptionFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSearchingLogo, setIsSearchingLogo] = useState(false);
  const { user, isLoading: userLoading } = useUser();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      name: "",
      amount: "",
      logoUrl: "",
      recurrence: "MONTHLY",
      startDate: new Date().toISOString().split("T")[0],
      categoryId: "",
    },
    values: defaultValues
      ? {
          ...defaultValues,
          amount: defaultValues.amount.toString(),
          startDate: new Date(defaultValues.startDate)
            .toISOString()
            .split("T")[0],
        }
      : undefined,
  });

  const fetchCategories = useCallback(async () => {
    if (!user) return;

    try {
      const response = await apiClient.get(API_ENDPOINTS.CATEGORIES, user.id);
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, [user]);

  const searchLogo = async () => {
    const name = form.getValues("name");
    if (!name) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a subscription name first",
      });
      return;
    }

    setIsSearchingLogo(true);
    try {
      const domain = name.toLowerCase().replace(/[^a-z0-9]/g, "");
      const apiKey = process.env.NEXT_PUBLIC_LOGO_DEV_API_KEY;

      if (!apiKey) {
        throw new Error("Logo.dev API key not found");
      }

      const searchUrl = `https://api.logo.dev/search?q=${domain}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const response = await fetch(searchUrl, {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (data && Array.isArray(data) && data.length > 0) {
            const logoUrl = data[0].logo_url;
            if (logoUrl) {
              form.setValue("logoUrl", logoUrl);
              toast({
                title: "Success",
                description: "Logo found and added",
              });
              return;
            }
          }
        }
        throw new Error("No logo found");
      } catch (error) {
        console.log("Logo fetch error:", error);
        console.log("Logo fetch failed, using fallback");
      }

      const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEEAD"];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const initials = name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      const svgLogo = `data:image/svg+xml,${encodeURIComponent(`
        <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="50" fill="${randomColor}"/>
          <text x="50" y="50" dy="0.35em" 
                fill="white" 
                font-family="Arial, sans-serif" 
                font-size="40" 
                text-anchor="middle">${initials}</text>
        </svg>
      `)}`;

      form.setValue("logoUrl", svgLogo);
      toast({
        title: "Using Fallback Logo",
        description: apiKey
          ? "Could not find a logo for this service. Using initials instead."
          : "Logo.dev API key not configured. Using initials instead.",
      });
    } catch (error) {
      console.error("Error fetching logo:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "Could not generate a logo. Please try again or leave it blank.",
      });
      form.setValue("logoUrl", "");
    } finally {
      setIsSearchingLogo(false);
    }
  };

  useEffect(() => {
    if (!userLoading && user) {
      fetchCategories();
    }
  }, [userLoading, fetchCategories]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Input {...field} placeholder="Netflix, Spotify, etc." />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={searchLogo}
                    disabled={isSearchingLogo}
                    className={isSearchingLogo ? "animate-spin" : ""}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch("logoUrl") && (
          <div className="flex items-center gap-2">
            {form.watch("logoUrl") && (
              <Image
                src={form.watch("logoUrl") || ""}
                alt="Service logo"
                width={32}
                height={32}
                className="rounded"
              />
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => form.setValue("logoUrl", "")}
            >
              Remove logo
            </Button>
          </div>
        )}

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
                      {...field}
                      type="number"
                      step="0.01"
                      min="0"
                      className="pl-7"
                      placeholder="0.00"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
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
          name="recurrence"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recurrence</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recurrence" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="ANNUALLY">Annually</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

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
                          <div className="flex items-center gap-2">
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
                            <span>
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
                  {categories.map((category) => {
                    const IconComponent =
                      CATEGORY_ICONS[category.icon] || CircleDot;
                    return (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                            style={{
                              backgroundColor: category.color,
                            }}
                          >
                            <IconComponent className="h-4 w-4 text-white" />
                          </div>
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : defaultValues ? "Update" : "Add"}{" "}
          Subscription
        </Button>
      </form>
    </Form>
  );
}
