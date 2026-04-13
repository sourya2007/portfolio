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
import CustomCursor from './components/CustomCursor';
import { motion } from 'motion/react';
import { useState } from 'react';

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

          <section id="contact" className="py-32 px-6 bg-accent text-white overflow-hidden relative">
            <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
              <motion.h2 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="text-6xl md:text-9xl font-serif font-bold mb-12 tracking-tighter"
              >
                Ready to <span className="italic">Transform?</span>
              </motion.h2>
              <p className="text-xl md:text-2xl max-w-2xl mb-16 opacity-90">
                Let's create something extraordinary together. Our team is ready to bring 
                your vision to life with precision and passion.
              </p>
              <button className="bg-white text-accent px-12 py-6 rounded-full text-lg font-bold uppercase tracking-widest hover:scale-105 transition-transform duration-300">
                Start a Project
              </button>
            </div>
            
            {/* Decorative large text in background removed */}
          </section>
        </main>

        <footer className="py-12 px-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8 text-sm opacity-50">
          <div>
            © 2026 The Monostroke. All rights reserved.
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-accent transition-colors">Instagram</a>
            <a href="#" className="hover:text-accent transition-colors">Dribbble</a>
            <a href="#" className="hover:text-accent transition-colors">Twitter</a>
          </div>
          <div>
            Crafted with passion by The Monostroke
          </div>
        </footer>
      </div>
    </SmoothScroll>
  );
}
