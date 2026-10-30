import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DEFAULT_LANGUAGE, Language, SUPPORTED_LANGUAGES } from '@core/models/api.models';
import { TRANSLATIONS } from '@core/i18n';

type TranslateParams = Record<string, string | number>;
type TranslationNode = string | TranslationNode[] | { [key: string]: TranslationNode };

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private static readonly STORAGE_KEY = 'javacash-docs-lang';

  private currentLanguageSubject: BehaviorSubject<Language>;
  readonly currentLanguage$: Observable<Language>;

  constructor() {
    const language = this.resolveInitialLanguage();
    this.currentLanguageSubject = new BehaviorSubject<Language>(language);
    this.currentLanguage$ = this.currentLanguageSubject.asObservable();
    this.applyDocumentLanguage(language);
  }

  getCurrentLanguage(): Language {
    return this.currentLanguageSubject.value;
  }

  setLanguage(language: Language): void {
    if (!SUPPORTED_LANGUAGES.includes(language)) {
      return;
    }
    this.persist(language);
    this.currentLanguageSubject.next(language);
    this.applyDocumentLanguage(language);
  }

  /**
   * Traduce una clave con notación de puntos (`auth.title`). Si la clave no
   * existe en el idioma activo, cae al idioma por defecto y, por último,
   * devuelve la propia clave.
   */
  translate(key: string, params?: TranslateParams): string {
    const language = this.currentLanguageSubject.value;
    const value =
      this.lookup(TRANSLATIONS[language], key) ??
      this.lookup(TRANSLATIONS[DEFAULT_LANGUAGE], key) ??
      key;

    return params ? this.interpolate(value, params) : value;
  }

  /** Lista de traducciones (usada por el pipe impuro para forzar recálculo). */
  get language(): Language {
    return this.currentLanguageSubject.value;
  }

  private lookup(dictionary: TranslationNode, key: string): string | undefined {
    const value = key
      .split('.')
      .reduce<TranslationNode | undefined>(
        (node, part) =>
          node && typeof node === 'object'
            ? (node as { [key: string]: TranslationNode })[part]
            : undefined,
        dictionary
      );
    return typeof value === 'string' ? value : undefined;
  }

  private interpolate(text: string, params: TranslateParams): string {
    return text.replace(/\{(\w+)\}/g, (match, name: string) =>
      params[name] !== undefined && params[name] !== null ? String(params[name]) : match
    );
  }

  private resolveInitialLanguage(): Language {
    const stored = this.readStored();
    if (stored) {
      return stored;
    }
    return this.detectFromBrowser();
  }

  private detectFromBrowser(): Language {
    const browserLanguage =
      typeof navigator !== 'undefined'
        ? navigator.language || (navigator.languages && navigator.languages[0])
        : '';
    const language = (browserLanguage || '').toLowerCase();

    if (language.startsWith('zh')) {
      return 'zh';
    }
    if (language.startsWith('en')) {
      return 'en';
    }
    if (language.startsWith('es')) {
      return 'es';
    }
    return DEFAULT_LANGUAGE;
  }

  private readStored(): Language | null {
    if (typeof sessionStorage === 'undefined') {
      return null;
    }
    const stored = sessionStorage.getItem(TranslationService.STORAGE_KEY) as Language | null;
    return stored && SUPPORTED_LANGUAGES.includes(stored) ? stored : null;
  }

  private persist(language: Language): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(TranslationService.STORAGE_KEY, language);
    }
  }

  private applyDocumentLanguage(language: Language): void {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      document.title = this.translate('meta.title');
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', this.translate('meta.description'));
      }
    }
  }
}
