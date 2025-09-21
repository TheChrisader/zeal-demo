import SidebarStoreProvider from "@/context/sidebarStore/sidebarStore.provider";
import LeftSidebar from "./LeftSidebar";
import MainContentArea from "./MainContentArea";
import RightSidebar from "./RightSidebar";
import Topbar from "./Topbar";

const EditorWorkspace = () => {
  return (
    <SidebarStoreProvider>
      <div className="flex h-screen flex-col overflow-hidden bg-background">
        <Topbar />
        <div className="relative flex flex-1 overflow-hidden">
          <LeftSidebar />
          <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <MainContentArea />
          </main>
          <RightSidebar />
        </div>
      </div>
    </SidebarStoreProvider>
  );
};

export default EditorWorkspace;
