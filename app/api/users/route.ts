import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();

    const {
      accountType,
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      marketingUpdates,
    } = body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: "Passwords do not match" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Create new user (in production, hash the password!)
    const newUser = await User.create({
      accountType,
      firstName,
      lastName,
      email: email.toLowerCase(),
      // In production: use bcrypt to hash password
      password, // Never store plain text passwords in production!
      marketingUpdates,
    });

    // Return success (without password)
    const userResponse = {
      id: newUser._id.toString(),
      accountType: newUser.accountType,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      marketingUpdates: newUser.marketingUpdates,
      createdAt: newUser.createdAt,
    };

    return NextResponse.json(
      {
        message: "User created successfully",
        user: userResponse,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await dbConnect();
    
    // Return users without passwords (for testing purposes)
    const users = await User.find({}).select("-password");
    return NextResponse.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
