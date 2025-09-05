import LeftSidebar from "./LeftSidebar";
import MainContentArea from "./MainContentArea";
import RightSidebar from "./RightSidebar";
import Topbar from "./Topbar";
import SidebarStoreProvider from "@/context/sidebarStore/sidebarStore.provider";

interface EditorWorkspaceProps {
  activeDocumentId?: string;
}

const EditorWorkspace = ({ activeDocumentId }: EditorWorkspaceProps) => {
  return (
    <SidebarStoreProvider>
      <div className="flex h-screen flex-col overflow-hidden bg-background">
        <Topbar />
        <div className="relative flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <LeftSidebar />
          {/* Main Content Area */}
          <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <MainContentArea />
          </main>
          {/* Right Sidebar */}
          <RightSidebar />
        </div>
      </div>
    </SidebarStoreProvider>
  );
};

export default EditorWorkspace;
