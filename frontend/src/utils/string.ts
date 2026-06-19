/**
 * Utility to strip markdown syntax and return plain text
 */
export function stripMarkdown(content: string): string {
    if (!content) return '';

    return content
        // Remove HTML tags
        .replace(/<[^>]*>/g, '')
        // Remove code blocks
        .replace(/```[\s\S]*?```/g, '')
        // Remove inline code
        .replace(/`([^`]+)`/g, '$1')
        // Remove images
        .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
        // Remove links but keep text
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
        // Remove headings
        .replace(/^#+\s+/gm, '')
        // Remove bold/italic
        .replace(/([*_]{1,3})(\S.*?\S)\1/g, '$2')
        // Remove blockquotes
        .replace(/^\s*>\s+/gm, '')
        // Remove horizontal rules
        .replace(/^\s*[-*_]{3,}\s*$/gm, '')
        // Remove list markers
        .replace(/^\s*[\d.+-]+\s+/gm, '')
        // Remove extra whitespace
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * 识别文本中的电话号码并转换为可点击的 tel: 链接
 * 支持手机号（1开头11位）、座机号（带区号）和纯7-8位座机号
 */
export function linkifyPhoneNumbers(text: string): string {
    if (!text) return '';
    // 先转义 HTML 特殊字符，防止 XSS
    const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    // 使用负向断言确保前后不是数字，避免从长数字串中误匹配
    // 手机号：1[3-9]开头的11位数字
    // 座机号（带区号）：0开头2-3位区号 + 可选横杠 + 7-8位号码
    // 纯座机号：7-8位数字（不带区号）
    const phoneRegex = /(?<!\d)(?:1[3-9]\d{9}|0\d{2,3}-?\d{7,8}|\d{7,8})(?!\d)/g;

    return escaped.replace(phoneRegex, (match) => {
        return `<a href="tel:${match}" class="phone-link">${match}</a>`;
    });
}
