"use client";

import { useState } from "react";
import { ICommentResponse } from "@/database/comment/comment.repository";
import { IComment } from "@/types/comment.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown, ChevronUp, MessageSquare, Send } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { getPublishTimeStamp } from "@/utils/time.utils";
import { useAuth } from "@/hooks/useAuth";
import { getReplies } from "../_actions/getReplies";
import { Link } from "@/i18n/routing";
import { cleanObject } from "@/utils/cleanObject.utils";

type CommentSectionProps = {
  article_id: string;
  comments: ICommentResponse[];
  pagination: {
    pages: number;
    current: number;
    total: number;
  };
};

const RepliesCache: Record<string, boolean> = {};

const CommentSection = ({
  comments: fetchedComments,
  article_id,
  pagination,
}: CommentSectionProps) => {
  const [comments, setComments] = useState<ICommentResponse[]>(fetchedComments);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [expandedComments, setExpandedComments] = useState<Set<string>>(
    new Set(),
  );
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const sortComments = (
    commentsToSort: ICommentResponse[],
  ): ICommentResponse[] => {
    return [...commentsToSort].sort((a, b) => {
      if (sortOrder === "oldest") {
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      } else {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
    });
  };

  const toggleExpand = async (parentId: string, depth: number) => {
    if (!expandedComments.has(parentId) && !RepliesCache[parentId]) {
      const replies = await getReplies(parentId, depth);
      const newReplies = replies.filter(
        (reply) => comments.findIndex((c) => c._id === reply._id) === -1,
      );
      setComments((prev) => sortComments([...prev, ...newReplies]));
      RepliesCache[parentId] = true;
    }

    setExpandedComments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(parentId)) {
        newSet.delete(parentId);
      } else {
        newSet.add(parentId);
      }
      return newSet;
    });
  };

  const addComment = async (parentId: string | null = null) => {
    const newCommentObj: Pick<
      IComment,
      "article_id" | "user_id" | "content" | "parent_id"
    > = {
      article_id: article_id,
      user_id: user.id,
      content: newComment,
      parent_id: parentId,
    };

    const response = await fetch("/api/v1/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newCommentObj),
    });

    const data: ICommentResponse = await response.json();

    setComments((prev) => sortComments([...prev, data]));
    setNewComment("");
    setReplyingTo(null);
  };

  const renderComment = (comment: ICommentResponse) => {
    const isExpanded = expandedComments.has(comment._id!.toString());
    const replies = comments.filter((c) => c.parent_id === comment._id!);

    return (
      <Card
        key={comment._id!.toString()}
        className="mb-4"
        style={{ marginLeft: `${comment.depth * 20}px` }}
      >
        <CardHeader className="flex flex-row items-start space-x-4 p-4">
          <Link href={`/profile/${comment.user_id.username}`}>
            <Avatar>
              <AvatarImage
                src={comment.user_id.avatar}
                alt={comment.user_id.display_name}
              />
              <AvatarFallback>{comment.user_id.display_name[0]}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-1 max-[500px]:flex-col max-[500px]:justify-start">
                <span className="font-semibold">
                  {comment.user_id.display_name}
                </span>
                <span className="text-sm text-muted-foreground">
                  @{comment.user_id.username}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {getPublishTimeStamp(comment.created_at as string)}
              </span>
            </div>
            <p className="mt-1">{comment.content}</p>
          </div>
        </CardHeader>
        <CardFooter className="p-4 pt-0">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                toggleExpand(comment._id!.toString(), comment.depth + 1)
              }
            >
              {isExpanded ? (
                <ChevronUp className="mr-1 h-4 w-4" />
              ) : (
                <ChevronDown className="mr-1 h-4 w-4" />
              )}
              {comment.reply_count}{" "}
              {comment.reply_count === 1 ? "reply" : "replies"}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyingTo(comment._id!.toString())}
            >
              <MessageSquare className="mr-1 h-4 w-4" />
              Reply
            </Button>
          </div>
        </CardFooter>
        {isExpanded && (
          <CardContent className="pt-0">
            {replies.map(renderComment)}
          </CardContent>
        )}
      </Card>
    );
  };

  const rootComments = comments.filter((comment) => comment.parent_id === null);

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-2xl font-bold">Comments</h2>
      <div className="mb-4 flex items-center justify-between">
        <Select
          value={sortOrder}
          onValueChange={(value: "newest" | "oldest") => setSortOrder(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort comments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-muted-foreground">
          {comments.length} comments
        </span>
      </div>
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-start space-x-4">
            {/* <Avatar>
              <AvatarImage
                src="https://api.dicebear.com/6.x/avataaars/svg?seed=CurrentUser"
                alt="Current User"
              />
              <AvatarFallback>CU</AvatarFallback>
            </Avatar> */}
            <div className="flex-1">
              <Textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mb-2"
              />
              <Button onClick={() => addComment()}>
                <MessageSquare className="mr-1 h-4 w-4" />
                {/* Comment */}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {sortComments(rootComments).map(renderComment)}
      {replyingTo && (
        <Card className="fixed bottom-0 left-0 right-0 z-50">
          <CardContent className="relative p-4">
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Write a reply..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1"
              />
              <Button onClick={() => addComment(replyingTo)}>
                <Send className="mr-1 h-4 w-4" />
                {/* Reply */}
              </Button>
              <Button
                className="absolute -top-2 right-1/2 flex -translate-x-1/2 animate-bounce repeat-infinite"
                variant="outline"
                onClick={() => setReplyingTo(null)}
              >
                <ChevronDown />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CommentSection;
