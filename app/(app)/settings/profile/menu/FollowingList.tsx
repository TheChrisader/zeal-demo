"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

function FollowingList({ children }: { children: React.ReactNode }) {
  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="mx-auto h-[80vh] max-w-sm">
        <div className="mx-auto size-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Following</DrawerTitle>
            <DrawerDescription>Accounts you follow.</DrawerDescription>
          </DrawerHeader>

          <div className="flex items-center justify-center">
            <span className="text-sm text-[#959595]">
              You currently do not follow anyone.
            </span>
          </div>

          <DrawerFooter>
            {/* <Button>Submit</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose> */}
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export default FollowingList;
