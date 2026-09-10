"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SizeGuideContent } from "./SizeGuideContent";
import type { GuideCategory } from "@/lib/sizeguide";

export function SizeGuideModal({ open, category, onClose }: { open: boolean; category: GuideCategory; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open ]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center sm:p-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
          role="dialog" aria-modal="true" aria-label="Size guide">
          <motion.div onClick={(e) => e.stopPropagation()}
            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="max-h-[92vh] w-full max-w-2xl overflow-auto rounded-t-2xl bg-[#141210] p-5 sm:rounded-2xl sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl tracking-wide">SIZE GUIDE</h2>
              <button onClick={onClose} aria-label="Close size guide" className="cursor-pointer rounded-full border border-white/20 px-3 py-1 hover:bg-white/10">✕</button>
            </div>
            <SizeGuideContent initial={category} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
