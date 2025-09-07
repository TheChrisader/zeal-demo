import { NextRequest, NextResponse } from "next/server";
import DraftModel from "@/database/draft/draft.model";
import {
  deleteDraftById,
  getDraftById,
  getDraftsByFilters,
  updateManyDrafts,
} from "@/database/draft/draft.repository";
import { createPostFromDraft } from "@/database/post/post.repository";
import { connectToDatabase } from "@/lib/database";

export const GET = async (req: NextRequest) => {
  try {
    await connectToDatabase();

    const searchParams = req.nextUrl.searchParams;
    const params = {
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 10,
      sort: searchParams.get("sort") || "created_at",
      order: (searchParams.get("order") as "asc" | "desc") || "desc",
      search: searchParams.get("search") || undefined,
      category: searchParams.get("category") || undefined,
      fromDate: searchParams.get("fromDate") || undefined,
      toDate: searchParams.get("toDate") || undefined,
      author: searchParams.get("author") || undefined,
    };

    const total = await DraftModel.countDocuments({
      moderationStatus: "awaiting_approval",
    });

    const drafts = await getDraftsByFilters(params);

    const totalPages = Math.ceil(total / params.limit);
    const hasMore = params.page < totalPages;

    return NextResponse.json({
      posts: drafts,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages,
        hasMore,
      },
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
};

export const PATCH = async (req: NextRequest) => {
  try {
    await connectToDatabase();

    const { ids } = await req.json();

    for (const id of ids) {
      const draft = await getDraftById(id);
      if (draft) {
        await createPostFromDraft(draft);
        await deleteDraftById(id);
      }
    }

    return NextResponse.json({ message: "Drafts published successfully" });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
};

export const DELETE = async (req: NextRequest) => {
  try {
    await connectToDatabase();

    const { ids } = await req.json();

    await updateManyDrafts(ids, { moderationStatus: "rejected" });

    return NextResponse.json({ message: "Drafts rejected successfully" });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
};
