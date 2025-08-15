import * as React from 'react'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg' | 'icon'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className = '', variant = 'default', size = 'md', ...props }, ref
) {
  const base = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none disabled:opacity-60 disabled:pointer-events-none'
  const rounded = 'rounded-md'
  const variants: Record<string,string> = {
    default: 'bg-black text-white hover:bg-black/90',
    outline: 'border border-slate-300 hover:bg-slate-50',
    secondary: 'bg-slate-100 hover:bg-slate-200',
    ghost: 'hover:bg-slate-100'
  }
  const sizes: Record<string,string> = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4',
    lg: 'h-11 px-5 text-base',
    icon: 'h-9 w-9'
  }
  return (
    <button ref={ref} className={`${base} ${rounded} ${variants[variant]} ${sizes[size]} ${className}`} {...props} />
  )
})