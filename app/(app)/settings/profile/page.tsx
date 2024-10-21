"use client";
import { Button } from "@/components/ui/button";
import useAuth from "@/context/auth/useAuth";
import UpdateProfile from "./menu/UpdateProfile";
import { ChangeEventHandler, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { optimizeImage } from "@/utils/file.utils";
import { updateUserAvatar } from "@/services/auth.services";
import revalidatePathAction from "@/app/actions/revalidatePath";
import { Loader2 } from "lucide-react";
import LogoutAlert from "@/components/layout/Topbar/popup/Logout";

const ProfileSettings = () => {
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleUpdateFile: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { files } = event.target;
    if (files) {
      const file = files.item(0);
      setFileToUpload(file);
    }
  };

  const handleUploadFile = async () => {
    if (fileToUpload) {
      setIsLoading(true);
      try {
        const optimizedFile = await optimizeImage(fileToUpload);
        await updateUserAvatar(optimizedFile);
        await revalidatePathAction("/settings/profile");
      } catch (error) {
        console.log(error);
      } finally {
        setFileToUpload(null);
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex w-full flex-col items-center gap-7">
      <div className="relative flex w-full justify-center">
        <div className="flex flex-col items-center">
          <div className="size-32 overflow-hidden rounded-full bg-[#2F2D32]">
            {(user?.avatar || fileToUpload) && (
              <img
                className="size-full"
                src={
                  (fileToUpload && URL.createObjectURL(fileToUpload)) ||
                  user?.avatar!
                }
                alt="user avatar"
              />
            )}
          </div>
          <Button
            variant="link"
            className="rounded-full text-primary underline"
            onClick={() => fileRef.current?.click()}
          >
            Upload profile image
            <Input
              ref={fileRef}
              accept="image/png, image/gif, image/jpeg"
              onChange={handleUpdateFile}
              type="file"
              className="hidden"
            />
          </Button>
          {fileToUpload && (
            <Button className="w-full" onClick={handleUploadFile}>
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Update Your Avatar"
              )}
            </Button>
          )}
        </div>
        {/* <Button variant="outline" className="absolute right-0 rounded-full"> */}
        <UpdateProfile>Edit</UpdateProfile>
        {/* </Button> */}
      </div>
      <div className="flex items-center gap-12 max-[500px]:flex-col max-[500px]:items-start max-[500px]:self-start">
        <div>
          <h3 className="text-sm font-normal text-[#696969]">Full Name</h3>
          <p className="text-sm font-normal text-[#2F2D32]">
            {user?.display_name}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-normal text-[#696969]">Username</h3>
          <p className="text-sm font-normal text-[#2F2D32]">
            @{user?.username}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-normal text-[#696969]">Email Address</h3>
          <p className="text-sm font-normal text-[#2F2D32]">{user?.email}</p>
        </div>
      </div>
      <div className="mt-9 flex w-full justify-end">
        <LogoutAlert standalone>Logout</LogoutAlert>
      </div>
    </div>
  );
};

export default ProfileSettings;
