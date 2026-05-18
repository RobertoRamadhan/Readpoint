'use client';

import React from 'react';
import styles from './RippleButton.module.css';

interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export default function RippleButton({
  variant = 'primary',
  size = 'medium',
  loading = false,
  fullWidth = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: RippleButtonProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return styles.buttonSmall;
      case 'large':
        return styles.buttonLarge;
      case 'medium':
      default:
        return '';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'secondary':
        return styles.buttonSecondary;
      case 'success':
        return styles.buttonSuccess;
      case 'danger':
        return styles.buttonDanger;
      case 'outline':
        return styles.buttonOutline;
      case 'primary':
      default:
        return styles.buttonPrimary;
    }
  };

  const buttonClasses = [
    styles.button,
    getVariantClasses(),
    getSizeClasses(),
    fullWidth ? styles.buttonFullWidth : '',
    loading ? styles.buttonLoading : '',
    disabled ? styles.buttonLoading : '',
    className
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={buttonClasses}
      disabled={disabled || loading}
      {...props}
    >
      {/* Ripple circles */}
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>

      {/* Content */}
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {loading && (
          <span className={styles.spinnerIcon}>
            ⟳
          </span>
        )}
        {icon && !loading && <span>{icon}</span>}
        {children}
      </span>
    </button>
  );
}
