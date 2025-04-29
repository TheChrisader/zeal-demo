import { getPublishTimeStamp } from "@/utils/time.utils";

const Comment = ({
  name,
  avatar,
  date,
  content,
}: {
  name: string;
  avatar: string;
  date: string;
  content: string;
}) => {
  return (
    <div className="flex w-fit items-center rounded-md px-6 py-2">
      <div className="min-w-fit self-start">
        {avatar && (
          <img
            className="mr-4 size-10 rounded-full"
            src={avatar}
            alt="user avatar"
          />
        )}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-muted-alt text-lg font-semibold">{name}</span>
          <span className="text-muted-alt text-sm font-normal">
            {getPublishTimeStamp(date)}
          </span>
        </div>
        <div>
          <span className="text-muted-alt text-sm font-normal">{content}</span>
        </div>
      </div>
    </div>
  );
};

export default Comment;
