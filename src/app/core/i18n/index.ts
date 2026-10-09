import { Language } from '@core/models/api.models';
import { es, TranslationDictionary } from './es';
import { en } from './en';
import { zh } from './zh';

export { TranslationDictionary } from './es';

/** Diccionarios disponibles por idioma. */
export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  es,
  en,
  zh
};
