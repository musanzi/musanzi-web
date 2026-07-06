import { Component, computed, input } from '@angular/core';
import { common, createLowlight } from 'lowlight';

const lowlight = createLowlight(common);

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function parseInlineMarkdown(value: string): string {
  let html = escapeHtml(value);

  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/~~([^~]+)~~/g, '<s>$1</s>');

  return html;
}

function renderHighlightedCode(value: string, language: string): string {
  try {
    const tree = language && lowlight.registered(language) ? lowlight.highlight(language, value) : lowlight.highlightAuto(value);

    return renderLowlightNodes(tree.children);
  } catch {
    return escapeHtml(value);
  }
}

function renderLowlightNodes(nodes: { properties?: { className?: unknown }; type?: string; value?: string; children?: unknown[] }[]): string {
  return nodes
    .map((node) => {
      if (node.type === 'text') {
        return escapeHtml(node.value ?? '');
      }

      const className = Array.isArray(node.properties?.className)
        ? node.properties.className.map(String).join(' ')
        : '';
      const children = Array.isArray(node.children)
        ? renderLowlightNodes(
            node.children as {
              properties?: { className?: unknown };
              type?: string;
              value?: string;
              children?: unknown[];
            }[]
          )
        : '';

      return className ? `<span class="${escapeHtml(className)}">${children}</span>` : children;
    })
    .join('');
}

function markdownToHtml(value: string): string {
  const lines = value.replace(/\r\n/g, '\n').split('\n');
  const html: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index] ?? '';

    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (line.startsWith('```')) {
      const language = escapeHtml(line.slice(3).trim());
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
      const highlightedCode = renderHighlightedCode(code, language);
      const languageClass = language ? ` class="language-${language}"` : '';
      html.push(`<pre><code${languageClass}>${highlightedCode}</code></pre>`);
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
  template: `
    <div
      class="article-content text-lg leading-8 text-gray-700 dark:text-gray-300"
      [innerHTML]="renderedContent()"></div>
  `,
  styles: [
    `
      .article-content :where(* + *) {
        margin-top: 1.25rem;
      }

      .article-content :where(h1, h2, h3, h4, h5, h6) {
        color: var(--mat-sys-on-surface);
        font-weight: var(--font-weight-semibold);
        line-height: var(--leading-tight);
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
        padding-left: 1rem;
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
    `
  ]
})
export class ArticleContent {
  readonly content = input<string>('');

  protected readonly renderedContent = computed(() => markdownToHtml(this.content()));
}
