import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { Endpoint } from '@core/models/api.models';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TranslationService } from '@core/services/translation.service';
import { firstValueFrom } from 'rxjs';

interface TryItOutRequest {
  headers: { [key: string]: string };
  body: any;
}

interface TryItOutResponse {
  status: number;
  statusText: string;
  body: any;
  headers: { [key: string]: string };
  time: number;
}

@Component({
  selector: 'app-try-it-out',
  templateUrl: './try-it-out.component.html',
  styleUrls: ['./try-it-out.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TryItOutComponent implements OnInit {
  @Input() endpoint!: Endpoint;

  apiKey = '';
  requestBody = '';
  response?: TryItOutResponse;
  loading = false;
  error = '';
  isExpanded = false;

  constructor(private http: HttpClient, private translationService: TranslationService) {}

  ngOnInit(): void {
    // Inicializar body con ejemplo si existe
    if (this.endpoint.requestBody?.example) {
      this.requestBody = JSON.stringify(this.endpoint.requestBody.example, null, 2);
    }

    // Cargar API Key guardada
    const savedKey = localStorage.getItem('javacash-api-key');
    if (savedKey) {
      this.apiKey = savedKey;
    }
  }

  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }

  async sendRequest(): Promise<void> {
    if (!this.apiKey.trim()) {
      this.error = this.translationService.translate('tryItOut.missingApiKey');
      return;
    }

    this.loading = true;
    this.error = '';
    this.response = undefined;

    // Guardar API Key
    localStorage.setItem('javacash-api-key', this.apiKey);

    const startTime = Date.now();
    const url = `${this.endpoint.baseUrl}${this.endpoint.path}`;

    try {
      // Preparar headers
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey
      });

      // Preparar body
      let body = null;
      if (this.requestBody && this.endpoint.method !== 'GET') {
        try {
          body = JSON.parse(this.requestBody);
        } catch (e) {
          throw new Error(this.translationService.translate('tryItOut.invalidJson'));
        }
      }

      // Hacer request
      const response: any = await firstValueFrom(this.http.request(
        this.endpoint.method,
        url,
        {
          headers,
          body,
          observe: 'response'
        }
      ));

      const endTime = Date.now();

      this.response = {
        status: response.status,
        statusText: response.statusText,
        body: response.body,
        headers: this.extractHeaders(response.headers),
        time: endTime - startTime
      };

    } catch (err: any) {
      const endTime = Date.now();
      
      if (err.error) {
        this.response = {
          status: err.status || 0,
          statusText: err.statusText || 'Error',
          body: err.error,
          headers: this.extractHeaders(err.headers),
          time: endTime - startTime
        };
      } else {
        this.error = err.message || this.translationService.translate('tryItOut.unknownError');
      }
    } finally {
      this.loading = false;
    }
  }

  private extractHeaders(headers: any): { [key: string]: string } {
    const result: { [key: string]: string } = {};
    if (headers && headers.keys) {
      headers.keys().forEach((key: string) => {
        result[key] = headers.get(key);
      });
    }
    return result;
  }

  clearApiKey(): void {
    this.apiKey = '';
    localStorage.removeItem('javacash-api-key');
  }

  getStatusClass(): string {
    if (!this.response) return '';
    const status = this.response.status;
    if (status >= 200 && status < 300) return 'success';
    if (status >= 400 && status < 500) return 'warning';
    if (status >= 500) return 'error';
    return '';
  }
}
