import { navigate, usePathname } from '../lib/navigation';
import { cn } from '../lib/cn';

interface SiteHeaderProps {
  className?: string;
}

function NavLink({ href, pathname, children }: { href: string; pathname: string; children: React.ReactNode }) {
  const active =
    pathname === href || (href !== '/' && href !== '/join' && pathname.startsWith(href)) ||
    (href === '/join' && (pathname.startsWith('/join') || pathname.startsWith('/room/')));

  return (
    <a
      href={href}
      className={cn(
        'text-sm font-medium transition-colors',
        active ? 'text-accent' : 'text-muted-foreground hover:text-foreground',
      )}
      onClick={(event) => {
        event.preventDefault();
        navigate(href);
      }}
    >
      {children}
    </a>
  );
}

export function SiteHeader({ className }: SiteHeaderProps) {
  const pathname = usePathname();

  return (
    <header className={cn('border-b border-border bg-card/80 backdrop-blur-sm', className)}>
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-6">
        <a
          href="/"
          className="font-display text-xl text-foreground"
          onClick={(event) => {
            event.preventDefault();
            navigate('/');
          }}
        >
          tandem
        </a>
        <nav className="flex items-center gap-6">
          <NavLink href="/" pathname={pathname}>
            Home
          </NavLink>
          <NavLink href="/join" pathname={pathname}>
            Join room
          </NavLink>
          <NavLink href="/download" pathname={pathname}>
            Download
          </NavLink>
          <NavLink href="/wiki" pathname={pathname}>
            Wiki
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

interface SiteLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function SiteLayout({ children, className }: SiteLayoutProps) {
  return (
    <div className={cn('min-h-screen bg-background', className)}>
      <SiteHeader />
      {children}
    </div>
  );
}
