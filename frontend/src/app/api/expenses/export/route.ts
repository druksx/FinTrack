import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const month = searchParams.get("month");

  try {
    const response = await fetch(
      `${process.env.API_URL || process.env.NEXT_PUBLIC_API_URL}/expenses/export${
        month ? `?month=${month}` : ""
      }`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch expenses for export");
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error in export API route:", error);
    return Response.json(
      { error: "Failed to fetch expenses for export" },
      { status: 500 }
    );
  }
} 