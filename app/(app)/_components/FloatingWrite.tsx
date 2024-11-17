"use client";

import { PenIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import WriterForm from "@/components/layout/Topbar/popup/WriterForm";
import { Button } from "@/components/ui/button";
import useAuth from "@/context/auth/useAuth";

const FloatingWrite = () => {
  const { canWrite } = useAuth();
  const pathname = usePathname();

  if (pathname.includes("/write")) {
    return null;
  }

  if (canWrite) {
    return (
      <Link
        href="/write"
        className="fixed bottom-20 right-6 z-50 flex items-center justify-center rounded-full bg-white p-6 text-sm font-medium shadow-2xl"
      >
        <PenIcon className="text-[#696969]" />
      </Link>
    );
  }

  return (
    <WriterForm>
      <Button
        variant="outline"
        className="fixed bottom-20 right-6 z-50 hidden items-center justify-center rounded-full px-6 py-9 text-sm font-medium shadow-2xl max-[400px]:flex"
      >
        <PenIcon className="text-[#696969]" />
      </Button>
    </WriterForm>
  );
};

export default FloatingWrite;
