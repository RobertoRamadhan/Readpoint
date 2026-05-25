'use client';

import React from 'react';
import styles from './AuthForm.module.css';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'select';
  placeholder?: string;
  icon?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  error?: string;
}

interface AuthFormProps {
  title: string;
  subtitle?: string;
  fields: FormField[];
  values: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitButtonText?: string;
  loading?: boolean;
  error?: string;
  successMessage?: string;
  bottomText?: {
    text: string;
    linkText: string;
    href: string;
  };
  socialButtons?: {
    icon: string;
    text: string;
    onClick?: () => void;
  }[];
  children?: React.ReactNode;
}

export default function AuthForm({
  title,
  subtitle,
  fields,
  values,
  onChange,
  onSubmit,
  submitButtonText = 'Submit',
  loading = false,
  error,
  successMessage,
  bottomText,
  socialButtons,
  children
}: AuthFormProps) {
  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {children}

      {/* Title & Subtitle */}
      <div className="mb-4">
        <h2 className="text-3xl font-bold text-emerald-900 mb-2">{title}</h2>
        {subtitle && <p className="text-emerald-700 text-sm">{subtitle}</p>}
      </div>

      {/* Error Message */}
      {error && (
        <div className={`${styles.errorMessage} bg-red-50 p-3 rounded-lg border-l-4 border-red-500`}>
          <span>⚠️</span>
          <div className="flex-1">{error}</div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className={`${styles.successMessage} bg-green-50 p-3 rounded-lg border-l-4 border-green-500`}>
          <span>✅</span>
          <div className="flex-1">{successMessage}</div>
        </div>
      )}

      {/* Form Fields */}
      {fields.map((field) => (
        <div key={field.name} className={styles.flexColumn}>
          <label htmlFor={field.name}>{field.label}</label>

          <div className={`${styles.inputForm} ${field.error ? styles.error : ''}`}>
            {field.icon && <div className={styles.iconInput}>{field.icon}</div>}

            {field.type === 'select' ? (
              <select
                id={field.name}
                name={field.name}
                value={values[field.name] || ''}
                onChange={onChange}
                required={field.required}
                disabled={loading}
                className={styles.input}
              >
                <option value="">{field.placeholder || `Select ${field.label}`}</option>
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={field.name}
                type={field.type}
                name={field.name}
                value={values[field.name] || ''}
                onChange={onChange}
                placeholder={field.placeholder}
                required={field.required}
                disabled={loading}
                className={styles.input}
              />
            )}
          </div>

          {field.error && (
            <div className={styles.errorMessage}>
              <span>✕</span>
              {field.error}
            </div>
          )}
        </div>
      ))}

      {/* Submit Button */}
      <button
        type="submit"
        className={styles.buttonSubmit}
        disabled={loading}
      >
        {loading ? 'Memproses...' : submitButtonText}
      </button>

      {/* Social Buttons */}
      {socialButtons && socialButtons.length > 0 && (
        <>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-emerald-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-emerald-700 font-medium">atau</span>
            </div>
          </div>

          <div className="space-y-3">
            {socialButtons.map((btn, idx) => (
              <button
                key={idx}
                type="button"
                onClick={btn.onClick}
                className={styles.btn}
                disabled={loading}
              >
                <span className="text-xl">{btn.icon}</span>
                {btn.text}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Bottom Text with Link */}
      {bottomText && (
        <div className={styles.flexRow}>
          <p className={styles.p}>
            {bottomText.text}{' '}
            <a href={bottomText.href} className={styles.span}>
              {bottomText.linkText}
            </a>
          </p>
        </div>
      )}
    </form>
  );
}
