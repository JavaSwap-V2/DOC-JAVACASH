import { Component, Input, ViewEncapsulation } from '@angular/core';

/**
 * Banderita basada en un SVG propio (`assets/images/flags/<code>.svg`).
 * No usa emojis porque Windows no renderiza las banderas regionales (muestra
 * las letras del código en su lugar).
 */
@Component({
  selector: 'app-flag',
  templateUrl: './flag.component.html',
  styleUrls: ['./flag.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FlagComponent {
  /** Código ISO 3166-1 alpha-2 en minúscula (ej. `ar`, `gt`, `us`). */
  @Input() code = '';
  @Input() alt = '';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';

  get src(): string {
    return `assets/images/flags/${this.code}.svg`;
  }
}
