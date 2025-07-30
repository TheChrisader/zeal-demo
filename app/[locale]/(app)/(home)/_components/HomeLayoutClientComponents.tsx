"use client";
import dynamic from "next/dynamic";
import { useAuth } from "@/hooks/useAuth";

const OneTap = dynamic(() => import("../../_components/OneTap"), {
  ssr: false,
});
const PreferencesPopup = dynamic(
  () => import("../_components/PreferencesPopup"),
  { ssr: false },
);

const HomeLayoutClientComponents = () => {
  const { user } = useAuth();

  return (
    <>
      {user && <OneTap />}
      {user && <PreferencesPopup />}
    </>
  );
};

export default HomeLayoutClientComponents;
