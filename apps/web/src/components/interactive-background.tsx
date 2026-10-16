import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

const DOT_SPACING = 28;
const DOT_RADIUS = 1.1;
const REACH = 220;
const MAX_PUSH = 6;
const EASING = 0.12;

type Point = { x: number; y: number };

/** Dot grid like a floor plan; dots near the pointer lift in the accent color. */
export function InteractiveBackground({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const styles = getComputedStyle(canvas);
    const dotColor = styles.getPropertyValue('--grid').trim();
    const accentColor = styles.getPropertyValue('--primary').trim();

    let width = 0;
    let height = 0;
    let rest: Point = { x: 0, y: 0 };
    let focus: Point = rest;
    let target: Point = rest;
    let pointerInside = false;
    let frame = 0;

    const draw = () => {
      context.clearRect(0, 0, width, height);
      const lifted: { x: number; y: number; lift: number }[] = [];

      context.globalAlpha = 1;
      context.fillStyle = dotColor;
      context.beginPath();
      for (let x = DOT_SPACING / 2; x < width; x += DOT_SPACING) {
        for (let y = DOT_SPACING / 2; y < height; y += DOT_SPACING) {
          const distance = Math.hypot(x - focus.x, y - focus.y);
          const t = Math.max(0, 1 - distance / REACH);
          const lift = t * t * (3 - 2 * t);
          const push = distance > 0 ? (lift * MAX_PUSH) / distance : 0;
          const dotX = x + (x - focus.x) * push;
          const dotY = y + (y - focus.y) * push;
          context.moveTo(dotX + DOT_RADIUS, dotY);
          context.arc(dotX, dotY, DOT_RADIUS, 0, Math.PI * 2);
          if (lift > 0.02) lifted.push({ x: dotX, y: dotY, lift });
        }
      }
      context.fill();

      context.fillStyle = accentColor;
      for (const dot of lifted) {
        context.globalAlpha = dot.lift;
        context.beginPath();
        context.arc(dot.x, dot.y, DOT_RADIUS + dot.lift * 1.6, 0, Math.PI * 2);
        context.fill();
      }
    };

    const step = () => {
      focus = {
        x: focus.x + (target.x - focus.x) * EASING,
        y: focus.y + (target.y - focus.y) * EASING,
      };
      draw();
      const settled = Math.abs(target.x - focus.x) + Math.abs(target.y - focus.y) < 0.5;
      frame = settled ? 0 : requestAnimationFrame(step);
    };

    const moveFocusTo = (point: Point) => {
      target = point;
      if (!frame) frame = requestAnimationFrame(step);
    };

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      // Upper right: clear of the hero copy at every width.
      rest = { x: width * 0.78, y: height * 0.2 };
      if (!pointerInside) {
        focus = rest;
        target = rest;
      }
      draw();
    };

    const onPointerMove = (event: PointerEvent) => {
      pointerInside = true;
      const bounds = canvas.getBoundingClientRect();
      moveFocusTo({ x: event.clientX - bounds.left, y: event.clientY - bounds.top });
    };

    const onPointerLeave = () => {
      pointerInside = false;
      moveFocusTo(rest);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    // Reduced motion: the grid is drawn once (on resize) and never follows the pointer.
    if (!reduceMotion) {
      window.addEventListener('pointermove', onPointerMove);
      document.documentElement.addEventListener('pointerleave', onPointerLeave);
    }

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onPointerMove);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 size-full', className)}
    />
  );
}
