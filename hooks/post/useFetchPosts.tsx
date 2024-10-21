import { useSearchParams } from "next/navigation";
import useSWR from "swr";

import { fetcher } from "@/lib/fetcher";
import { IPost } from "@/types/post.type";
import { Id } from "@/lib/database";

export type PostsResponse = Omit<
  IPost,
  "created_at" | "updated_at" | "content"
> & {
  _id?: string | Id;
};

export type PostsCursor = {
  next_cursor: string | null;
  previous_cursor: string | null;
};

export type FetchPostsResponse = {
  posts: PostsResponse[];
} & PostsCursor;

const useFetchPosts = () => {
  // const searchParams = useSearchParams();
  const { data, error, isLoading, mutate } = useSWR<FetchPostsResponse>(
    `/api/v1/posts`,
    fetcher,
  );

  return {
    data,
    error,
    isLoading,
    refetch: mutate,
  };
};

export default useFetchPosts;
