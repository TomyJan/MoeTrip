/**
 * 格式化日期时间
 * @param dateString 日期字符串
 * @returns 格式化后的日期字符串
 */
export const formatDateTime = (dateString: string | undefined): string => {
  if (!dateString) return '';

  const date = new Date(dateString);

  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

/**
 * 将数字格式化为货币格式
 * @param value 数字值
 * @param currency 货币符号，默认为 ￥
 * @returns 格式化后的货币字符串
 */
export const formatCurrency = (
  value: number,
  currency: string = '￥',
): string => {
  if (typeof value !== 'number') return `${currency}0.00`;

  return `${currency}${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

/**
 * 截断文本
 * @param text 原始文本
 * @param maxLength 最大长度
 * @param suffix 后缀，默认为 ...
 * @returns 截断后的文本
 */
export const truncateText = (
  text: string,
  maxLength: number,
  suffix: string = '...',
): string => {
  if (!text || text.length <= maxLength) return text;

  return `${text.substring(0, maxLength)}${suffix}`;
};

/**
 * 格式化日期为简短格式 (YYYY-MM-DD HH:MM)
 * @param dateString ISO格式的日期字符串
 * @returns 格式化后的日期字符串
 */
export const formatShortDate = (dateString: string): string => {
  if (!dateString) return '-';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};
