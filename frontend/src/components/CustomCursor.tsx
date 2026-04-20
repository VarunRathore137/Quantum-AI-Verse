import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const minMvmt = 0.5; // Update only if movement is greater than this
    let frameId: number;
    let lastX = 0;
    let lastY = 0;

    const mouseMove = (e: MouseEvent) => {
      if (Math.abs(e.clientX - lastX) > minMvmt || Math.abs(e.clientY - lastY) > minMvmt) {
        lastX = e.clientX;
        lastY = e.clientY;
        frameId = requestAnimationFrame(() => {
          setMousePosition({ x: e.clientX, y: e.clientY });
        });
      }
    };

    window.addEventListener('mousemove', mouseMove);
    return () => {
      window.removeEventListener('mousemove', mouseMove);
      cancelAnimationFrame(frameId);
    };
  }, []);

  // Use spring configuration for smooth trail effect
  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  const cursorX = useSpring(mousePosition.x, springConfig);
  const cursorY = useSpring(mousePosition.y, springConfig);

  return (
    <>
      {/* Primary Dot */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[99999] w-3 h-3 rounded-full bg-blue-300 shadow-[0_0_10px_2px_rgba(96,165,250,0.8)]"
        style={{
          x: mousePosition.x - 6,
          y: mousePosition.y - 6,
        }}
        transition={{ type: "tween", ease: "linear", duration: 0 }}
      />
      {/* Glowing Trail */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[99998] w-12 h-12 rounded-full mix-blend-screen"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
          background: 'radial-gradient(circle, rgba(99,102,241,0.6) 0%, rgba(99,102,241,0) 70%)',
          filter: 'blur(4px)'
        }}
      />
    </>
  );
}
