
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2
  }).format(amount);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function scrollToSection(id: string): void {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

export function getOrderStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    'pending': 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
    'preparing': 'bg-blue-500/20 text-blue-500 border-blue-500/50',
    'ready': 'bg-green-500/20 text-green-500 border-green-500/50',
    'delivered': 'bg-purple-500/20 text-purple-500 border-purple-500/50',
    'cancelled': 'bg-red-500/20 text-red-500 border-red-500/50'
  };
  
  return statusColors[status.toLowerCase()] || 'bg-gray-500/20 text-gray-500 border-gray-500/50';
}

export function generateQRCode(tableNumber: string): string {
  // This would be replaced with an actual QR code generation API
  // For now, we'll return a placeholder URL
  return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
    `${window.location.origin}/menu?table=${tableNumber}`
  )}&size=200x200`;
}
