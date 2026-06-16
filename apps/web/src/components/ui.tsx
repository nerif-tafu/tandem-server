import { motion } from 'framer-motion';
import { type ButtonHTMLAttributes } from 'react';

import { cn } from '../lib/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

export function Button({ className, variant = 'primary', children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex h-12 items-center justify-center rounded-xl px-6 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
        variant === 'primary' &&
          'bg-gradient-to-r from-accent to-accent-secondary text-accent-foreground shadow-sm hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(0,82,255,0.25)]',
        variant === 'secondary' &&
          'border border-border bg-transparent text-foreground hover:border-accent/30 hover:bg-muted',
        variant === 'ghost' && 'text-muted-foreground hover:text-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={cn('rounded-2xl border border-border bg-card p-8 shadow-md', className)}
    >
      {children}
    </motion.div>
  );
}

export function SectionLabel({ children }: { children: string }) {
  return (
    <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-accent/30 bg-accent/5 px-5 py-2">
      <span className="h-2 w-2 rounded-full bg-accent" />
      <span className="font-mono text-xs uppercase tracking-[0.15em] text-accent">{children}</span>
    </div>
  );
}
