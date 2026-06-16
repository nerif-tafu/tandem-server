import { cn } from '../../lib/cn';

export function WikiCode({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-xl border border-border bg-muted/60 p-4 font-mono text-xs leading-relaxed text-foreground md:text-sm">
      {children}
    </pre>
  );
}

export function WikiTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[32rem] text-left text-sm">{children}</table>
    </div>
  );
}

export function WikiH2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-24 font-display text-2xl text-foreground">
      {children}
    </h2>
  );
}

export function WikiH3({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h3 id={id} className="scroll-mt-24 text-lg font-semibold text-foreground">
      {children}
    </h3>
  );
}

export function WikiP({ children }: { children: React.ReactNode }) {
  return <p className="leading-relaxed text-muted-foreground">{children}</p>;
}

export function WikiUl({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc space-y-2 pl-5 text-muted-foreground">{children}</ul>;
}

export function WikiArticle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <article className={cn('space-y-6', className)}>{children}</article>;
}
