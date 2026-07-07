import { DOCUMENT } from '@angular/common';
import { Component, ViewEncapsulation, computed, inject, input } from '@angular/core';
import { common, createLowlight } from 'lowlight';
import { ILowlightNode } from '../../interfaces';

const defaultCodeLanguage = 'typescript';
const lowlight = createLowlight(common);

@Component({
  selector: 'blog-article-content',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './article-content.html',
  styleUrl: './article-content.css'
})
export class ArticleContent {
  private readonly document = inject(DOCUMENT);

  readonly content = input<string>('');

  protected readonly renderedContent = computed(() => this.renderContent(this.content()));

  private getCodeLanguage(codeElement: HTMLElement): string {
    const languageClass = Array.from(codeElement.classList).find((className) => className.startsWith('language-'));
    const language = languageClass?.replace('language-', '') || defaultCodeLanguage;

    return lowlight.registered(language) ? language : defaultCodeLanguage;
  }

  private renderContent(content: string): string {
    const template = this.document.createElement('template');
    template.innerHTML = content;

    template.content.querySelectorAll<HTMLElement>('pre code').forEach((codeElement) => {
      const language = this.getCodeLanguage(codeElement);
      const highlightedCode = lowlight.highlight(language, codeElement.textContent ?? '');

      codeElement.classList.add('hljs', `language-${language}`);
      codeElement.innerHTML = this.renderLowlightNodes(highlightedCode.children as ILowlightNode[]);
    });

    return template.innerHTML;
  }

  private renderLowlightNode(node: ILowlightNode): string {
    if (node.type === 'text') {
      return this.escapeHtml(node.value ?? '');
    }

    const classNames = this.getLowlightClassNames(node.properties?.className);
    const children = this.renderLowlightNodes(node.children ?? []);

    return classNames ? `<span class="${classNames}">${children}</span>` : children;
  }

  private renderLowlightNodes(nodes: ILowlightNode[]): string {
    return nodes.map((node) => this.renderLowlightNode(node)).join('');
  }

  private getLowlightClassNames(className: unknown): string {
    if (Array.isArray(className)) {
      return className.filter((value): value is string => typeof value === 'string').map((value) => this.escapeAttribute(value)).join(' ');
    }

    return typeof className === 'string' ? this.escapeAttribute(className) : '';
  }

  private escapeAttribute(value: string): string {
    return this.escapeHtml(value).replace(/"/g, '&quot;');
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
