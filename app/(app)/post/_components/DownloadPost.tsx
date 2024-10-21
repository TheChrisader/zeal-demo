"use client";
import { Button } from "@/components/ui/button";
import {
  DownloadedPost,
  getIDBConfig,
  PostToDownload,
} from "../../downloads/page";
import { CircleCheckBig, Download } from "lucide-react";
import useAuth from "@/context/auth/useAuth";
import { useEffect, useState } from "react";
import setupIndexedDB, { useIndexedDBStore } from "@/hooks/useIndexedDB";
import { toast } from "sonner";

const DownloadPost = ({ article }: { article: PostToDownload }) => {
  const [isDownloaded, setIsDownloaded] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setupIndexedDB(getIDBConfig(user?.id.toString()))
        .then(() => console.log("success"))
        .catch((e) => console.error("error / unsupported", e));
    }
  }, []);

  const { add, getByID, getAll } = useIndexedDBStore("posts");

  useEffect(() => {
    const getPost = async () => {
      const posts = await getAll();
      const post = posts.find(
        (post) => (post as DownloadedPost)._id === article._id,
      );
      if (post) {
        setIsDownloaded(true);
      }
    };
    getPost();
  }, []);

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

  const handleDownload = async () => {
    try {
    } catch {}
  };

  return (
    <Button variant={"unstyled"} onClick={() => insertPost(article)}>
      <Download className="text-[#696969]" />
    </Button>
  );
};

export default DownloadPost;
