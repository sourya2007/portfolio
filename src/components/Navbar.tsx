import { motion } from 'motion/react';
import type { MouseEvent } from 'react';

interface NavbarProps {
  showLinks: boolean;
}

export default function Navbar({ showLinks }: NavbarProps) {
  const handleNavClick = (event: MouseEvent<HTMLAnchorElement>, targetId: string) => {
    event.preventDefault();
    const section = document.getElementById(targetId);
    if (!section) return;

    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    const offsetVh = Number(section.getAttribute('data-scroll-offset-vh') ?? '0');
    const targetTop = sectionTop + (window.innerHeight * offsetVh) / 100;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    window.scrollTo({
      top: Math.max(0, Math.min(targetTop, maxScroll)),
      behavior: 'smooth',
    });

    if (window.location.hash !== `#${targetId}`) {
      window.history.replaceState(null, '', `#${targetId}`);
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: 'circOut' }}
      className="fixed top-0 left-0 w-full z-[90] px-8 py-8 flex justify-between items-center pointer-events-none"
    >
      <div
        className={`transform transition-all duration-500 ${
          showLinks
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        <div className="h-10 w-10 rounded-full overflow-hidden border border-white/20 bg-black/30">
          <img
            src="/The%20Monostroke%20Logo.png"
            alt="The Monostroke"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
      
      <div
        className={`hidden md:flex gap-12 glass px-8 py-3 rounded-full transform transition-all duration-500 ${
          showLinks
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        {['Home', 'About', 'Works', 'Contact'].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            onClick={(event) => handleNavClick(event, item.toLowerCase())}
            className="text-sm font-bold uppercase tracking-widest hover:text-accent transition-colors duration-300"
          >
            {item}
          </a>
        ))}
      </div>

      <div className="pointer-events-auto" />
    </motion.nav>
  );
}
