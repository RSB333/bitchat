import * as React from 'react'

type BadgeProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'secondary'
}

export function Badge({ className = '', variant = 'default', ...props }: BadgeProps) {
  const variants: Record<string,string> = {
    default: 'bg-black text-white',
    secondary: 'bg-slate-100 text-slate-900'
  }
  return <div className={`inline-flex items-center px-2 py-0.5 text-xs rounded ${variants[variant]} ${className}`} {...props} />
}