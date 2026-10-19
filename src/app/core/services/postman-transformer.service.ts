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
    const id = this.generateId(item.name, category);

    return {
      id,
      name: item.name,
      nameKey: this.resolveNameKey(item.name),
      method: this.normalizeMethod(request.method),
      path: this.extractPath(request.url),
      baseUrl: this.extractBaseUrl(collectionName),
      description: this.cleanDescription(request.description || item.description || ''),
      descriptionKey: this.resolveDescriptionKey(id),
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
    return `${category}-${this.slugify(name)}`;
  }

  /**
   * Convierte un texto en slug (`Listar por referencia` → `listar-por-referencia`).
   */
  private slugify(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Mapea el nombre del endpoint (tal como viene en la colección Postman, en
   * español) a su clave i18n. Si el endpoint es nuevo y no está mapeado,
   * devuelve `undefined` y la UI muestra el nombre crudo.
   */
  private resolveNameKey(name: string): string | undefined {
    const keysBySlug: Record<string, string> = {
      'registrar': 'register',
      'subir-comprobante': 'uploadReceipt',
      'listar-por-referencia': 'listByReference',
      'listar-por-cliente': 'listByClient',
      'detalle-por-id': 'detailById',
      'listar': 'list'
    };
    const key = keysBySlug[this.slugify(name)];
    return key ? `sidebar.endpoints.${key}` : undefined;
  }

  /**
   * Mapea la descripción en prosa del endpoint (por id, que ya incluye la
   * categoría) a su clave i18n. Devuelve `undefined` si no está mapeada.
   */
  private resolveDescriptionKey(id: string): string | undefined {
    const keysById: Record<string, string> = {
      'payin-registrar': 'noteCheckout',
      'payin-listar-por-referencia': 'listPayinByReference',
      'payin-listar-por-cliente': 'listPayinByCustomId',
      'payin-listar': 'listAllPayin',
      'payin-subir-comprobante': 'uploadReceipt',
      'payin-detalle-por-id': 'payinDetailById',
      'payout-detalle-por-id': 'payoutDetailById',
      'payout-listar-por-referencia': 'listPayoutByReference',
      'payout-listar-por-cliente': 'listPayoutByCustomId',
      'payout-listar': 'listAllPayout'
    };
    const key = keysById[id];
    return key ? `endpoint.descriptions.${key}` : undefined;
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
    argentina: 'https://api-ar.javacash.finance',
    ecuador: 'https://api-ec.javacash.finance',
    chile: 'https://api-cl.javacash.finance',
    guatemala: 'https://api-gt.javacash.finance',
    peru: 'https://api-pe.javacash.finance'
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
      .replace(/^[ \t]*\|.*\|[ \t]*$/gm, '') // Remueve solo las líneas de tabla (se muestran aparte como campos)
      .replace(/\n{3,}/g, '\n\n') // Normaliza los saltos que dejan las tablas
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
        description: h.description || this.getHeaderDescription(h.key),
        descriptionKey: this.resolveHeaderKey(h.key)
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
   * Mapea el nombre de un header a la clave i18n de su descripción.
   */
  private resolveHeaderKey(headerName: string): string | undefined {
    const keysByName: Record<string, string> = {
      'x-api-key': 'apiKey',
      'Content-Type': 'contentType',
      'Accept': 'accept',
      'Authorization': 'authorization'
    };
    const key = keysByName[headerName];
    return key ? `endpoint.headersDesc.${key}` : undefined;
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
      descriptionKey: 'endpoint.requestBodyDescription',
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

    return dataRows.map((row): RequestBodyField | null => {
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
      const required = cells.length >= 5 ? ['si', 'sí'].includes(cells[4].toLowerCase()) : false;

      return { name, type, example, description: desc, descriptionKey: this.resolveFieldKey(name), required };
    }).filter((field): field is RequestBodyField => field !== null);
  }

  /**
   * Mapea el nombre de un campo del body a la clave i18n de su descripción.
   * Solo cubre campos conocidos; el resto conserva la descripción original.
   */
  private resolveFieldKey(name: string): string | undefined {
    const knownFields = [
      'currency', 'amount', 'customId', 'userName', 'userPhone', 'userEmail',
      'userIdentificationNumber', 'dueDate', 'userBank', 'userTypeAccount',
      'userNumAccount', 'file', 'payment_proof', 'recipient_name',
      'recipient_email', 'payment_method', 'recipient_document'
    ];
    return knownFields.includes(name) ? `endpoint.fields.${name}` : undefined;
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
        descriptionKey: this.resolveResponseKey(response.code),
        body: parsedBody,
        headers: this.transformHeaders(response.header),
        isError: response.code >= 400
      };
    });
  }

  /**
   * Mapea un código HTTP a la clave i18n de su descripción.
   */
  private resolveResponseKey(code: number): string | undefined {
    const knownCodes = [200, 201, 400, 401, 403, 404, 422, 429, 500];
    return knownCodes.includes(code) ? `endpoint.responsesDesc.r${code}` : undefined;
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
        descriptionKey: 'endpoint.responsesDesc.r200',
        body: { success: true, message: 'Operación exitosa' },
        isError: false
      },
      {
        status: 400,
        statusText: 'Bad Request',
        description: 'Petición inválida',
        descriptionKey: 'endpoint.responsesDesc.r400',
        body: { success: false, message: 'Error en los datos enviados' },
        isError: true
      },
      {
        status: 401,
        statusText: 'Unauthorized',
        description: 'No autorizado',
        descriptionKey: 'endpoint.responsesDesc.r401',
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
    let body: any = null;
    if (request.body?.raw) {
      try {
        body = JSON.parse(request.body.raw);
      } catch {
        body = null;
      }
    }
    const apiKey = 'YOUR_API_KEY';

    if (path === '/api/manual-payments' && body && typeof body === 'object') {
      return this.generateMultipartExamples(fullUrl, apiKey, body);
    }

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
   * Genera ejemplos multipart/form-data para endpoints que reciben un archivo
   * (por ejemplo, /api/manual-payments con el campo payment_proof).
   */
  private generateMultipartExamples(url: string, apiKey: string, body: Record<string, any>): CodeExample[] {
    const fileKey = 'payment_proof';
    const fileValue = body[fileKey] ?? 'comprobante.jpg';
    const fields = Object.keys(body).filter(key => key !== fileKey);

    // cURL
    let curl = `curl -X POST "${url}" \\\n`;
    curl += `  -H "x-api-key: ${apiKey}" \\\n`;
    curl += `  -F "${fileKey}=@${fileValue}"`;
    for (const key of fields) {
      curl += ` \\\n  -F "${key}=${body[key]}"`;
    }

    // JavaScript (Fetch)
    let js = `const form = new FormData();\n`;
    js += `form.append("${fileKey}", file);\n`;
    for (const key of fields) {
      js += `form.append("${key}", "${body[key]}");\n`;
    }
    js += `\nconst response = await fetch("${url}", {\n`;
    js += `  method: "POST",\n`;
    js += `  headers: {\n`;
    js += `    "x-api-key": "${apiKey}"\n`;
    js += `  },\n`;
    js += `  body: form\n`;
    js += `});\n\n`;
    js += `const data = await response.json();\n`;
    js += `console.log(data);`;

    // Python
    let python = `import requests\n\n`;
    python += `url = "${url}"\n`;
    python += `headers = {\n`;
    python += `    "x-api-key": "${apiKey}"\n`;
    python += `}\n`;
    python += `data = {\n`;
    for (const key of fields) {
      python += `    "${key}": "${body[key]}",\n`;
    }
    python += `}\n`;
    python += `files = {\n`;
    python += `    "${fileKey}": open("${fileValue}", "rb")\n`;
    python += `}\n\n`;
    python += `response = requests.post(url, headers=headers, data=data, files=files)\n`;
    python += `print(response.json())`;

    // PHP
    let php = `<?php\n\n`;
    php += `$url = "${url}";\n`;
    php += `$headers = [\n`;
    php += `    "x-api-key: ${apiKey}"\n`;
    php += `];\n`;
    php += `$data = [\n`;
    php += `    "${fileKey}" => new CURLFile("${fileValue}"),\n`;
    for (const key of fields) {
      php += `    "${key}" => "${body[key]}",\n`;
    }
    php += `];\n\n`;
    php += `$ch = curl_init($url);\n`;
    php += `curl_setopt($ch, CURLOPT_POST, true);\n`;
    php += `curl_setopt($ch, CURLOPT_POSTFIELDS, $data);\n`;
    php += `curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);\n`;
    php += `curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\n\n`;
    php += `$response = curl_exec($ch);\n`;
    php += `curl_close($ch);\n\n`;
    php += `echo $response;\n`;
    php += `?>`;

    return [
      { language: 'curl', code: curl },
      { language: 'javascript', code: js },
      { language: 'python', code: python },
      { language: 'php', code: php }
    ];
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
