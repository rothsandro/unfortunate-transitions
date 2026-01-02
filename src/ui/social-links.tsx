import { SiBluesky, SiBuymeacoffee } from '@icons-pack/react-simple-icons';

const lins = [
  {
    href: 'https://www.buymeacoffee.com/sandroroth',
    label: 'Buy Me a Coffee',
    icon: SiBuymeacoffee,
  },
  {
    href: 'https://bsky.app/profile/sandroroth.com',
    label: 'Bluesky',
    icon: SiBluesky,
  },
];

export function SocialLinks() {
  return (
    <nav aria-label="Social links">
      <ul className="flex gap-6">
        {lins.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="flex items-center gap-2 text-sm text-slate-400 outline-offset-4
                transition-all hover:text-slate-300"
              target="_blank"
              rel="noopener noreferrer"
            >
              <link.icon size={16} />
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
