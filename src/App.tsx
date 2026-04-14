/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import SmoothScroll from './components/SmoothScroll';
import Navbar from './components/Navbar';
import ThemeToggle from './components/ThemeToggle';
import IntroSequence from './components/IntroSequence';
import AboutUs from './components/AboutUs';
import Projects from './components/Projects';
import CoreTeam from './components/CoreTeam';
import CustomCursor from './components/CustomCursor';
import RotatingText from './components/RotatingText';
import { useEffect, useState } from 'react';

function ContactTypingHeading() {
  const rotatingWords = ['Transform', 'Build', 'Detail', 'Design'];
  const [wordIndex, setWordIndex] = useState(0);
  const [typedWord, setTypedWord] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [holdPhase, setHoldPhase] = useState<'typing' | 'holdFull' | 'deleting' | 'holdEmpty'>('typing');

  useEffect(() => {
    const currentWord = rotatingWords[wordIndex];
    const delay =
      holdPhase === 'holdFull' ? 1100 : holdPhase === 'holdEmpty' ? 450 : isDeleting ? 70 : 110;

    const timer = window.setTimeout(() => {
      if (holdPhase === 'holdFull') {
        setHoldPhase('deleting');
        setIsDeleting(true);
        return;
      }

      if (holdPhase === 'holdEmpty') {
        setHoldPhase('typing');
        setIsDeleting(false);
        setWordIndex((current) => (current + 1) % rotatingWords.length);
        return;
      }

      setTypedWord((currentText) => {
        if (isDeleting) {
          if (currentText.length <= 1) {
            setHoldPhase('holdEmpty');
            return '';
          }
          return currentText.slice(0, -1);
        }

        const nextText = currentWord.slice(0, currentText.length + 1);
        if (nextText === currentWord) {
          setHoldPhase('holdFull');
        }
        return nextText;
      });
    }, delay);

    return () => window.clearTimeout(timer);
  }, [typedWord, isDeleting, wordIndex, holdPhase, rotatingWords]);

  return (
    <h2 className="text-4xl sm:text-6xl md:text-9xl font-serif font-bold mb-8 md:mb-12 tracking-tighter text-center">
      <span>Ready to</span>
      <span className="inline-flex items-baseline justify-center gap-x-1.5 whitespace-nowrap pl-4">
        <span className="font-sans font-semibold not-italic whitespace-nowrap">{typedWord}</span>
        <span className="ml-1 inline-block h-[0.85em] w-[0.08em] translate-y-[0.08em] bg-white/90 animate-pulse" />
      </span>
    </h2>
  );
}

function MobilePortfolioView() {
  return (
    <div className="relative min-h-screen selection:bg-accent selection:text-white">
      <ThemeToggle showToggle={true} />
      <Navbar showLinks={true} />

      <main>
        <section id="home" className="relative min-h-screen overflow-hidden bg-black px-4 pt-28 pb-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,0,0,0.2),transparent_40%),radial-gradient(circle_at_80%_82%,rgba(255,255,255,0.12),transparent_42%)]" aria-hidden="true" />
          <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" aria-hidden="true" />
          <div className="relative z-10 mx-auto flex min-h-[72vh] w-full max-w-5xl flex-col items-center justify-center text-center">
            <img
              src="/The%20Monostroke%20Logo.png"
              alt="The Monostroke"
              className="w-44 sm:w-52 h-auto object-contain"
            />
            <div className="mt-8 flex flex-col items-center gap-4">
              <p className="text-white text-3xl sm:text-4xl font-serif tracking-tight">Design which is</p>
              <RotatingText
                texts={['Bold', 'Precise', 'Expressive', 'Timeless']}
                mainClassName="inline-flex w-fit shrink-0 px-4 sm:px-6 py-2.5 sm:py-3 bg-red-600 text-white overflow-hidden justify-center rounded-xl text-2xl sm:text-3xl"
                staggerFrom="last"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '-120%' }}
                staggerDuration={0.025}
                splitLevelClassName="overflow-hidden pb-0.5"
                transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                rotationInterval={2000}
              />
            </div>
          </div>
        </section>

          <section id="about" data-scroll-offset-vh="188">
          <AboutUs enabled={true} />
        </section>

        <section id="works">
          <Projects />
        </section>

        <section id="team">
          <CoreTeam />
        </section>

        <section id="contact" className="py-24 px-4 bg-accent text-white overflow-hidden relative">
          <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
            <ContactTypingHeading />
            <p className="text-base sm:text-lg max-w-2xl mb-10 md:mb-16 opacity-90">
              Let&apos;s create something extraordinary together. Our team is ready to bring
              your vision to life with precision and passion.
            </p>
            <div className="w-[min(92vw,28rem)] rounded-2xl border border-white/30 bg-black/55 px-4 py-4 text-left font-sans text-white shadow-[0_14px_32px_rgba(0,0,0,0.28)]">
              <p className="text-center text-sm uppercase tracking-[0.2em] text-white/70">Contact Us</p>
              <div className="mt-3 flex items-center justify-center gap-3 text-sm font-medium tracking-wide">
                <a href="mailto:themonostroke@gmail.com" className="text-white/95 hover:text-white transition-colors">
                  Email
                </a>
                <span className="text-white/45">|</span>
                <a
                  href="https://www.linkedin.com/company/themonostroke/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-white/95 hover:text-white transition-colors"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-10 px-4 border-t border-white/10 flex flex-col justify-between items-center gap-5 text-xs opacity-60">
        <div>© 2026 The Monostroke. All rights reserved.</div>
        <div className="flex gap-6">
          <a href="https://www.instagram.com/themonostroke/" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors">Instagram</a>
          <a href="https://dribbble.com/themonostroke" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors">Dribbble</a>
          <a href="https://x.com/themonostroke" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors">Twitter</a>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  const [isIntroComplete, setIsIntroComplete] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 900px), (pointer: coarse)');

    const updateMobileView = () => {
      setIsMobileView(mediaQuery.matches);
    };

    updateMobileView();

    mediaQuery.addEventListener('change', updateMobileView);
    return () => {
      mediaQuery.removeEventListener('change', updateMobileView);
    };
  }, []);

  if (isMobileView) {
    return <MobilePortfolioView />;
  }

  return (
    <SmoothScroll>
      <div className="relative min-h-screen selection:bg-accent selection:text-white">
        <CustomCursor />
        <Navbar showLinks={isIntroComplete} />
        <ThemeToggle showToggle={isIntroComplete} />
        
        <main>
          <section id="home">
            <IntroSequence onCompleteChange={setIsIntroComplete} />
          </section>

          <section id="about" data-scroll-offset-vh="188">
            <AboutUs enabled={isIntroComplete} />
          </section>

          <section id="works">
            <Projects />
          </section>

          <section id="team">
            <CoreTeam />
          </section>

          <section id="contact" className="py-32 px-6 bg-accent text-white overflow-hidden relative">
            <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
              <ContactTypingHeading />
              <p className="text-xl md:text-2xl max-w-2xl mb-16 opacity-90">
                Let's create something extraordinary together. Our team is ready to bring 
                your vision to life with precision and passion.
              </p>
              <div className="w-[min(84vw,28rem)] rounded-2xl border border-white/30 bg-black/55 px-4 py-4 md:px-5 md:py-5 text-left font-sans text-white shadow-[0_14px_32px_rgba(0,0,0,0.28)]">
                <p className="text-center text-sm uppercase tracking-[0.2em] text-white/70">Contact Us</p>
                <div className="mt-3 flex items-center justify-center gap-3 text-sm md:text-base font-medium tracking-wide">
                  <a href="mailto:themonostroke@gmail.com" className="text-white/95 hover:text-white transition-colors">
                    Email
                  </a>
                  <span className="text-white/45">|</span>
                  <a
                    href="https://www.linkedin.com/company/themonostroke/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-white/95 hover:text-white transition-colors"
                  >
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>
            
            {/* Decorative large text in background removed */}
          </section>
        </main>

        <footer className="py-12 px-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8 text-sm opacity-50">
          <div>
            © 2026 The Monostroke. All rights reserved.
          </div>
          <div className="flex gap-8">
            <a href="https://www.instagram.com/themonostroke/" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors">Instagram</a>
            <a href="https://dribbble.com/themonostroke" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors">Dribbble</a>
            <a href="https://x.com/themonostroke" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors">Twitter</a>
          </div>
          <div>
            Crafted with passion by The Monostroke
          </div>
        </footer>
      </div>
    </SmoothScroll>
  );
}
