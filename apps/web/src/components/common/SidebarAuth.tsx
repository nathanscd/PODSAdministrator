"use client";

import { motion } from "framer-motion";
import { GradientCanvas } from "@/components/ui/gradient-canvas";

interface SidebarAuthProps {
  children: React.ReactNode;
}

export default function SidebarAuth({
  children,
}: SidebarAuthProps) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">

      <motion.div
        className="w-full lg:w-[50vw] h-[45dvh] lg:h-screen flex justify-center items-center bg-[var(--bg-app)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="relative w-[90%] h-[95%] rounded-lg overflow-hidden flex items-center justify-center">
          <GradientCanvas />

          <motion.img
            src="/logo_w_o.png"
            alt="Atlas"
            className="absolute w-65 h-65 pointer-events-none"
          />
        </div>
      </motion.div>

      <main className="flex-1">
        {children}
      </main>

    </div>
  );
}