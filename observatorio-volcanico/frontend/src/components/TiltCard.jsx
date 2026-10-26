import { useRef } from "react";

const MAX_TILT = 5;

/** Subtle pointer-driven tilt; disabled for touch and reduced motion (via CSS). */
export default function TiltCard({ children, className = "", ...rest }) {
  const ref = useRef(null);

  const onMove = (event) => {
    if (event.pointerType !== "mouse") return;
    const box = ref.current.getBoundingClientRect();
    const px = (event.clientX - box.left) / box.width - 0.5;
    const py = (event.clientY - box.top) / box.height - 0.5;
    ref.current.style.setProperty("--ry", `${px * MAX_TILT * 2}deg`);
    ref.current.style.setProperty("--rx", `${-py * MAX_TILT * 2}deg`);
  };

  const onLeave = () => {
    ref.current.style.setProperty("--rx", "0deg");
    ref.current.style.setProperty("--ry", "0deg");
  };

  return (
    <div ref={ref} className={`tilt ${className}`} onPointerMove={onMove} onPointerLeave={onLeave} {...rest}>
      {children}
    </div>
  );
}
