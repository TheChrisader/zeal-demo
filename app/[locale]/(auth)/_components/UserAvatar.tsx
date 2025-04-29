"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { StaticImageData } from "next/image";

const UserAvatar = ({
  image,
  overlap,
  index = 0,
}: {
  image: StaticImageData;
  overlap: boolean;
  index?: number;
}) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: -26,
      }}
      animate={{
        opacity: 1,
        x: 0,
        transition: {
          delay: 0.18 * index,
          duration: 0.25,
          ease: "easeIn",
          // type: "spring",
        },
      }}
      whileHover={{
        scale: 1.5,
        y: -15,
        // zIndex: 20,
        transition: { type: "spring", duration: 0.2 },
      }}
      tabIndex={-1}
      whileTap={{
        scale: 1,
        y: 3,
        transition: { type: "spring", duration: 0.2 },
      }}
      className={`bg-card-alt-bg relative flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-full shadow-basic ${overlap ? "z-10 ml-[-14px]" : ""}`}
    >
      <Image
        src={image}
        alt="Profile picture"
        className="size-[90%] rounded-full object-cover"
      />
    </motion.div>
  );
};

export default UserAvatar;
