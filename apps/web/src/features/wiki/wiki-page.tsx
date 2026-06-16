import {
  parseWikiSection,
  usePathname,
  wikiPath,
  navigate,
  type WikiSectionId,
} from '../../lib/navigation';
import { cn } from '../../lib/cn';
import { WIKI_NAV, WikiSectionContent } from './wiki-sections';

export function WikiPage() {
  const pathname = usePathname();
  const section = parseWikiSection(pathname);
  const current = WIKI_NAV.find((item) => item.id === section);

  let lastGroup: string | undefined;

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10 lg:flex-row lg:gap-12">
      <aside className="lg:w-56 lg:shrink-0">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Documentation</p>
        <nav className="mt-4 space-y-1">
          {WIKI_NAV.map((item) => {
            const showGroup = item.group !== lastGroup;
            lastGroup = item.group;

            return (
              <div key={item.id}>
                {showGroup && item.group ? (
                  <p className="mb-2 mt-4 first:mt-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {item.group}
                  </p>
                ) : null}
                <WikiNavLink section={item.id} active={section === item.id}>
                  {item.label}
                </WikiNavLink>
              </div>
            );
          })}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted-foreground">{current?.group ?? 'Guide'}</p>
        <WikiSectionContent section={section} />
      </div>
    </main>
  );
}

function WikiNavLink({
  section,
  active,
  children,
}: {
  section: WikiSectionId;
  active: boolean;
  children: React.ReactNode;
}) {
  const href = wikiPath(section);

  return (
    <a
      href={href}
      className={cn(
        'block rounded-lg px-3 py-2 text-sm transition-colors',
        active
          ? 'bg-accent/10 font-medium text-accent'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
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
