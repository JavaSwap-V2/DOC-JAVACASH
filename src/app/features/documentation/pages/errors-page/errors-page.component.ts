import { Component, ViewEncapsulation } from '@angular/core';

interface ErrorCode {
  code: number;
  name: string;
  description: string;
  causes: string[];
  solution: string;
  example?: string;
}

@Component({
  selector: 'app-errors-page',
  templateUrl: './errors-page.component.html',
  styleUrls: ['./errors-page.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ErrorsPageComponent {
  errorCodes: ErrorCode[] = [
    {
      code: 400,
      name: 'Bad Request',
      description: 'La petición contiene datos inválidos o mal formateados.',
      causes: [
        'JSON mal formado en el body',
        'Campos requeridos faltantes',
        'Valores fuera de rango permitido',
        'Formato de fecha incorrecto'
      ],
      solution: 'Verifica que todos los campos requeridos estén presentes y tengan el formato correcto.',
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
      name: 'Unauthorized',
      description: 'La API Key es inválida, está ausente o ha sido revocada.',
      causes: [
        'API Key incorrecta',
        'Header x-api-key faltante',
        'API Key deshabilitada',
        'API Key expirada'
      ],
      solution: 'Verifica que estés usando la API Key correcta en el header x-api-key.',
      example: `{
  "success": false,
  "message": "Invalid API key or missing authentication",
  "code": 401,
  "error": "Unauthorized"
}`
    },
    {
      code: 403,
      name: 'Forbidden',
      description: 'No tienes permisos para acceder a este recurso.',
      causes: [
        'API Key sin permisos suficientes',
        'Acceso a recurso de otra cuenta',
        'Plan no incluye esta funcionalidad'
      ],
      solution: 'Contacta con soporte para verificar los permisos de tu cuenta.',
      example: `{
  "success": false,
  "message": "Access denied to this resource",
  "code": 403,
  "error": "Forbidden"
}`
    },
    {
      code: 404,
      name: 'Not Found',
      description: 'El recurso solicitado no existe.',
      causes: [
        'ID de transacción inexistente',
        'Endpoint incorrecto',
        'Recurso eliminado'
      ],
      solution: 'Verifica que el ID del recurso sea correcto y que el endpoint exista.',
      example: `{
  "success": false,
  "message": "Transaction not found",
  "code": 404,
  "error": "Not Found"
}`
    },
    {
      code: 422,
      name: 'Unprocessable Entity',
      description: 'La petición está bien formada pero contiene errores de lógica de negocio.',
      causes: [
        'Transacción duplicada',
        'Monto insuficiente',
        'Cuenta de destino inválida',
        'Fecha de vencimiento en el pasado'
      ],
      solution: 'Revisa la lógica de negocio y los datos enviados.',
      example: `{
  "success": false,
  "message": "Ya tienes una transacción similar en revisión",
  "code": 422,
  "error": "Unprocessable Entity"
}`
    },
    {
      code: 429,
      name: 'Too Many Requests',
      description: 'Has excedido el límite de peticiones permitidas.',
      causes: [
        'Demasiadas peticiones en corto tiempo',
        'Rate limit excedido',
        'Comportamiento sospechoso detectado'
      ],
      solution: 'Implementa backoff exponencial y respeta los rate limits.',
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
      name: 'Internal Server Error',
      description: 'Error interno del servidor. El equipo de JavaCash ha sido notificado.',
      causes: [
        'Error inesperado en el servidor',
        'Problema de base de datos',
        'Servicio temporal no disponible'
      ],
      solution: 'Reintenta la petición. Si persiste, contacta a soporte.',
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
      name: 'Service Unavailable',
      description: 'El servicio está temporalmente no disponible, generalmente por mantenimiento.',
      causes: [
        'Mantenimiento programado',
        'Sobrecarga del sistema',
        'Actualización en progreso'
      ],
      solution: 'Espera unos minutos y reintenta. Verifica el status en status.javacash.finance',
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
