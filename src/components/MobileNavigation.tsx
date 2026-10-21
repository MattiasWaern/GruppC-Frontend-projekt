import {
  House,
  Search,
  CalendarDays,
  Info,
  UserRound,
} from 'lucide-react';

const navigationItems = [
  { label: 'Hem', href: '#hem', Icon: House },
  { label: 'Sök', href: '#sok', Icon: Search },
  { label: 'Boka', href: '#boka', Icon: CalendarDays },
  { label: 'Om oss', href: '#om-oss', Icon: Info },
  { label: 'Konto', href: '#konto', Icon: UserRound },
];

export default function MobileNavigation() {
  return (
    <nav
      aria-label="Huvudnavigation"
      className="
        fixed z-50
        inset-x-0 bottom-0
        flex flex-row items-center justify-around
        border-t border-[#806b36]
        bg-[#1d1d1d] p-2

        md:inset-x-auto md:left-0
        md:top-20 md:bottom-0
        md:w-56
        md:flex-col md:items-stretch md:justify-start
        md:gap-3 md:border-r md:border-t-0
        md:p-4
      "
    >
      {navigationItems.map(({ label, href, Icon }) => (
        <a
          key={href}
          href={href}
          className={`
            flex flex-col items-center gap-1
            rounded-lg px-2 py-2
            text-[#e5ca7a]
            transition-colors hover:bg-[#333333]
            ${label === 'Sök' ? 'md:hidden' : ''}

            md:flex-row md:justify-start
            md:gap-3 md:px-2 lg:px-3
          `}
        >
          <Icon
            aria-hidden="true"
            size={24}
            strokeWidth={1.7}
            className="shrink-0"
          />
          <span className="text-xs md:text-sm">{label}</span>
        </a>
      ))}
    </nav>
  );
}
