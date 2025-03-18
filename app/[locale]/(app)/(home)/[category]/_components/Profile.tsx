"use client";
import { VideoGrid } from "./VideoGrid";
import type { VideoPost } from "./video-post";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bookmark, Grid, Heart, Lock, Settings } from "lucide-react";

export default function ProfilePage() {
  // Mock user data
  const user = {
    username: "yourprofile",
    handle: "@yourprofile",
    bio: "✨ Creating content about tech, travel, and lifestyle ✨\nLinks in bio",
    followers: "1.2M",
    following: "245",
    likes: "15.6M",
    avatar: "/placeholder.svg?height=150&width=150",
  };

  // Mock videos data
  const userVideos: VideoPost[] = [
    {
      id: "user1",
      username: user.username,
      userHandle: user.handle,
      caption: "My trip to Japan was amazing! #travel #japan",
      audioTitle: "Travel Vibes - YourProfile",
      likes: "450K",
      comments: "12K",
      shares: "85K",
      bookmarks: "32K",
      videoUrl: "/placeholder.svg?height=720&width=405",
      userAvatar: user.avatar,
    },
    {
      id: "user2",
      username: user.username,
      userHandle: user.handle,
      caption: "Testing out the new iPhone camera #tech #iphone",
      audioTitle: "Tech Review - YourProfile",
      likes: "380K",
      comments: "9.5K",
      shares: "65K",
      bookmarks: "28K",
      videoUrl: "/placeholder.svg?height=720&width=405",
      userAvatar: user.avatar,
    },
    {
      id: "user3",
      username: user.username,
      userHandle: user.handle,
      caption: "Morning routine in my new apartment #lifestyle #routine",
      audioTitle: "Morning Vibes - Popular Song",
      likes: "520K",
      comments: "14K",
      shares: "95K",
      bookmarks: "42K",
      videoUrl: "/placeholder.svg?height=720&width=405",
      userAvatar: user.avatar,
    },
    {
      id: "user4",
      username: user.username,
      userHandle: user.handle,
      caption: "Trying viral TikTok recipes #food #cooking",
      audioTitle: "Cooking Sounds - Original",
      likes: "410K",
      comments: "11K",
      shares: "75K",
      bookmarks: "30K",
      videoUrl: "/placeholder.svg?height=720&width=405",
      userAvatar: user.avatar,
    },
    {
      id: "user5",
      username: user.username,
      userHandle: user.handle,
      caption: "Workout routine that changed my life #fitness #workout",
      audioTitle: "Workout Mix - Fitness",
      likes: "490K",
      comments: "13K",
      shares: "88K",
      bookmarks: "36K",
      videoUrl: "/placeholder.svg?height=720&width=405",
      userAvatar: user.avatar,
    },
    {
      id: "user6",
      username: user.username,
      userHandle: user.handle,
      caption: "My favorite books of 2023 #books #reading",
      audioTitle: "Reading Time - Calm Music",
      likes: "320K",
      comments: "8K",
      shares: "55K",
      bookmarks: "25K",
      videoUrl: "/placeholder.svg?height=720&width=405",
      userAvatar: user.avatar,
    },
  ];

  const likedVideos: VideoPost[] = [
    {
      id: "liked1",
      username: "othercreator",
      userHandle: "@othercreator",
      caption: "This dance is going viral! #dancechallenge",
      audioTitle: "Viral Hit - Famous Artist",
      likes: "3.2M",
      comments: "85K",
      shares: "450K",
      bookmarks: "210K",
      videoUrl: "/placeholder.svg?height=720&width=405",
      userAvatar: "/placeholder.svg?height=50&width=50",
    },
    {
      id: "liked2",
      username: "funnyuser",
      userHandle: "@funnyuser",
      caption: "When your alarm goes off on Monday morning 😂 #comedy",
      audioTitle: "Funny Sound - Original",
      likes: "2.8M",
      comments: "72K",
      shares: "390K",
      bookmarks: "180K",
      videoUrl: "/placeholder.svg?height=720&width=405",
      userAvatar: "/placeholder.svg?height=50&width=50",
    },
  ];

  const handleVideoSelect = (videoId: string) => {
    // In a real app, this would navigate to the video player page
    console.log(`Selected video: ${videoId}`);
    // You could use router.push(`/video/${videoId}`) here
  };

  return (
    <div className="min-h-screen bg-black pb-16 text-white">
      {/* Profile Header */}
      <div className="border-b border-gray-800 px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">{user.username}</h1>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex flex-col items-center">
          <Avatar className="mb-4 h-20 w-20">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>
              {user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <h2 className="mb-1 text-lg font-semibold">{user.handle}</h2>

          <div className="my-4 flex gap-4">
            <div className="flex flex-col items-center">
              <span className="font-bold">{user.following}</span>
              <span className="text-sm text-gray-400">Following</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold">{user.followers}</span>
              <span className="text-sm text-gray-400">Followers</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold">{user.likes}</span>
              <span className="text-sm text-gray-400">Likes</span>
            </div>
          </div>

          <p className="mb-4 whitespace-pre-line text-center">{user.bio}</p>

          <Button className="mb-2 w-full">Edit Profile</Button>
        </div>
      </div>

      {/* Profile Content */}
      <Tabs defaultValue="videos" className="w-full">
        <TabsList className="w-full border-b border-gray-800 bg-black">
          <TabsTrigger
            value="videos"
            className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:text-white"
          >
            <Grid className="h-5 w-5" />
          </TabsTrigger>
          <TabsTrigger
            value="liked"
            className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:text-white"
          >
            <Heart className="h-5 w-5" />
          </TabsTrigger>
          <TabsTrigger
            value="private"
            className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:text-white"
          >
            <Lock className="h-5 w-5" />
          </TabsTrigger>
          <TabsTrigger
            value="bookmarks"
            className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:text-white"
          >
            <Bookmark className="h-5 w-5" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="videos" className="mt-0">
          <VideoGrid
            videos={userVideos}
            onVideoSelect={handleVideoSelect}
            title=""
            showStats={true}
          />
        </TabsContent>

        <TabsContent value="liked" className="mt-0">
          <VideoGrid
            videos={likedVideos}
            onVideoSelect={handleVideoSelect}
            title=""
            showStats={true}
          />
        </TabsContent>

        <TabsContent value="private" className="mt-0">
          <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
            <Lock className="mb-4 h-16 w-16 text-gray-500" />
            <h3 className="mb-2 text-xl font-bold">Private videos</h3>
            <p className="mb-4 text-gray-400">
              Videos you've set to private will appear here
            </p>
          </div>
        </TabsContent>

        <TabsContent value="bookmarks" className="mt-0">
          <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
            <Bookmark className="mb-4 h-16 w-16 text-gray-500" />
            <h3 className="mb-2 text-xl font-bold">Bookmarks</h3>
            <p className="mb-4 text-gray-400">
              Videos you've bookmarked will appear here
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
