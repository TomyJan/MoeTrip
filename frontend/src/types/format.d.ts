declare module '../utils/format' {
  export function formatDateTime(dateString: string | undefined): string;
  export function formatCurrency(value: number, currency?: string): string;
  export function formatFileSize(bytes: number): string;
  export function truncateText(
    text: string,
    maxLength: number,
    suffix?: string,
  ): string;
  export function formatShortDate(dateString: string): string;
}
