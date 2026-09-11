"use client";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const upd = () => setCoarse(mq.matches);
    upd();
    mq.addEventListener("change", upd);
    return () => mq.removeEventListener("change", upd);
  }, []);
  // HP: opacity saja (tanpa blur/geser) — hemat GPU, animasi tetap terasa.
  if (reduce || coarse) {
    if (reduce) return <div className={className}>{children}</div>;
    return (
      <motion.div
        className={className}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.4, delay: Math.min(delay, 0.15) }}
      >
        {children}
      </motion.div>
    );
  }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
