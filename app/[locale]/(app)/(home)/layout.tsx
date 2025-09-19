import dynamic from "next/dynamic";
import { ReactNode } from "react";
// import Navbar from "@/components/layout/Navbar";
// import { validateRequest } from "@/lib/auth/auth";
import { connectToDatabase } from "@/lib/database";
// import HomeLayoutClientComponents from "./_components/HomeLayoutClientComponents";
// import OneTap from "../_components/OneTap";
// import PreferencesPopup from "./_components/PreferencesPopup";

// const Navbar = dynamic(() => import("@/components/layout/Navbar"));

const HomeLayoutClientComponents = dynamic(
  () => import("./_components/HomeLayoutClientComponents"),
  { ssr: false },
);

const HomeLayout = async ({ children }: { children?: ReactNode }) => {
  await connectToDatabase();
  // const { user } = await validateRequest();

  return (
    <div className="flex flex-col gap-5 bg-background-alt">
      {/* <Navbar /> */}
      <div className="mt-5 px-[100px] max-[1024px]:px-7 max-[500px]:px-0">
        {children}
      </div>
      <HomeLayoutClientComponents />
      {/* {!user && <OneTap />} */}
      {/* {user && <PreferencesPopup />} */}
    </div>
  );
};
// onetap if no user

export default HomeLayout;
