"use client";

import { useEffect, useState } from "react";
import EmptyFeed from "./EmptyFeed";
import FollowingPostCard from "./FollowingPostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { IPost } from "@/types/post.type";
import { IUser } from "@/types/user.type";

interface FeedProps {
  initialPosts?: IPost[];
}

function ForYouFeed({ initialPosts = [] }: FeedProps) {
  const [posts, setPosts] = useState<IPost[]>(initialPosts);
  const [isLoading, setIsLoading] = useState(!initialPosts.length);

  // Simulated user data - in a real app, this would come from your auth context
  const mockUser: Partial<IUser> = {
    id: "1",
    email: "john@example.com",
    has_email_verified: true,
    role: "user",
    username: "johndoe",
    display_name: "John Doe",
    avatar: "/placeholder.svg",
    location: "New York",
    bio: "Tech enthusiast",
  };

  useEffect(() => {
    if (!initialPosts.length) {
      // Simulate API call
      setTimeout(() => {
        setPosts([
          //   {
          //     id: "1",
          //     title: "Introducing the Next.js App Router",
          //     slug: "nextjs-app-router",
          //     author_id: "1",
          //     content: "Full content here...",
          //     description:
          //       "Learn about the new Next.js App Router and how it can improve your application architecture.",
          //     ttr: 5,
          //     link: null,
          //     image_url: "",
          //     video_url: null,
          //     source: {
          //       name: "Next.js Blog",
          //       icon: "/placeholder.svg",
          //     },
          //     keywords: ["nextjs", "react", "web-development"],
          //     language: "English",
          //     country: ["US"],
          //     category: ["Technology"],
          //     published: true,
          //     reactions: {
          //       id: "1",
          //       post_id: "1",
          //       like: 42,
          //       dislike: 2,
          //       created_at: new Date(),
          //       updated_at: new Date(),
          //     },
          //     external: false,
          //     published_at: new Date().toISOString(),
          //     created_at: new Date().toISOString(),
          //     updated_at: new Date().toISOString(),
          //   },
        ]);
        setIsLoading(false);
      }, 1500);
    }
  }, [initialPosts.length]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
            <Skeleton className="h-[200px] w-full rounded-lg" />
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!posts.length) {
    return <EmptyFeed />;
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <FollowingPostCard
          key={post.id as string}
          post={post}
          user={mockUser}
          onLike={console.log}
          onDislike={console.log}
          onBookmark={console.log}
        />
      ))}
    </div>
  );
}

export default ForYouFeed;
