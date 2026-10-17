export const formatDateTime = (iso: string) => new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });

export const formatDate = (isoDate: string) => new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-GB', { dateStyle: 'medium' });
