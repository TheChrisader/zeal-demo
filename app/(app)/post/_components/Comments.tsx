import CommentInput from "@/components/forms/Input/CommentInput";
import { getCommentsByArticleId } from "@/database/comment/comment.repository";
import { findUsersByIds } from "@/database/user/user.repository";
import Comment from "./Comment";
import { Separator } from "@/components/ui/separator";
import React from "react";

const Comments = async ({ postID }: { postID: string }) => {
  const comments = await getCommentsByArticleId(postID);
  //   get users from user ids
  const userIds = comments.map((comment) => comment.user_id);

  const users = await findUsersByIds(userIds);

  //   const users = await Promise.all(
  //     comments.map(async (comment) => {
  //       const user = await findUsersById(comment.user_id);
  //       return user;
  //     }),
  //   );

  return (
    <section className="flex w-full flex-col gap-5">
      <h3 className="text-2xl font-extrabold text-[#2F2D32]">
        {comments.length} Comments
      </h3>
      <div>
        <CommentInput articleId={postID} />
      </div>
      <div className="flex flex-col gap-3">
        {comments?.map((comment) => {
          const user = users.find(
            (user) => user.id === comment.user_id.toString(),
          );
          return (
            <React.Fragment key={comment.id as string}>
              <Comment
                name={user?.display_name as string}
                avatar={user?.avatar as string}
                date={comment.created_at.toString()}
                content={comment.content}
              />
              <Separator />
            </React.Fragment>
            // <div key={comment.id as string}>
            //   <h4>{user?.display_name}</h4>
            //   <p>{comment.content}</p>
            // </div>
          );
        })}
      </div>
    </section>
  );
};

export default Comments;
