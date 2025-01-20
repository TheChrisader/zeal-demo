"use client";

import { formatDistanceToNow } from "date-fns";
import {
  Bookmark,
  Heart,
  MessageCircle,
  Share2,
  ThumbsDown,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { IPost } from "@/types/post.type";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { IUser } from "@/types/user.type";

interface PostCardProps {
  post: IPost;
  user: Partial<IUser>;
  onLike?: (postId: string) => void;
  onDislike?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
}

function FollowingPostCard({
  post,
  user,
  onLike,
  onDislike,
  onBookmark,
}: PostCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(post.bookmarked);
  const [reactions, setReactions] = useState(post.reactions);

  const handleLike = () => {
    setReactions((prev) => ({
      ...prev,
      like: prev.like + 1,
    }));
    onLike?.(post.id as string);
  };

  const handleDislike = () => {
    setReactions((prev) => ({
      ...prev,
      dislike: prev.dislike + 1,
    }));
    onDislike?.(post.id as string);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    onBookmark?.(post.id as string);
  };

  return (
    <Card className="border-b">
      <CardHeader className="flex-row items-start gap-4 space-y-0">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.avatar || undefined} />
          <AvatarFallback>{user.display_name![0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{user.display_name}</span>
            <span className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(post.published_at), {
                addSuffix: true,
              })}
            </span>
          </div>
          <Link href={`/post/${post.slug}`} className="block">
            <h2 className="text-xl font-semibold leading-tight hover:text-primary">
              {post.title}
            </h2>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {post.image_url && (
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <Image
              src={post.image_url || "/placeholder.svg"}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
        <p className="line-clamp-3 text-muted-foreground">{post.description}</p>
        {post.source.name && (
          <div className="flex items-center gap-2">
            {post.source.icon && (
              <Image
                src={post.source.icon || "/placeholder.svg"}
                alt={post.source.name}
                width={16}
                height={16}
                className="rounded-sm"
              />
            )}
            <span className="text-sm text-muted-foreground">
              {post.source.name}
            </span>
            <span className="text-sm text-muted-foreground">·</span>
            <span className="text-sm text-muted-foreground">
              {post.ttr} min read
            </span>
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-between">
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLike}
            className="text-muted-foreground hover:text-primary"
          >
            <Heart className="h-4 w-4" />
            <span className="sr-only">Like</span>
            {reactions.like > 0 && (
              <span className="ml-1 text-xs">{reactions.like}</span>
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDislike}
            className="text-muted-foreground hover:text-primary"
          >
            <ThumbsDown className="h-4 w-4" />
            <span className="sr-only">Dislike</span>
            {reactions.dislike > 0 && (
              <span className="ml-1 text-xs">{reactions.dislike}</span>
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-primary"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="sr-only">Comment</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-primary"
          >
            <Share2 className="h-4 w-4" />
            <span className="sr-only">Share</span>
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBookmark}
          className={
            isBookmarked
              ? "text-primary"
              : "text-muted-foreground hover:text-primary"
          }
        >
          <Bookmark className="h-4 w-4" />
          <span className="sr-only">Bookmark</span>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default FollowingPostCard;
