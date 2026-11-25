import { Component, ViewEncapsulation } from '@angular/core';
import { TranslationService } from '@core/services/translation.service';

/**
 * Página «Fechas y horas»: en qué zona horaria devuelve la API las fechas,
 * cómo se interpretan los filtros por fecha, el `timestamp` de los webhooks y
 * la fecha de vencimiento (`dueDate`). Los ejemplos usan Guatemala (UTC-6).
 */
@Component({
  selector: 'app-dates-page',
  templateUrl: './dates-page.component.html',
  styleUrls: ['./dates-page.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DatesPageComponent {
  constructor(private readonly translationService: TranslationService) {}

  private t(key: string): string {
    return this.translationService.translate(key);
  }

  readonly responseExample = `{
  "id": 1234,
  "amount": "500.00",
  "status": "paid",
  "createdAt": "2026-11-10T20:30:00.000-06:00",
  "updatedAt": "2026-11-10T20:31:15.000-06:00"
}`;

  /** El mismo instante escrito de las dos formas, con los comentarios traducidos. */
  get sameInstantExample(): string {
    return `// ${this.t('dates.sameInstantBefore')}
"createdAt": "2026-11-11T02:30:00.000Z"

// ${this.t('dates.sameInstantNow')}
"createdAt": "2026-11-10T20:30:00.000-06:00"

new Date("2026-11-11T02:30:00.000Z").getTime()
  === new Date("2026-11-10T20:30:00.000-06:00").getTime(); // true`;
  }

  get filterExample(): string {
    return `// ${this.t('dates.filterExampleOneDay')}
?startDate=2026-11-10&endDate=2026-11-10
// 2026-11-10T00:00:00.000-06:00  ->  2026-11-10T23:59:59.999-06:00

// ${this.t('dates.filterExampleRange')}
?startDate=2026-11-01&endDate=2026-11-30
// 2026-11-01T00:00:00.000-06:00  ->  2026-11-30T23:59:59.999-06:00`;
  }

  readonly webhookExample = `POST /su-ruta-webhook HTTP/1.1
Content-Type: application/json
X-JavaCash-Signature: 88e58feda7b82053fb77628a7351d8c887013c35a67f9c3bd2c29d8c5e59e301
X-JavaCash-Timestamp: 2026-09-16T09:36:48.411-06:00

{"type":"pay-in","transactionId":149,"userId":42,"amount":"120.00","status":"paid","timestamp":"2026-09-16T09:36:48.411-06:00","customId":"20260917","amountReceived":"120.00"}`;

  get dueDateExample(): string {
    return `// ${this.t('dates.dueDateExampleDay')}
"dueDate": "2027/12/30"
// -> 2027-12-30T23:59:59.999-06:00 (Guatemala)

// ${this.t('dates.dueDateExampleInstant')}
"dueDate": "2027-12-30T23:59:59-06:00"`;
  }
}
