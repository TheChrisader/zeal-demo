"use client";
import { Button } from "@/components/ui/button";
import useAuth from "@/context/auth/useAuth";
import UpdateProfile from "./menu/UpdateProfile";
import React, { ChangeEventHandler, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { optimizeImage } from "@/utils/file.utils";
import { updateUserAvatar } from "@/services/auth.services";
import revalidatePathAction from "@/app/actions/revalidatePath";
import { CheckCircle2, Loader2, Pencil } from "lucide-react";
import LogoutAlert from "@/components/layout/Topbar/popup/Logout";
import FollowingList from "./menu/FollowingList";
import { Separator } from "@/components/ui/separator";
import FollowerList from "./menu/FollowerList";

import { Camera, Check, Mail, User, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User as UserType } from "lucia";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const EditProfileDialog = ({
  isEditDialogOpen,
  setIsEditDialogOpen,
  userData,
  handleEditFormChange,
}: {
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  userData: UserType;
  handleEditFormChange: ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  >;
}) => {
  const handleEditFormSubmit = () => {
    // Here you would typically send the updated data to your server
    setIsEditDialogOpen(false);
  };
  return (
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogContent className="scrollbar-change scrollbar-change-mini max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile information here.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={userData.display_name}
              onChange={handleEditFormChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <span className="absolute left-3 top-[7px] text-muted-foreground">
                @
              </span>
              <Input
                id="username"
                name="username"
                value={userData.username}
                onChange={handleEditFormChange}
                className="pl-7"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={userData.email}
              onChange={handleEditFormChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={userData.bio ? userData.bio : ""}
              onChange={handleEditFormChange}
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleEditFormSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ProfileSettings = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [following, setFollowing] = useState(0);
  const [followers, setFollowers] = useState(0);

  const { user, canWrite } = useAuth();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setShowSaveButton(true);
    }
  };

  const handleSaveChanges = async () => {
    if (selectedFile) {
      setIsLoading(true);
      try {
        const optimizedFile = await optimizeImage(selectedFile);
        await updateUserAvatar(optimizedFile);
        await revalidatePathAction("/settings/profile");
      } catch (error) {
        console.log(error);
      } finally {
        setSelectedFile(null);
        setIsLoading(false);
        setShowSaveButton(false);
      }
    }
  };

  const handleEditFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    // setEditFormData((prev) => ({
    //   ...prev,
    //   [name]: value,
    // }));
  };

  useEffect(() => {
    if (!user) return;
    const fetchFollowCount = async () => {
      const response = await fetch("/api/v1/follow-count");
      const data = await response.json();
      setFollowing(data.followCount);
      setFollowers(data.followerCount);
    };

    fetchFollowCount();
  }, [user]);

  return (
    <>
      <div className="max-w-2x container mx-0 p-0">
        <Card className="w-full border-0 bg-transparent shadow-none">
          <CardHeader className="space-y-4 p-0 pb-6">
            <div>
              <div className="mb-4 flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-[#2F2D32]">
                  Profile Settings
                </CardTitle>
                {/* <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
              Edit Profile
              </Button> */}
              </div>
              <Separator />
            </div>

            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={previewUrl || (user?.avatar ?? "")} />
                  <AvatarFallback>
                    <User className="h-16 w-16" />
                  </AvatarFallback>
                </Avatar>

                <Label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 cursor-pointer"
                >
                  <div className="rounded-full bg-primary p-2 text-primary-foreground hover:bg-green-900">
                    <Camera className="h-4 w-4" />
                  </div>
                  <input
                    id="avatar-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </Label>
              </div>

              {showSaveButton && (
                <Button onClick={handleSaveChanges} className="w-auto">
                  Save Changes
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6 p-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-1">
                <div>
                  <h2 className="text-2xl font-bold max-[400px]:text-xl">
                    {user?.display_name}
                  </h2>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <span>@{user?.username}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size={"sm"}
                  onClick={() => setIsEditDialogOpen(true)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{user?.email}</span>
                {user?.has_email_verified && (
                  // <Badge variant="secondary" className="ml-2">
                  //   <Check className="mr-1 h-3 w-3" /> Verified
                  // </Badge>
                  <HoverCard>
                    <HoverCardTrigger>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </HoverCardTrigger>
                    <HoverCardContent>Email verified</HoverCardContent>
                  </HoverCard>
                )}
              </div>

              <p className="text-muted-foreground">
                {user?.bio ? user.bio : "No bio set."}
              </p>

              <div className="flex space-x-6">
                <FollowerList>
                  <button>
                    <span className="font-bold">{followers}</span>
                    <span className="ml-1 text-muted-foreground">
                      Followers
                    </span>
                  </button>
                </FollowerList>
                {canWrite && (
                  <>
                    <div className="h-6">
                      <Separator orientation="vertical" className="w-[2px]" />
                    </div>
                    <FollowingList>
                      <button>
                        <span className="font-bold">{following}</span>
                        <span className="ml-1 text-muted-foreground">
                          Following
                        </span>
                      </button>
                    </FollowingList>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <EditProfileDialog
          isEditDialogOpen={isEditDialogOpen}
          setIsEditDialogOpen={setIsEditDialogOpen}
          userData={user!}
          handleEditFormChange={handleEditFormChange}
        />
      </div>
      <div className="mt-9 flex w-full justify-end pb-20">
        <LogoutAlert standalone>Logout</LogoutAlert>
      </div>
    </>
  );
};

export default ProfileSettings;
