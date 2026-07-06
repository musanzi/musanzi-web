import { Component, ViewEncapsulation, computed, input } from '@angular/core';
import { common, createLowlight } from 'lowlight';
import { ILowlightNode, ITextContentMark, ITextContentNode } from '../../interfaces';

const lowlight = createLowlight(common);
const CODE_LANGUAGE_PATTERN = /language-([a-zA-Z0-9_-]+)/;
const HTML_CODE_BLOCK_PATTERN = /<pre\b[^>]*>\s*<code\b([^>]*)>([\s\S]*?)<\/code>\s*<\/pre>/gi;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isHtmlContent(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function decodeHtml(value: string): string {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

function parseInlineMarkdown(value: string): string {
  let html = escapeHtml(value);

  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/~~([^~]+)~~/g, '<s>$1</s>');

  return html;
}

function normalizeMarkdown(value: string): string {
  let normalized = value.replace(/\r\n/g, '\n');

  if (!normalized.includes('\n') && normalized.includes('\\n')) {
    normalized = normalized.replace(/\\n/g, '\n');
  }

  return normalized
    .replace(/```([a-zA-Z0-9_-]*)\s+([\s\S]*?)\s+```/g, (_match, language: string, code: string) => {
      return `\n\`\`\`${language}\n${code.trim()}\n\`\`\`\n`;
    })
    .trim();
}

function parseTextAlignClass(attrs: Record<string, unknown> | undefined): string {
  const textAlign = attrs?.['textAlign'];

  return typeof textAlign === 'string' && ['center', 'right', 'justify'].includes(textAlign)
    ? ` class="article-content-align-${textAlign}"`
    : '';
}

function renderHighlightedCode(value: string, language: string): string {
  try {
    const tree =
      language && lowlight.registered(language) ? lowlight.highlight(language, value) : lowlight.highlightAuto(value);

    return renderLowlightNodes(tree.children);
  } catch {
    return escapeHtml(value);
  }
}

function renderCodeBlock(value: string, language: string): string {
  const highlightedCode = renderHighlightedCode(value, language);
  const languageClass = language ? ` class="language-${escapeHtml(language)}"` : '';

  return `<pre><code${languageClass}>${highlightedCode}</code></pre>`;
}

function renderLowlightNodes(nodes: ILowlightNode[]): string {
  return nodes
    .map((node) => {
      if (node.type === 'text') {
        return escapeHtml(node.value ?? '');
      }

      const className = Array.isArray(node.properties?.className)
        ? node.properties.className.map(String).join(' ')
        : '';
      const children = Array.isArray(node.children) ? renderLowlightNodes(node.children) : '';

      return className ? `<span class="${escapeHtml(className)}">${children}</span>` : children;
    })
    .join('');
}

function contentToHtml(value: unknown): string {
  if (typeof value !== 'string') {
    return richTextNodeToHtml(value);
  }

  const content = value.trim();

  if (!content) {
    return '';
  }

  const parsedContent = parseJsonContent(content);

  if (parsedContent) {
    return richTextNodeToHtml(parsedContent);
  }

  if (isHtmlContent(content)) {
    return highlightHtmlCodeBlocks(content);
  }

  return markdownToHtml(content);
}

function highlightHtmlCodeBlocks(value: string): string {
  return value.replace(HTML_CODE_BLOCK_PATTERN, (_match, attrs: string, code: string) => {
    const language = CODE_LANGUAGE_PATTERN.exec(attrs)?.[1] ?? '';

    return renderCodeBlock(decodeHtml(code), language);
  });
}

function parseJsonContent(value: string): ITextContentNode | ITextContentNode[] | null {
  if (!value.startsWith('{') && !value.startsWith('[')) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    if (Array.isArray(parsed)) {
      return parsed.filter(isRichTextNode);
    }

    return isRichTextNode(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function isRichTextNode(value: unknown): value is ITextContentNode {
  return isRecord(value) && typeof value['type'] === 'string';
}

function richTextNodeToHtml(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((node) => richTextNodeToHtml(node)).join('');
  }

  if (!isRichTextNode(value)) {
    return '';
  }

  const children = renderRichTextChildren(value.content);

  switch (value.type) {
    case 'doc':
      return children;
    case 'paragraph':
      return `<p${parseTextAlignClass(value.attrs)}>${children}</p>`;
    case 'heading': {
      const level = Math.min(Math.max(Number(value.attrs?.['level'] ?? 2), 1), 6);
      return `<h${level}${parseTextAlignClass(value.attrs)}>${children}</h${level}>`;
    }
    case 'bulletList':
      return `<ul>${children}</ul>`;
    case 'orderedList': {
      const start = Number(value.attrs?.['start'] ?? 1);
      const startAttr = Number.isFinite(start) && start > 1 ? ` start="${start}"` : '';
      return `<ol${startAttr}>${children}</ol>`;
    }
    case 'listItem':
      return `<li>${children}</li>`;
    case 'blockquote':
      return `<blockquote>${children}</blockquote>`;
    case 'codeBlock': {
      const language = typeof value.attrs?.['language'] === 'string' ? value.attrs['language'] : '';
      const code = renderPlainText(value);
      return renderCodeBlock(code, language);
    }
    case 'horizontalRule':
      return '<hr>';
    case 'hardBreak':
      return '<br>';
    case 'text':
      return applyRichTextMarks(escapeHtml(value.text ?? ''), value.marks ?? []);
    default:
      return children;
  }
}

function renderRichTextChildren(content: ITextContentNode[] | undefined): string {
  return (content ?? []).map((node) => richTextNodeToHtml(node)).join('');
}

function renderPlainText(node: ITextContentNode): string {
  if (node.type === 'text') {
    return node.text ?? '';
  }

  return (node.content ?? []).map((child) => renderPlainText(child)).join('');
}

function applyRichTextMarks(value: string, marks: ITextContentMark[]): string {
  return marks.reduce((nextValue, mark) => {
    if (mark.type === 'bold') {
      return `<strong>${nextValue}</strong>`;
    }

    if (mark.type === 'italic') {
      return `<em>${nextValue}</em>`;
    }

    if (mark.type === 'strike') {
      return `<s>${nextValue}</s>`;
    }

    if (mark.type === 'code') {
      return `<code>${nextValue}</code>`;
    }

    return nextValue;
  }, value);
}

function markdownToHtml(value: string): string {
  const lines = normalizeMarkdown(value).split('\n');
  const html: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index] ?? '';

    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (line.startsWith('```')) {
      const language = line.slice(3).trim();
      const codeLines: string[] = [];
      index += 1;

      while (index < lines.length && !lines[index].startsWith('```')) {
        codeLines.push(lines[index]);
        index += 1;
      }

      if (index < lines.length) {
        index += 1;
      }

      const code = codeLines.join('\n');
      html.push(renderCodeBlock(code, language));
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      html.push('<hr>');
      index += 1;
      continue;
    }

    const headingMatch = /^(#{1,6})\s+(.+)$/.exec(line);

    if (headingMatch) {
      const level = headingMatch[1].length;
      html.push(`<h${level}>${parseInlineMarkdown(headingMatch[2])}</h${level}>`);
      index += 1;
      continue;
    }

    if (line.startsWith('> ')) {
      const quoteLines: string[] = [];

      while (index < lines.length && lines[index].startsWith('> ')) {
        quoteLines.push(lines[index].slice(2));
        index += 1;
      }

      html.push(`<blockquote>${markdownToHtml(quoteLines.join('\n'))}</blockquote>`);
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];

      while (index < lines.length && /^\s*[-*]\s+/.test(lines[index])) {
        items.push(`<li>${parseInlineMarkdown(lines[index].replace(/^\s*[-*]\s+/, ''))}</li>`);
        index += 1;
      }

      html.push(`<ul>${items.join('')}</ul>`);
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];

      while (index < lines.length && /^\s*\d+\.\s+/.test(lines[index])) {
        items.push(`<li>${parseInlineMarkdown(lines[index].replace(/^\s*\d+\.\s+/, ''))}</li>`);
        index += 1;
      }

      html.push(`<ol>${items.join('')}</ol>`);
      continue;
    }

    const paragraphLines: string[] = [];

    while (
      index < lines.length &&
      lines[index].trim() &&
      !lines[index].startsWith('```') &&
      !/^---+$/.test(lines[index].trim()) &&
      !/^(#{1,6})\s+/.test(lines[index]) &&
      !lines[index].startsWith('> ') &&
      !/^\s*[-*]\s+/.test(lines[index]) &&
      !/^\s*\d+\.\s+/.test(lines[index])
    ) {
      paragraphLines.push(lines[index]);
      index += 1;
    }

    html.push(`<p>${parseInlineMarkdown(paragraphLines.join(' '))}</p>`);
  }

  return html.join('');
}

@Component({
  selector: 'blog-article-content',
  encapsulation: ViewEncapsulation.None,
  template: `
    <div
      class="article-content text-lg leading-8 text-gray-700 dark:text-gray-300"
      [innerHTML]="renderedContent()"></div>
  `,
  styles: [
    `
      .article-content > :where(* + *) {
        margin-top: 1rem;
      }

      .article-content :where(li + li) {
        margin-top: 0.375rem;
      }

      .article-content :where(li > :first-child) {
        margin-top: 0;
      }

      .article-content :where(h1, h2, h3, h4, h5, h6) {
        color: var(--mat-sys-on-surface);
        font-weight: var(--font-weight-semibold);
        line-height: var(--leading-tight);
        scroll-margin-top: 6rem;
      }

      .article-content :where(h1) {
        font-size: var(--text-4xl);
      }

      .article-content :where(h2) {
        font-size: var(--text-3xl);
      }

      .article-content :where(h3) {
        font-size: var(--text-2xl);
      }

      .article-content :where(h4, h5, h6) {
        font-size: var(--text-xl);
      }

      .article-content :where(p) {
        overflow-wrap: anywhere;
      }

      .article-content :where(.article-content-align-center) {
        text-align: center;
      }

      .article-content :where(.article-content-align-right) {
        text-align: right;
      }

      .article-content :where(.article-content-align-justify) {
        text-align: justify;
      }

      .article-content :where(ul),
      .article-content :where(ol) {
        padding-left: 1.5rem;
      }

      .article-content :where(ul) {
        list-style: disc;
      }

      .article-content :where(ol) {
        list-style: decimal;
      }

      .article-content :where(blockquote) {
        border-left: 3px solid var(--mat-sys-outline-variant);
        color: var(--mat-sys-on-surface-variant);
        font-style: italic;
        margin-block: 1.25rem;
        padding-left: 1rem;
      }

      .article-content :where(blockquote > :first-child) {
        margin-top: 0;
      }

      .article-content :where(hr) {
        border: 0;
        border-top: 1px solid var(--mat-sys-outline-variant);
        margin-block: 2rem;
      }

      .article-content :where(a) {
        color: var(--mat-sys-primary);
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .article-content :where(code) {
        border-radius: 0.25rem;
        background: var(--mat-sys-surface-container-high);
        color: var(--mat-sys-on-surface);
        font-family: var(--font-mono);
        font-size: 0.92em;
        padding: 0.125rem 0.25rem;
      }

      .article-content :where(pre) {
        overflow-x: auto;
        border-radius: 0.5rem;
        background: #282c34;
        color: #abb2bf;
        font-family: var(--font-mono);
        margin-block: 1.25rem;
        max-width: 100%;
        padding: 1rem;
      }

      .article-content :where(pre code) {
        background: transparent;
        color: inherit;
        display: block;
        font-size: var(--text-sm);
        line-height: var(--leading-6);
        padding: 0;
      }

      .article-content :where(.hljs-comment, .hljs-quote) {
        color: #7f848e;
        font-style: italic;
      }

      .article-content :where(.hljs-doctag, .hljs-keyword, .hljs-formula) {
        color: #c678dd;
      }

      .article-content :where(.hljs-section, .hljs-name, .hljs-selector-tag, .hljs-deletion, .hljs-subst) {
        color: #e06c75;
      }

      .article-content :where(.hljs-literal, .hljs-number) {
        color: #d19a66;
      }

      .article-content :where(.hljs-string, .hljs-regexp, .hljs-addition, .hljs-attribute, .hljs-meta-string) {
        color: #98c379;
      }

      .article-content :where(.hljs-built_in, .hljs-class .hljs-title) {
        color: #e6c07b;
      }

      .article-content
        :where(
          .hljs-attr,
          .hljs-variable,
          .hljs-template-variable,
          .hljs-type,
          .hljs-selector-class,
          .hljs-selector-attr
        ) {
        color: #d19a66;
      }

      .article-content :where(.hljs-symbol, .hljs-bullet, .hljs-link, .hljs-meta, .hljs-selector-id, .hljs-title) {
        color: #61afef;
      }

      .article-content :where(.hljs-emphasis) {
        font-style: italic;
      }

      .article-content :where(.hljs-strong) {
        font-weight: var(--font-weight-semibold);
      }

      .article-content :where(img) {
        border-radius: 0.5rem;
        max-width: 100%;
      }
    `
  ]
})
export class ArticleContent {
  readonly content = input<unknown>('');

  protected readonly renderedContent = computed(() => contentToHtml(this.content()));
}
