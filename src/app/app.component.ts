import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ThemeService } from './core/services/theme.service';
import { EndpointService } from './core/services/endpoint.service';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
  styles: []
})
export class AppComponent implements OnInit {

  constructor(
    private themeService: ThemeService,
    private endpointService: EndpointService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Inicializar tema
    this.themeService.setTheme(this.themeService.getCurrentTheme());

    // El país de la URL manda sobre el recordado: así una URL directa como
    // /gtm/api/... abre la documentación de Guatemala. Se aplica al cargar y
    // en cada navegación posterior.
    this.syncCountryWithUrl(this.getCurrentPath());
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(event => this.syncCountryWithUrl(event.urlAfterRedirects));

    // Listener para Ctrl+K (búsqueda)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Aquí se abriría el modal de búsqueda
        console.log('Búsqueda activada');
      }
    });
  }

  /**
   * Alinea el país actual con el de la URL. Si no hay país en la URL, deja
   * cargado el país actual (recordado en sessionStorage o el de por defecto).
   */
  private syncCountryWithUrl(url: string): void {
    const segments = url.split('#')[0].split('?')[0].split('/').filter(Boolean);
    const code = this.endpointService.resolveCountryCode(segments[0]);

    if (code && segments[1] === 'api') {
      if (code !== this.endpointService.getCurrentCountry()) {
        this.endpointService.setCurrentCountry(code);
      }
      return;
    }

    // Sin país en la URL: garantizar que el país actual esté cargado.
    this.endpointService
      .loadEndpointsForCountry(this.endpointService.getCurrentCountry())
      .subscribe();
  }

  /**
   * Ruta del navegador tal como se escribió (antes de redirects del router),
   * para no perder el país en URLs que redirigen.
   */
  private getCurrentPath(): string {
    return typeof window !== 'undefined' ? window.location.pathname : '/';
  }
}
