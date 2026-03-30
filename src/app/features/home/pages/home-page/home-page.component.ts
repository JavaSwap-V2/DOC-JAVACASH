import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { EndpointService } from '@core/services/endpoint.service';
import { COUNTRIES, CountryCode } from '@core/models/api.models';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HomePageComponent implements OnInit {
  
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
      title: 'Rápido y Seguro',
      description: 'Procesa pagos de manera ágil con la máxima seguridad en cada transacción.'
    },
    {
      icon: 'globe',
      title: 'Argentina',
      description: 'Operaciones en Argentina con soporte de moneda local (ARS).'
    },
    {
      icon: 'code',
      title: 'Fácil Integración',
      description: 'API REST simple y bien documentada con ejemplos en múltiples lenguajes.'
    },
    {
      icon: 'shield',
      title: 'API Key Segura',
      description: 'Autenticación mediante API Key con control total de permisos.'
    }
  ];

  quickStartSteps = [
    {
      step: 1,
      title: 'Obtén tu API Key',
      description: 'Accede al Dashboard y encuentra tu API Key en tu perfil de usuario.'
    },
    {
      step: 2,
      title: 'Configura tu integración',
      description: 'Usa tu API Key en el header x-api-key de cada petición.'
    },
    {
      step: 3,
      title: 'Haz tu primera llamada',
      description: 'Usa PayIn para recibir pagos o PayOut para enviar fondos.'
    }
  ];

  constructor(
    private router: Router,
    private endpointService: EndpointService
  ) {}

  ngOnInit(): void {}

  navigateToCountryDocs(): void {
    this.endpointService.setCurrentCountry('ARG');
    this.router.navigate(['arg', 'api']);
  }

  navigateToDocs(): void {
    this.router.navigate(['/gateway']);
  }
}
