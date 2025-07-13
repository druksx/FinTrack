import { NextRequest } from "next/server";

const API_URL = process.env.API_URL || 'http://localhost:3333';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const year = searchParams.get("year");
  const month = searchParams.get("month");

  try {
    const response = await fetch(
      `${API_URL}/subscriptions/month?year=${year}&month=${month}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch monthly subscriptions");
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error in monthly subscriptions API route:", error);
    return Response.json(
      { error: "Failed to fetch monthly subscriptions" },
      { status: 500 }
    );
  }
}