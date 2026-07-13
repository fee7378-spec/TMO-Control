import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, differenceInMilliseconds } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(ms: number) {
  const date = new Date(ms);
  const hours = Math.floor(ms / 3600000).toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const seconds = date.getUTCSeconds().toString().padStart(2, '0');
  const milliseconds = Math.floor(date.getUTCMilliseconds() / 10).toString().padStart(2, '0');

  return `${hours}:${minutes}:${seconds}:${milliseconds}`;
}

export function formatTimeHHMMSS(ms: number) {
  const date = new Date(ms);
  const hours = Math.floor(ms / 3600000).toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const seconds = date.getUTCSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

export function formatDateTime(timestamp: number) {
  return format(new Date(timestamp), 'dd/MM/yyyy HH:mm:ss');
}

export function formatDate(timestamp: number) {
  return format(new Date(timestamp), 'dd/MM/yyyy');
}
