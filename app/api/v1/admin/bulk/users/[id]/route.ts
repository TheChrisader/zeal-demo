import { NextRequest, NextResponse } from "next/server";
import UserModel from "@/database/user/user.model";
import { connectToDatabase, newId } from "@/lib/database";
import PreferencesModel from "@/database/preferences/preferences.model";

interface UpdateUserBody {
  role?: string;
  has_email_verified?: boolean;
  is_disabled?: boolean;
  display_name?: string;
  bio?: string;
  location?: string;
  upgrade_pending?: boolean;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await connectToDatabase();

    const user = await UserModel.findById(params.id)
      .select("-password_hash")
      .lean();

    if (!user) {
      return NextResponse.json(
        {
          status: "error",
          message: "User not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        status: "success",
        data: user,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("User GET Error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Internal Server Error",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      },
      {
        status: 500,
      },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await connectToDatabase();

    const body: UpdateUserBody = await req.json();
    const { id } = params;

    // Check if user exists
    const existingUser = await UserModel.findById(id);
    if (!existingUser) {
      return NextResponse.json(
        {
          status: "error",
          message: "User not found",
        },
        {
          status: 404,
        },
      );
    }

    // Remove sensitive fields that shouldn't be updated via this endpoint
    const {
      password_hash,
      email,
      username,
      auth_provider,
      created_at,
      updated_at,
      ...safeUpdateData
    } = body as any;

    // Validate role if provided
    if (safeUpdateData.role) {
      const validRoles = ["user", "admin", "writer", "freelance_writer"];
      if (!validRoles.includes(safeUpdateData.role)) {
        return NextResponse.json(
          {
            status: "error",
            message: "Invalid role provided",
          },
          {
            status: 400,
          },
        );
      }
    }

    // Update user
    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { $set: safeUpdateData },
      { new: true, runValidators: true },
    )
      .select("-password_hash")
      .lean();

    return NextResponse.json(
      {
        status: "success",
        data: updatedUser,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("User PATCH Error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Internal Server Error",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await connectToDatabase();

    const deletedUser = await UserModel.findByIdAndDelete(params.id);

    // Delete associated posts
    // await PostModel.deleteMany({ user_id: params.id });
    await PreferencesModel.findOneAndDelete({ user_id: params.id });

    if (!deletedUser) {
      return NextResponse.json(
        {
          status: "error",
          message: "User not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        status: "success",
        message: "User deleted successfully",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("User DELETE Error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Internal Server Error",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      },
      {
        status: 500,
      },
    );
  }
}
