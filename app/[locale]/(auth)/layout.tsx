import Image from "next/image";
import { redirect } from "@/i18n/routing";
import { ReactNode } from "react";
import ZealLogo from "@/assets/images/zeal_news_logo.png";
// import ZealLogoDark from "@/assets/images/zeal_news_logo_dark.png";
import { validateRequest } from "@/lib/auth/auth";
import { connectToDatabase } from "@/lib/database";
import AuthLayoutUserAvatar from "./_components/UserAvatar";
import { AVATAR_LIST } from "./_utils/images";
import PageTransition from "../../_components/PageTransition";
import Logo from "./_components/Logo";

type AuthLayoutProps = {
  children: ReactNode;
};

const authVariants = {
  initial: { opacity: 0, x: 170 },
  animate: { opacity: 1, x: 0, transition: { type: "spring" } },
  exit: { opacity: 0, x: -500 },
};

// section - pt-[calc(0.098*100vh)]
const AuthLayout = async ({ children }: AuthLayoutProps) => {
  // await connectToDatabase();
  // const { session } = await validateRequest();
  // if (session) {
  //   redirect("/");
  // }

  return (
    <main className="flex min-h-screen max-[1200px]:flex-col">
      <section className="z-10 flex min-w-[40%] max-w-[40%] justify-center bg-[#e1ffe8] px-[80px] max-[1200px]:max-w-full max-[1200px]:p-[20px]">
        <div className="my-auto flex w-full flex-col max-[500px]:justify-between">
          <div className="flex items-center justify-between max-[1200px]:items-center">
            {/* <Image
              src={ZealLogo}
              alt="logo"
              height={34}
              className="mb-[34px] max-[1200px]:mb-0"
            /> */}
            {/* <img
              alt="zeal_news_logo"
              src="/zeal_news_logo.png"
              className="mb-[34px] w-[150px] object-cover max-[1200px]:mb-0"
              height={34}
            /> */}
            <Logo />
            <div className="hidden items-center max-[1200px]:flex">
              <div className="mr-[13px] flex">
                {AVATAR_LIST.map((image, index) => (
                  <AuthLayoutUserAvatar
                    image={image}
                    key={image.src}
                    overlap={index !== 0}
                    index={index}
                  />
                ))}
              </div>
              <span className="text-base font-normal text-[#2F2D32] max-[500px]:hidden">
                Join 200+ Users
              </span>
            </div>
          </div>
          <h1 className="mb-[75px] text-[34px] font-extrabold text-[#2F2D32] max-[1200px]:mb-3 max-[500px]:hidden">
            Bringing the Positives of Africa to your News Timeline!
          </h1>
          <div className="flex items-center max-[1200px]:hidden">
            <div className="mr-[13px] flex">
              {AVATAR_LIST.map((image, index) => (
                <AuthLayoutUserAvatar
                  image={image}
                  key={image.src}
                  overlap={index !== 0}
                  index={index}
                />
              ))}
            </div>
            <span className="text-base font-normal text-[#2F2D32]">
              Join 200+ Users
            </span>
          </div>
        </div>
      </section>
      <section className="my-auto flex w-full justify-center py-5 max-[690px]:my-0">
        {/* <div className="flex h-fit w-3/5 flex-col rounded-[10px] px-[35px] py-[20px] shadow-authCard"> */}
        <PageTransition
          variants={authVariants}
          mode="wait"
          depth={1}
          transition={{ ease: "easeInOut", duration: 0.25 }}
          className="flex h-fit w-3/5 flex-col overflow-hidden rounded-[10px] bg-white px-[35px] py-[20px] shadow-authCard max-[690px]:mx-3 max-[690px]:w-screen"
        >
          {children}
        </PageTransition>
        {/* </div> */}
      </section>
    </main>
  );
};

export default AuthLayout;
