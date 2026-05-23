export const getDisplayNameFromEmail = (email?: string | null) => {
  if (!email) return '';

  const localPart = email.split('@')[0]?.trim();
  if (!localPart) return '';

  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};
