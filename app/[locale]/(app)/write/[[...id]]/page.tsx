"use client";

import { CircleX } from "lucide-react";
import { ChangeEventHandler, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePathname } from "@/i18n/routing";
import Editor from "@/lexical/Editor";
import { getDraftData } from "@/services/draft.services";
import { IDraft } from "@/types/draft.type";
import PublishButton from "../_components/PublishButton";
import SelectCategory from "../_components/SelectCategory";
import WriteBar from "../_components/WriteBar";
import useActionHandler from "../_context/action-handler/useActionHandler";

import { Textarea } from "@/components/ui/textarea";

const WritePage = () => {
  const { setTitle, file, setFile, setDescription } = useActionHandler();
  const [existingState, setExistingState] = useState<Partial<IDraft>>({
    title: "",
    category: [],
    image_url: "",
    description: "",
  });
  const id = usePathname().split("/").pop();

  useEffect(() => {
    if (!id || id === "write") return;
    const getDraft = async () => {
      const doc = await getDraftData(id);
      setExistingState(doc);
      setTitle(doc.title);
      setDescription(doc.description);
      setFile(doc.image_url);
    };
    getDraft();
  }, [id, setTitle]);

  const handleUpdateFile: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { files } = event.target;
    if (files) {
      const file = files.item(0);
      setFile(file);
    }
  };

  return (
    <main className="bg-subtle-bg-alt flex min-h-[calc(100vh-62px)] flex-col gap-3 pb-20">
      <WriteBar />
      <div className="flex flex-col gap-9 px-[100px] py-4 max-[1024px]:px-7 max-[500px]:px-3">
        {/* TOP */}
        <div className="flex gap-7 max-[600px]:flex-col">
          <div className="flex flex-1 flex-col gap-2">
            <span>Title</span>
            <Input
              defaultValue={existingState?.title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="flex flex-1 flex-col items-end gap-2 max-[600px]:items-start">
            <span>Tags</span>
            <SelectCategory draftCategory={existingState?.category?.[0]} />
          </div>
        </div>
        {/* DESCRIPTION */}
        <div className="flex flex-col gap-2">
          <span>Description</span>
          <Textarea
            defaultValue={existingState?.description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter a short description for your post..."
          />
        </div>
        {/* MIDDLE */}
        <div className="flex flex-col gap-4">
          <span>Post Thumbnail</span>
          {file || existingState?.image_url ? (
            <div className="relative h-[200px] w-full rounded-[5px] outline outline-slate-300">
              <Button
                onClick={() => setFile(null)}
                className="absolute right-[-12px] top-[-12px] size-fit cursor-pointer rounded-full p-1"
              >
                <CircleX />
              </Button>
              <img
                className="size-full object-cover"
                src={
                  (file &&
                    typeof file !== "string" &&
                    URL.createObjectURL(file)) ||
                  existingState?.image_url
                }
                alt="user avatar"
              />
            </div>
          ) : (
            <Input
              accept="image/png, image/gif, image/jpeg"
              onChange={handleUpdateFile}
              type="file"
            />
          )}
        </div>
        {/* BOTTOM */}
        <div className="flex flex-col">
          {/* <span>Content</span> */}
          <div>
            <Editor />
          </div>
          <div className="flex w-full justify-end">
            <PublishButton />
          </div>
        </div>
      </div>
    </main>
  );
};

export default WritePage;
