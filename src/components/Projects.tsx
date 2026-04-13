import { motion } from 'motion/react';

const projects = [
  {
    title: "Lumina Digital",
    category: "Brand Identity",
    image: "https://picsum.photos/seed/lumina/800/600",
  },
  {
    title: "Aetheria",
    category: "3D Experience",
    image: "https://picsum.photos/seed/aether/800/600",
  },
  {
    title: "Vortex UI",
    category: "Product Design",
    image: "https://picsum.photos/seed/vortex/800/600",
  },
  {
    title: "Onyx Studio",
    category: "Web Development",
    image: "https://picsum.photos/seed/onyx/800/600",
  },
];

export default function Projects() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div>
          <h2 className="text-accent text-sm font-bold tracking-[0.3em] uppercase mb-4">
            Selected Works
          </h2>
          <h3 className="text-5xl md:text-7xl font-serif">
            Our <span className="italic">Designs</span>
          </h3>
        </div>
        <p className="max-w-md opacity-60 text-lg">
          A collection of our most challenging and rewarding projects, where 
          creativity meets technical excellence.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {projects.map((project, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="group relative overflow-hidden rounded-3xl liquid-glass aspect-[4/3]"
          >
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-10">
              <span className="text-accent font-bold text-sm tracking-widest uppercase mb-2">
                {project.category}
              </span>
              <h4 className="text-white text-3xl font-serif font-bold">
                {project.title}
              </h4>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
