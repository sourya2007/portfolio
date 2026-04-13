import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ThemeToggleProps {
  showToggle: boolean;
}

export default function ThemeToggle({ showToggle }: ThemeToggleProps) {
  const [isDark, setIsDark] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.remove('light');
    } else {
      root.classList.add('light');
    }
  }, [isDark]);

  const toggleTheme = (e: React.MouseEvent) => {
    if (isAnimating) return;

    setIsAnimating(true);

    const x = e.clientX;
    const y = e.clientY;

    const root = document.documentElement;
    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    root.style.setProperty('--theme-x', `${x}px`);
    root.style.setProperty('--theme-y', `${y}px`);
    root.style.setProperty('--theme-radius', `${maxRadius}px`);

    const hasViewTransition = typeof (document as Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } }).startViewTransition === 'function';

    if (hasViewTransition) {
      root.classList.add('theme-transitioning');

      const transition = (document as Document & { startViewTransition: (cb: () => void) => { finished: Promise<void> } }).startViewTransition(() => {
        const nextIsDark = !isDark;
        root.classList.toggle('light', !nextIsDark);
        setIsDark(nextIsDark);
      });

      transition.finished.finally(() => {
        root.classList.remove('theme-transitioning');
        setIsAnimating(false);
      });

      return;
    }

    setIsDark((prev) => !prev);
    setTimeout(() => {
      setIsAnimating(false);
    }, 250);
  };

  return (
    <button
      onClick={toggleTheme}
      className={`fixed top-8 right-8 z-[100] p-3 rounded-full glass transition-all duration-500 ${
        showToggle
          ? 'opacity-100 translate-y-0 pointer-events-auto hover:scale-110'
          : 'opacity-0 -translate-y-2 pointer-events-none'
      }`}
      aria-label="Toggle Theme"
    >
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.div
            key="sun"
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.3 }}
          >
            <Sun className="w-6 h-6 text-yellow-400" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.3 }}
          >
            <Moon className="w-6 h-6 text-blue-600" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
