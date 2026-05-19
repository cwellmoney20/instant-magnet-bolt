import { type ButtonHTMLAttributes } from 'react';

interface ExtrudedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'surface';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

const variantClasses = {
  primary: 'bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary',
  secondary: 'bg-secondary text-on-secondary hover:bg-on-secondary-container hover:text-secondary-fixed',
  surface: 'bg-surface text-on-surface border border-outline hover:bg-surface-variant',
};

const sizeClasses = {
  sm: 'px-3 py-2 text-xs',
  md: 'px-5 py-3 text-label-tag',
  lg: 'px-6 py-4 text-body-md',
};

export default function ExtrudedButton({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  ...props
}: ExtrudedButtonProps) {
  return (
    <button
      {...props}
      className={`btn-extruded font-mono-brand font-bold rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
