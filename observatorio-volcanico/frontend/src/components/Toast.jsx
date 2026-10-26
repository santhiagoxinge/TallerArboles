import { AnimatePresence, motion } from "framer-motion";

export default function Toast({ toast }) {
  return (
    <AnimatePresence>
      {toast ? (
        <motion.div
          key={toast.id}
          className={`toast glass strong ${toast.error ? "error" : ""}`}
          role={toast.error ? "alert" : "status"}
          initial={{ opacity: 0, y: 24, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 12, x: "-50%" }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
        >
          {toast.message}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
