// ============================================
// endpoint.model.ts
// Modelos para Endpoints de la API
// ============================================

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type ParameterType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'date';

export type ParameterLocation = 'header' | 'path' | 'query' | 'body';

export interface Endpoint {
  id: string;
  name: string;
  method: HttpMethod;
  path: string;
  baseUrl: string;
  description: string;
  category: 'payin' | 'payout';
  headers: Header[];
  pathParameters?: Parameter[];
  queryParameters?: Parameter[];
  requestBody?: RequestBody;
  responses: ApiResponse[];
  examples: CodeExample[];
  tags?: string[];
}

export interface Header {
  name: string;
  value: string;
  required: boolean;
  description?: string;
}

export interface Parameter {
  name: string;
  type: ParameterType;
  required: boolean;
  description: string;
  example?: any;
  defaultValue?: any;
  enum?: string[];
  pattern?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  location: ParameterLocation;
}

export interface RequestBodyField {
  name: string;
  type: string;
  example: string;
  description: string;
  required: boolean;
}

export interface RequestBody {
  contentType: string;
  description?: string;
  schema: any;
  example?: any;
  required: boolean;
  fields?: RequestBodyField[];
}

export interface ApiResponse {
  status: number;
  statusText: string;
  description: string;
  body: any;
  headers?: Header[];
  isError: boolean;
}

export interface CodeExample {
  language: CodeLanguage;
  code: string;
  title?: string;
}

export type CodeLanguage = 'curl' | 'javascript' | 'python' | 'php' | 'java' | 'go' | 'ruby' | 'bash';

export interface EndpointGroup {
  name: string;
  description: string;
  endpoints: Endpoint[];
  icon?: string;
}

// ============================================
// country.model.ts
// Configuración por País
// ============================================

export type CountryCode = 'ARG' | 'ECU' | 'CHL' | 'GTM' | 'PER';

/**
 * Documento de identidad que la API espera en `userIdentificationNumber`.
 * Varía por país, por eso se documenta junto al resto de la configuración.
 */
export interface CountryIdentification {
  /** Nombre local del documento (CUIT/CUIL, Cédula, RUT, DPI, DNI...) */
  label: string;
  /** Valor de ejemplo, con el mismo formato que acepta la API */
  example: string;
  /** Aclaración de formato que se muestra en las tablas de parámetros */
  hint: string;
}

/** Terminología bancaria local para el enum `userTypeAccount` de la API. */
export interface CountryAccountTypes {
  /** Nombre local de `savings` */
  savings: string;
  /** Nombre local de `checking` */
  checking: string;
}

export interface Country {
  code: CountryCode;
  name: string;
  fullName: string;
  currency: string;
  currencySymbol: string;
  flag: string;
  /** URL base de la API de producción */
  baseUrl: string;
  /** Dashboard de cliente donde se obtiene la API Key */
  dashboardUrl: string;
  locale: string;
  timezone: string;
  /**
   * `false` mientras el ambiente del país no esté publicado.
   * La documentación se muestra igual, marcada como próximamente.
   */
  available: boolean;
  identification: CountryIdentification;
  accountTypes: CountryAccountTypes;
  /** Banco de ejemplo usado en los payloads de PayOut */
  exampleBank: string;
  /** Teléfono de ejemplo, sin prefijo de país */
  examplePhone: string;
}

/**
 * Ambiente compartido de Sandbox / Staging: es único para todos los países.
 */
export const SANDBOX = {
  name: 'Sandbox',
  dashboardUrl: 'https://stagin.javacash.finance',
  baseUrl: 'https://api-dev.javacash.finance'
};

export const COUNTRIES: Record<CountryCode, Country> = {
  ARG: {
    code: 'ARG',
    name: 'Argentina',
    fullName: 'República Argentina',
    currency: 'ARS',
    currencySymbol: '$',
    flag: '🇦🇷',
    baseUrl: 'https://api-ar.javacash.finance',
    dashboardUrl: 'https://argentina.javacash.finance',
    locale: 'es-AR',
    timezone: 'America/Argentina/Buenos_Aires',
    available: true,
    identification: {
      label: 'CUIT/CUIL',
      example: '20123456789',
      hint: 'CUIT/CUIL del comprador, 11 dígitos sin guiones'
    },
    accountTypes: {
      savings: 'Caja de Ahorro',
      checking: 'Cuenta Corriente'
    },
    exampleBank: 'Banco Galicia',
    examplePhone: '1123456789'
  },
  ECU: {
    code: 'ECU',
    name: 'Ecuador',
    fullName: 'República del Ecuador',
    currency: 'USD',
    currencySymbol: '$',
    flag: '🇪🇨',
    baseUrl: 'https://api-ec.javacash.finance',
    dashboardUrl: 'https://ecuador.javacash.finance',
    locale: 'es-EC',
    timezone: 'America/Guayaquil',
    available: true,
    identification: {
      label: 'Cédula / RUC',
      example: '1712345678',
      hint: 'Cédula de 10 dígitos o RUC de 13 dígitos, sin guiones'
    },
    accountTypes: {
      savings: 'Cuenta de Ahorros',
      checking: 'Cuenta Corriente'
    },
    exampleBank: 'Banco Pichincha',
    examplePhone: '987654321'
  },
  CHL: {
    code: 'CHL',
    name: 'Chile',
    fullName: 'República de Chile',
    currency: 'CLP',
    currencySymbol: '$',
    flag: '🇨🇱',
    baseUrl: 'https://api-cl.javacash.finance',
    dashboardUrl: 'https://chile.javacash.finance',
    locale: 'es-CL',
    timezone: 'America/Santiago',
    available: false,
    identification: {
      label: 'RUT',
      example: '121234567',
      hint: 'RUT del comprador sin puntos ni guion, incluyendo el dígito verificador'
    },
    accountTypes: {
      savings: 'Cuenta de Ahorro',
      checking: 'Cuenta Corriente / Cuenta Vista'
    },
    exampleBank: 'Banco de Chile',
    examplePhone: '912345678'
  },
  GTM: {
    code: 'GTM',
    name: 'Guatemala',
    fullName: 'República de Guatemala',
    currency: 'GTQ',
    currencySymbol: 'Q',
    flag: '🇬🇹',
    baseUrl: 'https://api-gt.javacash.finance',
    dashboardUrl: 'https://guatemala.javacash.finance',
    locale: 'es-GT',
    timezone: 'America/Guatemala',
    available: false,
    identification: {
      label: 'DPI / NIT',
      example: '1234567890101',
      hint: 'DPI (CUI) de 13 dígitos o NIT, sin guiones'
    },
    accountTypes: {
      savings: 'Cuenta de Ahorro',
      checking: 'Cuenta Monetaria'
    },
    exampleBank: 'Banco Industrial',
    examplePhone: '51234567'
  },
  PER: {
    code: 'PER',
    name: 'Perú',
    fullName: 'República del Perú',
    currency: 'PEN',
    currencySymbol: 'S/',
    flag: '🇵🇪',
    baseUrl: 'https://api-pe.javacash.finance',
    dashboardUrl: 'https://peru.javacash.finance',
    locale: 'es-PE',
    timezone: 'America/Lima',
    available: false,
    identification: {
      label: 'DNI / RUC',
      example: '12345678',
      hint: 'DNI de 8 dígitos o RUC de 11 dígitos, sin guiones'
    },
    accountTypes: {
      savings: 'Cuenta de Ahorros',
      checking: 'Cuenta Corriente'
    },
    exampleBank: 'Banco de Crédito del Perú (BCP)',
    examplePhone: '912345678'
  }
};

/** Países listados en el orden en que se muestran en la documentación. */
export const COUNTRY_LIST: Country[] = [
  COUNTRIES.ARG,
  COUNTRIES.ECU,
  COUNTRIES.CHL,
  COUNTRIES.GTM,
  COUNTRIES.PER
];

// ============================================
// postman.model.ts
// Estructura de Postman Collection
// ============================================

export interface PostmanCollection {
  info: PostmanInfo;
  item: PostmanItem[];
  auth?: PostmanAuth;
  variable?: PostmanVariable[];
}

export interface PostmanInfo {
  _postman_id: string;
  name: string;
  description?: string;
  schema: string;
}

export interface PostmanItem {
  name: string;
  description?: string;
  item?: PostmanItem[];
  request?: PostmanRequest;
  response?: PostmanResponse[];
  event?: PostmanEvent[];
}

export interface PostmanRequest {
  method: string;
  header: PostmanHeader[];
  body?: PostmanBody;
  url: PostmanUrl | string;
  description?: string;
  auth?: PostmanAuth;
}

export interface PostmanHeader {
  key: string;
  value: string;
  type?: string;
  disabled?: boolean;
  description?: string;
}

export interface PostmanBody {
  mode: 'raw' | 'urlencoded' | 'formdata' | 'file' | 'graphql';
  raw?: string;
  options?: any;
  urlencoded?: Array<{ key: string; value: string; type?: string }>;
  formdata?: Array<{ key: string; value: string; type?: string }>;
}

export interface PostmanUrl {
  raw: string;
  protocol?: string;
  host?: string[];
  path?: string[];
  query?: Array<{ key: string; value: string }>;
  variable?: PostmanVariable[];
}

export interface PostmanResponse {
  name: string;
  originalRequest: PostmanRequest;
  status: string;
  code: number;
  _postman_previewlanguage: string;
  header: PostmanHeader[];
  cookie?: any[];
  body: string;
}

export interface PostmanAuth {
  type: string;
  apikey?: Array<{ key: string; value: string; type: string }>;
  bearer?: Array<{ key: string; value: string; type: string }>;
}

export interface PostmanVariable {
  key: string;
  value: string;
  type?: string;
}

export interface PostmanEvent {
  listen: string;
  script: {
    type: string;
    exec: string[];
  };
}

// ============================================
// search.model.ts
// Modelos para Búsqueda
// ============================================

export interface SearchResult {
  id: string;
  type: 'endpoint' | 'documentation' | 'example';
  title: string;
  description: string;
  path: string;
  category?: string;
  method?: HttpMethod;
  relevance: number;
  highlights?: SearchHighlight[];
}

export interface SearchHighlight {
  field: string;
  snippet: string;
  matchedText: string;
}

export interface SearchOptions {
  query: string;
  country?: CountryCode;
  category?: string;
  method?: HttpMethod;
  limit?: number;
}

// ============================================
// ui.model.ts
// Modelos de UI
// ============================================

export interface Tab {
  id: string;
  label: string;
  icon?: string;
  badge?: string | number;
  disabled?: boolean;
}

export interface Breadcrumb {
  label: string;
  path?: string;
  icon?: string;
}

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  path?: string;
  children?: MenuItem[];
  badge?: string | number;
  expanded?: boolean;
  disabled?: boolean;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
}

export interface Modal {
  id: string;
  title: string;
  content: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  actions?: ModalAction[];
}

export interface ModalAction {
  label: string;
  variant: 'primary' | 'secondary' | 'danger';
  onClick: () => void;
}

export type Theme = 'light' | 'dark' | 'auto';

export interface ThemeConfig {
  mode: Theme;
  accentColor?: string;
  fontSize?: 'sm' | 'md' | 'lg';
}

// ============================================
// error.model.ts
// Modelos de Error
// ============================================

export interface ApiError {
  code: number;
  message: string;
  details?: string;
  timestamp?: string;
  path?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export const HTTP_STATUS_CODES: Record<number, string> = {
  200: 'OK',
  201: 'Created',
  204: 'No Content',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable'
};

export const ERROR_CATEGORIES: Record<number, 'client' | 'server'> = {
  400: 'client',
  401: 'client',
  403: 'client',
  404: 'client',
  422: 'client',
  429: 'client',
  500: 'server',
  502: 'server',
  503: 'server'
};
