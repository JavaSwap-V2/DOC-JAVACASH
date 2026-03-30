import { Component, OnInit } from '@angular/core';
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
    private endpointService: EndpointService
  ) {}

  ngOnInit(): void {
    // Inicializar tema
    this.themeService.setTheme(this.themeService.getCurrentTheme());
    
    // Cargar endpoints para país por defecto
    this.endpointService.setCurrentCountry('ARG');

    // Listener para Ctrl+K (búsqueda)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Aquí se abriría el modal de búsqueda
        console.log('Búsqueda activada');
      }
    });
  }
}
