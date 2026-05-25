'use client';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{ value: string; label: string }>;
  isTextarea?: boolean;
  rows?: number;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export default function FormField({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  hint,
  required,
  disabled,
  options,
  isTextarea,
  rows = 3,
  icon,
  size = 'md',
}: FormFieldProps) {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-5 py-3 text-lg'
  };

  const inputClasses = `w-full ${sizeClasses[size]} border-2 rounded-lg transition-all duration-200 ${
    error 
      ? 'border-danger bg-danger bg-opacity-5 focus:border-danger focus:ring-2 focus:ring-danger focus:ring-opacity-10' 
      : 'border-secondary-200 hover:border-secondary-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
  } focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-secondary-50 bg-white text-secondary-900 placeholder-secondary-400`;

  return (
    <div className="form-group">
      <label className="form-label">
        {label}
        {required && <span className="text-danger ml-1">*</span>}
      </label>

      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 pointer-events-none">
            {icon}
          </div>
        )}

        {isTextarea ? (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            className={`${inputClasses} ${icon ? 'pl-10' : ''} resize-none`}
          />
        ) : options ? (
          <select 
            name={name} 
            value={value} 
            onChange={onChange} 
            disabled={disabled} 
            className={`${inputClasses} ${icon ? 'pl-10' : ''} appearance-none cursor-pointer`}
          >
            <option value="">{placeholder || 'Select...'}</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className={`${inputClasses} ${icon ? 'pl-10' : ''}`}
          />
        )}
      </div>

      {error && (
        <p className="form-error flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18.101 12.93a1 1 0 00-1.414-1.414L10 14.586l-6.687-6.687a1 1 0 00-1.414 1.414l8.1 8.1a1 1 0 001.414 0l8.1-8.1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      
      {hint && !error && (
        <p className="form-hint">
          {hint}
        </p>
      )}
    </div>
  );
}
