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

export interface RequestBody {
  contentType: string;
  description?: string;
  schema: any;
  example?: any;
  required: boolean;
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

export type CountryCode = 'ARG';

export interface Country {
  code: CountryCode;
  name: string;
  fullName: string;
  currency: string;
  currencySymbol: string;
  flag: string;
  baseUrl: string;
  locale: string;
  timezone: string;
}

export const COUNTRIES: Record<CountryCode, Country> = {
  ARG: {
    code: 'ARG',
    name: 'Argentina',
    fullName: 'República Argentina',
    currency: 'ARS',
    currencySymbol: '$',
    flag: '🇦🇷',
    baseUrl: 'https://api-ar.javacash.finance',
    locale: 'es-AR',
    timezone: 'America/Argentina/Buenos_Aires'
  }
};

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
