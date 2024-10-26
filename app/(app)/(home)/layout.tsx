import { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import { validateRequest } from "@/lib/auth/auth";
import { connectToDatabase } from "@/lib/database";
import OneTap from "../_components/OneTap";

const HomeLayout = async ({ children }: { children?: ReactNode }) => {
  await connectToDatabase();
  const { user } = await validateRequest();

  return (
    <div className="flex flex-col gap-5 bg-blue-50/60">
      <Navbar />
      <div className="px-[100px] max-[1024px]:px-7 max-[500px]:px-0">
        {children}
      </div>
      {!user && <OneTap />}
    </div>
  );
};

export default HomeLayout;
