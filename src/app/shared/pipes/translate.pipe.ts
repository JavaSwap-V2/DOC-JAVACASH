import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslationService } from '@core/services/translation.service';

type TranslateParams = Record<string, string | number>;

/**
 * Traduce una clave i18n y devuelve texto plano. Es impuro para volver a
 * evaluarse cuando cambia el idioma activo.
 */
@Pipe({ name: 't', pure: false })
export class TranslatePipe implements PipeTransform {
  constructor(private translationService: TranslationService) {}

  transform(key: string, params?: TranslateParams): string {
    return this.translationService.translate(key, params);
  }
}

/**
 * Igual que `t` pero devuelve HTML seguro, para claves cuyas traducciones
 * incluyen marcado en línea (`<strong>`, `<code>`, enlaces...). El contenido es
 * estático y de confianza (nunca input del usuario).
 */
@Pipe({ name: 'tHtml', pure: false })
export class TranslateHtmlPipe implements PipeTransform {
  constructor(
    private translationService: TranslationService,
    private sanitizer: DomSanitizer
  ) {}

  transform(key: string, params?: TranslateParams): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(
      this.translationService.translate(key, params)
    );
  }
}
