import { Separator } from "@/components/ui/separator";
// import { getPreferencesByUserId } from "@/database/preferences/preferences.repository";
import { serverAuthGuard } from "@/lib/auth/serverAuthGuard";
import SettingsBar from "./_components/SettingsBar";
import SettingSidebar from "./_components/SettingsSidebar";
import { connectToDatabase } from "@/lib/database";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connectToDatabase();
  await serverAuthGuard({
    rolesWhiteList: ["user"],
    redirect: true,
  });

  // const preferences = await getPreferencesByUserId(user.id);

  return (
    <div
      className="flex min-h-[calc(100vh-62px)] flex-col gap-7 max-[800px]:gap-3"
      suppressHydrationWarning
    >
      <SettingsBar />
      <div className="flex gap-9 px-[100px] max-[1024px]:px-7 max-[800px]:flex-col max-[800px]:gap-0 max-[500px]:px-2">
        <SettingSidebar />
        <Separator orientation="vertical" className="h-96 max-[800px]:hidden" />

        {children}
      </div>
    </div>
  );
}
