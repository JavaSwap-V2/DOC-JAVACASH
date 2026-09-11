// ============================================
// methods-guide-page.component.ts
// Guía: Métodos de Pago por URL Separada (PayIn)
// ============================================

import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { COUNTRIES, COUNTRY_LIST, SANDBOX, Country, CodeLanguage } from '@core/models/api.models';
import { EndpointService } from '@core/services/endpoint.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/** Quita el protocolo para mostrar solo el host en los enlaces. */
const host = (url: string) => url.replace(/^https?:\/\//, '');

/** Id de transacción de ejemplo usado en las URLs de checkout. */
const EXAMPLE_TX_ID = '65baf429-9e41-44c5-bb16-5785aa087160';

export type MethodTabId = 'html' | 'react' | 'angular' | 'react-native' | 'flutter';

export interface MethodCodeTab {
  id: MethodTabId;
  label: string;
  sublabel: string;
  language: CodeLanguage;
  title: string;
}

const METHOD_TABS: MethodCodeTab[] = [
  { id: 'html', label: 'HTML', sublabel: 'Vanilla JavaScript', language: 'html', title: 'index.html' },
  { id: 'react', label: 'React', sublabel: 'JSX', language: 'jsx', title: 'PaymentButtons.jsx' },
  { id: 'angular', label: 'Angular', sublabel: 'TypeScript', language: 'typescript', title: 'checkout.component.ts' },
  { id: 'react-native', label: 'React Native', sublabel: 'JSX', language: 'jsx', title: 'PaymentButtons.jsx' },
  { id: 'flutter', label: 'Flutter', sublabel: 'Dart', language: 'dart', title: 'payment_buttons.dart' }
];

@Component({
  selector: 'app-methods-guide-page',
  templateUrl: './methods-guide-page.component.html',
  styleUrls: ['./methods-guide-page.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MethodsGuidePageComponent implements OnInit, OnDestroy {
  readonly countries = COUNTRY_LIST.map(country => ({
    ...country,
    dashboardHost: host(country.dashboardUrl),
    baseHost: host(country.baseUrl)
  }));

  readonly sandbox = {
    ...SANDBOX,
    dashboardHost: host(SANDBOX.dashboardUrl),
    baseHost: host(SANDBOX.baseUrl)
  };

  readonly methodTabs = METHOD_TABS;

  readonly queryParams = [
    { param: 'simple', value: 'true', description: 'Oculta el header y sidebar del checkout; muestra solo el formulario de pago.' },
    { param: 'color', value: '{hex}', description: 'Color principal del checkout, sin el símbolo # (ej. 4de8b0).' },
    { param: 'opacity', value: '{0-1}', description: 'Opacidad del fondo del checkout (ej. 0.08).' },
    { param: 'logo', value: '{url}', description: 'Logo que se muestra en el checkout (ej. https://tu-logo.png).' }
  ];

  readonly statuses = [
    { value: 'pending', description: 'Esperando pago' },
    { value: 'paid', description: 'Pago completado' },
    { value: 'processing', description: 'Pago en proceso' },
    { value: 'rejected', description: 'Pago rechazado' },
    { value: 'failed', description: 'Pago fallido' }
  ];

  selectedTabId: MethodTabId = 'html';
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

  selectTab(tabId: MethodTabId): void {
    this.selectedTabId = tabId;
  }

  get activeTab(): MethodCodeTab {
    return this.methodTabs.find(tab => tab.id === this.selectedTabId) ?? this.methodTabs[0];
  }

  get activeExampleCode(): string {
    const c = this.selectedCountry;
    switch (this.selectedTabId) {
      case 'react':
        return this.reactExample(c);
      case 'angular':
        return this.angularExample(c);
      case 'react-native':
        return this.reactNativeExample(c);
      case 'flutter':
        return this.flutterExample(c);
      default:
        return this.htmlExample(c);
    }
  }

  get bodyFields(): Array<{ name: string; type: string; required: boolean; example: string; description: string }> {
    const c = this.selectedCountry;
    return [
      { name: 'currency', type: 'string', required: true, example: c.currency, description: 'Código ISO 4217 de una moneda habilitada para el país (ver tabla de países).' },
      { name: 'amount', type: 'string', required: true, example: '1500.00', description: 'Monto de la transacción en formato decimal con punto.' },
      { name: 'userName', type: 'string', required: true, example: 'Juan Pérez', description: 'Nombre del pagador.' },
      { name: 'userEmail', type: 'string', required: true, example: 'juan@email.com', description: 'Correo electrónico del pagador.' },
      { name: 'userPhone', type: 'string', required: true, example: c.examplePhone, description: 'Teléfono del pagador, sin prefijo de país.' },
      { name: 'userIdentificationNumber', type: 'string', required: true, example: c.identification.example, description: `${c.identification.label} del pagador. ${c.identification.hint}` },
      { name: 'customId', type: 'string', required: false, example: '1', description: 'Identificador propio de la transacción; sirve para consultarla después.' },
      { name: 'dueDate', type: 'string', required: false, example: '2026/12/31', description: 'Fecha límite de pago (YYYY/MM/DD). Si no se envía, se usa el configurado en tu cuenta.' }
    ];
  }

  get curlPayInExample(): string {
    const c = this.selectedCountry;
    return `curl -X POST "${c.baseUrl}/api/payin/register" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: TU_API_KEY" \\
  -d '{
    "currency": "${c.currency}",
    "amount": "1500.00",
    "userName": "Juan Pérez",
    "userEmail": "juan@email.com",
    "userPhone": "${c.examplePhone}",
    "userIdentificationNumber": "${c.identification.example}",
    "dueDate": "2026/12/31"
  }'`;
  }

  get responseExample(): string {
    const c = this.selectedCountry;
    const methods = c.methods.map(m => ({
      url: `${c.dashboardUrl}/checkout/${EXAMPLE_TX_ID}/${m.id}`,
      name_method: m.name_method,
      logo: m.logo
    }));
    const sample = {
      success: true,
      message: 'Transaction successfully created',
      code: 200,
      data: {
        id: EXAMPLE_TX_ID,
        status: 'pending',
        reference: '39001303',
        checkoutUrl: `${c.dashboardUrl}/checkout/${EXAMPLE_TX_ID}`,
        currency: c.currency,
        amount: '100.00',
        customId: '1',
        methods
      }
    };
    return JSON.stringify(sample, null, 2);
  }

  get optionACode(): string {
    const c = this.selectedCountry;
    return `<a href="${c.dashboardUrl}/checkout/${EXAMPLE_TX_ID}">
  Pagar ahora
</a>`;
  }

  get personalizationExample(): string {
    const c = this.selectedCountry;
    const methodId = c.methods[0]?.id ?? 'transfer';
    return `${c.dashboardUrl}/checkout/${EXAMPLE_TX_ID}/${methodId}?simple=true&color=4de8b0&logo=https://mi-logo.png`;
  }

  get statusByReference(): string {
    return `GET ${this.selectedCountry.baseUrl}/api/payin/get-reference/{reference}`;
  }

  get statusByCustomId(): string {
    return `GET ${this.selectedCountry.baseUrl}/api/payin/custom-id/{customId}`;
  }

  get statusHeaders(): string {
    return `x-api-key: TU_API_KEY`;
  }

  get statusResponseExample(): string {
    const c = this.selectedCountry;
    const sample = {
      success: true,
      data: {
        id: EXAMPLE_TX_ID,
        reference: '39001303',
        customId: '1',
        status: 'paid',
        amount: '100.00',
        currency: c.currency,
        checkoutUrl: `${c.dashboardUrl}/checkout/...`
      }
    };
    return JSON.stringify(sample, null, 2);
  }

  private methodsArraySnippet(c: Country): string {
    return c.methods
      .map(m => `    { url: "${c.dashboardUrl}/checkout/${EXAMPLE_TX_ID}/${m.id}", name_method: "${m.name_method}", logo: ${m.logo ? `"${m.logo}"` : 'null'} }`)
      .join(',\n');
  }

  private htmlExample(c: Country): string {
    return `<!-- index.html -->
<div id="payment-methods">
  <p>Selecciona tu método de pago:</p>
  <div id="buttons-container"></div>
</div>

<script>
  // Reemplaza estos valores con el array "methods" de la respuesta de /api/payin/register
  const methods = [
${this.methodsArraySnippet(c)}
  ];

  const container = document.getElementById("buttons-container");

  methods.forEach((method) => {
    const button = document.createElement("a");
    button.href = method.url;
    button.style.display = "flex";
    button.style.alignItems = "center";
    button.style.gap = "12px";
    button.style.padding = "14px 20px";
    button.style.marginBottom = "10px";
    button.style.border = "1px solid #e5e7eb";
    button.style.borderRadius = "12px";
    button.style.textDecoration = "none";
    button.style.color = "#111";
    button.style.background = "#fff";
    button.style.cursor = "pointer";

    if (method.logo) {
      const img = document.createElement("img");
      img.src = method.logo;
      img.alt = method.name_method;
      img.style.width = "32px";
      img.style.height = "32px";
      img.style.objectFit = "contain";
      button.appendChild(img);
    }

    const label = document.createElement("span");
    label.textContent = method.name_method;
    label.style.fontSize = "16px";
    label.style.fontWeight = "500";
    button.appendChild(label);

    container.appendChild(button);
  });
</script>`;
  }

  private reactExample(c: Country): string {
    return `import { useState } from "react";

function PaymentButtons({ methods }) {
  return (
    <div>
      <p>Selecciona tu método de pago:</p>
      {methods.map((method, index) => (
        <a
          key={index}
          href={method.url}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "14px 20px",
            marginBottom: "10px",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            textDecoration: "none",
            color: "#111",
            background: "#fff",
          }}
        >
          {method.logo && (
            <img
              src={method.logo}
              alt={method.name_method}
              style={{ width: 32, height: 32, objectFit: "contain" }}
            />
          )}
          <span style={{ fontSize: 16, fontWeight: 500 }}>
            {method.name_method}
          </span>
        </a>
      ))}
    </div>
  );
}

// Uso:
function Checkout() {
  const [methods, setMethods] = useState([]);

  async function createPayIn() {
    const res = await fetch("${c.baseUrl}/api/payin/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "TU_API_KEY",
      },
      body: JSON.stringify({
        currency: "${c.currency}",
        amount: "1500.00",
        userName: "Juan Pérez",
        userEmail: "juan@email.com",
        userPhone: "${c.examplePhone}",
        userIdentificationNumber: "${c.identification.example}",
        dueDate: "2026/12/31",
      }),
    });

    const data = await res.json();
    setMethods(data.data.methods);
  }

  return <PaymentButtons methods={methods} />;
}`;
  }

  private angularExample(c: Country): string {
    return `// payment.service.ts
import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable({ providedIn: "root" })
export class PaymentService {
  private baseUrl = "${c.baseUrl}";

  constructor(private http: HttpClient) {}

  createPayIn(payload: any) {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "x-api-key": "TU_API_KEY",
    });
    return this.http.post(\`\${this.baseUrl}/api/payin/register\`, payload, { headers });
  }
}

// checkout.component.ts
import { Component } from "@angular/core";
import { PaymentService } from "./payment.service";

@Component({
  selector: "app-checkout",
  template: \`
    <p>Selecciona tu método de pago:</p>
    @for (method of methods; track method.url) {
      <a [href]="method.url" class="payment-button">
        @if (method.logo) {
          <img [src]="method.logo" [alt]="method.name_method" />
        }
        <span>{{ method.name_method }}</span>
      </a>
    }
  \`,
  styles: [\`
    .payment-button {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 20px;
      margin-bottom: 10px;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      text-decoration: none;
      color: #111;
      background: #fff;
    }
    .payment-button img { width: 32px; height: 32px; object-fit: contain; }
  \`],
})
export class CheckoutComponent {
  methods: any[] = [];

  constructor(private paymentSrv: PaymentService) {
    this.paymentSrv.createPayIn({
      currency: "${c.currency}",
      amount: "1500.00",
      userName: "Juan Pérez",
      userEmail: "juan@email.com",
      userPhone: "${c.examplePhone}",
      userIdentificationNumber: "${c.identification.example}",
      dueDate: "2026/12/31",
    }).subscribe((res: any) => {
      this.methods = res.data.methods;
    });
  }
}`;
  }

  private reactNativeExample(c: Country): string {
    return `import { View, Text, TouchableOpacity, Image, Linking } from "react-native";

function PaymentButtons({ methods }) {
  return (
    <View>
      <Text style={{ marginBottom: 12, fontSize: 16, fontWeight: "600" }}>
        Selecciona tu método de pago:
      </Text>
      {methods.map((method, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => Linking.openURL(method.url)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            padding: 14,
            marginBottom: 10,
            borderWidth: 1,
            borderColor: "#e5e7eb",
            borderRadius: 12,
            backgroundColor: "#fff",
          }}
        >
          {method.logo && (
            <Image
              source={{ uri: method.logo }}
              style={{ width: 32, height: 32, resizeMode: "contain" }}
            />
          )}
          <Text style={{ fontSize: 16, fontWeight: "500" }}>
            {method.name_method}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// Crear PayIn:
async function createPayIn() {
  const res = await fetch("${c.baseUrl}/api/payin/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "TU_API_KEY",
    },
    body: JSON.stringify({
      currency: "${c.currency}",
      amount: "1500.00",
      userName: "Juan Pérez",
      userEmail: "juan@email.com",
      userPhone: "${c.examplePhone}",
      userIdentificationNumber: "${c.identification.example}",
      dueDate: "2026/12/31",
    }),
  });
  const data = await res.json();
  return data.data.methods;
}`;
  }

  private flutterExample(c: Country): string {
    return `import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:url_launcher/url_launcher.dart';

class PaymentMethod {
  final String url;
  final String nameMethod;
  final String? logo;

  PaymentMethod({required this.url, required this.nameMethod, this.logo});

  factory PaymentMethod.fromJson(Map<String, dynamic> json) {
    return PaymentMethod(
      url: json['url'],
      nameMethod: json['name_method'],
      logo: json['logo'],
    );
  }
}

class PaymentButtons extends StatelessWidget {
  final List<PaymentMethod> methods;
  const PaymentButtons({super.key, required this.methods});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text("Selecciona tu método de pago:",
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
        const SizedBox(height: 12),
        ...methods.map((method) => Padding(
          padding: const EdgeInsets.only(bottom: 10),
          child: InkWell(
            onTap: () => launchUrl(Uri.parse(method.url)),
            borderRadius: BorderRadius.circular(12),
            child: Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey.shade300),
                borderRadius: BorderRadius.circular(12),
                color: Colors.white,
              ),
              child: Row(
                children: [
                  if (method.logo != null)
                    Image.network(method.logo!, width: 32, height: 32),
                  if (method.logo != null) const SizedBox(width: 12),
                  Text(method.nameMethod,
                      style: const TextStyle(
                          fontSize: 16, fontWeight: FontWeight.w500)),
                ],
              ),
            ),
          ),
        )),
      ],
    );
  }
}

// Crear PayIn:
Future<List<PaymentMethod>> createPayIn() async {
  final response = await http.post(
    Uri.parse("${c.baseUrl}/api/payin/register"),
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "TU_API_KEY",
    },
    body: jsonEncode({
      "currency": "${c.currency}",
      "amount": "1500.00",
      "userName": "Juan Pérez",
      "userEmail": "juan@email.com",
      "userPhone": "${c.examplePhone}",
      "userIdentificationNumber": "${c.identification.example}",
      "dueDate": "2026/12/31",
    }),
  );

  final data = jsonDecode(response.body);
  final methods = (data['data']['methods'] as List)
      .map((m) => PaymentMethod.fromJson(m))
      .toList();
  return methods;
}`;
  }
}