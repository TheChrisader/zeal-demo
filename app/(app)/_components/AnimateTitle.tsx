"use client";
import { motion } from "framer-motion";

const AnimateTitle = ({
  children,
  _key,
}: {
  children: React.ReactNode;
  _key: string;
}) => {
  return <motion.div layoutId={_key}>{children}</motion.div>;
};

export default AnimateTitle;
