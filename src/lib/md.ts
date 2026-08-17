// Markdown 渲染（带 XSS 消毒）
import { marked } from 'marked';
import DOMPurify from 'dompurify';

/** 渲染 Markdown 并消毒 HTML，安全用于 v-html */
export function renderMarkdown(s: string): string {
  const html = marked.parse(s) as string;
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'hr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'strong', 'em', 'del', 'code', 'pre', 'blockquote',
      'ul', 'ol', 'li', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel'],
  });
}
