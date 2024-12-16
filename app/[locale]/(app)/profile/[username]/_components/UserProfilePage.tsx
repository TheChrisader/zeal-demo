// app/users/[username]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  BellOff,
  Bookmark,
  CalendarDays,
  Flag,
  Heart,
  Image as ImageIcon,
  LineChart,
  Link as LinkIcon,
  MapPin,
  MessageCircle,
  MessageSquare,
  MoreHorizontal,
  Newspaper,
  Share2,
  UserPlus,
} from "lucide-react";
import { IComment } from "@/types/comment.type";
import { IPost } from "@/types/post.type";
import { Types } from "mongoose";
import { toast } from "sonner";

// Types
// interface Article {
//   _id: string;
//   title: string;
//   excerpt: string;
//   createdAt: string;
//   likes: number;
//   comments: number;
//   readTime: string;
//   bookmarked?: boolean;
//   liked?: boolean;
//   imageUrl?: string;
// }

// interface Comment {
//   _id: string;
//   content: string;
//   createdAt: string;
//   likes: number;
// }

// interface Media {
//   _id: string;
//   type: "image" | "video";
//   url: string;
//   caption: string;
//   createdAt: string;
// }

// interface Analytics {
//   views: number;
//   totalLikes: number;
//   totalComments: number;
//   topArticles: Array<{ title: string; views: number }>;
// }

// interface User {
//   _id: string;
//   username: string;
//   name: string;
//   bio: string;
//   avatar: string;
//   location: string;
//   website: string;
//   joinedAt: string;
//   following: number;
//   followers: number;
//   articles: Article[];
//   comments: Comment[];
//   media: Media[];
//   analytics: Analytics;
// }

// Mock data fetching function
// async function getUserProfile(username: string): Promise<User | null> {
//   return {
//     _id: "1",
//     username: username,
//     name: "Janestopher Smithkeotuonye",
//     bio: "Tech writer & software developer. Writing about web development, AI, and the future of technology.",
//     avatar:
//       "https://images.unsplash.com/photo-1731683609568-c234749e323c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxM3x8fGVufDB8fHx8fA%3D%3D",
//     location: "San Francisco, CA",
//     website: "janesmith.dev",
//     joinedAt: "2023-01-15T00:00:00Z",
//     following: 0,
//     followers: 1,
//     articles: [
//       {
//         _id: "1",
//         title: "The Future of Web Development with Next.js 14",
//         excerpt:
//           "Exploring the latest features and improvements in Next.js 14...",
//         createdAt: "2024-03-15T00:00:00Z",
//         likes: 0,
//         comments: 0,
//         readTime: "5 min",
//         imageUrl:
//           "https://images.unsplash.com/photo-1731517515193-0518a1eb2034?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//       },
//       {
//         _id: "2",
//         title: "Building Modern UIs with shadcn/ui",
//         excerpt:
//           "A deep dive into creating beautiful, accessible components...",
//         createdAt: "2024-03-10T00:00:00Z",
//         likes: 0,
//         comments: 0,
//         readTime: "7 min",
//       },
//     ],
//     comments: [
//       {
//         _id: "1",
//         content: "Great insights on the new React Server Components!",
//         createdAt: "2024-03-16T00:00:00Z",
//         likes: 1,
//       },
//     ],
//     media: [
//       {
//         _id: "1",
//         type: "image",
//         url: "/api/placeholder/400/400",
//         caption: "Live coding session preview",
//         createdAt: "2024-03-14T00:00:00Z",
//       },
//     ],
//     analytics: {
//       views: 45280,
//       totalLikes: 1834,
//       totalComments: 423,
//       topArticles: [
//         { title: "The Future of Web Development", views: 12000 },
//         { title: "Building Modern UIs", views: 8500 },
//       ],
//     },
//   };
// }

type User = {
  id: Types.ObjectId;
  username: string;
  email: string;
  bio: string | null;
  avatar: string | null;
  display_name: string;
  followersCount: number;
  followingCount: number;
};

type Articles = (IPost &
  Required<{
    _id: Types.ObjectId;
  }>)[];

type Comments = (IComment & { _id?: Types.ObjectId })[];

export default function UserProfilePage({
  fetchedUser,
  fetchedArticles,
  fetchedComments,
  fetchedIsFollowing,
}: {
  fetchedUser: User;
  fetchedArticles: Articles;
  fetchedComments: Comments;
  fetchedIsFollowing: boolean;
}) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(
    new Set(),
  );
  const [user, setUser] = useState<User | null>(null);
  const [articles, setArticles] = useState<Articles>([]);
  const [comments, setComments] = useState<Comments>([]);

  // Mock data - in real app, would be fetched
  //   const user = getUserProfile(username)
  //   if (!user) return null

  useEffect(() => {
    // const fetchUser = async () => {
    //   // const user = await getUserProfile(username);
    //   const { user, articles, comments, isFollowing } = await fetch(
    //     `/api/v1/user/${username}`,
    //   ).then((res) => res.json());
    //   setUser(user);
    //   setArticles(articles);
    //   setComments(comments);
    //   setIsFollowing(isFollowing);
    // };
    // fetchUser();
    // }, [username]);
    setUser(fetchedUser);
    setArticles(fetchedArticles);
    setComments(fetchedComments);
    setIsFollowing(fetchedIsFollowing);
  }, []);

  if (!user) return null;

  const handleFollow = async () => {
    const currentFollowing = isFollowing;
    try {
      setIsFollowing(!isFollowing);
      if (currentFollowing) {
        await fetch(`/api/v1/unfollow`, {
          method: "POST",
          body: JSON.stringify({ targetUserId: user.id.toString() }),
        });
      } else {
        await fetch(`/api/v1/follow`, {
          method: "POST",
          body: JSON.stringify({ targetUserId: user.id.toString() }),
        });
      }
    } catch {
      setIsFollowing(currentFollowing);
      toast.error("Something went wrong");
    }
  };

  const handleNotification = () => {
    setIsNotifying(!isNotifying);
  };

  const handleLike = (articleId: string) => {
    setLikedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
      }
      return newSet;
    });
  };

  const handleBookmark = (articleId: string) => {
    setBookmarkedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
      }
      return newSet;
    });
  };

  return (
    <main className="mx-auto max-w-[90vw] p-2 pb-16 max-[1000px]:max-w-[100vw]">
      {/* Header */}
      <div className="mb-4">
        {/* <div className="h-32 rounded-t-lg bg-gradient-to-r from-[#6ee870] to-[#08940a]" /> */}
        <div className="h-12" />
        <div className="px-4 pb-4">
          <div className="relative">
            <Avatar className="absolute top-[-35px] size-24 border-4 border-white max-[600px]:-top-12 max-[600px]:size-24">
              {user.avatar && (
                <AvatarImage src={user.avatar} alt={user.display_name} />
              )}
              <AvatarFallback>{user.display_name[0]}</AvatarFallback>
            </Avatar>
            <div className="ml-28 flex items-start justify-between max-[600px]:ml-28 max-[560px]:justify-end">
              <div className="max-[560px]:hidden">
                <h1 className="text-2xl font-bold">{user.display_name}</h1>
                <p className="text-gray-500">@{user.username}</p>
              </div>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {isNotifying ? (
                      <DropdownMenuItem onClick={handleNotification}>
                        <BellOff className="mr-2 h-4 w-4" />
                        Mute notifications
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={handleNotification}>
                        <Bell className="mr-2 h-4 w-4" />
                        Turn on notifications
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => setReportDialogOpen(true)}>
                      <Flag className="mr-2 h-4 w-4" />
                      Report profile
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // In real app, implement share functionality
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Link copied to clipboard");
                  }}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  <span className="max-[700px]:hidden">Share</span>
                </Button>
                <Button
                  size="sm"
                  onClick={handleFollow}
                  variant={isFollowing ? "outline" : "default"}
                >
                  {isFollowing ? (
                    "Following"
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      {/* <span className="max-[700px]:hidden"> */}
                      Follow
                      {/* </span> */}
                    </>
                  )}
                </Button>
              </div>
            </div>
            <div className="hidden max-[560px]:mt-2 max-[560px]:block">
              <h1 className="text-xl font-bold">{user.display_name}</h1>
              <p className="text-gray-500">@{user.username}</p>
            </div>
          </div>

          {/* Bio and Stats */}
          <div className="mt-4">
            <p className="mb-3 text-muted-foreground">{user.bio || ""}</p>
            <div className="mb-3 flex gap-4 text-sm text-gray-500">
              {/* {user.location && (
                <span className="flex items-center">
                  <MapPin className="mr-1 h-4 w-4" />
                  {user.location}
                </span>
              )} */}
              {/* {user.website && ( */}
              <a
                // href={`https://${user.website}`}
                href={`https://google.com`}
                className="flex items-center hover:text-blue-500"
                target="_blank"
                rel="noopener noreferrer"
              >
                <LinkIcon className="mr-1 size-4" />
                {/* {user.website} */}
                Google
              </a>
              {/* )} */}
              {/* <span className="flex items-center">
                <CalendarDays className="mr-1 h-4 w-4" />
                Joined {formatDistanceToNow(new Date(user.joinedAt))} ago
              </span> */}
            </div>
            <div className="flex gap-4 text-sm">
              <span className="font-semibold">
                {user.followingCount} Following
              </span>
              <span className="font-semibold">
                {user.followersCount} Followers
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="articles" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="articles" className="flex-1">
            <Newspaper className="mr-2 h-4 w-4" />
            Articles
          </TabsTrigger>
          {/* <TabsTrigger value="media" className="flex-1">
            <ImageIcon className="mr-2 h-4 w-4" />
            Media
          </TabsTrigger> */}
          <TabsTrigger value="comments" className="flex-1">
            <MessageCircle className="mr-2 h-4 w-4" />
            Comments
          </TabsTrigger>
          {/* <TabsTrigger value="analytics" className="flex-1">
            <LineChart className="mr-2 h-4 w-4" />
            Analytics
          </TabsTrigger> */}
        </TabsList>

        <TabsContent value="articles">
          {articles.length === 0 ? (
            <Card className="mx-auto max-w-sm border-0 bg-transparent text-center shadow-none">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  No Posts Yet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This user hasn’t shared anything yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {articles.map((article) => (
                <Card
                  key={article._id.toString()}
                  className="transition-shadow hover:shadow-lg"
                >
                  <CardContent className="pt-6">
                    {article.image_url && (
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className="mb-4 h-48 w-full rounded-lg object-cover"
                      />
                    )}
                    <h2 className="mb-2 text-xl font-semibold">
                      {article.title}
                    </h2>
                    <p className="mb-3 text-gray-600">{article.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <span>
                          {formatDistanceToNow(new Date(article.published_at))}{" "}
                          ago
                        </span>
                        <span>{article.ttr} min read</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(article._id.toString())}
                          className={
                            likedPosts.has(article._id.toString())
                              ? "text-red-500"
                              : ""
                          }
                        >
                          <Heart className="mr-1 h-4 w-4" />
                          {article.reactions.like +
                            (likedPosts.has(article._id.toString()) ? 1 : 0)}
                        </Button>
                        {/* <Button variant="ghost" size="sm">
                        <MessageSquare className="mr-1 h-4 w-4" />
                        {article.comments}
                      </Button> */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleBookmark(article._id.toString())}
                          className={
                            bookmarkedPosts.has(article._id.toString())
                              ? "text-blue-500"
                              : ""
                          }
                        >
                          <Bookmark className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* <TabsContent value="media">
          <div className="grid grid-cols-2 gap-4">
            {user.media.map((item) => (
              <Card key={item._id}>
                <CardContent className="pt-6">
                  <img
                    src={item.url}
                    alt={item.caption}
                    className="mb-2 h-48 w-full rounded-lg object-cover"
                  />
                  <p className="text-sm text-gray-600">{item.caption}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {formatDistanceToNow(new Date(item.createdAt))} ago
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent> */}

        <TabsContent value="comments">
          {comments.length === 0 ? (
            <Card className="mx-auto max-w-sm border-0 bg-transparent text-center shadow-none">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  No Comments Yet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This user hasn’t commented yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <Card key={comment._id!.toString()}>
                  <CardContent className="pt-6">
                    <p className="text-gray-700">{comment.content}</p>
                    <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                      <span>
                        {formatDistanceToNow(new Date(comment.created_at))} ago
                      </span>
                      {/* <Button variant="ghost" size="sm">
                      <Heart className="mr-1 h-4 w-4" />
                      {comment.likes}
                    </Button> */}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* <TabsContent value="analytics">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h3 className="text-sm font-medium text-gray-500">
                      Total Views
                    </h3>
                    <p className="mt-1 text-2xl font-bold">
                      {user.analytics.views.toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h3 className="text-sm font-medium text-gray-500">
                      Total Likes
                    </h3>
                    <p className="mt-1 text-2xl font-bold">
                      {user.analytics.totalLikes.toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h3 className="text-sm font-medium text-gray-500">
                      Total Comments
                    </h3>
                    <p className="mt-1 text-2xl font-bold">
                      {user.analytics.totalComments.toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-4 font-semibold">Top Performing Articles</h3>
                <div className="space-y-4">
                  {user.analytics.topArticles.map((article, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg p-2 hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <span className="w-6 text-gray-500">{index + 1}.</span>
                        <span className="font-medium">{article.title}</span>
                      </div>
                      <span className="text-gray-500">
                        {article.views.toLocaleString()} views
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent> */}
      </Tabs>

      {/* Report Dialog */}
      <AlertDialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Report Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to report this profile? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                // In real app, implement report functionality
                setReportDialogOpen(false);
              }}
            >
              Report
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
