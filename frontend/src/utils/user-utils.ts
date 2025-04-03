// Helper function to get initials from username
export const getUserInitials = (username: string | undefined): string => {
  if (!username) return 'U';
  return username
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};