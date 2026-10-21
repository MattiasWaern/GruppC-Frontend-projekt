import { House, CalendarDays, Info, UserRound } from 'lucide-react';


const footerGroups = [
  {
    title: 'EVENT',
    links: [
      { label: 'Boka', href: '#boka' },
      { label: 'Event', href: '#event' },
      { label: 'Om oss', href: '#om-oss' },
      { label: 'Konto', href: '#konto' },

    ],
  },
  {
    title: 'INFORMATION',
    links: [
      { label: 'Biljetter', href: '#biljetter' },
      { label: 'Salonger', href: '#Salonger' },
      { label: 'Mat & dryck', href: '#mat-dryck' },
      { label: 'Tillgänglighet', href: '#tillganglighet' },
    ],
  },
  {
    title: 'SUPPORT',
    links: [
      { label: 'Hjälpcenter', href: '#hjalpcenter' },
      { label: 'Kontakta oss', href: '#kontakt' },
      { label: 'Villkor', href: '#villkor' },
      { label: 'Integritet', href: '#integritet' },
    ],
  },
];

const quickLinks = [
  { label: 'Hem', href: '#hem', Icon: House },
  { label: 'Boka', href: '#boka', Icon: CalendarDays },
  { label: 'Om oss', href: '#om-oss', Icon: Info },
  { label: 'Konto', href: '#konto', Icon: UserRound },
];

export default function Footer() {
  return (
    <footer className='border-t border-[#806b36] bg-[#1d1d1d] text-[#e5ca7a]'>

      
      <nav
        aria-label="Footernavigation"
        className="hidden md:flex flex-wrap items-center justify-center gap-x-5 gap-y-3 border-b border-[#806b36] px-4 py-5 sm:gap-7"
      >

        {quickLinks.map(({ label, href, Icon }) => (
          <a
            key={href}
            href={href}
            className='flex items-center gap-1.5 text-xs transition-colors hover:text-white'
          >
            <Icon size={14} aria-hidden="true" />
            <span>{label}</span>
          </a>
        ))}
      </nav>

      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-10 sm:grid-cols-4 md:ml-64">
        <div className="col-span-2 md:col-span-1">
          <a href="#hem" className="font-serif text-xl font-bold tracking-wide">
            Filmvisarna
          </a>
          <p className="mt-3 max-w-xs text-xs leading-5 text-white/60">
            En premium bioupplevelse med tydlig design, genreröversikt
            och en känsla av exklusivitet i varje detalj.
          </p>
        </div>

        {footerGroups.map((group) => (
          <div key={group.title}>
            <h2 className="mb-3 text-[10px] font-semibold tracking-widest text-white/50">
              {group.title}
            </h2>
            <ul className="space-y-2">
              {group.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-xs text-white/65 transition-colors hover:text-[#e5ca7a]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

       <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 px-6 py-4 text-[10px] text-white/40 sm:flex-row md:ml-64">
        <p>© 2026 Filmvisarna. Alla rättigheter reserverade.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="#villkor" className="hover:text-[#e5ca7a]">Villkor</a>
          <a href="#integritet" className="hover:text-[#e5ca7a]">Integritet</a>
          <a href="#cookies" className="hover:text-[#e5ca7a]">Cookies</a>
        </div>
      </div>
    </footer>
  );
}