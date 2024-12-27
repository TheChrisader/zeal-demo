import { NextResponse } from "next/server";
import PostModel from "@/database/post/post.model";
import { SlugGenerator } from "@/lib/slug";

export async function POST() {
  try {
    const generator = new SlugGenerator();
    const posts = await PostModel.find();
    const updates = posts.map((post) => {
      post.slug = generator.generate(post.title);
      return post.save();
    });
    await Promise.all(updates);

    return NextResponse.json({
      message: `${posts.length} posts updated`,
    });
  } catch (err) {
    console.log(err);
    NextResponse.json({ err });
  }
}
