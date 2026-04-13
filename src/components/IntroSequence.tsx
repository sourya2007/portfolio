import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import RotatingText from './RotatingText';

gsap.registerPlugin(ScrollTrigger);

interface IntroSequenceProps {
  onCompleteChange?: (complete: boolean) => void;
}

export default function IntroSequence({ onCompleteChange }: IntroSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const introTriggerRef = useRef<ScrollTrigger | null>(null);
  const canvasLayerRef = useRef<HTMLDivElement>(null);
  const welcomeOverlayRef = useRef<HTMLDivElement>(null);
  const welcomeBackdropRef = useRef<HTMLDivElement>(null);
  const welcomeTextRef = useRef<HTMLParagraphElement>(null);
  const welcomeScrollHintRef = useRef<HTMLButtonElement>(null);
  const welcomeScrollArrowRef = useRef<HTMLSpanElement>(null);
  const outroBackdropRef = useRef<HTMLDivElement>(null);
  const outroRef = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const frameCount = 192;
  const currentFrame = (index: number) =>
    `/intro/${(index + 1).toString().padStart(5, '0')}.jpg`;

  const WELCOME_SCROLL_TARGET_PROGRESS = 0.995;

  const handleWelcomeScroll = () => {
    if (welcomeScrollArrowRef.current) {
      gsap.fromTo(
        welcomeScrollArrowRef.current,
        { y: 0, scale: 1, opacity: 1 },
        {
          y: 10,
          scale: 0.92,
          opacity: 0.8,
          duration: 0.18,
          ease: 'power2.out',
          yoyo: true,
          repeat: 1,
        }
      );
    }

    window.setTimeout(() => {
      startWelcomeScrollAnimation();
    }, 140);
  };

  const startWelcomeScrollAnimation = () => {
    const trigger = introTriggerRef.current;

    let targetTop = window.scrollY;
    if (trigger && Number.isFinite(trigger.start) && Number.isFinite(trigger.end)) {
      targetTop = trigger.start + (trigger.end - trigger.start) * WELCOME_SCROLL_TARGET_PROGRESS;
    } else if (containerRef.current) {
      const sectionTop = containerRef.current.getBoundingClientRect().top + window.scrollY;
      targetTop = sectionTop + window.innerHeight * 3 * WELCOME_SCROLL_TARGET_PROGRESS;
    }

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const clampedTargetTop = Math.max(window.scrollY, Math.min(targetTop, maxScroll));

    const startTop = window.scrollY;
    const distance = clampedTargetTop - startTop;
    if (distance <= 1) return;

    const duration = 5500;
    const startTime = performance.now();

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = easeInOutCubic(progress);
      window.scrollTo({ top: startTop + distance * eased, behavior: 'auto' });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  useEffect(() => {
    const preloadImages = async () => {
      const loadedImages: HTMLImageElement[] = [];
      const promises = [];

      for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.src = currentFrame(i);
        const promise = new Promise((resolve) => {
          img.onload = resolve;
          // Resolve on error too so one bad frame does not stall the full sequence.
          img.onerror = resolve;
        });
        promises.push(promise);
        loadedImages.push(img);
      }

      await Promise.all(promises);
      setImages(loadedImages);
      setIsLoaded(true);
    };

    preloadImages();
  }, []);

  useEffect(() => {
    if (!isLoaded || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const render = (index: number) => {
      if (images[index]) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw image with cover aspect ratio
        const img = images[index];
        const canvasRatio = canvas.width / canvas.height;
        const imgRatio = img.width / img.height;
        let drawWidth, drawHeight, offsetX, offsetY;

        if (canvasRatio > imgRatio) {
          drawWidth = canvas.width;
          drawHeight = canvas.width / imgRatio;
          offsetX = 0;
          offsetY = (canvas.height - drawHeight) / 2;
        } else {
          drawWidth = canvas.height * imgRatio;
          drawHeight = canvas.height;
          offsetX = (canvas.width - drawWidth) / 2;
          offsetY = 0;
        }

        context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      }
    };

    render(0);

    const sequence = { frame: 0 };

    const tween = gsap.to(sequence, {
      frame: frameCount - 1,
      snap: 'frame',
      ease: 'none',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: '+=300%',
        scrub: 0.5,
        pin: true,
        onRefresh: (self) => {
          introTriggerRef.current = self;
        },
        onUpdate: (self) => {
          introTriggerRef.current = self;
          onCompleteChange?.(self.progress >= 0.999);

          const welcomeFadeStart = 0;
          const welcomeTextFadeEnd = 0.2;
          // This is the canonical "timestamp" where text is fully gone.
          const textFadeProgress = gsap.utils.clamp(
            0,
            1,
            (self.progress - welcomeFadeStart) / (welcomeTextFadeEnd - welcomeFadeStart)
          );
          const easedTextProgress = gsap.parseEase('power2.out')(textFadeProgress);
          const textOpacity = 1 - easedTextProgress;

          // Blur end timestamp is locked to text end timestamp.
          const blurFadeEnd = welcomeTextFadeEnd;
          const blurFadeProgress = gsap.utils.clamp(
            0,
            1,
            (self.progress - welcomeFadeStart) / (blurFadeEnd - welcomeFadeStart)
          );
          const easedBlurProgress = gsap.parseEase('power2.inOut')(blurFadeProgress);
          const blurAlpha = 1 - easedBlurProgress;

          if (welcomeOverlayRef.current) {
            gsap.set(welcomeOverlayRef.current, {
              opacity: 1,
              visibility: self.progress >= blurFadeEnd ? 'hidden' : 'visible',
            });
          }

          if (welcomeBackdropRef.current) {
            const darkness = 0.5 * blurAlpha;
            const blur = 24 * blurAlpha;

            gsap.set(welcomeBackdropRef.current, {
              backgroundColor: `rgba(0, 0, 0, ${darkness})`,
              backdropFilter: `blur(${blur}px)`,
              WebkitBackdropFilter: `blur(${blur}px)`,
            });
          }

          if (welcomeTextRef.current) {
            gsap.set(welcomeTextRef.current, {
              opacity: textOpacity,
              y: easedTextProgress * -8,
            });
          }

          if (welcomeScrollHintRef.current) {
            gsap.set(welcomeScrollHintRef.current, {
              opacity: textOpacity,
              y: easedTextProgress * -6,
            });
          }

          const fadeStart = 0.88;
          const fadeProgress = Math.min(
            1,
            Math.max(0, (self.progress - fadeStart) / (1 - fadeStart))
          );

          if (canvasLayerRef.current) {
            gsap.set(canvasLayerRef.current, {
              opacity: 1 - fadeProgress,
            });
          }

          if (outroBackdropRef.current) {
            const blur = 24 * fadeProgress;
            const darkness = 0.55 * fadeProgress;

            gsap.set(outroBackdropRef.current, {
              opacity: fadeProgress,
              visibility: fadeProgress <= 0.001 ? 'hidden' : 'visible',
              backgroundColor: `rgba(0, 0, 0, ${darkness})`,
              backdropFilter: `blur(${blur}px)`,
              WebkitBackdropFilter: `blur(${blur}px)`,
            });
          }

          if (outroRef.current) {
            gsap.set(outroRef.current, {
              opacity: fadeProgress,
              y: (1 - fadeProgress) * 20,
            });
          }
        },
      },
      onUpdate: () => render(Math.round(sequence.frame)),
    });

    // Fade out logo text as we scroll
    // Animation removed as title is removed

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      render(Math.round(sequence.frame));
    };

    window.addEventListener('resize', handleResize);
    return () => {
      introTriggerRef.current = null;
      window.removeEventListener('resize', handleResize);
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [isLoaded, images, onCompleteChange]);

  return (
    <div ref={containerRef} className="relative w-full h-screen overflow-hidden bg-black">
      <div ref={canvasLayerRef} className="absolute inset-0 z-0">
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
      </div>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-50">
          <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}
      <div
        ref={welcomeOverlayRef}
        className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
      >
        <div ref={welcomeBackdropRef} className="absolute inset-0 bg-black/50 backdrop-blur-xl" />
        <div className="relative flex flex-col items-center gap-6">
          <p ref={welcomeTextRef} className="text-white text-4xl md:text-6xl font-serif tracking-tight">
            Welcome to
          </p>
          <button
            ref={welcomeScrollHintRef}
            type="button"
            onClick={handleWelcomeScroll}
            className="pointer-events-auto mt-8 md:mt-12 flex flex-col items-center text-white/90 hover:text-white transition-colors duration-300"
            aria-label="Scroll down"
          >
            <span className="text-xs uppercase tracking-[0.2em]">Scroll</span>
            <span ref={welcomeScrollArrowRef} className="text-xl leading-none mt-1 inline-block">
              ↓
            </span>
          </button>
        </div>
      </div>
      <div
        ref={outroBackdropRef}
        className="absolute inset-0 z-[15] opacity-0 pointer-events-none"
      />
      <div
        ref={outroRef}
        className="absolute inset-0 z-20 opacity-0 pointer-events-none flex items-center justify-center px-6 md:px-16"
      >
        <div className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16">
          <img
            src="/The%20Monostroke%20Logo.png"
            alt="The Monostroke"
            className="w-52 md:w-72 lg:w-[20rem] h-auto object-contain shrink-0"
          />
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-5 md:gap-6">
            <p className="text-white text-3xl md:text-5xl lg:text-6xl font-serif tracking-tight">
              Design which is
            </p>
            <RotatingText
              texts={['Bold', 'Precise', 'Expressive', 'Timeless']}
              mainClassName="inline-flex w-fit shrink-0 px-5 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 bg-red-600 text-white overflow-hidden justify-center rounded-xl text-2xl md:text-3xl lg:text-4xl"
              staggerFrom="last"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-120%' }}
              staggerDuration={0.025}
              splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              rotationInterval={2000}
            />
          </div>
        </div>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
      </div>
    </div>
  );
}
