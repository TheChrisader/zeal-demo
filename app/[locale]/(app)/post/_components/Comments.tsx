import React from "react";
import CommentInput from "@/components/forms/Input/CommentInput";
import { Separator } from "@/components/ui/separator";
import { getCommentsByArticleId } from "@/database/comment/comment.repository";
import Comment from "./Comment";
import CommentSection from "./CommentSection";
import { cleanObject } from "@/utils/cleanObject.utils";

const Comments = async ({ postID }: { postID: string }) => {
  const { comments, pagination } = await getCommentsByArticleId(postID, {});

  return (
    <section className="flex w-full flex-col gap-5">
      {/* <h3 className="text-2xl font-extrabold text-[#2F2D32]">
        {comments.length} Comments
      </h3>
      <div>
        <CommentInput articleId={postID} />
      </div> */}
      <div className="flex flex-col gap-3">
        <CommentSection
          comments={comments.map((comment) => cleanObject(comment))}
          article_id={postID}
          pagination={pagination}
        />
        {/* {comments?.map((comment) => {
          return (
            <React.Fragment key={comment._id.toString() as string}>
              <Comment
                name={comment.user_id.display_name as string}
                avatar={comment.user_id?.avatar as string}
                date={comment.created_at.toString()}
                content={comment.content}
              />
              <Separator />
            </React.Fragment>
          );
        })} */}
      </div>
    </section>
  );
};

export default Comments;
