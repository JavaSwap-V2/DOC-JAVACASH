// ============================================
// postman-transformer.service.ts
// Servicio para transformar Postman Collections
// ============================================

import { Injectable } from '@angular/core';
import {
  Endpoint,
  EndpointGroup,
  PostmanCollection,
  PostmanItem,
  PostmanRequest,
  PostmanResponse,
  Parameter,
  ApiResponse,
  CodeExample,
  Header,
  RequestBody,
  RequestBodyField,
  HttpMethod
} from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class PostmanTransformerService {

  /**
   * Transforma una Postman Collection completa en un array de grupos de endpoints
   */
  transformCollection(collection: PostmanCollection, category: 'payin' | 'payout'): EndpointGroup[] {
    const groups: EndpointGroup[] = [];

    collection.item.forEach(item => {
      if (item.item && item.item.length > 0) {
        // Es un grupo con sub-items
        const group: EndpointGroup = {
          name: item.name,
          description: item.description || '',
          endpoints: this.transformItems(item.item, category, collection.info.name),
          icon: this.getIconForGroup(item.name)
        };
        groups.push(group);
      }
    });

    return groups;
  }

  /**
   * Transforma un array de PostmanItems en Endpoints
   */
  private transformItems(items: PostmanItem[], category: 'payin' | 'payout', collectionName: string): Endpoint[] {
    return items
      .filter(item => item.request) // Solo items con request
      .map(item => this.transformItem(item, category, collectionName));
  }

  /**
   * Transforma un PostmanItem individual en un Endpoint
   */
  private transformItem(item: PostmanItem, category: 'payin' | 'payout', collectionName: string): Endpoint {
    const request = item.request!;

    return {
      id: this.generateId(item.name, category),
      name: item.name,
      method: this.normalizeMethod(request.method),
      path: this.extractPath(request.url),
      baseUrl: this.extractBaseUrl(collectionName),
      description: this.cleanDescription(request.description || item.description || ''),
      category,
      headers: this.transformHeaders(request.header),
      requestBody: this.transformRequestBody(request.body, request.description || item.description || ''),
      responses: this.transformResponses(item.response || []),
      examples: this.generateCodeExamples(request, this.extractBaseUrl(collectionName)),
      tags: [category, request.method.toLowerCase()]
    };
  }

  /**
   * Genera un ID único basado en el nombre y la categoría
   */
  private generateId(name: string, category: 'payin' | 'payout'): string {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return `${category}-${slug}`;
  }

  /**
   * Normaliza el método HTTP
   */
  private normalizeMethod(method: string): HttpMethod {
    return method.toUpperCase() as HttpMethod;
  }

  /**
   * Extrae la ruta del URL de Postman
   */
  private extractPath(url: any): string {
    if (typeof url === 'string') {
      const match = url.match(/\/api\/.*$/);
      return match ? match[0] : url;
    }
    
    if (url.path) {
      return '/' + url.path.join('/');
    }
    
    return '/api';
  }

  /**
   * Extrae la base URL del nombre de la colección
   */
  private readonly countryBaseUrls: Record<string, string> = {
    argentina: 'https://api-ar.javacash.finance'
  };

  private extractBaseUrl(collectionName: string): string {
    const name = collectionName.toLowerCase();
    for (const [key, url] of Object.entries(this.countryBaseUrls)) {
      if (name.includes(key)) return url;
    }
    return 'https://api-ar.javacash.finance';
  }

  /**
   * Limpia y formatea la descripción
   */
  private cleanDescription(description: string): string {
    return description
      .replace(/\|.*\|/g, '') // Remueve tablas markdown
      .replace(/#{1,6}\s/g, '') // Remueve headers markdown
      .trim();
  }

  /**
   * Transforma headers de Postman
   */
  private transformHeaders(headers: any[]): Header[] {
    if (!headers) return [];
    
    return headers
      .filter(h => !h.disabled)
      .map(h => ({
        name: h.key,
        value: h.value,
        required: h.key === 'x-api-key' || h.key === 'Content-Type',
        description: h.description || this.getHeaderDescription(h.key)
      }));
  }

  /**
   * Obtiene descripción para headers comunes
   */
  private getHeaderDescription(headerName: string): string {
    const descriptions: Record<string, string> = {
      'x-api-key': 'Tu API Key de autenticación',
      'Content-Type': 'Tipo de contenido de la petición',
      'Accept': 'Tipo de contenido aceptado en la respuesta',
      'Authorization': 'Token de autorización'
    };
    return descriptions[headerName] || '';
  }

  /**
   * Transforma el cuerpo de la petición
   */
  private transformRequestBody(body: any, description: string): RequestBody | undefined {
    if (!body || !body.raw) return undefined;

    let parsedBody: any;
    try {
      parsedBody = JSON.parse(body.raw);
    } catch {
      parsedBody = body.raw;
    }

    return {
      contentType: 'application/json',
      description: 'Cuerpo de la petición en formato JSON',
      schema: parsedBody,
      example: parsedBody,
      required: true,
      fields: this.parseFieldsFromDescription(description)
    };
  }

  /**
   * Parsea la tabla markdown de campos desde la descripción del endpoint
   */
  private parseFieldsFromDescription(description: string): RequestBodyField[] {
    if (!description) return [];

    const lines = description.split('\n').filter(line => line.trim().startsWith('|'));
    if (lines.length < 3) return []; // header + separator + at least one row

    // Skip header and separator rows
    const dataRows = lines.slice(2);

    return dataRows.map(row => {
      const cells = row.split('|').map(cell => cell.trim()).filter(cell => cell.length > 0);
      if (cells.length < 4) return null;

      const name = cells[0].replace(/`/g, '');
      const type = cells[1].replace(/\*\*/g, '');
      const example = cells[2].replace(/\[.*?\]\(.*?\)/g, (match) => {
        const text = match.match(/\[(.*?)\]/);
        return text ? text[1] : match;
      });
      const desc = cells[3].replace(/\[.*?\]\(.*?\)/g, (match) => {
        const text = match.match(/\[(.*?)\]/);
        return text ? text[1] : match;
      });
      const required = cells.length >= 5 ? cells[4].toLowerCase() === 'si' : false;

      return { name, type, example, description: desc, required };
    }).filter((field): field is RequestBodyField => field !== null);
  }

  /**
   * Transforma las respuestas de ejemplo
   */
  private transformResponses(responses: PostmanResponse[]): ApiResponse[] {
    if (!responses || responses.length === 0) {
      return this.getDefaultResponses();
    }

    return responses.map(response => {
      let parsedBody: any;
      try {
        parsedBody = JSON.parse(response.body);
      } catch {
        parsedBody = response.body;
      }

      return {
        status: response.code,
        statusText: response.status,
        description: this.getResponseDescription(response.code),
        body: parsedBody,
        headers: this.transformHeaders(response.header),
        isError: response.code >= 400
      };
    });
  }

  /**
   * Obtiene respuestas por defecto si no hay ejemplos
   */
  private getDefaultResponses(): ApiResponse[] {
    return [
      {
        status: 200,
        statusText: 'OK',
        description: 'Petición exitosa',
        body: { success: true, message: 'Operación exitosa' },
        isError: false
      },
      {
        status: 400,
        statusText: 'Bad Request',
        description: 'Petición inválida',
        body: { success: false, message: 'Error en los datos enviados' },
        isError: true
      },
      {
        status: 401,
        statusText: 'Unauthorized',
        description: 'No autorizado',
        body: { success: false, message: 'API Key inválida o faltante' },
        isError: true
      }
    ];
  }

  /**
   * Obtiene descripción para códigos de respuesta
   */
  private getResponseDescription(code: number): string {
    const descriptions: Record<number, string> = {
      200: 'La petición fue exitosa',
      201: 'Recurso creado exitosamente',
      400: 'La petición contiene datos inválidos',
      401: 'No autorizado - API Key inválida o faltante',
      403: 'Acceso prohibido',
      404: 'Recurso no encontrado',
      422: 'Entidad no procesable - Error de validación',
      429: 'Demasiadas peticiones - Rate limit excedido',
      500: 'Error interno del servidor'
    };
    return descriptions[code] || 'Respuesta del servidor';
  }

  /**
   * Genera ejemplos de código en múltiples lenguajes
   */
  private generateCodeExamples(request: PostmanRequest, baseUrl: string): CodeExample[] {
    const examples: CodeExample[] = [];
    const path = this.extractPath(request.url);
    const fullUrl = `${baseUrl}${path}`;
    const body = request.body?.raw ? JSON.parse(request.body.raw) : null;
    const apiKey = 'YOUR_API_KEY';

    // cURL
    examples.push({
      language: 'curl',
      code: this.generateCurlExample(request.method, fullUrl, apiKey, body)
    });

    // JavaScript (Fetch)
    examples.push({
      language: 'javascript',
      code: this.generateJavaScriptExample(request.method, fullUrl, apiKey, body)
    });

    // Python
    examples.push({
      language: 'python',
      code: this.generatePythonExample(request.method, fullUrl, apiKey, body)
    });

    // PHP
    examples.push({
      language: 'php',
      code: this.generatePhpExample(request.method, fullUrl, apiKey, body)
    });

    return examples;
  }

  /**
   * Genera ejemplo cURL
   */
  private generateCurlExample(method: string, url: string, apiKey: string, body: any): string {
    let code = `curl -X ${method} "${url}" \\\n`;
    code += `  -H "Content-Type: application/json" \\\n`;
    code += `  -H "x-api-key: ${apiKey}"`;
    
    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      code += ` \\\n  -d '${JSON.stringify(body, null, 2)}'`;
    }
    
    return code;
  }

  /**
   * Genera ejemplo JavaScript
   */
  private generateJavaScriptExample(method: string, url: string, apiKey: string, body: any): string {
    let code = `const response = await fetch("${url}", {\n`;
    code += `  method: "${method}",\n`;
    code += `  headers: {\n`;
    code += `    "Content-Type": "application/json",\n`;
    code += `    "x-api-key": "${apiKey}"\n`;
    code += `  }`;
    
    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      code += `,\n  body: JSON.stringify(${JSON.stringify(body, null, 2)})`;
    }
    
    code += `\n});\n\n`;
    code += `const data = await response.json();\n`;
    code += `console.log(data);`;
    
    return code;
  }

  /**
   * Genera ejemplo Python
   */
  private generatePythonExample(method: string, url: string, apiKey: string, body: any): string {
    let code = `import requests\n\n`;
    code += `url = "${url}"\n`;
    code += `headers = {\n`;
    code += `    "Content-Type": "application/json",\n`;
    code += `    "x-api-key": "${apiKey}"\n`;
    code += `}\n`;
    
    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      code += `data = ${JSON.stringify(body, null, 2)}\n\n`;
      code += `response = requests.${method.toLowerCase()}(url, headers=headers, json=data)\n`;
    } else {
      code += `\nresponse = requests.${method.toLowerCase()}(url, headers=headers)\n`;
    }
    
    code += `print(response.json())`;
    
    return code;
  }

  /**
   * Genera ejemplo PHP
   */
  private generatePhpExample(method: string, url: string, apiKey: string, body: any): string {
    let code = `<?php\n\n`;
    code += `$url = "${url}";\n`;
    code += `$headers = [\n`;
    code += `    "Content-Type: application/json",\n`;
    code += `    "x-api-key: ${apiKey}"\n`;
    code += `];\n\n`;
    
    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      code += `$data = ${JSON.stringify(body, null, 2)};\n\n`;
      code += `$ch = curl_init($url);\n`;
      code += `curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "${method}");\n`;
      code += `curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));\n`;
    } else {
      code += `$ch = curl_init($url);\n`;
      code += `curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "${method}");\n`;
    }
    
    code += `curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);\n`;
    code += `curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\n\n`;
    code += `$response = curl_exec($ch);\n`;
    code += `curl_close($ch);\n\n`;
    code += `echo $response;\n`;
    code += `?>`;
    
    return code;
  }

  /**
   * Obtiene icono para el grupo basado en el nombre
   */
  private getIconForGroup(groupName: string): string {
    const name = groupName.toLowerCase();
    if (name.includes('payin') || name.includes('pago')) return 'arrow-down-circle';
    if (name.includes('payout') || name.includes('retiro')) return 'arrow-up-circle';
    return 'folder';
  }
}
