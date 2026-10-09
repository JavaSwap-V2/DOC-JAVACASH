import { Component, ViewEncapsulation } from '@angular/core';
import { COUNTRIES } from '@core/models/api.models';

interface ErrorCode {
  code: number;
  nameKey: string;
  descriptionKey: string;
  causesKeys: string[];
  solutionKey: string;
  example?: string;
}

@Component({
  selector: 'app-errors-page',
  templateUrl: './errors-page.component.html',
  styleUrls: ['./errors-page.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ErrorsPageComponent {
  /** País por defecto de los enlaces a la referencia de la API. */
  readonly defaultCountry = COUNTRIES.ARG;

  errorCodes: ErrorCode[] = [
    {
      code: 400,
      nameKey: 'errors.codes.400.name',
      descriptionKey: 'errors.codes.400.description',
      causesKeys: [
        'errors.codes.400.causes.0',
        'errors.codes.400.causes.1',
        'errors.codes.400.causes.2',
        'errors.codes.400.causes.3'
      ],
      solutionKey: 'errors.codes.400.solution',
      example: `{
  "success": false,
  "message": "Validation failed",
  "code": 400,
  "errors": [
    {
      "field": "amount",
      "message": "Amount must be a positive number"
    },
    {
      "field": "userEmail",
      "message": "Invalid email format"
    }
  ]
}`
    },
    {
      code: 401,
      nameKey: 'errors.codes.401.name',
      descriptionKey: 'errors.codes.401.description',
      causesKeys: [
        'errors.codes.401.causes.0',
        'errors.codes.401.causes.1',
        'errors.codes.401.causes.2',
        'errors.codes.401.causes.3'
      ],
      solutionKey: 'errors.codes.401.solution',
      example: `{
  "success": false,
  "message": "Invalid API key or missing authentication",
  "code": 401,
  "error": "Unauthorized"
}`
    },
    {
      code: 403,
      nameKey: 'errors.codes.403.name',
      descriptionKey: 'errors.codes.403.description',
      causesKeys: [
        'errors.codes.403.causes.0',
        'errors.codes.403.causes.1',
        'errors.codes.403.causes.2'
      ],
      solutionKey: 'errors.codes.403.solution',
      example: `{
  "success": false,
  "message": "Access denied to this resource",
  "code": 403,
  "error": "Forbidden"
}`
    },
    {
      code: 404,
      nameKey: 'errors.codes.404.name',
      descriptionKey: 'errors.codes.404.description',
      causesKeys: [
        'errors.codes.404.causes.0',
        'errors.codes.404.causes.1',
        'errors.codes.404.causes.2'
      ],
      solutionKey: 'errors.codes.404.solution',
      example: `{
  "success": false,
  "message": "Transaction not found",
  "code": 404,
  "error": "Not Found"
}`
    },
    {
      code: 422,
      nameKey: 'errors.codes.422.name',
      descriptionKey: 'errors.codes.422.description',
      causesKeys: [
        'errors.codes.422.causes.0',
        'errors.codes.422.causes.1',
        'errors.codes.422.causes.2',
        'errors.codes.422.causes.3'
      ],
      solutionKey: 'errors.codes.422.solution',
      example: `{
  "success": false,
  "message": "Ya tienes una transacción similar en revisión",
  "code": 422,
  "error": "Unprocessable Entity"
}`
    },
    {
      code: 429,
      nameKey: 'errors.codes.429.name',
      descriptionKey: 'errors.codes.429.description',
      causesKeys: [
        'errors.codes.429.causes.0',
        'errors.codes.429.causes.1',
        'errors.codes.429.causes.2'
      ],
      solutionKey: 'errors.codes.429.solution',
      example: `{
  "success": false,
  "message": "Rate limit exceeded. Try again in 60 seconds",
  "code": 429,
  "error": "Too Many Requests",
  "retryAfter": 60
}`
    },
    {
      code: 500,
      nameKey: 'errors.codes.500.name',
      descriptionKey: 'errors.codes.500.description',
      causesKeys: [
        'errors.codes.500.causes.0',
        'errors.codes.500.causes.1',
        'errors.codes.500.causes.2'
      ],
      solutionKey: 'errors.codes.500.solution',
      example: `{
  "success": false,
  "message": "Internal server error. Please try again later",
  "code": 500,
  "error": "Internal Server Error",
  "requestId": "req_abc123xyz"
}`
    },
    {
      code: 503,
      nameKey: 'errors.codes.503.name',
      descriptionKey: 'errors.codes.503.description',
      causesKeys: [
        'errors.codes.503.causes.0',
        'errors.codes.503.causes.1',
        'errors.codes.503.causes.2'
      ],
      solutionKey: 'errors.codes.503.solution',
      example: `{
  "success": false,
  "message": "Service temporarily unavailable",
  "code": 503,
  "error": "Service Unavailable"
}`
    }
  ];

  retryExample = `const maxRetries = 3;
let retries = 0;

async function makeRequestWithRetry() {
  while (retries < maxRetries) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || 60;
        await sleep(retryAfter * 1000);
        retries++;
        continue;
      }
      
      if (response.status >= 500) {
        const backoff = Math.pow(2, retries) * 1000; // Exponential backoff
        await sleep(backoff);
        retries++;
        continue;
      }
      
      return response;
    } catch (error) {
      retries++;
      if (retries >= maxRetries) throw error;
      await sleep(Math.pow(2, retries) * 1000);
    }
  }
  
  throw new Error('Max retries exceeded');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}`;

  getErrorClass(code: number): string {
    if (code >= 400 && code < 500) return 'client-error';
    if (code >= 500) return 'server-error';
    return '';
  }
}
