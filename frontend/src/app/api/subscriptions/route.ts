import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch subscriptions");
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error in subscriptions API route:", error);
    return Response.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/subscriptions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create subscription");
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error in subscriptions API route:", error);
    return Response.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
} 