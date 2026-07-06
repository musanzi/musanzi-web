import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Editor } from '@tiptap/core';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import StarterKit from '@tiptap/starter-kit';
import { common, createLowlight } from 'lowlight';
import { ITextEditorToolbarAction } from './text-editor.interface';

const lowlight = createLowlight(common);

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

function markdownToHtml(value: string): string {
  if (!value.trim()) {
    return '';
  }

  if (isHtmlContent(value)) {
    return value;
  }

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

      const languageClass = language ? ` class="language-${language}"` : '';
      html.push(`<pre><code${languageClass}>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      html.push('<hr>');
      index += 1;
      continue;
    }

    const headingMatch = /^(#{1,2})\s+(.+)$/.exec(line);

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
      !/^(#{1,2})\s+/.test(lines[index]) &&
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

function parseInlineMarkdown(value: string): string {
  let html = escapeHtml(value);

  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/~~([^~]+)~~/g, '<s>$1</s>');

  return html;
}

@Component({
  selector: 'app-ui-text-editor',
  imports: [CommonModule, MatButtonModule, MatDivider, MatIconModule, MatTooltipModule],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './text-editor.html',
  styles: [
    `
      app-ui-text-editor {
        display: block;
      }

      .text-editor-shell {
        background: var(--mat-sys-surface-container-lowest);
        color: var(--mat-sys-on-surface);
        display: flex;
        flex-direction: column;
      }

      .text-editor-toolbar {
        background: var(--mat-sys-surface-container);
        flex: 0 0 auto;
        position: sticky;
        top: 0;
        z-index: 1;
      }

      .text-editor-content {
        overflow-y: auto;
      }

      .text-editor-disabled .text-editor-content {
        background: var(--mat-sys-surface-container-high);
      }

      .text-editor-content :where(.ProseMirror) {
        min-height: inherit;
        color: inherit;
        font-size: var(--text-md);
        line-height: var(--leading-7);
        outline: none !important;
        outline-offset: 0 !important;
      }

      .text-editor-content :where(.ProseMirror:focus, .ProseMirror-focused) {
        outline: none !important;
      }

      .text-editor-content :where(.ProseMirror > * + *) {
        margin-top: 0.875rem;
      }

      .text-editor-content :where(.ProseMirror p.is-editor-empty:first-child::before) {
        color: var(--mat-sys-on-surface-variant);
        content: attr(data-placeholder);
        float: left;
        height: 0;
        pointer-events: none;
      }

      .text-editor-content :where(.ProseMirror h1) {
        font-size: var(--text-3xl);
        font-weight: var(--font-weight-semibold);
        line-height: var(--leading-8);
      }

      .text-editor-content :where(.ProseMirror h2) {
        font-size: var(--text-2xl);
        font-weight: var(--font-weight-semibold);
        line-height: var(--leading-7);
      }

      .text-editor-content :where(.ProseMirror ul),
      .text-editor-content :where(.ProseMirror ol) {
        padding-left: 1.5rem;
      }

      .text-editor-content :where(.ProseMirror ul) {
        list-style: disc;
      }

      .text-editor-content :where(.ProseMirror ol) {
        list-style: decimal;
      }

      .text-editor-content :where(.ProseMirror blockquote) {
        border-left: 3px solid var(--mat-sys-outline-variant);
        color: var(--mat-sys-on-surface-variant);
        padding-left: 1rem;
      }

      .text-editor-content :where(.ProseMirror a) {
        color: var(--mat-sys-primary);
        text-decoration: underline;
        text-underline-offset: 0.2em;
      }

      .text-editor-content :where(.ProseMirror code) {
        border-radius: 0.25rem;
        background: var(--mat-sys-surface-container-high);
        color: var(--mat-sys-on-surface);
        font-family: var(--font-mono);
        font-size: 0.92em;
        padding: 0.125rem 0.25rem;
      }

      .text-editor-content :where(.ProseMirror pre) {
        overflow-x: auto;
        border-radius: 0.5rem;
        background: #282c34;
        color: #abb2bf;
        font-family: var(--font-mono);
        margin: 1rem 0;
        padding: 1rem;
      }

      .text-editor-content :where(.ProseMirror pre code) {
        background: transparent;
        color: inherit;
        display: block;
        font-size: var(--text-sm);
        line-height: var(--leading-6);
        padding: 0;
      }

      .text-editor-content :where(.hljs-comment, .hljs-quote) {
        color: #5c6370;
        font-style: italic;
      }

      .text-editor-content :where(.hljs-doctag, .hljs-keyword, .hljs-formula) {
        color: #c678dd;
      }

      .text-editor-content :where(.hljs-section, .hljs-name, .hljs-selector-tag, .hljs-deletion, .hljs-subst) {
        color: #e06c75;
      }

      .text-editor-content :where(.hljs-literal, .hljs-number) {
        color: #d19a66;
      }

      .text-editor-content :where(.hljs-string, .hljs-regexp, .hljs-addition, .hljs-attribute, .hljs-meta-string) {
        color: #98c379;
      }

      .text-editor-content :where(.hljs-built_in, .hljs-class .hljs-title) {
        color: #e6c07b;
      }

      .text-editor-content
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

      .text-editor-content :where(.hljs-symbol, .hljs-bullet, .hljs-link, .hljs-meta, .hljs-selector-id, .hljs-title) {
        color: #61afef;
      }

      .text-editor-content :where(.hljs-emphasis) {
        font-style: italic;
      }

      .text-editor-content :where(.hljs-strong) {
        font-weight: var(--font-weight-semibold);
      }

      .text-editor-content :where(.text-editor-image) {
        border-radius: 0.5rem;
        max-width: 100%;
      }
    `
  ]
})
export class UiTextEditor implements AfterViewInit, OnDestroy {
  @ViewChild('editorHost', { static: true }) private readonly editorHost!: ElementRef<HTMLDivElement>;

  readonly disabled = input<boolean>(false);
  readonly errors = input<unknown[]>([]);
  readonly id = input<string>('');
  readonly invalid = input<boolean>(false);
  readonly maxHeight = input<string>('');
  readonly minHeight = input<string>('420px');
  readonly placeholder = input<string>('Start typing...');
  readonly required = input<boolean>(false);
  readonly value = model<string>('');

  readonly touch = output<void>();

  readonly changeDetectorRef = inject(ChangeDetectorRef);

  protected readonly isDisabled = computed(() => this.disabled());
  protected readonly isFocused = signal(false);
  protected readonly toolbarActions: ITextEditorToolbarAction[] = [
    { command: 'bold', icon: 'bold', label: 'Bold' },
    { command: 'italic', icon: 'italic', label: 'Italic' },
    { command: 'heading1', icon: 'heading-1', label: 'Heading 1' },
    { command: 'heading2', icon: 'heading-2', label: 'Heading 2' },
    { command: 'bulletList', icon: 'list', label: 'Bulleted list' },
    { command: 'orderedList', icon: 'list-ordered', label: 'Numbered list' },
    { command: 'blockquote', icon: 'quote', label: 'Quote' },
    { command: 'horizontalRule', icon: 'minus', label: 'Horizontal rule' },
    { command: 'undo', icon: 'undo-2', label: 'Undo' },
    { command: 'redo', icon: 'redo-2', label: 'Redo' }
  ];

  private editor: Editor | null = null;
  private renderedValue = '';

  constructor() {
    effect(() => {
      const value = this.value();

      if (this.editor && this.renderedValue !== value) {
        this.editor.commands.setContent(markdownToHtml(value), { emitUpdate: false });
        this.renderedValue = value;
      }
    });

    effect(() => {
      this.editor?.setEditable(!this.isDisabled());
    });
  }

  ngAfterViewInit(): void {
    this.editor = new Editor({
      element: this.editorHost.nativeElement,
      content: markdownToHtml(this.value()),
      editable: !this.isDisabled(),
      extensions: [
        StarterKit.configure({
          codeBlock: false
        }),
        TextAlign.configure({
          types: ['heading', 'paragraph']
        }),
        Placeholder.configure({
          placeholder: () => this.placeholder()
        }),
        CodeBlockLowlight.configure({
          defaultLanguage: null,
          lowlight
        })
      ],
      onBlur: () => {
        this.isFocused.set(false);
        this.touch.emit();
        this.changeDetectorRef.markForCheck();
      },
      onFocus: () => {
        this.isFocused.set(true);
        this.changeDetectorRef.markForCheck();
      },
      onSelectionUpdate: () => this.changeDetectorRef.markForCheck(),
      onTransaction: () => this.changeDetectorRef.markForCheck(),
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        this.renderedValue = html;
        this.value.set(html);
      }
    });

    this.renderedValue = this.value();
    this.changeDetectorRef.markForCheck();
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
  }

  protected applyAction(command: string): void {
    if (!this.editor || this.isDisabled()) {
      return;
    }

    const chain = this.editor.chain().focus();

    if (command === 'bold') {
      chain.toggleBold().run();
    } else if (command === 'italic') {
      chain.toggleItalic().run();
    } else if (command === 'strike') {
      chain.toggleStrike().run();
    } else if (command === 'heading1') {
      chain.toggleHeading({ level: 1 }).run();
    } else if (command === 'heading2') {
      chain.toggleHeading({ level: 2 }).run();
    } else if (command === 'bulletList') {
      chain.toggleBulletList().run();
    } else if (command === 'orderedList') {
      chain.toggleOrderedList().run();
    } else if (command === 'blockquote') {
      chain.toggleBlockquote().run();
    } else if (command === 'horizontalRule') {
      chain.setHorizontalRule().run();
    } else if (command === 'undo') {
      chain.undo().run();
    } else if (command === 'redo') {
      chain.redo().run();
    }
  }

  protected isActionActive(command: string): boolean {
    if (!this.editor) {
      return false;
    }

    if (command === 'heading1') {
      return this.editor.isActive('heading', { level: 1 });
    }

    if (command === 'heading2') {
      return this.editor.isActive('heading', { level: 2 });
    }

    return this.editor.isActive(command);
  }

  protected isCodeBlockActive(): boolean {
    return this.editor?.isActive('codeBlock') ?? false;
  }

  protected toggleCodeBlock(): void {
    if (!this.editor || this.isDisabled()) {
      return;
    }

    this.editor.chain().focus().toggleCodeBlock().run();
  }
}
