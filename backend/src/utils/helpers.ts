import crypto from 'crypto';

export const generateRandomString = (length = 16): string => {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
};

export const generateOTP = (length = 6): string => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
};

export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const paginate = (page = 1, limit = 20) => {
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
  const offset = (pageNum - 1) * limitNum;
  return { page: pageNum, limit: limitNum, offset };
};

export const buildPaginationMeta = (totalCount: number, page: number, limit: number) => {
  const totalPages = Math.ceil(totalCount / limit);
  return {
    totalCount,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

export const calculatePercentage = (part: number, total: number): number => {
  if (total === 0) return 0;
  return parseFloat(((part / total) * 100).toFixed(2));
};

export const calculateStreak = (dates: Date[]): number => {
  if (dates.length === 0) return 0;

  const sortedDates = [...dates]
    .map((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()))
    .sort((a, b) => b.getTime() - a.getTime());

  const uniqueDates = Array.from(new Set(sortedDates.map((d) => d.getTime()))).map(
    (t) => new Date(t)
  );

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let expectedDate = today;

  for (const date of uniqueDates) {
    const diffDays = Math.round(
      (expectedDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) {
      streak++;
      expectedDate = new Date(expectedDate.getTime() - 24 * 60 * 60 * 1000);
    } else if (diffDays === 1) {
      expectedDate = new Date(date.getTime());
      streak++;
      expectedDate = new Date(expectedDate.getTime() - 24 * 60 * 60 * 1000);
    } else {
      break;
    }
  }

  return streak;
};

export const formatDuration = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

export const sanitizeInput = (input: string): string => {
  return input.replace(/[<>]/g, '').trim();
};

export const getDateRange = (period: 'day' | 'week' | 'month' | 'year'): { start: Date; end: Date } => {
  const end = new Date();
  const start = new Date();

  switch (period) {
    case 'day':
      start.setDate(end.getDate() - 1);
      break;
    case 'week':
      start.setDate(end.getDate() - 7);
      break;
    case 'month':
      start.setMonth(end.getMonth() - 1);
      break;
    case 'year':
      start.setFullYear(end.getFullYear() - 1);
      break;
  }

  return { start, end };
};

export const chunkArray = <T>(array: T[], chunkSize: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

export const maskEmail = (email: string): string => {
  const [localPart, domain] = email.split('@');
  if (!domain) return email;
  const maskedLocal =
    localPart.length > 2
      ? `${localPart.slice(0, 2)}${'*'.repeat(localPart.length - 2)}`
      : localPart;
  return `${maskedLocal}@${domain}`;
};
