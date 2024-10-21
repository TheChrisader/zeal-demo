"use client";
import { useEffect, useState } from "react";
import DownloadsBar from "./_components/DownloadsBar";
import setupIndexedDB, { useIndexedDBStore } from "@/hooks/useIndexedDB";
import Link from "next/link";
import Downloads from "./_components/Downloads";
import { toast } from "sonner";
import { CircleCheckBig } from "lucide-react";
import useAuth from "@/context/auth/useAuth";

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

// Database Configuration
export const getIDBConfig = (userID: string) => ({
  databaseName: `zeal-articles-db-${userID}`,
  version: 1,
  stores: [
    {
      name: "posts",
      id: { keyPath: "id", autoIncrement: true },
      //    indexes: ["title", "author_id", "category", "description", "image", "published_at", "ttr", "content", "source"],
      indices: [
        { name: "_id", keyPath: "_id", options: { unique: true } },
        { name: "title", keyPath: "title", options: { unique: false } },
        { name: "author_id", keyPath: "author_id" },
        { name: "category", keyPath: "category", options: { unique: false } },
        {
          name: "description",
          keyPath: "description",
          options: { unique: false },
        },
        { name: "image", keyPath: "image", options: { unique: false } },
        {
          name: "published_at",
          keyPath: "published_at",
          options: { unique: false },
        },
        { name: "ttr", keyPath: "ttr" },
        { name: "content", keyPath: "content", options: { unique: false } },
        { name: "source", keyPath: "source", options: { unique: false } },
      ],
    },
  ],
});

const DownloadsPage = () => {
  const [posts, setPosts] = useState<DownloadedPost[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    setupIndexedDB(getIDBConfig(user?.id.toString()!))
      .then(() => console.log("success"))
      .catch((e) => console.error("error / unsupported", e));
  }, []);

  const { add, getByID, getAll } = useIndexedDBStore("posts");

  const post = {
    _id: "1",
    title: "Mango 🥭",
    author_id: "Hi",
    category: [],
    description: "Hi",
    image: "Yo",
    published_at: "Heheh",
    ttr: 5,
    content: "HHHHHHH",
    source: {
      name: "i",
      icon: "y",
    },
  };

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

  const getPost = () => {
    getByID(1).then(console.log).catch(console.error);
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
            <h2 className="text-center text-2xl font-bold text-[#2F2D32]">
              Your downloads will appear here
            </h2>
            {/* <button
              onClick={async () => {
                await insertPost(post);
              }}
            >
              Qdd post
            </button> */}
            <span className="max-w-[50vw] text-center text-sm font-normal text-[#696969] max-[500px]:max-w-full">
              Enim tempus tincidunt et facilisis amet et feugiat. Scelerisque at
              eget sed auctor non eget rhoncus. Morbi sit sumassa quis a. Velit.
            </span>
          </div>
          <Link
            className="flex h-[35px] w-[138px] items-center justify-center rounded-[30px] bg-[#2F7830] px-[10px] py-[5px] text-sm font-normal text-white shadow-basic"
            href={"/"}
          >
            Return to Feed
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh-62px)] flex-col gap-3">
      <DownloadsBar />
      <div className="mb-3 flex h-fit flex-1 flex-col gap-3 rounded-[20px] px-[100px] py-4 shadow-sm max-[900px]:px-5">
        {/* <button onClick={getPost}>Qdd post</button> */}
        <Downloads articles={posts} />
        {/* <div className="flex flex-col gap-4"></div> */}
      </div>
    </main>
    // <p>
    //   <p>Downloads</p>
    //   <button onClick={insertPost}>Qdd post</button>
    // </>
  );
};

export default DownloadsPage;
