import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { COUNTRIES, COUNTRY_LIST, SANDBOX, Country, CountryCode } from '@core/models/api.models';
import { EndpointService } from '@core/services/endpoint.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/** Quita el protocolo para mostrar solo el host en los enlaces. */
const host = (url: string) => url.replace(/^https?:\/\//, '');

/** Id de transacción de ejemplo usado en las respuestas. */
const EXAMPLE_TX_ID = '65baf429-9e41-44c5-bb16-5785aa087160';

const ResponseSample = {
  success: true,
  message: 'Transaction successfully created',
  code: 200,
  data: {
    id: EXAMPLE_TX_ID,
    status: 'pending',
    reference: '39001303',
    checkoutUrl: (c: Country) => `${c.dashboardUrl}/checkout/${EXAMPLE_TX_ID}`,
    currency: (c: Country) => c.currency,
    amount: '100.00',
    customId: '1',
    methods: (c: Country) => c.methods.map(m => ({
      url: `${c.dashboardUrl}/checkout/${EXAMPLE_TX_ID}/${m.id}`,
      name_method: m.name_method,
      logo: m.logo
    }))
  }
};

@Component({
  selector: 'app-introduction-page',
  templateUrl: './introduction-page.component.html',
  styleUrls: ['./introduction-page.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class IntroductionPageComponent implements OnInit, OnDestroy {
  readonly countries = COUNTRY_LIST.map(country => ({
    ...country,
    dashboardHost: host(country.dashboardUrl)
  }));

  readonly sandbox = {
    ...SANDBOX,
    dashboardHost: host(SANDBOX.dashboardUrl)
  };

  /** País seleccionado en el selector (los ejemplos de esta página cambian con él). */
  selectedCountry: Country = COUNTRIES.ARG;

  private destroy$ = new Subject<void>();

  constructor(private endpointService: EndpointService) {}

  ngOnInit(): void {
    this.endpointService.currentCountry$.pipe(takeUntil(this.destroy$)).subscribe(code => {
      this.selectedCountry = COUNTRIES[code] ?? COUNTRIES.ARG;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get quickStartCode(): string {
    const c = this.selectedCountry;
    return `curl -X POST "${c.baseUrl}/api/payin/register" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{
    "currency": "${c.currency}",
    "amount": "100",
    "userName": "John Doe",
    "userEmail": "john@example.com",
    "userPhone": "${c.examplePhone}",
    "userIdentificationNumber": "${c.identification.example}",
    "dueDate": "2025/12/31"
  }'`;
  }

  get responseExample(): string {
    const c = this.selectedCountry;
    const sample = {
      success: ResponseSample.success,
      message: ResponseSample.message,
      code: ResponseSample.code,
      data: {
        id: ResponseSample.data.id,
        status: ResponseSample.data.status,
        reference: ResponseSample.data.reference,
        checkoutUrl: ResponseSample.data.checkoutUrl(c),
        currency: ResponseSample.data.currency(c),
        amount: ResponseSample.data.amount,
        customId: ResponseSample.data.customId,
        methods: ResponseSample.data.methods(c)
      }
    };
    return JSON.stringify(sample, null, 2);
  }

  get nodeExample(): string {
    const c = this.selectedCountry;
    return `const JavaCash = require('@javacash/sdk');

const javacash = new JavaCash({
  apiKey: process.env.JAVACASH_API_KEY,
  country: '${c.code}'
});

// Crear un PayIn
const payin = await javacash.payin.create({
  amount: 100,
  currency: '${c.currency}',
  userName: 'John Doe',
  userEmail: 'john@example.com',
  userPhone: '${c.examplePhone}',
  userIdentificationNumber: '${c.identification.example}',
  dueDate: '2025/12/31'
});

console.log(payin.checkoutUrl);`;
  }

  get pythonExample(): string {
    const c = this.selectedCountry;
    return `from javacash import JavaCash

javacash = JavaCash(
    api_key=os.environ.get('JAVACASH_API_KEY'),
    country='${c.code}'
)

# Crear un PayIn
payin = javacash.payin.create(
    amount=100,
    currency='${c.currency}',
    user_name='John Doe',
    user_email='john@example.com',
    user_phone='${c.examplePhone}',
    user_identification_number='${c.identification.example}',
    due_date='2025/12/31'
)

print(payin.checkout_url)`;
  }

  get phpExample(): string {
    const c = this.selectedCountry;
    return `<?php
use JavaCash\\JavaCashClient;

$javacash = new JavaCashClient([
    'api_key' => getenv('JAVACASH_API_KEY'),
    'country' => '${c.code}'
]);

// Crear un PayIn
$payin = $javacash->payin->create([
    'amount' => 100,
    'currency' => '${c.currency}',
    'userName' => 'John Doe',
    'userEmail' => 'john@example.com',
    'userPhone' => '${c.examplePhone}',
    'userIdentificationNumber' => '${c.identification.example}',
    'dueDate' => '2025/12/31'
]);

echo $payin->checkoutUrl;`;
  }

  webhookExample = `// Configurar webhook para recibir notificaciones
app.post('/webhook/javacash', (req, res) => {
  const event = req.body;

  switch(event.type) {
    case 'payin.completed':
      console.log('Pago completado:', event.data.id);
      // Actualizar estado en tu base de datos
      break;
    case 'payin.failed':
      console.log('Pago fallido:', event.data.id);
      break;
    case 'payout.completed':
      console.log('Transferencia completada:', event.data.id);
      break;
  }

  res.status(200).send('OK');
});`;
}
