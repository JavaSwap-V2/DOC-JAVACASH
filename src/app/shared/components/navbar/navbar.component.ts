import { Component, OnInit, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs';
import { ThemeService } from '@core/services/theme.service';
import { EndpointService } from '@core/services/endpoint.service';
import { Country, COUNTRIES, CountryCode } from '@core/models/api.models';

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
  countries = Object.values(COUNTRIES);
  showCountryDropdown = false;
  showMobileMenu = false;

  constructor(
    private themeService: ThemeService,
    private endpointService: EndpointService
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
