"use client";
import { useEffect, useState } from "react";
import DownloadsBar from "../_components/DownloadsBar";
import setupIndexedDB, { useIndexedDBStore } from "@/hooks/useIndexedDB";
import { Link } from "@/i18n/routing";
import Downloads from "../_components/Downloads";
import { toast } from "sonner";
import { CircleCheckBig } from "lucide-react";
import useAuth from "@/context/auth/useAuth";
import DownloadedPage from "../_components/DownloadedPage";
import useDownloads from "@/context/downloads/useDownloads";
import { usePathname } from "@/i18n/routing";
import { cleanContent } from "@/utils/post.utils";
import { getIDBConfig } from "../_utils/getIDBConfig";

export type PostToDownload = {
  _id: string;
  title: string;
  author_id: string;
  category: string[];
  description: string;
  image: string | null;
  published_at: string;
  ttr: number;
  content: string;
  source: {
    name: string;
    icon: string;
  };
};

export type DownloadedPost = PostToDownload & {
  id: number;
};

const DownloadsPage = () => {
  const [post, setPost] = useState<DownloadedPost | null>(null);
  const [posts, setPosts] = useState<DownloadedPost[]>([]);
  const [postID, setPostID] = useState<string | null>(null);
  const path = usePathname();
  // const { postID } = useDownloads();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      return;
    }

    setupIndexedDB(getIDBConfig(user.id.toString()!))
      .then(() => console.log("success"))
      .catch((e) => console.error("error / unsupported", e));
  }, [user]);

  const { add, getByID, getAll } = useIndexedDBStore("posts");

  const getPost = async () => {
    const id = path.replace("/downloads", "").replaceAll("/", "");
    if (!id) {
      setPost(null);
      return;
    }
    const post = (await getByID(Number(id))) as DownloadedPost;

    if (!post) {
      setPost(null);
      return;
    }

    post.content = cleanContent(post.content);

    setPost(post);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    getPost();
  }, [path]);

  const insertPost = async (newPost: PostToDownload | DownloadedPost) => {
    try {
      const id = await add(newPost);
      (newPost as DownloadedPost).id = id;
      setPosts([...posts, newPost as DownloadedPost]);
      //   toast.success("Post added successfully", {
      //     icon: <CircleCheckBig className="stroke-primary" />,
      //     classNames: {
      //       toast: "flex gap-4 items-center w-fit",
      //     },
      //   });
    } catch (error) {
      // remove post
      setPosts(posts.filter((p) => p._id !== newPost._id));
      toast.error("Something went wrong", {
        // icon: <CircleCheckBig className="stroke-primary" />,
        classNames: {
          toast: "flex gap-4 items-center w-fit",
        },
      });
    }
  };

  useEffect(() => {
    const getPosts = async () => {
      const posts = await getAll();
      setPosts(posts as DownloadedPost[]);
    };

    getPosts();
  }, []);

  if (posts.length === 0) {
    return (
      <main className="flex min-h-[calc(100vh-62px)] flex-col gap-7">
        <DownloadsBar />
        <div className="my-auto flex flex-col items-center justify-center gap-9 px-[100px] max-[1024px]:px-7 max-[500px]:px-2">
          <div className="flex flex-col items-center justify-center gap-3">
            <h2 className="text-foreground-alt text-center text-2xl font-bold">
              Your downloads will appear here
            </h2>
            <span className="text-muted-alt max-w-[50vw] text-center text-sm font-normal max-[500px]:max-w-full">
              Enim tempus tincidunt et facilisis amet et feugiat. Scelerisque at
              eget sed auctor non eget rhoncus. Morbi sit sumassa quis a. Velit.
            </span>
          </div>
          <Link
            className="bg-success text-special-text flex h-[35px] w-[138px] items-center justify-center rounded-[30px] px-[10px] py-[5px] text-sm font-normal shadow-basic"
            href={"/"}
          >
            Return to Feed
          </Link>
        </div>
      </main>
    );
  }

  if (post) {
    return <DownloadedPage post={post} />;
  }

  return (
    <main className="flex min-h-[calc(100vh-62px)] flex-col gap-3">
      <DownloadsBar />
      <div className="mb-3 flex h-fit flex-1 flex-col gap-3 rounded-[20px] px-[100px] py-4 shadow-sm max-[900px]:px-5">
        <Downloads articles={posts} />
      </div>
    </main>
  );
};

export default DownloadsPage;
