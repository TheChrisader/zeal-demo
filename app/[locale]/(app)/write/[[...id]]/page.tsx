"use client";

import Editor from "@/lexical/Editor";
import WriteBar from "../_components/WriteBar";
import { Input } from "@/components/ui/input";
import PublishButton from "../_components/PublishButton";
import SelectCategory from "../_components/SelectCategory";
import useActionHandler from "../_context/action-handler/useActionHandler";
import { ChangeEventHandler, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CircleX } from "lucide-react";
import { usePathname } from "@/i18n/routing";
import { getDraftData } from "@/services/draft.services";
import { IDraft } from "@/types/draft.type";

const WritePage = () => {
  const { setTitle, file, setFile } = useActionHandler();
  const [existingState, setExistingState] = useState<Partial<IDraft>>({
    title: "",
    category: [],
    image_url: "",
  });
  const id = usePathname().split("/").pop();

  useEffect(() => {
    if (!id || id === "write") return;
    const getDraft = async () => {
      const doc = await getDraftData(id);
      setExistingState(doc);
      setTitle(doc.title);
    };
    getDraft();
  }, [id]);

  const handleUpdateFile: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { files } = event.target;
    if (files) {
      const file = files.item(0);
      setFile(file);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-62px)] flex-col gap-3 bg-slate-100 pb-20">
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
                  (file && URL.createObjectURL(file)) ||
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