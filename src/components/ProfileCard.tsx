import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

const DEFAULT_INNER_GRADIENT = 'linear-gradient(145deg,#60496e8c 0%,#71C4FF44 100%)';

const ANIMATION_CONFIG = {
  INITIAL_DURATION: 1200,
  INITIAL_X_OFFSET: 70,
  INITIAL_Y_OFFSET: 60,
  DEVICE_BETA_OFFSET: 20,
  ENTER_TRANSITION_MS: 180,
} as const;

const clamp = (v: number, min = 0, max = 100): number => Math.min(Math.max(v, min), max);
const round = (v: number, precision = 3): number => parseFloat(v.toFixed(precision));
const adjust = (v: number, fMin: number, fMax: number, tMin: number, tMax: number): number =>
  round(tMin + ((tMax - tMin) * (v - fMin)) / (fMax - fMin));

const KEYFRAMES_ID = 'pc-keyframes';
if (typeof document !== 'undefined' && !document.getElementById(KEYFRAMES_ID)) {
  const style = document.createElement('style');
  style.id = KEYFRAMES_ID;
  style.textContent = `
    @keyframes pc-holo-bg {
      0% { background-position: 0 var(--background-y), 0 0, center; }
      100% { background-position: 0 var(--background-y), 90% 90%, center; }
    }
  `;
  document.head.appendChild(style);
}

interface ProfileCardProps {
  avatarUrl?: string;
  iconUrl?: string;
  grainUrl?: string;
  grainTintColor?: string;
  innerGradient?: string;
  behindGlowEnabled?: boolean;
  behindGlowColor?: string;
  behindGlowSize?: string;
  className?: string;
  enableTilt?: boolean;
  enableMobileTilt?: boolean;
  mobileTiltSensitivity?: number;
  nameClassName?: string;
  miniAvatarUrl?: string;
  name?: string;
  title?: string;
  handle?: string;
  status?: string;
  contactText?: string;
  showUserInfo?: boolean;
  showTitle?: boolean;
  onContactClick?: () => void;
  cardHeight?: string;
  cardMaxHeight?: string;
  mobileCardHeight?: string;
  mobileCardMaxHeight?: string;
}

interface TiltEngine {
  setImmediate: (x: number, y: number) => void;
  setTarget: (x: number, y: number) => void;
  toCenter: () => void;
  beginInitial: (durationMs: number) => void;
  getCurrent: () => { x: number; y: number; tx: number; ty: number };
  cancel: () => void;
}

function ProfileCardComponent({
  avatarUrl = 'https://picsum.photos/seed/portrait-default/800/1200',
  iconUrl = '',
  grainUrl = '',
  grainTintColor = 'rgba(255,255,255,0.18)',
  innerGradient,
  behindGlowEnabled = true,
  behindGlowColor,
  behindGlowSize,
  className = '',
  enableTilt = true,
  enableMobileTilt = false,
  mobileTiltSensitivity = 5,
  nameClassName = '',
  miniAvatarUrl,
  name = 'Javi A. Torres',
  title = 'Software Engineer',
  handle = 'javicodes',
  status = 'Online',
  contactText = 'Contact',
  showUserInfo = true,
  showTitle = true,
  onContactClick,
  cardHeight = '80svh',
  cardMaxHeight = '520px',
  mobileCardHeight = '80svh',
  mobileCardMaxHeight = '520px',
}: ProfileCardProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLImageElement>(null);
  const sampleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sampleCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const glowColorRef = useRef({ r: 255, g: 255, b: 255, a: 0.72 });

  const enterTimerRef = useRef<number | null>(null);
  const leaveRafRef = useRef<number | null>(null);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');

    const updateViewport = () => {
      setIsMobileViewport(mediaQuery.matches);
    };

    updateViewport();

    mediaQuery.addEventListener('change', updateViewport);
    return () => {
      mediaQuery.removeEventListener('change', updateViewport);
    };
  }, []);

  const tiltEngine = useMemo<TiltEngine | null>(() => {
    if (!enableTilt) return null;

    let rafId: number | null = null;
    let running = false;
    let lastTs = 0;

    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;

    const DEFAULT_TAU = 0.14;
    const INITIAL_TAU = 0.6;
    let initialUntil = 0;

    const setVarsFromXY = (x: number, y: number): void => {
      const shell = shellRef.current;
      const wrap = wrapRef.current;
      const avatar = avatarRef.current;
      if (!shell || !wrap) return;

      const width = shell.clientWidth || 1;
      const height = shell.clientHeight || 1;

      const percentX = clamp((100 / width) * x);
      const percentY = clamp((100 / height) * y);

      const centerX = percentX - 50;
      const centerY = percentY - 50;
      const activeOpacity = shell.classList.contains('active') ? 1 : 0;
      const sampledGlowColor = sampleImageColor(avatar, x, y) ?? behindGlowColor ?? 'rgba(255, 92, 92, 0.72)';
      const smoothedGlowColor = smoothGlowColor(sampledGlowColor);

      const properties: Record<string, string> = {
        '--pointer-x': `${percentX}%`,
        '--pointer-y': `${percentY}%`,
        '--background-x': `${adjust(percentX, 0, 100, 35, 65)}%`,
        '--background-y': `${adjust(percentY, 0, 100, 35, 65)}%`,
        '--pointer-from-center': `${clamp(Math.hypot(percentY - 50, percentX - 50) / 50, 0, 1)}`,
        '--pointer-from-top': `${percentY / 100}`,
        '--pointer-from-left': `${percentX / 100}`,
        '--card-opacity': `${activeOpacity}`,
        '--sampled-glow-color': smoothedGlowColor,
        '--edge-glow-color': smoothedGlowColor,
        '--rotate-x': `${round(-(centerX / 3.6))}deg`,
        '--rotate-y': `${round(centerY / 2.7)}deg`,
      };

      for (const [k, v] of Object.entries(properties)) {
        wrap.style.setProperty(k, v);
      }
    };

    const parseColor = (input: string): { r: number; g: number; b: number; a: number } | null => {
      const rgbaMatch = input.match(/rgba?\(([^)]+)\)/i);
      if (rgbaMatch) {
        const parts = rgbaMatch[1].split(',').map((part) => part.trim());
        const r = Number(parts[0]);
        const g = Number(parts[1]);
        const b = Number(parts[2]);
        const a = parts[3] != null ? Number(parts[3]) : 1;
        if ([r, g, b, a].some((value) => Number.isNaN(value))) return null;
        return { r, g, b, a };
      }

      const hslaMatch = input.match(/hsla?\(([^)]+)\)/i);
      if (hslaMatch) {
        const parts = hslaMatch[1].split(',').map((part) => part.trim().replace('%', ''));
        const h = Number(parts[0]);
        const s = Number(parts[1]) / 100;
        const l = Number(parts[2]) / 100;
        const a = parts[3] != null ? Number(parts[3]) : 1;
        if ([h, s, l, a].some((value) => Number.isNaN(value))) return null;

        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        const m = l - c / 2;
        let r1 = 0;
        let g1 = 0;
        let b1 = 0;
        if (h < 60) {
          r1 = c; g1 = x;
        } else if (h < 120) {
          r1 = x; g1 = c;
        } else if (h < 180) {
          g1 = c; b1 = x;
        } else if (h < 240) {
          g1 = x; b1 = c;
        } else if (h < 300) {
          r1 = x; b1 = c;
        } else {
          r1 = c; b1 = x;
        }
        return {
          r: Math.round((r1 + m) * 255),
          g: Math.round((g1 + m) * 255),
          b: Math.round((b1 + m) * 255),
          a,
        };
      }

      return null;
    };

    const toRgba = (color: { r: number; g: number; b: number; a: number }): string =>
      `rgba(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}, ${Math.min(Math.max(color.a, 0), 1)})`;

    const smoothGlowColor = (nextColor: string): string => {
      const next = parseColor(nextColor);
      if (!next) return nextColor;

      const current = glowColorRef.current;
      const mix = 0.18;
      const blended = {
        r: current.r + (next.r - current.r) * mix,
        g: current.g + (next.g - current.g) * mix,
        b: current.b + (next.b - current.b) * mix,
        a: current.a + (next.a - current.a) * mix,
      };

      glowColorRef.current = blended;
      return toRgba(blended);
    };

    const sampleImageColor = (
      avatar: HTMLImageElement | null,
      pointerX: number,
      pointerY: number
    ): string | null => {
      if (!avatar || !avatar.complete || avatar.naturalWidth === 0 || avatar.naturalHeight === 0) return null;

      const shell = shellRef.current;
      if (!shell) return null;

      const rect = shell.getBoundingClientRect();
      const displayedWidth = rect.width;
      const displayedHeight = rect.height;
      const naturalWidth = avatar.naturalWidth;
      const naturalHeight = avatar.naturalHeight;

      const coverScale = Math.max(displayedWidth / naturalWidth, displayedHeight / naturalHeight);
      const drawnWidth = naturalWidth * coverScale;
      const drawnHeight = naturalHeight * coverScale;
      const offsetX = (displayedWidth - drawnWidth) / 2;
      const offsetY = (displayedHeight - drawnHeight) / 2;

      const canvas = sampleCanvasRef.current || document.createElement('canvas');
      sampleCanvasRef.current = canvas;
      const ctx = sampleCtxRef.current || canvas.getContext('2d', { willReadFrequently: true });
      sampleCtxRef.current = ctx;
      if (!ctx) return null;

      canvas.width = naturalWidth;
      canvas.height = naturalHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(avatar, 0, 0, naturalWidth, naturalHeight);

      const sampleX = clamp((pointerX - offsetX) / coverScale, 0, naturalWidth - 1);
      const sampleY = clamp((pointerY - offsetY) / coverScale, 0, naturalHeight - 1);

      try {
        const pixel = ctx.getImageData(Math.round(sampleX), Math.round(sampleY), 1, 1).data;
        return `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, 0.72)`;
      } catch {
        return null;
      }
    };

    const step = (ts: number): void => {
      if (!running) return;
      if (lastTs === 0) lastTs = ts;
      const dt = (ts - lastTs) / 1000;
      lastTs = ts;

      const tau = ts < initialUntil ? INITIAL_TAU : DEFAULT_TAU;
      const k = 1 - Math.exp(-dt / tau);

      currentX += (targetX - currentX) * k;
      currentY += (targetY - currentY) * k;

      setVarsFromXY(currentX, currentY);

      const stillFar = Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05;

      if (stillFar || document.hasFocus()) {
        rafId = requestAnimationFrame(step);
      } else {
        running = false;
        lastTs = 0;
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      }
    };

    const start = (): void => {
      if (running) return;
      running = true;
      lastTs = 0;
      rafId = requestAnimationFrame(step);
    };

    return {
      setImmediate(x: number, y: number): void {
        currentX = x;
        currentY = y;
        setVarsFromXY(currentX, currentY);
      },
      setTarget(x: number, y: number): void {
        targetX = x;
        targetY = y;
        start();
      },
      toCenter(): void {
        const shell = shellRef.current;
        if (!shell) return;
        this.setTarget(shell.clientWidth / 2, shell.clientHeight / 2);
      },
      beginInitial(durationMs: number): void {
        initialUntil = performance.now() + durationMs;
        start();
      },
      getCurrent(): { x: number; y: number; tx: number; ty: number } {
        return { x: currentX, y: currentY, tx: targetX, ty: targetY };
      },
      cancel(): void {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
        running = false;
        lastTs = 0;
      },
    };
  }, [enableTilt]);

  const getOffsets = (evt: PointerEvent, el: HTMLElement): { x: number; y: number } => {
    const rect = el.getBoundingClientRect();
    return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
  };

  const handlePointerMove = useCallback(
    (event: PointerEvent): void => {
      const shell = shellRef.current;
      if (!shell || !tiltEngine) return;
      const { x, y } = getOffsets(event, shell);
      tiltEngine.setTarget(x, y);
    },
    [tiltEngine]
  );

  const handlePointerEnter = useCallback(
    (event: PointerEvent): void => {
      const shell = shellRef.current;
      if (!shell || !tiltEngine) return;

      shell.classList.add('active');
      shell.classList.add('entering');
      if (enterTimerRef.current) window.clearTimeout(enterTimerRef.current);
      enterTimerRef.current = window.setTimeout(() => {
        shell.classList.remove('entering');
      }, ANIMATION_CONFIG.ENTER_TRANSITION_MS);

      const { x, y } = getOffsets(event, shell);
      tiltEngine.setTarget(x, y);
    },
    [tiltEngine]
  );

  const handlePointerLeave = useCallback((): void => {
    const shell = shellRef.current;
    const wrap = wrapRef.current;
    if (!shell || !tiltEngine) return;

    tiltEngine.toCenter();

    const checkSettle = (): void => {
      const { x, y, tx, ty } = tiltEngine.getCurrent();
      const settled = Math.hypot(tx - x, ty - y) < 0.6;
      if (settled) {
        shell.classList.remove('active');
        wrap?.style.setProperty('--card-opacity', '0');
        leaveRafRef.current = null;
      } else {
        leaveRafRef.current = requestAnimationFrame(checkSettle);
      }
    };

    if (leaveRafRef.current) cancelAnimationFrame(leaveRafRef.current);
    leaveRafRef.current = requestAnimationFrame(checkSettle);
  }, [tiltEngine]);

  const handleDeviceOrientation = useCallback(
    (event: DeviceOrientationEvent): void => {
      const shell = shellRef.current;
      if (!shell || !tiltEngine) return;

      const { beta, gamma } = event;
      if (beta == null || gamma == null) return;

      const centerX = shell.clientWidth / 2;
      const centerY = shell.clientHeight / 2;
      const x = clamp(centerX + gamma * mobileTiltSensitivity, 0, shell.clientWidth);
      const y = clamp(
        centerY + (beta - ANIMATION_CONFIG.DEVICE_BETA_OFFSET) * mobileTiltSensitivity,
        0,
        shell.clientHeight
      );

      tiltEngine.setTarget(x, y);
    },
    [tiltEngine, mobileTiltSensitivity]
  );

  useEffect(() => {
    if (!enableTilt || !tiltEngine) return;

    const shell = shellRef.current;
    if (!shell) return;

    const pointerMoveHandler = handlePointerMove as EventListener;
    const pointerEnterHandler = handlePointerEnter as EventListener;
    const pointerLeaveHandler = handlePointerLeave as EventListener;
    const deviceOrientationHandler = handleDeviceOrientation as EventListener;

    shell.addEventListener('pointerenter', pointerEnterHandler);
    shell.addEventListener('pointermove', pointerMoveHandler);
    shell.addEventListener('pointerleave', pointerLeaveHandler);

    const handleClick = (): void => {
      if (!enableMobileTilt) return;
      const anyMotion = window.DeviceMotionEvent as typeof DeviceMotionEvent & {
        requestPermission?: () => Promise<string>;
      };
      if (anyMotion && typeof anyMotion.requestPermission === 'function') {
        anyMotion
          .requestPermission()
          .then((state: string) => {
            if (state === 'granted') {
              window.addEventListener('deviceorientation', deviceOrientationHandler);
            }
          })
          .catch(() => {
            // Ignore permission errors on unsupported browsers.
          });
      } else {
        window.addEventListener('deviceorientation', deviceOrientationHandler);
      }
    };

    shell.addEventListener('click', handleClick);

    const initialX = (shell.clientWidth || 0) - ANIMATION_CONFIG.INITIAL_X_OFFSET;
    const initialY = ANIMATION_CONFIG.INITIAL_Y_OFFSET;
    tiltEngine.setImmediate(initialX, initialY);
    tiltEngine.toCenter();
    tiltEngine.beginInitial(ANIMATION_CONFIG.INITIAL_DURATION);

    return () => {
      shell.removeEventListener('pointerenter', pointerEnterHandler);
      shell.removeEventListener('pointermove', pointerMoveHandler);
      shell.removeEventListener('pointerleave', pointerLeaveHandler);
      shell.removeEventListener('click', handleClick);
      window.removeEventListener('deviceorientation', deviceOrientationHandler);
      if (enterTimerRef.current) window.clearTimeout(enterTimerRef.current);
      if (leaveRafRef.current) cancelAnimationFrame(leaveRafRef.current);
      tiltEngine.cancel();
      shell.classList.remove('entering');
    };
  }, [
    enableTilt,
    enableMobileTilt,
    tiltEngine,
    handlePointerMove,
    handlePointerEnter,
    handlePointerLeave,
    handleDeviceOrientation,
  ]);

  const cardRadius = '30px';

  const cardStyle = useMemo(
    () =>
      ({
        '--icon': iconUrl ? `url(${iconUrl})` : 'none',
        '--grain': grainUrl ? `url(${grainUrl})` : 'none',
        '--inner-gradient': innerGradient ?? DEFAULT_INNER_GRADIENT,
        '--behind-glow-color': behindGlowColor ?? 'hsla(355, 100%, 70%, 0.6)',
        '--behind-glow-size': behindGlowSize ?? '50%',
        '--grain-tint': grainTintColor,
        '--pointer-x': '50%',
        '--pointer-y': '50%',
        '--pointer-from-center': '0',
        '--pointer-from-top': '0.5',
        '--pointer-from-left': '0.5',
        '--card-opacity': '0',
        '--rotate-x': '0deg',
        '--rotate-y': '0deg',
        '--background-x': '50%',
        '--background-y': '50%',
        '--card-radius': cardRadius,
      }) as CSSProperties,
    [iconUrl, grainUrl, innerGradient, behindGlowColor, behindGlowSize]
  );

  const handleContactClick = useCallback((): void => {
    onContactClick?.();
  }, [onContactClick]);

  return (
    <div
      ref={wrapRef}
      className={`relative touch-none ${className}`.trim()}
      style={{ perspective: '500px', transform: 'translate3d(0,0,0.1px)', ...cardStyle }}
    >
      {behindGlowEnabled && (
        <div
          className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-200 ease-out"
          style={{
            background:
              'radial-gradient(circle at var(--pointer-x) var(--pointer-y), var(--behind-glow-color) 0%, transparent var(--behind-glow-size))',
            filter: 'blur(50px) saturate(1.1)',
            opacity: 'calc(0.75 * var(--card-opacity))',
          }}
        />
      )}

      <div ref={shellRef} className="relative z-[1] group">
        <section
          className="grid relative overflow-hidden"
          style={{
            height: isMobileViewport ? mobileCardHeight : cardHeight,
            maxHeight: isMobileViewport ? mobileCardMaxHeight : cardMaxHeight,
            aspectRatio: '0.718',
            borderRadius: cardRadius,
            boxShadow:
              'rgba(0,0,0,0.8) calc((var(--pointer-from-left) * 10px) - 3px) calc((var(--pointer-from-top) * 20px) - 6px) 20px -5px',
            transition: 'transform 1s ease',
            transform: 'translateZ(0) rotateX(0deg) rotateY(0deg)',
            background: 'rgba(0,0,0,0.9)',
            backfaceVisibility: 'hidden',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transition = 'none';
            e.currentTarget.style.transform = 'translateZ(0) rotateX(var(--rotate-y)) rotateY(var(--rotate-x))';
          }}
          onMouseLeave={(e) => {
            const shell = shellRef.current;
            e.currentTarget.style.transition = shell?.classList.contains('entering')
              ? 'transform 180ms ease-out'
              : 'transform 1s ease';
            e.currentTarget.style.transform = 'translateZ(0) rotateX(0deg) rotateY(0deg)';
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'var(--inner-gradient)',
              backgroundColor: 'rgba(0,0,0,0.9)',
              borderRadius: cardRadius,
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: 'var(--grain)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                mixBlendMode: 'soft-light',
                opacity: 'calc(0.26 * var(--card-opacity))',
              }}
            />

            <div className="absolute inset-0 rounded-[30px] overflow-hidden">
              <img
                ref={avatarRef}
                className="w-full h-full object-cover"
                src={avatarUrl}
                alt={`${name} avatar`}
                loading="lazy"
                onError={(e) => {
                  const t = e.target as HTMLImageElement;
                  t.style.display = 'none';
                }}
              />
            </div>

            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 14% 18%, color-mix(in srgb, var(--grain-tint) 70%, transparent) 0 2px, transparent 2.2px), radial-gradient(circle at 72% 30%, color-mix(in srgb, var(--grain-tint) 50%, transparent) 0 1.5px, transparent 1.7px), radial-gradient(circle at 28% 76%, color-mix(in srgb, var(--grain-tint) 62%, transparent) 0 1.8px, transparent 2px), radial-gradient(circle at 84% 68%, color-mix(in srgb, var(--grain-tint) 44%, transparent) 0 1.2px, transparent 1.4px)',
                backgroundSize: '180px 160px, 220px 200px, 200px 180px, 240px 210px',
                mixBlendMode: 'screen',
                opacity: 'calc(0.28 * var(--card-opacity))',
                filter: 'blur(0.3px)',
              }}
            />

            <div
              className="absolute inset-[-1px] rounded-[31px] pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at var(--pointer-x) var(--pointer-y), color-mix(in srgb, var(--edge-glow-color, var(--behind-glow-color)) 88%, transparent) 0%, color-mix(in srgb, var(--edge-glow-color, var(--behind-glow-color)) 48%, transparent) 26%, rgba(0,0,0,0) 70%)',
                padding: '1px',
                opacity: 'calc(0.86 * var(--card-opacity))',
                zIndex: 2,
                WebkitMask:
                  'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
              }}
            />

            {showUserInfo && (
              <div
                className="absolute z-[3] flex items-center justify-between backdrop-blur-[30px] border border-white/10"
                style={{
                  bottom: '20px',
                  left: '20px',
                  right: '20px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full overflow-hidden border border-white/10 w-12 h-12">
                    <img
                      className="w-full h-full object-cover"
                      src={miniAvatarUrl || avatarUrl}
                      alt={`${name} mini avatar`}
                      loading="lazy"
                    />
                  </div>
                  <div className="flex flex-col items-start gap-1.5">
                    <div className="text-sm font-medium text-white/90 leading-none">@{handle}</div>
                    <div className="text-sm text-white/70 leading-none">{status}</div>
                  </div>
                </div>
                <button
                  className="border border-white/10 rounded-lg px-4 py-3 text-xs font-semibold text-white/90 backdrop-blur-[10px] hover:border-white/40 hover:-translate-y-px transition-all duration-200"
                  onClick={handleContactClick}
                  type="button"
                >
                  {contactText}
                </button>
              </div>
            )}

            <div
              className="absolute top-10 left-0 right-0 z-[4] text-center"
              style={{
                transform:
                  'translate3d(calc(var(--pointer-from-left) * -6px + 3px), calc(var(--pointer-from-top) * -6px + 3px), 0.1px)',
                mixBlendMode: 'luminosity',
                pointerEvents: 'none',
              }}
            >
              <div className="mx-auto inline-flex max-w-[92%] items-center justify-center rounded-full border border-white/16 bg-[rgba(255,24,24,0.88)] px-5 py-2.5 backdrop-blur-2xl shadow-[0_12px_30px_rgba(0,0,0,0.28)]">
                <h3
                  className={`font-semibold leading-none ${nameClassName}`.trim()}
                  style={{
                    fontSize: 'min(4.2svh, 2.1em)',
                    color: '#fff',
                  }}
                >
                  {name.split(' ').map((part, index, parts) => {
                    const isSurname = index === parts.length - 1 && parts.length > 1;
                    const isFirst = index === 0;
                    return (
                      <span
                        key={`${part}-${index}`}
                        className={`${isSurname ? 'font-serif italic' : 'font-sans'} ${isFirst ? 'mr-2' : ''}`.trim()}
                      >
                        {part}
                        {index < parts.length - 1 ? ' ' : ''}
                      </span>
                    );
                  })}
                </h3>
              </div>
              {showTitle && (
                <p
                  className="font-semibold whitespace-nowrap mx-auto w-min mt-3"
                  style={{
                    fontSize: '15px',
                    backgroundImage: 'linear-gradient(to bottom, #fff, #4a4ac0)',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                  }}
                >
                  {title}
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

const ProfileCard = memo(ProfileCardComponent);
export default ProfileCard;
