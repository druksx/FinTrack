import { NextRequest } from "next/server";

const API_URL = process.env.API_URL || 'http://localhost:3333';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const response = await fetch(
      `${API_URL}/subscriptions/${params.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update subscription");
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error in subscriptions API route:", error);
    return Response.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(
      `${API_URL}/subscriptions/${params.id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete subscription");
    }

    return Response.json({ message: "Subscription deleted successfully" });
  } catch (error) {
    console.error("Error in subscriptions API route:", error);
    return Response.json(
      { error: "Failed to delete subscription" },
      { status: 500 }
    );
  }
} 