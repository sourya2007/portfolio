import { useEffect, useState } from 'react';

const projects = [
  {
    name: "Gym",
    images: [
      "/work-showcase/Gym1.jpeg",
      "/work-showcase/Gym2.jpeg",
      "/work-showcase/Gym3.jpeg",
      "/work-showcase/Gym4.jpeg",
    ],
  },
  {
    name: "Restaurant",
    images: [
      "/work-showcase/Restaurant1.jpeg",
      "/work-showcase/Restaurant2.jpeg",
      "/work-showcase/Restaurant3.jpeg",
    ],
  },
  {
    name: "Veritas",
    images: [
      "/work-showcase/Veritas1.jpg",
      "/work-showcase/Veritas2.jpg",
    ],
  },
  {
    name: "Biochain",
    images: [
      "/work-showcase/Biochain1.jpg",
      "/work-showcase/Biochain2.jpg",
      "/work-showcase/Biochain3.jpg",
      "/work-showcase/Biochain4.jpg",
    ],
  },
];

const MAX_VISIBLE_STACK_CARDS = 3;

export default function Projects() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [stackCycle, setStackCycle] = useState(0);
  const isPrevDisabled = activeIndex === 0;
  const isNextDisabled = activeIndex === projects.length - 1;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setStackCycle((current) => current + 1);
    }, 2200);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const goPrev = () => {
    if (isPrevDisabled) return;
    setActiveIndex((current) => Math.max(0, current - 1));
  };

  const goNext = () => {
    if (isNextDisabled) return;
    setActiveIndex((current) => Math.min(projects.length - 1, current + 1));
  };

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-8">
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

      <div className="works-carousel-pin">
        <button
          type="button"
          onClick={goPrev}
          disabled={isPrevDisabled}
          aria-label="Show previous project"
          className="works-carousel-arrow works-carousel-arrow-left"
        >
          ‹
        </button>
        <div className="works-carousel-viewport">
          <div
            className="works-carousel-track"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
        {projects.map((project, index) => (
          <article
            key={index}
            className="works-card group"
          >
            <div className="project-stack" aria-hidden="true">
              {project.images.map((image, imageIndex) => {
                const stackPosition =
                  (imageIndex - (stackCycle % project.images.length) + project.images.length) %
                  project.images.length;
                const isVisible = stackPosition < Math.min(MAX_VISIBLE_STACK_CARDS, project.images.length);
                const positionClass = isVisible ? `stack-pos-${stackPosition}` : 'stack-pos-hidden';

                return (
                  <figure
                    key={`${project.name}-${image}`}
                    className={`project-stack-card ${positionClass}`}
                  >
                    <img
                      src={image}
                      alt={`${project.name} showcase ${imageIndex + 1}`}
                      className="h-full w-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </figure>
                );
              })}
            </div>
            <div className="project-name-callout">
              <span>{project.name}</span>
            </div>
          </article>
        ))}
          </div>
        </div>
        <button
          type="button"
          onClick={goNext}
          disabled={isNextDisabled}
          aria-label="Show next project"
          className="works-carousel-arrow works-carousel-arrow-right"
        >
          ›
        </button>
        <div className="mt-5 flex items-center justify-center gap-2">
          {projects.map((_, index) => (
            <span
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === activeIndex ? 'w-8 bg-accent' : 'w-3 bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
