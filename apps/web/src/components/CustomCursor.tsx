import { useEffect, useState, useCallback, useRef } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";

type Mode =
  | "default"
  | "pointer"
  | "text"
  | "drag"
  | "resize-h"
  | "resize-v"
  | "not-allowed";

const CURSORS: Record<
  Mode,
  {
    viewBox: string;
    size: [number, number];
    hotspot: [number, number];
    layers: {
      d: string;
      fill: string;
      stroke?: string;
      strokeWidth?: number;
      opacity?: number;
    }[];
  }
> = {
  default: {
    viewBox: "0 0 22 28",
    size: [22, 28],
    hotspot: [2, 2],
    layers: [
      {
        d: "M4 4 L4 24.5 L9 19 L13.5 29 L17 27.5 L12.5 17 L21.5 17 Z",
        fill: "var(--shadow-color)",
        opacity: 0.4,
      },
      {
        d: "M2 2 L2 23 L7 17.5 L11.5 27.5 L15 26 L10.5 15.5 L19.5 15.5 Z",
        fill: "var(--bg-app)",
        stroke: "var(--text-primary)",
        strokeWidth: 1.2,
      },
    ],
  },

  pointer: {
    viewBox: "0 0 22 28",
    size: [22, 28],
    hotspot: [8, 2],
    layers: [
      {
        d: "M8 3 C8 1.9 8.9 1 10 1 C11.1 1 12 1.9 12 3 L12 12 C12.6 11.4 13.5 11 14.5 11 C15.9 11 17 12.1 17 13.5 L17 13.5 C17.6 12.9 18.4 12.5 19 12.5 C19 12.5 19.5 12.5 19.5 14 L19.5 19 C19.5 23.1 16.1 26.5 12 26.5 L10 26.5 C6.9 26.5 4 23.6 4 19.5 L4 7 C4 5.9 4.9 5 6 5 C7.1 5 8 5.9 8 7 Z",
        fill: "var(--bg-app)",
        stroke: "var(--text-primary)",
        strokeWidth: 1.1,
      },
    ],
  },

  text: {
    viewBox: "0 0 16 26",
    size: [16, 26],
    hotspot: [8, 13],
    layers: [
      {
        d: "M7 2 L9 2 L9 24 L7 24 Z",
        fill: "var(--text-primary)",
      },
    ],
  },

  drag: {
    viewBox: "0 0 24 24",
    size: [24, 24],
    hotspot: [12, 12],
    layers: [
      {
        d: "M12 1 L9 5 L11 5 L11 11 L5 11 L5 9 L1 12 L5 15 L5 13 L11 13 L11 19 L9 19 L12 23 L15 19 L13 19 L13 13 L19 13 L19 15 L23 12 L19 9 L19 11 L13 11 L13 5 L15 5 Z",
        fill: "var(--accent-color)",
      },
    ],
  },

  "resize-h": {
    viewBox: "0 0 26 16",
    size: [26, 16],
    hotspot: [13, 8],
    layers: [
      {
        d: "M1 8 L6 3 L6 6 L20 6 L20 3 L25 8 L20 13 L20 10 L6 10 L6 13 Z",
        fill: "var(--accent-color)",
      },
    ],
  },

  "resize-v": {
    viewBox: "0 0 16 26",
    size: [16, 26],
    hotspot: [8, 13],
    layers: [
      {
        d: "M8 1 L3 6 L6 6 L6 20 L3 20 L8 25 L13 20 L10 20 L10 6 L13 6 Z",
        fill: "var(--accent-color)",
      },
    ],
  },

  "not-allowed": {
    viewBox: "0 0 24 24",
    size: [24, 24],
    hotspot: [12, 12],
    layers: [
      {
        d: "M12 2 C6.5 2 2 6.5 2 12 C2 17.5 6.5 22 12 22 C17.5 22 22 17.5 22 12 C22 6.5 17.5 2 12 2 Z",
        fill: "var(--accent-hover)",
      },
    ],
  },
};

const SPRING = { stiffness: 600, damping: 40 };

export default function SmartCursor() {
  const [mode, setMode] = useState<Mode>("default");
  const [pressing, setPressing] = useState(false);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const x = useSpring(mouseX, SPRING);
  const y = useSpring(mouseY, SPRING);

  const detect = (el: HTMLElement): Mode => {
    const css = getComputedStyle(el).cursor;

    if (el.isContentEditable || el.tagName === "INPUT") return "text";
    if (css.includes("resize")) return css.includes("col") ? "resize-h" : "resize-v";
    if (css === "move") return "drag";
    if (css === "not-allowed") return "not-allowed";
    if (el.closest("button,a") || css === "pointer") return "pointer";

    return "default";
  };

  const move = useCallback((e: MouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);

    const el = e.target as HTMLElement;
    if (!el) return;

    setMode(detect(el));
  }, []);

  useEffect(() => {
    const down = () => setPressing(true);
    const up = () => setPressing(false);

    const context = (e: MouseEvent) => {
      e.preventDefault();
      setMenu({ x: e.clientX, y: e.clientY });
    };

    const close = () => setMenu(null);

    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    window.addEventListener("contextmenu", context);
    window.addEventListener("click", close);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("contextmenu", context);
      window.removeEventListener("click", close);
    };
  }, [move]);

  const cursor = CURSORS[mode];

  return (
    <>
      <style>{`
        * { cursor: none !important; }
      `}</style>

      {/* CURSOR */}
      <motion.div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          pointerEvents: "none",
          zIndex: 999999,
          x,
          y,
          translateX: `-${cursor.hotspot[0]}px`,
          translateY: `-${cursor.hotspot[1]}px`,
        }}
        animate={{ scale: pressing ? 0.9 : 1 }}
      >
        <svg width={cursor.size[0]} height={cursor.size[1]} viewBox={cursor.viewBox}>
          {cursor.layers.map((l, i) => (
            <path key={i} {...l} />
          ))}
        </svg>
      </motion.div>

      {/* MENU */}
      <AnimatePresence>
        {menu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              position: "fixed",
              top: menu.y,
              left: menu.x,
              zIndex: 999999,
            }}
          >
            <div
              style={{
                background: "var(--card-bg)",
                backdropFilter: "blur(12px)",
                border: "1px solid var(--border-color)",
                boxShadow: "0 10px 30px var(--shadow-color)",
                borderRadius: 12,
                padding: 8,
                minWidth: 180,
              }}
            >
              {["Editar", "Duplicar", "Excluir"].map((item) => (
                <div
                  key={item}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    cursor: "pointer",
                    color: "var(--text-primary)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--bg-sidebar)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}