interface DymoLabelProps {
  children: React.ReactNode;
  variant?: 'black' | 'blue' | 'red' | 'gray' | 'yellow';
  className?: string;
}

const variantClasses: Record<NonNullable<DymoLabelProps['variant']>, string> = {
  black: 'bg-on-surface text-white',
  blue: 'bg-secondary text-on-secondary',
  red: 'bg-tertiary text-on-tertiary',
  gray: 'bg-outline text-white',
  yellow: 'bg-primary text-on-primary',
};

export default function DymoLabel({ children, variant = 'black', className = '' }: DymoLabelProps) {
  return (
    <span
      className={`dymo-label font-mono-brand text-label-tag uppercase tracking-widest ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
