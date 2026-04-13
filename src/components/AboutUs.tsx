import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface AboutUsProps {
  enabled?: boolean;
}

interface AnimatedTextSegment {
  text: string;
  className?: string;
  underline?: boolean;
}

export default function AboutUs({ enabled = true }: AboutUsProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const paragraphRef = useRef<HTMLDivElement>(null);
  const underlineRef = useRef<HTMLSpanElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const renderAnimatedSegments = (segments: AnimatedTextSegment[], keyPrefix: string): ReactNode => {
    return segments.map((segment, segmentIndex) => {
      const characters = Array.from(segment.text);
      const characterNodes = characters.map((char, charIndex) => {
        if (/\s/.test(char)) {
          return (
            <span key={`${keyPrefix}-${segmentIndex}-${charIndex}`} className="whitespace-pre">
              {char}
            </span>
          );
        }

        return (
          <span
            key={`${keyPrefix}-${segmentIndex}-${charIndex}`}
            data-about-char
            className={segment.className}
          >
            {char}
          </span>
        );
      });

      if (segment.underline) {
        return (
          <span key={`${keyPrefix}-${segmentIndex}`} className="relative pb-1">
            {characterNodes}
            <span
              ref={underlineRef}
              className="absolute left-0 bottom-0 h-[2px] w-full bg-white origin-left"
            />
          </span>
        );
      }

      return <span key={`${keyPrefix}-${segmentIndex}`}>{characterNodes}</span>;
    });
  };

  const renderTypingSegments = (segments: AnimatedTextSegment[], keyPrefix: string): ReactNode => {
    return segments.map((segment, segmentIndex) => {
      const characters = Array.from(segment.text);
      return (
        <span key={`${keyPrefix}-${segmentIndex}`}>
          {characters.map((char, charIndex) => {
            if (/\s/.test(char)) {
              return (
                <span key={`${keyPrefix}-${segmentIndex}-${charIndex}`} className="whitespace-pre">
                  {char}
                </span>
              );
            }

            return (
              <span
                key={`${keyPrefix}-${segmentIndex}-${charIndex}`}
                data-about-headline-char
                className={segment.className}
              >
                {char}
              </span>
            );
          })}
        </span>
      );
    });
  };

  useEffect(() => {
    if (!enabled) return;
    if (!sectionRef.current || !paragraphRef.current) return;

    const ctx = gsap.context(() => {
      const headlineChars = gsap.utils.toArray<HTMLElement>('[data-about-headline-char]', paragraphRef.current);
      const chars = gsap.utils.toArray<HTMLElement>('[data-about-char]', paragraphRef.current);
      if (headlineChars.length === 0 || chars.length === 0) return;

      gsap.set(headlineChars, { opacity: 0 });
      gsap.set(chars, { opacity: 0.12, filter: 'brightness(0.45)' });
      gsap.set(underlineRef.current, { scaleX: 0, transformOrigin: 'left center' });
      gsap.set(headingRef.current, { opacity: 0 });
      gsap.set(cardsRef.current, { opacity: 0, y: 24 });

      const revealTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=180%',
          scrub: true,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      revealTimeline.to(headingRef.current, { opacity: 1, duration: 0.12, ease: 'none' }, 0);
      revealTimeline.to(
        headlineChars,
        {
          opacity: 1,
          duration: 0.01,
          stagger: {
            each: 0.028,
            from: 'start',
          },
          ease: 'none',
        },
        0.04
      );
      revealTimeline.to(
        chars,
        {
          opacity: 1,
          filter: 'brightness(1)',
          duration: 0.03,
          stagger: {
            each: 0.012,
            from: 'start',
          },
          ease: 'none',
        },
        '>'
      );
      revealTimeline.to(
        underlineRef.current,
        {
          scaleX: 1,
          duration: 0.16,
          ease: 'none',
        },
        '>'
      );
      revealTimeline.to(
        cardsRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.2,
          ease: 'none',
        },
        '>'
      );
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, [enabled]);

  return (
    <section
      ref={sectionRef}
      className={`min-h-screen flex items-center justify-center px-6 py-24 relative overflow-hidden transition-opacity duration-500 ${
        enabled ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      aria-hidden={!enabled}
    >
      <div className="max-w-4xl w-full z-10">
        <h2 ref={headingRef} className="text-accent text-sm font-bold tracking-[0.3em] uppercase mb-8">
          About Us
        </h2>
        <div ref={paragraphRef} className="mb-12 space-y-8">
          <p className="text-4xl md:text-6xl font-serif leading-tight">
            {renderTypingSegments(
              [
                { text: 'Digital presence, ' },
                { text: 'elevated.', className: 'text-accent' },
              ],
              'about-headline'
            )}
          </p>

          <p className="text-xl md:text-3xl font-serif leading-relaxed max-w-4xl">
            {renderAnimatedSegments(
              [
                {
                  text: "We are a boutique design agency crafting high-performance interfaces and websites. By merging intuitive UI with strategic brand positioning, we help businesses establish a digital presence that doesn't just look better - ",
                },
                { text: 'it performs better.', underline: true },
              ],
              'about-body'
            )}
          </p>
        </div>
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16">
          <div className="liquid-glass p-8 rounded-2xl">
            <h3 className="text-xl font-bold mb-4">Our Philosophy</h3>
            <p className="opacity-70 leading-relaxed">
              Every stroke matters. We believe in the power of minimalism combined with 
              dynamic motion to tell stories that resonate.
            </p>
          </div>
          <div className="liquid-glass p-8 rounded-2xl">
            <h3 className="text-xl font-bold mb-4">Our Vision</h3>
            <p className="opacity-70 leading-relaxed">
              To redefine the boundaries of digital design, blending 3D aesthetics 
              with seamless user interaction.
            </p>
          </div>
        </div>
      </div>
      
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
    </section>
  );
}
