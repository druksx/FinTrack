export interface Subscription {
  id: string;
  name: string;
  amount: string;
  logoUrl?: string;
  recurrence: "MONTHLY" | "ANNUALLY";
  startDate: string;
  nextPayment: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
} 