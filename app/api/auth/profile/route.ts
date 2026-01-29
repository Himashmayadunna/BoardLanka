import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get token from Authorization header
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Authorization token required" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    // Decode the token (in production, use JWT verification)
    try {
      const decoded = Buffer.from(token, "base64").toString("utf-8");
      const [userId] = decoded.split(":");

      if (!userId) {
        return NextResponse.json(
          { message: "Invalid token" },
          { status: 401 }
        );
      }

      // Find user by ID
      const user = await User.findById(userId).select("-password");

      if (!user) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      }

      // Return user data
      const userResponse = {
        id: user._id.toString(),
        accountType: user.accountType,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        marketingUpdates: user.marketingUpdates,
        createdAt: user.createdAt,
      };

      return NextResponse.json(
        { user: userResponse },
        { status: 200 }
      );
    } catch {
      return NextResponse.json(
        { message: "Invalid token format" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
