import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const posRef = useRef({ x: 0, y: 0 });
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(pointer: fine)');
    const update = () => setEnabled(media.matches);
    update();

    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const dot = dotRef.current;
    if (!dot) {
      return;
    }

    const startX = window.innerWidth / 2;
    const startY = window.innerHeight / 2;
    targetRef.current = { x: startX, y: startY };
    posRef.current = { x: startX, y: startY };

    const onMouseMove = (event: MouseEvent) => {
      targetRef.current.x = event.clientX;
      targetRef.current.y = event.clientY;
      dot.style.opacity = '1';
    };

    const animate = () => {
      const pos = posRef.current;
      const target = targetRef.current;

      pos.x += (target.x - pos.x) * 0.09;
      pos.y += (target.y - pos.y) * 0.09;

      dot.style.transform = `translate3d(${pos.x - 6}px, ${pos.y - 6}px, 0)`;
      rafRef.current = window.requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMouseMove);
    rafRef.current = window.requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [enabled]);

  if (!enabled) {
    return null;
  }

  return <div ref={dotRef} className="custom-invert-cursor" aria-hidden="true" />;
}
