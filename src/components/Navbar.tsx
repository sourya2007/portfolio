import { motion } from 'motion/react';

interface NavbarProps {
  showLinks: boolean;
}

export default function Navbar({ showLinks }: NavbarProps) {
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
