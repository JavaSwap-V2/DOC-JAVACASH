import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { EndpointService } from '@core/services/endpoint.service';
import { Country, COUNTRY_LIST, CountryCode } from '@core/models/api.models';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HomePageComponent implements OnInit {
  
  countries: Country[] = COUNTRY_LIST;

  exampleCode = `const response = await fetch("https://api-ar.javacash.finance/api/payin/register", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "YOUR_API_KEY"
  },
  body: JSON.stringify({
    currency: "ARS",
    amount: "100",
    userName: "John Doe",
    userEmail: "john@example.com"
  })
});

const data = await response.json();
console.log(data);`;

  features = [
    {
      icon: 'zap',
      titleKey: 'home.features.fastTitle',
      descriptionKey: 'home.features.fastDesc'
    },
    {
      icon: 'globe',
      titleKey: 'home.features.coverageTitle',
      descriptionKey: 'home.features.coverageDesc'
    },
    {
      icon: 'code',
      titleKey: 'home.features.integrationTitle',
      descriptionKey: 'home.features.integrationDesc'
    },
    {
      icon: 'shield',
      titleKey: 'home.features.secureTitle',
      descriptionKey: 'home.features.secureDesc'
    }
  ];

  quickStartSteps = [
    {
      step: 1,
      titleKey: 'home.steps.keyTitle',
      descriptionKey: 'home.steps.keyDesc'
    },
    {
      step: 2,
      titleKey: 'home.steps.configTitle',
      descriptionKey: 'home.steps.configDesc'
    },
    {
      step: 3,
      titleKey: 'home.steps.callTitle',
      descriptionKey: 'home.steps.callDesc'
    }
  ];

  constructor(
    private router: Router,
    private endpointService: EndpointService
  ) {}

  ngOnInit(): void {}

  navigateToCountryDocs(code: CountryCode = 'ARG'): void {
    this.endpointService.setCurrentCountry(code);
    this.router.navigate([code.toLowerCase(), 'api']);
  }

  /** Las tarjetas de país llevan a la introducción, fijando el país para que los ejemplos correspondan. */
  navigateToIntroduction(countryCode: CountryCode): void {
    this.endpointService.setCurrentCountry(countryCode);
    this.router.navigate(['/gateway', 'introduction']);
  }

  navigateToDocs(): void {
    this.router.navigate(['/gateway']);
  }
}
