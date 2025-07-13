import { NextRequest } from "next/server";

const API_URL = process.env.API_URL || 'http://localhost:3333';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const response = await fetch(
      `${API_URL}/categories/${params.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update category");
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error in categories API route:", error);
    return Response.json(
      { error: "Failed to update category" },
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
      `${API_URL}/categories/${params.id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      // Forward the 409 Conflict status if present
      if (response.status === 409) {
        const errorData = await response.json();
        return Response.json(errorData, { status: 409 });
      }
      throw new Error("Failed to delete category");
    }

    return Response.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error in categories API route:", error);
    return Response.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
} 