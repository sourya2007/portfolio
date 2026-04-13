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
    <h2 className="text-6xl md:text-9xl font-serif font-bold mb-12 tracking-tighter text-center">
      <span>Ready to</span>
      <span className="inline-flex items-baseline justify-center gap-x-1.5 whitespace-nowrap pl-4">
        <span className="font-sans font-semibold not-italic whitespace-nowrap">{typedWord}</span>
        <span className="ml-1 inline-block h-[0.85em] w-[0.08em] translate-y-[0.08em] bg-white/90 animate-pulse" />
      </span>
    </h2>
  );
}

export default function App() {
  const [isIntroComplete, setIsIntroComplete] = useState(false);

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

          <section id="about">
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
