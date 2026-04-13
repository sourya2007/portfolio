import ProfileCard from './ProfileCard';

const teamMembers = [
  {
    name: 'Eshaan Sarkar',
    handle: 'eshaan',
    status: 'Online',
    avatarUrl: '/team/Eshaan.jpeg',
    behindGlowColor: 'hsla(352, 100%, 68%, 0.72)',
    grainTintColor: 'rgba(255, 92, 92, 0.28)',
    innerGradient: 'linear-gradient(145deg,hsla(352, 52%, 34%, 0.58) 0%,hsla(358, 78%, 62%, 0.18) 48%,hsla(20, 90%, 70%, 0.12) 100%)',
  },
  {
    name: 'Sourya Paul',
    handle: 'sourya',
    status: 'In Studio',
    avatarUrl: '/team/Sourya.jpeg',
    behindGlowColor: 'hsla(197, 100%, 66%, 0.72)',
    grainTintColor: 'rgba(72, 186, 255, 0.28)',
    innerGradient: 'linear-gradient(145deg,hsla(197, 56%, 32%, 0.58) 0%,hsla(210, 82%, 64%, 0.18) 48%,hsla(165, 82%, 72%, 0.12) 100%)',
  },
  {
    name: 'Dwijagro Sengupta',
    handle: 'dwijagro',
    status: 'Available',
    avatarUrl: '/team/Dwijagro.jpeg',
    nameClassName: 'whitespace-nowrap text-[min(3.1svh,1.72em)] md:text-[min(3.35svh,1.88em)] tracking-tight',
    behindGlowColor: 'hsla(270, 100%, 72%, 0.72)',
    grainTintColor: 'rgba(177, 124, 255, 0.28)',
    innerGradient: 'linear-gradient(145deg,hsla(270, 56%, 32%, 0.58) 0%,hsla(292, 82%, 66%, 0.18) 50%,hsla(244, 84%, 74%, 0.12) 100%)',
  },
];

export default function CoreTeam() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="mb-14 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <h2 className="text-accent text-sm font-bold tracking-[0.3em] uppercase mb-4">Core Team</h2>
          <h3 className="text-5xl md:text-7xl font-serif">
            Minds Behind The <span className="italic">Monostroke</span>
          </h3>
        </div>
        <p className="max-w-md opacity-60 text-lg">
          A lean, multidisciplinary team blending strategy, design, and engineering to craft high-impact experiences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 justify-items-center">
        {teamMembers.map((member) => (
          <ProfileCard
            key={member.handle}
            name={member.name}
            handle={member.handle}
            status={member.status}
            contactText="Contact Me"
            avatarUrl={member.avatarUrl}
            showUserInfo={false}
            showTitle={false}
            enableTilt={true}
            enableMobileTilt={false}
            onContactClick={() => console.log(`Contact clicked: ${member.handle}`)}
            behindGlowColor={member.behindGlowColor}
            behindGlowEnabled
            grainTintColor={member.grainTintColor}
            innerGradient={member.innerGradient}
            nameClassName={member.nameClassName}
          />
        ))}
      </div>
    </section>
  );
}
