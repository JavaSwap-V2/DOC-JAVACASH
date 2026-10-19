import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Endpoint, CodeLanguage } from '@core/models/api.models';
import { EndpointService } from '@core/services/endpoint.service';
import { TranslationService } from '@core/services/translation.service';

@Component({
  selector: 'app-endpoint-detail-page',
  templateUrl: './endpoint-detail-page.component.html',
  styleUrls: ['./endpoint-detail-page.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EndpointDetailPageComponent implements OnInit, OnDestroy {
  endpoint?: Endpoint;
  selectedLanguage: CodeLanguage = 'curl';
  selectedResponseStatus: number = 200;
  loading = true;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private endpointService: EndpointService,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    // El estado de carga lo lleva el servicio: al cambiar de país la colección
    // se recarga y los endpoints llegan de forma asíncrona.
    this.endpointService.loading$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(loading => this.loading = loading);

    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      // Un enlace directo a /per/api/... debe mostrar los datos de Perú,
      // no los del país que estuviera cargado.
      const country = this.endpointService.resolveCountryCode(params['country']);
      if (country && country !== this.endpointService.getCurrentCountry()) {
        this.endpointService.setCurrentCountry(country);
      }

      this.loadEndpoint(params['endpointId']);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadEndpoint(id: string): void {
    this.endpointService.getEndpointById(id).pipe(
      takeUntil(this.destroy$)
    ).subscribe(endpoint => {
      this.endpoint = endpoint;

      if (endpoint?.responses && endpoint.responses.length > 0) {
        this.selectedResponseStatus = endpoint.responses[0].status;
      }
    });
  }

  selectLanguage(language: CodeLanguage): void {
    this.selectedLanguage = language;
  }

  selectResponseStatus(status: number): void {
    this.selectedResponseStatus = status;
  }

  getSelectedExample() {
    return this.endpoint?.examples.find(ex => ex.language === this.selectedLanguage);
  }

  getSelectedResponse() {
    return this.endpoint?.responses.find(r => r.status === this.selectedResponseStatus);
  }

  getFullUrl(): string {
    if (!this.endpoint) return '';
    return `${this.endpoint.baseUrl}${this.endpoint.path}`;
  }

  /**
   * Descripción del endpoint traducida si hay clave i18n; si no, la original.
   */
  getDescription(): string {
    if (!this.endpoint) return '';
    return this.endpoint.descriptionKey
      ? this.translationService.translate(this.endpoint.descriptionKey)
      : this.endpoint.description;
  }

  copyUrl(): void {
    const url = this.getFullUrl();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  }
}
