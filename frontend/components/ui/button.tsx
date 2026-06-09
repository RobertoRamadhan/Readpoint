import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-black transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-700/15 disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-emerald-700 text-white shadow-lg shadow-emerald-700/20 hover:bg-emerald-800',
        secondary: 'border border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-slate-50 hover:text-emerald-700',
        ghost: 'text-slate-700 hover:bg-slate-100 hover:text-slate-950',
        outline: 'border border-slate-300 bg-white text-slate-900 hover:border-emerald-700 hover:text-emerald-700',
      },
      size: {
        default: 'h-12 px-5 py-3',
        sm: 'h-10 px-4 py-2',
        lg: 'h-14 px-6 py-4 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
