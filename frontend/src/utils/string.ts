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
