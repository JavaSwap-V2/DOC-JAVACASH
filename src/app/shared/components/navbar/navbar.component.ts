import { Component, OnInit, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ThemeService } from '@core/services/theme.service';
import { EndpointService } from '@core/services/endpoint.service';
import { Country, COUNTRIES, COUNTRY_LIST, CountryCode } from '@core/models/api.models';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NavbarComponent implements OnInit {
  @Output() menuToggle = new EventEmitter<void>();
  @Output() searchFocus = new EventEmitter<void>();

  isDarkMode$: Observable<boolean>;
  currentCountry: Country = COUNTRIES.ARG;
  countries = COUNTRY_LIST;
  showCountryDropdown = false;
  showMobileMenu = false;

  constructor(
    private themeService: ThemeService,
    private endpointService: EndpointService,
    private router: Router
  ) {
    this.isDarkMode$ = this.themeService.isDarkMode$;
  }

  ngOnInit(): void {
    this.endpointService.currentCountry$.subscribe(code => {
      this.currentCountry = COUNTRIES[code];
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  selectCountry(country: Country): void {
    this.currentCountry = country;
    this.endpointService.setCurrentCountry(country.code);
    this.showCountryDropdown = false;

    // Si estamos dentro de la referencia de la API, la URL tiene que seguir al
    // país elegido; de lo contrario quedaria /arg/api mostrando otro país.
    const segments = this.router.url.split('#')[0].split('?')[0]
      .split('/').filter(Boolean);

    if (segments[1] === 'api') {
      segments[0] = country.code.toLowerCase();
      this.router.navigate(['/', ...segments]);
    }
  }

  toggleCountryDropdown(): void {
    this.showCountryDropdown = !this.showCountryDropdown;
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
    this.menuToggle.emit();
  }

  onSearchClick(): void {
    this.searchFocus.emit();
  }
}
