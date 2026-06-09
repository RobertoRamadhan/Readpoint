import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-950 shadow-sm transition placeholder:text-slate-400 focus:border-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-700/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export { Input };
