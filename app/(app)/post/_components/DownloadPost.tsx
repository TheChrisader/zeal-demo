"use client";

import { CircleCheckBig, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import useAuth from "@/context/auth/useAuth";
import setupIndexedDB, { useIndexedDBStore } from "@/hooks/useIndexedDB";
import {
  DownloadedPost,
  getIDBConfig,
  PostToDownload,
} from "../../downloads/[[...id]]/page";

const DownloadPost = ({ article }: { article: PostToDownload }) => {
  const [isDownloaded, setIsDownloaded] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setupIndexedDB(getIDBConfig(user?.id.toString()))
        .then(() => console.log("success"))
        .catch((e) => console.error("error / unsupported", e));
    }
  }, [user]);

  const { add, getAll } = useIndexedDBStore("posts");

  useEffect(() => {
    const getPost = async () => {
      if (!user) return;

      const posts = await getAll();
      const post = posts.find(
        (post) => (post as DownloadedPost)._id === article._id,
      );
      if (post) {
        setIsDownloaded(true);
      }
    };
    getPost();
  }, [article._id, user, getAll]);

  if (!user || isDownloaded) {
    return null;
  }

  const insertPost = async (newPost: PostToDownload | DownloadedPost) => {
    try {
      const id = await add(newPost);
      (newPost as DownloadedPost).id = id;
      toast.success("Post downloaded successfully", {
        icon: <CircleCheckBig className="stroke-primary" />,
        classNames: {
          toast: "flex gap-4 items-center w-fit",
        },
      });
      setIsDownloaded(true);
    } catch (error) {
      toast.error("Something went wrong", {
        // icon: <CircleCheckBig className="stroke-primary" />,
        classNames: {
          toast: "flex gap-4 items-center w-fit",
        },
      });
    }
  };

  return (
    <Button variant={"unstyled"} onClick={() => insertPost(article)}>
      <Download className="text-[#696969]" />
    </Button>
  );
};

export default DownloadPost;
