import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const month = searchParams.get("month");

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/expenses/dashboard${
        month ? `?month=${month}` : ""
      }`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch dashboard data");
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error in dashboard API route:", error);
    return Response.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
} 