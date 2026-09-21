import { ReactNode } from "react";
import { ReactLenis } from "lenis/react";

interface SmoothScrollProps {
  children: ReactNode;
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  return (
    <ReactLenis
      root
      options={{
        duration: 0.8,
        smoothWheel: true,
        wheelMultiplier: 1.2,
      }}
    >
      {children}
    </ReactLenis>
  );
}