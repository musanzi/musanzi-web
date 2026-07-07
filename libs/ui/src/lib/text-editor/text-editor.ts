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

@Component({
  selector: 'app-ui-text-editor',
  imports: [CommonModule, MatButtonModule, MatDivider, MatIconModule, MatTooltipModule],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './text-editor.html',
  styleUrl: './text-editor.css'
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
        this.editor.commands.setContent(value, { emitUpdate: false });
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
      content: this.value(),
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
          defaultLanguage: 'typescript',
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
