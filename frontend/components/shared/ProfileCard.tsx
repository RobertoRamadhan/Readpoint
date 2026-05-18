'use client';

import React from 'react';
import styles from './ProfileCard.module.css';

interface ProfileCardProps {
  name: string;
  role: string;
  avatar?: string | React.ReactNode;
  buttonText?: string;
  buttonHref?: string;
  onButtonClick?: () => void;
  variant?: 'siswa' | 'guru' | 'admin';
  isOnline?: boolean;
  className?: string;
}

export default function ProfileCard({
  name,
  role,
  avatar,
  buttonText = 'Lihat Profile',
  buttonHref,
  onButtonClick,
  variant = 'siswa',
  isOnline = true,
  className = ''
}: ProfileCardProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'guru':
        return styles.profileCardGuru;
      case 'admin':
        return styles.profileCardAdmin;
      case 'siswa':
      default:
        return styles.profileCard;
    }
  };

  const profileCardClass = [
    styles.profileCard,
    getVariantClasses(),
    className
  ].filter(Boolean).join(' ');

  // Get initial from name if no avatar provided
  const getInitial = () => {
    if (typeof avatar === 'string') return null;
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else if (buttonHref) {
      window.location.href = buttonHref;
    }
  };

  return (
    <div className={`${styles.profileCardContainer} group`}>
      <div className={profileCardClass}>
        {/* Status Badge */}
        {isOnline && <div className={styles.statusBadge}></div>}

        {/* Content */}
        <div className={styles.profileCardContent}>
          {/* Avatar */}
          {typeof avatar === 'string' && avatar.startsWith('http') ? (
            <img
              src={avatar}
              alt={name}
              className={styles.profileAvatarImage}
            />
          ) : typeof avatar === 'string' ? (
            <div className={styles.profileAvatar}>{avatar}</div>
          ) : avatar ? (
            <div className={styles.profileAvatar}>{avatar}</div>
          ) : (
            <div className={styles.profileAvatar}>{getInitial()}</div>
          )}

          {/* Info */}
          <div className={styles.profileInfo}>
            <h3 className={styles.profileName}>{name}</h3>
            <p className={styles.profileRole}>{role}</p>
          </div>

          {/* Button */}
          {buttonHref ? (
            <a
              href={buttonHref}
              className={styles.profileButton}
              target="_blank"
              rel="noopener noreferrer"
            >
              {buttonText}
            </a>
          ) : (
            <button
              onClick={handleButtonClick}
              className={styles.profileButton}
              type="button"
            >
              {buttonText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
