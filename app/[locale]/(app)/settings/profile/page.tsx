"use client";
import { User as UserType } from "lucia";
import {
  AlertCircle,
  Award,
  Check,
  CheckCircle2,
  X as CloseIcon,
  Download,
  Eye,
  Image as ImageIcon,
  Loader2,
  Maximize2,
  Pencil,
  RotateCw,
  Save,
  Sparkles,
  TrendingUp,
  Upload,
  Zap,
} from "lucide-react";
import { Camera, Mail, Shield, User, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import revalidatePathAction from "@/app/actions/revalidatePath";
import LogoutAlert from "@/components/layout/Topbar/popup/Logout";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { updateUser, updateUserAvatar } from "@/services/auth.services";
import { optimizeImage } from "@/utils/file.utils";

type ProfileInformation = Pick<UserType, "display_name" | "username" | "bio">;

const ProfileCompletion = ({
  user,
  onDismiss,
}: {
  user: UserType;
  onDismiss: () => void;
}) => {
  const calculateCompletion = () => {
    let completed = 0;
    const total = 4;

    if (user?.avatar) completed++;
    if (user?.display_name && user.display_name.length > 0) completed++;
    if (user?.bio && user.bio.length > 0) completed++;
    if (user?.has_email_verified) completed++;

    return (completed / total) * 100;
  };

  const completion = calculateCompletion();

  const getCompletionMessage = () => {
    if (completion === 100)
      return {
        text: "Perfect!",
        color: "from-primary to-primary/80",
        icon: Award,
      };
    if (completion >= 75)
      return {
        text: "Almost complete",
        color: "from-primary/90 to-primary/70",
        icon: TrendingUp,
      };
    if (completion >= 50)
      return {
        text: "Great progress",
        color: "from-primary/80 to-primary/60",
        icon: Sparkles,
      };
    return {
      text: "Getting started",
      color: "from-muted-foreground to-muted-foreground/80",
      icon: Zap,
    };
  };

  const { text, color, icon: Icon } = getCompletionMessage();

  return (
    <Card className="border-0 bg-gradient-to-br from-background via-background to-muted/20 shadow-sm">
      <CardContent className="p-3 sm:p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 sm:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div
                className={`rounded-lg bg-gradient-to-br ${color} shrink-0 p-2 shadow-sm transition-all duration-300 hover:scale-105`}
              >
                <Icon className="size-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-foreground/90 sm:text-base">
                  Profile Strength
                </h3>
                <p className="hidden text-xs text-muted-foreground sm:block">
                  Complete your profile to unlock all features
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <div className="text-right">
                <span
                  className={`bg-gradient-to-br text-xl font-bold sm:text-2xl ${color} bg-clip-text text-transparent`}
                >
                  {Math.round(completion)}%
                </span>
                <p className="hidden text-xs font-medium text-muted-foreground sm:block">
                  {text}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onDismiss}
                className="size-6 shrink-0 opacity-60 transition-opacity hover:opacity-100 sm:size-6"
              >
                <X className="size-3" />
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/30">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700 ease-out`}
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>

          {/* Compact checklist */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 sm:flex sm:gap-3">
            <div className="flex items-center gap-1.5 text-xs">
              {user?.avatar ? (
                <CheckCircle2 className="size-3 shrink-0 text-primary" />
              ) : (
                <div className="size-3 shrink-0 rounded-full border border-border" />
              )}
              <span
                className={
                  user?.avatar
                    ? "text-foreground/70"
                    : "text-muted-foreground/70"
                }
              >
                Photo
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              {user?.display_name && user.display_name.length > 0 ? (
                <CheckCircle2 className="size-3 shrink-0 text-primary" />
              ) : (
                <div className="size-3 shrink-0 rounded-full border border-border" />
              )}
              <span
                className={
                  user?.display_name
                    ? "text-foreground/70"
                    : "text-muted-foreground/70"
                }
              >
                Name
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              {user?.bio && user.bio.length > 0 ? (
                <CheckCircle2 className="size-3 shrink-0 text-primary" />
              ) : (
                <div className="size-3 shrink-0 rounded-full border border-border" />
              )}
              <span
                className={
                  user?.bio ? "text-foreground/70" : "text-muted-foreground/70"
                }
              >
                Bio
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              {user?.has_email_verified ? (
                <CheckCircle2 className="size-3 shrink-0 text-primary" />
              ) : (
                <div className="size-3 shrink-0 rounded-full border border-border" />
              )}
              <span
                className={
                  user?.has_email_verified
                    ? "text-foreground/70"
                    : "text-muted-foreground/70"
                }
              >
                Email
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AvatarPreview = ({
  isOpen,
  onClose,
  imageUrl,
}: {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [rotation, setRotation] = useState(0);

  if (!isOpen) return null;

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "profile-avatar.png";
    link.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl overflow-hidden p-0">
        <div className="relative bg-background/95">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/90 p-4 backdrop-blur-sm">
            <DialogTitle className="text-lg font-semibold">
              Avatar Preview
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRotate}
                className="gap-2"
              >
                <RotateCw className="size-4" />
                Rotate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsZoomed(!isZoomed)}
                className="gap-2"
              >
                <Maximize2 className="size-4" />
                {isZoomed ? "Zoom Out" : "Zoom In"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="gap-2"
              >
                <Download className="size-4" />
                Download
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="size-8"
              >
                <CloseIcon className="size-4" />
              </Button>
            </div>
          </div>
          <div className="flex max-h-[80vh] min-h-[500px] items-center justify-center overflow-auto p-8">
            <div
              className={`relative transition-all duration-300 ${isZoomed ? "scale-150" : "scale-100"}`}
              style={{
                transform: `rotate(${rotation}deg) ${isZoomed ? "scale(1.5)" : "scale(1)"}`,
              }}
            >
              <img
                src={imageUrl}
                alt="Profile preview"
                className="h-auto w-full max-w-[600px] rounded-lg object-contain shadow-2xl"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ProfileSettings = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [isAvatarPreviewOpen, setIsAvatarPreviewOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    display_name: "",
    username: "",
    email: "",
    bio: "",
  });
  const [profileSaveLoading, setProfileSaveLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [isCompletionCardVisible, setIsCompletionCardVisible] = useState(true);

  const { user, loading } = useAuth();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    processFile(file);
  };

  const processFile = (file?: File) => {
    if (!file) return;

    // Reset states
    setUploadError(null);
    setUploadProgress(0);

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file (JPG, PNG, GIF, WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      setUploadError("Image size should be less than 5MB");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setShowSaveButton(true);
  };

  const handleSaveChanges = async () => {
    if (selectedFile) {
      setIsLoading(true);
      setUploadError(null);
      setUploadProgress(10);

      try {
        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90));
        }, 200);

        setUploadProgress(30);
        const optimizedFile = await optimizeImage(selectedFile);
        setUploadProgress(60);

        await updateUserAvatar(optimizedFile);
        setUploadProgress(90);

        await revalidatePathAction("/settings/profile");
        setUploadProgress(100);

        clearInterval(progressInterval);

        setSelectedFile(null);
        setPreviewUrl(null);
        setShowSaveButton(false);
        setUploadProgress(0);
      } catch (error) {
        console.log(error);
        setUploadError("Failed to upload avatar. Please try again.");
        setUploadProgress(0);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleProfileFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setProfileFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditProfile = () => {
    setIsEditingProfile(true);
    setProfileFormData({
      display_name: user?.display_name || "",
      username: user?.username || "",
      email: user?.email || "",
      bio: user?.bio || "",
    });
  };

  const handleSaveProfile = async () => {
    setProfileSaveLoading(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      // For profile fields, use the regular update endpoint
      const updatedFields: ProfileInformation = {
        display_name: profileFormData.display_name,
        username: profileFormData.username,
        bio: profileFormData.bio,
      };

      // Only include fields that have actually changed
      const changes = Object.entries(updatedFields).reduce(
        (acc, [key, value]) => {
          if (
            value !==
            (user as ProfileInformation)?.[key as keyof ProfileInformation]
          ) {
            if (value === null) {
              acc[key as keyof ProfileInformation] = "";
            } else {
              acc[key as keyof ProfileInformation] = value;
            }
          }
          return acc;
        },
        {} as ProfileInformation,
      );

      if (Object.keys(changes).length > 0) {
        await updateUser(changes);
        setProfileSuccess("Profile updated successfully!");
      } else {
        setProfileSuccess("No changes to save.");
      }

      // Revalidate the path to refresh server-side data
      await revalidatePathAction("/settings/profile");

      // Exit edit mode on success
      setIsEditingProfile(false);

      // Clear success message after 3 seconds
      setTimeout(() => setProfileSuccess(null), 3000);
    } catch (error: unknown) {
      console.error("Failed to save profile:", error);
      setProfileError("Failed to update profile. Please try again.");
    } finally {
      setProfileSaveLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setProfileFormData({
      display_name: user?.display_name || "",
      username: user?.username || "",
      email: user?.email || "",
      bio: user?.bio || "",
    });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + E to edit profile
      if ((e.ctrlKey || e.metaKey) && e.key === "e") {
        e.preventDefault();
        if (!isEditingProfile) {
          handleEditProfile();
        }
      }
      // Ctrl/Cmd + U to focus avatar upload
      if ((e.ctrlKey || e.metaKey) && e.key === "u") {
        e.preventDefault();
        document.getElementById("avatar-upload")?.click();
      }
      // Ctrl/Cmd + P to preview avatar
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key === "p" &&
        (user?.avatar || previewUrl)
      ) {
        e.preventDefault();
        setIsAvatarPreviewOpen(true);
      }
      // Ctrl/Cmd + S to save (avatar when selected or profile when editing)
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        if (selectedFile && !isLoading) {
          e.preventDefault();
          handleSaveChanges();
        } else if (isEditingProfile && !profileSaveLoading) {
          e.preventDefault();
          handleSaveProfile();
        }
      }
      // Escape to close modals or cancel editing
      if (e.key === "Escape") {
        if (isAvatarPreviewOpen) setIsAvatarPreviewOpen(false);
        if (isEditingProfile) handleCancelEdit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isEditingProfile,
    isAvatarPreviewOpen,
    selectedFile,
    isLoading,
    profileSaveLoading,
    user?.avatar,
    previewUrl,
  ]);

  // Skeleton loading component
  const ProfileSkeleton = () => (
    <div className="mx-auto max-w-4xl space-y-8 p-0">
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-px bg-muted" />
      </div>
      <div className="flex flex-col items-center space-y-6 sm:flex-row sm:items-start sm:space-x-6 sm:space-y-0">
        <div className="size-32 animate-pulse rounded-full bg-muted" />
        <div className="flex-1 space-y-4">
          <div className="h-8 w-64 animate-pulse rounded-lg bg-muted" />
          <div className="h-5 w-48 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
      <div className="space-y-6">
        <div className="h-5 w-96 animate-pulse rounded-lg bg-muted" />
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="size-10 animate-pulse rounded-lg bg-muted" />
            <div className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-4 w-64 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return <ProfileSkeleton />;

  return (
    <TooltipProvider>
      <div className="w-full space-y-4 p-4 sm:mx-auto sm:max-w-4xl sm:space-y-6 sm:p-0">
        {/* Profile Completion Card */}
        {/* {isCompletionCardVisible && (
          <ProfileCompletion
            user={user!}
            onDismiss={() => setIsCompletionCardVisible(false)}
          />
        )} */}

        <Card className="w-full border-0 bg-transparent shadow-none">
          <CardHeader className="space-y-4 p-0 pb-4 sm:pb-6">
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div>
                <CardTitle className="text-xl font-bold text-foreground/80 sm:text-2xl">
                  Profile Settings
                </CardTitle>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground/70">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px]">
                      Ctrl+E
                    </kbd>
                    edit
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px]">
                      Ctrl+S
                    </kbd>
                    save
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px]">
                      Esc
                    </kbd>
                    cancel
                  </span>
                  <span className="flex items-center gap-1 sm:hidden">
                    <kbd className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px]">
                      📷
                    </kbd>
                    upload
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-8">
              <div className="group relative shrink-0">
                <div className="relative">
                  <Avatar
                    className="size-20 border-[3px] border-background shadow-lg transition-all duration-300 sm:size-24"
                    style={{
                      borderRadius: "40% / 24%",
                      background:
                        "linear-gradient(135deg, hsl(var(--primary) / 0.1) 0%, hsl(var(--secondary) / 0.1) 100%)",
                    }}
                  >
                    <AvatarImage
                      src={previewUrl || (user?.avatar ?? "")}
                      className="object-cover"
                      style={{
                        borderRadius: "inherit",
                      }}
                    />
                    <AvatarFallback className="bg-transparent">
                      <User className="size-16 text-muted-foreground/60 sm:size-20" />
                    </AvatarFallback>
                  </Avatar>

                  {(user?.avatar || previewUrl) && (
                    <button
                      onClick={() => setIsAvatarPreviewOpen(true)}
                      className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-[40%_/_24%] opacity-0 transition-all duration-200 group-hover:bg-black/20 group-hover:opacity-100"
                      style={{
                        borderRadius: "40% / 24%",
                      }}
                    >
                      <Eye className="size-6 text-white sm:size-8" />
                    </button>
                  )}

                  {isLoading && uploadProgress > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm">
                      <div className="relative">
                        <svg className="size-16 -rotate-90 sm:size-20">
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            className="sm:cx-40 sm:cy-40 sm:r-36 text-background/20"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 28}`}
                            strokeDashoffset={`${2 * Math.PI * 28 * (1 - uploadProgress / 100)}`}
                            className="sm:cx-40 sm:cy-40 sm:r-36 text-primary transition-all duration-300"
                            style={{
                              strokeDasharray: `calc(2 * 3.14159 * var(--r, 28))`,
                              strokeDashoffset: `calc(2 * 3.14159 * var(--r, 28) * (1 - ${uploadProgress / 100}))`,
                            }}
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-primary-foreground sm:text-base">
                          {uploadProgress}%
                        </span>
                      </div>
                    </div>
                  )}

                  <Label
                    htmlFor="avatar-upload"
                    className="absolute -bottom-1 -right-1 cursor-pointer opacity-0 transition-all duration-200 group-hover:opacity-100"
                  >
                    <div className="rounded-full bg-primary/90 p-2.5 text-primary-foreground shadow-lg backdrop-blur-sm transition-colors hover:scale-110 hover:bg-primary sm:p-3">
                      <Camera className="size-4 sm:size-5" />
                    </div>
                    <input
                      id="avatar-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={isLoading}
                    />
                  </Label>

                  {selectedFile && !isLoading && (
                    <>
                      <div className="absolute -right-2 -top-2 animate-pulse">
                        <div className="rounded-full bg-green-500 p-1 shadow-lg">
                          <Check className="size-3 text-white" />
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          setPreviewUrl(null);
                          setShowSaveButton(false);
                          setUploadError(null);
                        }}
                        className="absolute -left-2 -top-2 z-10 rounded-full bg-red-500 p-1 shadow-lg transition-colors hover:bg-red-600"
                      >
                        <X className="size-3 text-white" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="w-full flex-1 space-y-3 text-center sm:w-auto sm:text-left">
                <div>
                  <div className="mb-1 flex items-center justify-center gap-2 sm:justify-start">
                    <h1 className="text-2xl font-bold text-foreground/80">
                      {user?.display_name}
                    </h1>
                    {user?.has_email_verified && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="cursor-help rounded-full bg-blue-500/10 p-1.5 transition-colors hover:bg-blue-500/20">
                            <Shield
                              className="size-4 text-blue-500"
                              fill="currentColor"
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          <p>Email verified</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <div className="flex items-center justify-center text-muted-foreground sm:justify-start">
                    <span className="text-sm font-medium">
                      @{user?.username}
                    </span>
                  </div>
                </div>

                {uploadError && (
                  <div className="flex items-center gap-2 rounded-md border border-red-200/50 bg-red-50/50 p-2.5 animate-in fade-in-0 slide-in-from-top-2 dark:border-red-800/50 dark:bg-red-900/10">
                    <AlertCircle className="size-3.5 shrink-0 text-red-500" />
                    <span className="text-xs text-red-600 dark:text-red-400">
                      {uploadError}
                    </span>
                  </div>
                )}

                {selectedFile && (
                  <div className="flex items-center gap-2 rounded-md border border-blue-200/50 bg-blue-50/50 p-2.5 animate-in fade-in-0 slide-in-from-top-2 dark:border-blue-800/50 dark:bg-blue-900/10">
                    <ImageIcon className="size-3.5 shrink-0 text-blue-500" />
                    <span className="text-xs text-blue-600 dark:text-blue-400">
                      {selectedFile.name} (
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                )}

                {showSaveButton && (
                  <div className="flex justify-center gap-2 sm:justify-start">
                    <Button
                      onClick={handleSaveChanges}
                      size="sm"
                      className="relative h-10 min-w-[100px] gap-1.5 px-4 text-xs"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="size-3.5" />
                          <span>Save</span>
                        </>
                      )}
                    </Button>
                    {!isLoading && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl(null);
                          setShowSaveButton(false);
                          setUploadError(null);
                        }}
                        className="h-10 px-3 text-xs"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground/60">
                  <span className="flex items-center gap-1.5">
                    <div className="size-1.5 rounded-full bg-green-500" />
                    JPG, PNG, WebP
                  </span>
                  <span className="flex items-center gap-1.5">
                    <div className="size-1.5 rounded-full bg-blue-500" />
                    5MB max
                  </span>
                  <span className="flex items-center gap-1.5">
                    <div className="size-1.5 rounded-full bg-orange-500" />
                    Click camera to upload
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 p-0 sm:space-y-2">
            {isCompletionCardVisible && (
              <ProfileCompletion
                user={user!}
                onDismiss={() => setIsCompletionCardVisible(false)}
              />
            )}
            <div className="grid gap-6 sm:gap-8">
              <div className="space-y-6">
                <Card className="border-0 bg-gradient-to-br from-background via-background to-muted/20 shadow-sm">
                  <CardHeader className="px-0 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                          <User className="size-5 text-muted-foreground" />
                          Profile Information
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {isEditingProfile
                            ? "Editing your profile details"
                            : "Manage your account details"}
                        </p>
                        {profileSuccess && (
                          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 animate-in fade-in-0 slide-in-from-top-2 dark:border-green-800 dark:bg-green-900/20">
                            <CheckCircle2 className="size-4 shrink-0 text-green-500" />
                            <span className="text-sm text-green-600 dark:text-green-400">
                              {profileSuccess}
                            </span>
                          </div>
                        )}
                        {profileError && (
                          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 animate-in fade-in-0 slide-in-from-top-2 dark:border-red-800 dark:bg-red-900/20">
                            <AlertCircle className="size-4 shrink-0 text-red-500" />
                            <span className="text-sm text-red-600 dark:text-red-400">
                              {profileError}
                            </span>
                          </div>
                        )}
                      </div>
                      {!isEditingProfile ? (
                        <Button
                          onClick={handleEditProfile}
                          variant="outline"
                          size="sm"
                          className="h-10 gap-2 transition-all duration-200 hover:scale-105 hover:bg-primary hover:text-primary-foreground sm:px-3"
                        >
                          <Pencil className="size-4" />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            onClick={handleSaveProfile}
                            disabled={profileSaveLoading}
                            size="sm"
                            className="h-10 gap-2 transition-all duration-200 sm:px-3"
                          >
                            {profileSaveLoading ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <Save className="size-4" />
                            )}
                            <span className="hidden sm:inline">Save</span>
                          </Button>
                          <Button
                            onClick={handleCancelEdit}
                            variant="outline"
                            size="sm"
                            className="h-10 gap-2 transition-all duration-200 sm:px-3"
                            disabled={profileSaveLoading}
                          >
                            <X className="size-4" />
                            <span className="hidden sm:inline">Cancel</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 px-0 sm:px-6">
                    {isEditingProfile ? (
                      <div className="space-y-0.5">
                        {/* Display Name */}
                        <div className="group relative rounded-lg border border-border/40 bg-gradient-to-r from-background/80 to-muted/5 p-3 transition-all duration-200 focus-within:border-primary/30 focus-within:bg-muted/10 hover:border-primary/15 hover:bg-muted/10">
                          <div className="relative flex items-start gap-3">
                            <div className="shrink-0 rounded-lg bg-primary/5 p-2 transition-all duration-200 group-hover:bg-primary/10">
                              <User className="size-4 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <Label
                                  htmlFor="display_name"
                                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70"
                                >
                                  Display Name
                                </Label>
                                <div className="h-px flex-1 bg-border/30" />
                              </div>
                              <div className="rounded-md border border-border/20 bg-background/50 p-2.5 transition-all duration-200 focus-within:border-primary/40 focus-within:bg-background/80">
                                <Input
                                  id="display_name"
                                  name="display_name"
                                  value={profileFormData.display_name}
                                  onChange={handleProfileFormChange}
                                  className="h-10 border-0 bg-transparent p-0 text-base text-foreground/75 shadow-none placeholder:text-muted-foreground/40 focus-visible:ring-0 focus-visible:ring-offset-0 sm:h-auto sm:text-sm"
                                  placeholder="Enter your display name"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Username */}
                        <div className="group relative rounded-lg border border-border/40 bg-gradient-to-r from-background/80 to-muted/5 p-3 transition-all duration-200 focus-within:border-primary/30 focus-within:bg-muted/10 hover:border-primary/15 hover:bg-muted/10">
                          <div className="relative flex items-start gap-3">
                            <div className="shrink-0 rounded-lg bg-blue-500/5 p-2 transition-all duration-200 group-hover:bg-blue-500/10">
                              <span className="font-mono text-xs font-bold text-blue-500">
                                @
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <Label
                                  htmlFor="username"
                                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70"
                                >
                                  Username
                                </Label>
                                <div className="h-px flex-1 bg-border/30" />
                              </div>
                              <div className="rounded-md border border-border/20 bg-background/50 p-2.5 transition-all duration-200 focus-within:border-primary/40 focus-within:bg-background/80">
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-sm text-muted-foreground/50">
                                    @
                                  </span>
                                  <Input
                                    id="username"
                                    name="username"
                                    value={profileFormData.username}
                                    onChange={handleProfileFormChange}
                                    className="h-10 border-0 bg-transparent p-0 pl-8 font-mono text-base text-foreground/75 shadow-none placeholder:text-muted-foreground/40 focus-visible:ring-0 focus-visible:ring-offset-0 sm:h-auto sm:pl-5 sm:text-sm"
                                    placeholder="username"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Email Address */}
                        <div className="group relative rounded-lg border border-border/40 bg-gradient-to-r from-background/80 to-muted/5 p-3 transition-all duration-200 focus-within:border-primary/30 focus-within:bg-muted/10 hover:border-primary/15 hover:bg-muted/10">
                          <div className="relative flex items-start gap-3">
                            <div className="shrink-0 rounded-lg bg-green-500/5 p-2 transition-all duration-200 group-hover:bg-green-500/10">
                              <Mail className="size-4 text-green-600" />
                            </div>
                            <div className="min-w-0 flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <Label
                                  htmlFor="email"
                                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70"
                                >
                                  Email Address
                                </Label>
                                <div className="h-px flex-1 bg-border/30" />
                              </div>
                              <div className="space-y-2">
                                <div className="rounded-md border border-border/20 bg-muted/30 p-2.5 opacity-60">
                                  <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={profileFormData.email}
                                    onChange={handleProfileFormChange}
                                    disabled
                                    className="h-10 cursor-not-allowed border-0 bg-transparent p-0 text-base text-muted-foreground/50 shadow-none placeholder:text-muted-foreground/30 focus-visible:ring-0 focus-visible:ring-offset-0 sm:h-auto sm:text-sm"
                                    placeholder="your@email.com"
                                    inputMode="email"
                                  />
                                </div>
                                <p className="text-[10px] text-muted-foreground/60">
                                  Email cannot be changed from this page
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bio */}
                        <div className="group relative rounded-lg border border-border/40 bg-gradient-to-r from-background/80 to-muted/5 p-3 transition-all duration-200 focus-within:border-primary/30 focus-within:bg-muted/10 hover:border-primary/15 hover:bg-muted/10">
                          <div className="relative flex items-start gap-3">
                            <div className="shrink-0 rounded-lg bg-purple-500/5 p-2 transition-all duration-200 group-hover:bg-purple-500/10">
                              <User className="size-4 text-purple-600" />
                            </div>
                            <div className="min-w-0 flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <Label
                                  htmlFor="bio"
                                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70"
                                >
                                  Bio
                                </Label>
                                <div className="h-px flex-1 bg-border/30" />
                                <span className="text-[10px] text-muted-foreground/60">
                                  {profileFormData.bio.length} chars
                                </span>
                              </div>
                              <div className="rounded-md border border-border/20 bg-background/50 p-2.5 transition-all duration-200 focus-within:border-primary/40 focus-within:bg-background/80">
                                <Textarea
                                  id="bio"
                                  name="bio"
                                  value={profileFormData.bio}
                                  onChange={handleProfileFormChange}
                                  rows={4}
                                  className="sm:rows-3 h-auto min-h-[100px] resize-none border-0 bg-transparent p-0 text-base leading-relaxed text-foreground shadow-none placeholder:text-muted-foreground/40 focus-visible:ring-0 focus-visible:ring-offset-0 sm:min-h-[75px] sm:text-sm"
                                  placeholder="Tell us about yourself..."
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        {/* Display Name */}
                        <div className="group relative rounded-lg border border-border/40 bg-gradient-to-r from-background/80 to-muted/5 p-4 transition-all duration-200 hover:border-primary/15 hover:bg-muted/10">
                          <div className="relative flex items-start gap-3">
                            <div className="shrink-0 rounded-lg bg-primary/5 p-2 transition-all duration-200 group-hover:bg-primary/10">
                              <User className="size-4 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                                  Display Name
                                </p>
                                <div className="h-px flex-1 bg-border/30" />
                              </div>
                              <p className="text-sm font-normal text-foreground/75">
                                {user?.display_name || (
                                  <span className="italic text-muted-foreground/50">
                                    Not set
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Username */}
                        <div className="group relative rounded-lg border border-border/40 bg-gradient-to-r from-background/80 to-muted/5 p-4 transition-all duration-200 hover:border-primary/15 hover:bg-muted/10">
                          <div className="relative flex items-start gap-3">
                            <div className="shrink-0 rounded-lg bg-blue-500/5 p-2 transition-all duration-200 group-hover:bg-blue-500/10">
                              <span className="font-mono text-xs font-bold text-blue-500">
                                @
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                                  Username
                                </p>
                                <div className="h-px flex-1 bg-border/30" />
                              </div>
                              <p className="font-mono text-sm font-normal text-foreground/75">
                                @
                                {user?.username || (
                                  <span className="italic text-muted-foreground/50">
                                    notset
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Email Address */}
                        <div className="group relative rounded-lg border border-border/40 bg-gradient-to-r from-background/80 to-muted/5 p-4 transition-all duration-200 hover:border-primary/15 hover:bg-muted/10">
                          <div className="relative flex items-start gap-3">
                            <div className="shrink-0 rounded-lg bg-green-500/5 p-2 transition-all duration-200 group-hover:bg-green-500/10">
                              <Mail className="size-4 text-green-600" />
                            </div>
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                                  Email Address
                                </p>
                                <div className="h-px flex-1 bg-border/30" />
                                {user?.has_email_verified && (
                                  <Badge
                                    variant="secondary"
                                    className="h-4 gap-1 px-1.5 text-[10px]"
                                  >
                                    <CheckCircle2 className="size-2.5 text-green-500" />
                                    Verified
                                  </Badge>
                                )}
                              </div>
                              <p className="break-all text-sm font-normal text-foreground">
                                {user?.email}
                              </p>
                              {user?.has_email_verified ? (
                                <Badge
                                  variant="secondary"
                                  className="h-4 gap-1 px-1.5 text-[10px]"
                                >
                                  <CheckCircle2 className="size-2.5 text-green-500" />
                                  Verified
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="h-4 gap-1 border-yellow-600 px-1.5 text-[10px] text-yellow-600"
                                >
                                  <AlertCircle className="size-2.5" />
                                  Not Verified
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Bio */}
                        <div className="group relative rounded-lg border border-border/40 bg-gradient-to-r from-background/80 to-muted/5 p-4 transition-all duration-200 hover:border-primary/15 hover:bg-muted/10">
                          <div className="relative flex items-start gap-3">
                            <div className="shrink-0 rounded-lg bg-purple-500/5 p-2 transition-all duration-200 group-hover:bg-purple-500/10">
                              <User className="size-4 text-purple-600" />
                            </div>
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                                  Bio
                                </p>
                                <div className="h-px flex-1 bg-border/30" />
                                <span className="text-[10px] text-muted-foreground/60">
                                  {user?.bio ? user.bio.length : 0} chars
                                </span>
                              </div>
                              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/75">
                                {user?.bio ? (
                                  user.bio
                                ) : (
                                  <span className="italic text-muted-foreground/50">
                                    Tell us about yourself...
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        <AvatarPreview
          isOpen={isAvatarPreviewOpen}
          onClose={() => setIsAvatarPreviewOpen(false)}
          imageUrl={previewUrl || user?.avatar || ""}
        />
      </div>

      <div className="mb-8 mt-10 flex w-full justify-end px-4 sm:mx-auto sm:mb-16 sm:max-w-4xl sm:px-0 sm:pb-16">
        <div className="group relative">
          <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-red-600/20 to-orange-600/20 opacity-0 blur transition duration-300 group-hover:opacity-75"></div>
          <LogoutAlert
            standalone
            className="relative flex items-center gap-2 border border-red-500/20 bg-gradient-to-r from-red-500 to-red-600 px-6 py-2.5 font-medium text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:from-red-600 hover:to-red-700 hover:shadow-xl"
          >
            <svg
              className="size-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </LogoutAlert>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ProfileSettings;
