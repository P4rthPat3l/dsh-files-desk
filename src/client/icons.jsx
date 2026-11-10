import React from 'react';

/**
 * One 16px stroke icon.
 * @param {{ children: React.ReactNode, size?: number }} props - path children and size.
 * @returns {JSX.Element} the icon.
 */
function Icon({ children, size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export function IconFilePlus() {
  return (
    <Icon>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6" />
      <path d="M14 3v5h5" />
      <path d="M17 15v6M14 18h6" />
    </Icon>
  );
}

export function IconFolderPlus() {
  return (
    <Icon>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      <path d="M12 11v6M9 14h6" />
    </Icon>
  );
}

export function IconRefresh() {
  return (
    <Icon>
      <path d="M20 11a8 8 0 1 0-2.3 5.7" />
      <path d="M20 4v7h-7" />
    </Icon>
  );
}

export function IconSave() {
  return (
    <Icon>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
      <path d="M17 21v-8H7v8M7 3v5h8" />
    </Icon>
  );
}

export function IconEye() {
  return (
    <Icon>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </Icon>
  );
}

export function IconClose() {
  return (
    <Icon size={14}>
      <path d="M18 6 6 18M6 6l12 12" />
    </Icon>
  );
}

export function IconFolder() {
  return (
    <Icon>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
    </Icon>
  );
}

export function IconFile() {
  return (
    <Icon>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
      <path d="M14 3v5h5" />
    </Icon>
  );
}

export function IconWrap() {
  return (
    <Icon>
      <path d="M3 6h18M3 12h13a3 3 0 0 1 0 6h-3" />
      <path d="m15 15-3 3 3 3" />
      <path d="M3 18h6" />
    </Icon>
  );
}

export function IconDots() {
  return (
    <Icon>
      <circle cx="5" cy="12" r="1" fill="currentColor" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <circle cx="19" cy="12" r="1" fill="currentColor" />
    </Icon>
  );
}
