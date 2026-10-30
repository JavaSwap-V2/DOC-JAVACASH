import { Component, OnInit, HostListener } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ThemeService } from './core/services/theme.service';
import { EndpointService } from './core/services/endpoint.service';
import { TranslationService } from './core/services/translation.service';
import { SearchModalService } from './core/services/search-modal.service';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet><app-toast></app-toast>',
  styles: []
})
export class AppComponent implements OnInit {

  constructor(
    private themeService: ThemeService,
    private endpointService: EndpointService,
    private translationService: TranslationService,
    private searchModalService: SearchModalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.translationService.getCurrentLanguage();
    this.themeService.setTheme(this.themeService.getCurrentTheme());
    this.syncCountryWithUrl(this.getCurrentPath());
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(event => this.syncCountryWithUrl(event.urlAfterRedirects));
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      this.searchModalService.open();
    }
  }

  private syncCountryWithUrl(url: string): void {
    const segments = url.split('#')[0].split('?')[0].split('/').filter(Boolean);
    const code = this.endpointService.resolveCountryCode(segments[0]);

    if (code && segments[1] === 'api') {
      if (code !== this.endpointService.getCurrentCountry()) {
        this.endpointService.setCurrentCountry(code);
      } else {
        this.endpointService.loadEndpointsForCountry(code).subscribe();
      }
      return;
    }

    this.endpointService
      .loadEndpointsForCountry(this.endpointService.getCurrentCountry())
      .subscribe();
  }

  private getCurrentPath(): string {
    return typeof window !== 'undefined' ? window.location.pathname : '/';
  }
}
