// ============================================
// code-block.component.ts
// ============================================

import { Component, Input, Output, EventEmitter, AfterViewInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { CodeLanguage } from '@core/models/api.models';

@Component({
  selector: 'app-code-block',
  templateUrl: './code-block.component.html',
  styleUrls: ['./code-block.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CodeBlockComponent implements AfterViewInit {
  @Input() code: string = '';
  @Input() language: CodeLanguage = 'javascript';
  @Input() title?: string;
  @Input() showLineNumbers: boolean = false;
  @Input() highlightLines?: number[];
  @Input() maxHeight?: string;

  @Output() copied = new EventEmitter<void>();

  @ViewChild('codeElement') codeElement?: ElementRef<HTMLElement>;

  isCopied: boolean = false;
  lines: string[] = [];

  ngAfterViewInit(): void {
    this.processCode();
    this.highlightCode();
  }

  ngOnChanges(): void {
    this.processCode();
    if (this.codeElement) {
      this.highlightCode();
    }
  }

  private processCode(): void {
    this.lines = this.code.split('\n');
  }

  private highlightCode(): void {
    // Aquí se integraría Prism.js o highlight.js
    // import Prism from 'prismjs';
    // if (this.codeElement) {
    //   Prism.highlightElement(this.codeElement.nativeElement);
    // }
  }

  async copyToClipboard(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.code);
      this.isCopied = true;
      this.copied.emit();

      setTimeout(() => {
        this.isCopied = false;
      }, 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  }

  isLineHighlighted(lineNumber: number): boolean {
    return this.highlightLines?.includes(lineNumber) ?? false;
  }

  getLanguageDisplay(): string {
    const languageMap: Record<CodeLanguage, string> = {
      curl: 'cURL',
      javascript: 'JavaScript',
      python: 'Python',
      php: 'PHP',
      java: 'Java',
      go: 'Go',
      ruby: 'Ruby',
      bash: 'Bash'
    };
    return languageMap[this.language] || this.language;
  }
}
