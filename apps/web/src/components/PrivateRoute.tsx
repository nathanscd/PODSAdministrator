
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion, useReducedMotion } from "framer-motion";

export default function PrivateRoute() {
  const { user, loading } = useAuth();
  const reduceMotion = useReducedMotion();

  if (loading) {
    return (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: "#030316" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex flex-col items-center"
        >
          {/* SVG Loading Symbol */}
          <motion.svg
            width="76"
            height="76"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            animate={
              reduceMotion
                ? { rotate: 0 }
                : { rotate: 360 }
            }
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{ transformOrigin: "center" }}
          >
            <path
              d="M60 5H100L94 45H54L60 5Z"
              fill="#F5F5F5"
            />

            <path
              d="M6 55H46L40 95H0L6 55Z"
              fill="#F5F5F5"
            />
          </motion.svg>

          {/* Loading Text */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-12 flex flex-col items-center gap-5"
          >
            <span
              className="text-[10px] font-medium uppercase tracking-[0.35em]"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              Carregando ambiente
            </span>

            {/* Progress Indicator */}
            <div
              className="relative h-[2px] w-24 overflow-hidden"
              style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
            >
              {!reduceMotion && (
                <motion.div
                  className="absolute inset-y-0 left-0 w-1/2"
                  style={{ backgroundColor: "#F5F5F5" }}
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Subtle Footer */}
        <div
          className="absolute bottom-8 text-[9px] font-medium tracking-[0.3em] uppercase"
          style={{ color: "rgba(255,255,255,0.2)" }}
        >
          PODSAdministrator
        </div>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
