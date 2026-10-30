import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Renderiza un subconjunto seguro de Markdown a HTML: encabezados (`##`),
 * negrita (`**`), código en línea (`` ` ``), listas (`-`) y enlaces http(s).
 * Primero escapa el HTML para que el contenido no pueda inyectar etiquetas;
 * luego aplica las transformaciones, así el HTML resultante es de confianza.
 */
@Pipe({ name: 'markdown' })
export class MarkdownPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string | null | undefined): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.render(value || ''));
  }

  private render(markdown: string): string {
    const processedMarkdown = markdown.replace(/\\n/g, '\n');
    const lines = this.escape(processedMarkdown.trim()).split(/\r?\n/);
    const html: string[] = [];
    let paragraph: string[] = [];
    let listOpen = false;

    const flushParagraph = (): void => {
      if (paragraph.length > 0) {
        html.push(`<p>${paragraph.join(' ')}</p>`);
        paragraph = [];
      }
    };

    const closeList = (): void => {
      if (listOpen) {
        html.push('</ul>');
        listOpen = false;
      }
    };

    for (const rawLine of lines) {
      const line = rawLine.trim();

      if (!line) {
        flushParagraph();
        closeList();
        continue;
      }

      const heading = line.match(/^(#{1,6})\s+(.*)$/);
      if (heading) {
        flushParagraph();
        closeList();
        const level = heading[1].length;
        html.push(`<h${level}>${this.inline(heading[2])}</h${level}>`);
        continue;
      }

      const bullet = line.match(/^[-*]\s+(.*)$/);
      if (bullet) {
        flushParagraph();
        if (!listOpen) {
          html.push('<ul>');
          listOpen = true;
        }
        html.push(`<li>${this.inline(bullet[1])}</li>`);
        continue;
      }

      paragraph.push(this.inline(line));
    }

    flushParagraph();
    closeList();
    return html.join('');
  }

  private inline(text: string): string {
    return text
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(
        /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener">$1</a>'
      );
  }

  private escape(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
